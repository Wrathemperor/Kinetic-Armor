import os
import uuid
import base64
import requests
from urllib.parse import urlparse
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))  # Load environment variables from backend/.env

from models import db, Organization, Asset, Violation, SystemConfig
from services.fingerprint import generate_phash, calculate_distance
from services.ai import evaluate_violation

app = Flask(__name__)
CORS(app)

# SQLite for prototyping
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(BASE_DIR, "assets.db")}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

db.init_app(app)

# Create tables and mock org on startup
with app.app_context():
    db.create_all()
    if not Organization.query.first():
        org = Organization(name="Kinetic Test Org", api_key="test-api-key")
        db.session.add(org)
    if not SystemConfig.query.first():
        conf = SystemConfig(scan_threshold=35)
        db.session.add(conf)
    db.session.commit()

@app.route('/api/upload', methods=['POST'])
def upload_asset():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    # Fingerprint it
    phash_val = generate_phash(filepath)
    if not phash_val:
        return jsonify({"error": "Error processing image"}), 500
        
    org = Organization.query.first()
    
    asset = Asset(org_id=org.id, file_path=filepath, phash=phash_val)
    db.session.add(asset)
    db.session.commit()
    
    return jsonify({
        "message": "Asset uploaded and fingerprinted successfully",
        "asset_id": asset.id,
        "phash": asset.phash
    }), 201

@app.route('/api/scan', methods=['POST'])
def mock_crawler_scan():
    """
    Mock endpoint that a crawler would hit when it finds an image on the web.
    """
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    found_url = request.form.get('url', 'http://unknown.com/image.jpg')
    platform = request.form.get('platform', 'Unknown')
    
    file = request.files['file']
    filename = secure_filename(file.filename)
    unique_filename = f"violation_{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)
    
    # 1. Fingerprint the discovered image
    found_phash = generate_phash(filepath)
    
    if not found_phash:
        return jsonify({"error": "Could not hash image"}), 500
        
    # 2. Compare against our database
    config = SystemConfig.query.first()
    threshold = config.scan_threshold if config else 35
    
    assets = Asset.query.all()
    matched_asset = None
    min_dist = float('inf')
    
    for a in assets:
        dist = calculate_distance(a.phash, found_phash)
        if dist < threshold and dist < min_dist:
            matched_asset = a
            min_dist = dist
            
    if matched_asset:
        # 3. Match found! Call Claude stub
        ai_data = evaluate_violation(platform, found_url)
        v = Violation(
            asset_id=matched_asset.id,
            found_url=found_url,
            found_image_path=unique_filename,
            severity=ai_data['severity'],
            context=ai_data['context'],
            draft_dmca=ai_data['draft_dmca']
        )
        db.session.add(v)
        db.session.commit()
        return jsonify({
            "match": True,
            "message": f"Violation detected! Distance: {min_dist}",
            "violation_id": v.id
        })
        
    return jsonify({"match": False, "message": "No matches found."})

@app.route('/api/violations', methods=['GET'])
def get_violations():
    violations = Violation.query.order_by(Violation.created_at.desc()).all()
    data = []
    for v in violations:
        asset = Asset.query.get(v.asset_id)
        data.append({
            "id": v.id,
            "asset_id": v.asset_id,
            "asset_phash": asset.phash,
            "found_url": v.found_url,
            "severity": v.severity,
            "status": v.status,
            "context": v.context,
            "draft_dmca": v.draft_dmca,
            "original_image": os.path.basename(asset.file_path),
            "found_image": v.found_image_path,
            "created_at": v.created_at.isoformat()
        })
    return jsonify(data)

@app.route('/api/assets', methods=['GET'])
def get_assets():
    assets = Asset.query.order_by(Asset.created_at.desc()).all()
    data = []
    for a in assets:
        data.append({
            "id": a.id,
            "phash": a.phash,
            "file_path": a.file_path,
            "created_at": a.created_at.isoformat()
        })
    return jsonify(data)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    violations = Violation.query.all()
    assets_count = Asset.query.count()
    
    # 1. Severity Distribution
    severity_map = {i: 0 for i in range(1, 11)}
    for v in violations:
        severity_map[v.severity] += 1
    severity_dist = [{"level": k, "count": v} for k, v in severity_map.items()]
    
    # 2. Platform Distribution
    platform_map = {}
    for v in violations:
        domain = urlparse(v.found_url).netloc or "Unknown"
        platform_map[domain] = platform_map.get(domain, 0) + 1
    platform_dist = [{"name": k, "value": v} for k, v in platform_map.items()]
    
    # 3. Overall numbers
    return jsonify({
        "total_violations": len(violations),
        "total_assets": assets_count,
        "severity_dist": severity_dist,
        "platform_dist": platform_dist
    })

@app.route('/api/config', methods=['GET', 'POST'])
def handle_config():
    config = SystemConfig.query.first()
    if request.method == 'POST':
        data = request.json
        config.scan_threshold = data.get('scan_threshold', config.scan_threshold)
        config.webhook_url = data.get('webhook_url', config.webhook_url)
        db.session.commit()
        return jsonify({"message": "Configuration updated"})
    
    return jsonify({
        "scan_threshold": config.scan_threshold,
        "webhook_url": config.webhook_url
    })

@app.route('/api/search', methods=['POST'])
def reverse_search():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    config = SystemConfig.query.first()
    imgbb_key = os.environ.get("IMGBB_API_KEY")
    serpapi_key = os.environ.get("SERPAPI_KEY")

    if not imgbb_key or not serpapi_key:
        return jsonify({"error": "ImgBB and SerpApi keys must be configured in .env file"}), 400

    filename = secure_filename(file.filename)
    unique_filename = f"search_{uuid.uuid4().hex}_{filename}"
    filepath = os.path.join(UPLOAD_FOLDER, unique_filename)
    file.save(filepath)

    query_phash = generate_phash(filepath)
    if not query_phash:
        return jsonify({"error": "Could not hash image"}), 500

    # 1. Upload to ImgBB
    try:
        with open(filepath, "rb") as file_data:
            b64_image = base64.b64encode(file_data.read()).decode('utf-8')
        
        imgbb_response = requests.post(
            f"https://api.imgbb.com/1/upload?key={imgbb_key}",
            data={"image": b64_image}
        )
        imgbb_data = imgbb_response.json()
        if not imgbb_data.get("success"):
            return jsonify({"error": f"ImgBB upload failed: {imgbb_data.get('error', {}).get('message', 'Unknown error')}"}), 500
            
        public_url = imgbb_data["data"]["url"]
    except Exception as e:
        return jsonify({"error": f"Failed to upload to ImgBB: {str(e)}"}), 500

    # 2. SerpApi Google Lens Search
    try:
        serpapi_params = {
            "engine": "google_lens",
            "url": public_url,
            "api_key": serpapi_key,
            "hl": "en"
        }
        serp_resp = requests.get("https://serpapi.com/search", params=serpapi_params)
        serp_data = serp_resp.json()
        
        visual_matches = serp_data.get("visual_matches", [])[:15] # Top 15 matches
    except Exception as e:
        return jsonify({"error": f"Failed to query SerpApi: {str(e)}"}), 500

    # 3. Local Verification
    verified_results = []
    threshold = config.scan_threshold if config else 35

    for match in visual_matches:
        match_img_url = match.get("thumbnail") or match.get("original_image") # Try to get best image URL
        if not match_img_url:
            continue
            
        link = match.get("link", "Unknown URL")
        
        try:
            # Download image to check phash
            img_resp = requests.get(match_img_url, timeout=5)
            if img_resp.status_code == 200:
                cand_filename = f"cand_{uuid.uuid4().hex}.jpg"
                cand_filepath = os.path.join(UPLOAD_FOLDER, cand_filename)
                with open(cand_filepath, 'wb') as f:
                    f.write(img_resp.content)
                
                cand_phash = generate_phash(cand_filepath)
                if cand_phash:
                    dist = calculate_distance(query_phash, cand_phash)
                    if dist <= threshold:
                        verified_results.append({
                            "found_url": link,
                            "found_image": cand_filename,
                            "distance": dist,
                            "phash": cand_phash,
                            "title": match.get("title", "Unknown Title")
                        })
        except Exception:
            # Skip on download failure
            continue
            
    return jsonify({
        "original_image": unique_filename,
        "query_phash": query_phash,
        "public_url": public_url,
        "results": verified_results
    }), 200

@app.route('/uploads/<path:filename>')
def serve_uploads(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=False, host='0.0.0.0', port=port)
