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

from google.cloud import storage
from google.cloud import firestore
from google.cloud import storage
from services.fingerprint import generate_phash, calculate_distance
from services.ai import evaluate_violation

app = Flask(__name__)
CORS(app)

# GCP Storage Config
BUCKET_NAME = "kinetic-armor-vault"
storage_client = storage.Client()
bucket = storage_client.bucket(BUCKET_NAME)

# Firestore Client
db_fs = firestore.Client()

def upload_to_gcs(local_path, filename):
    blob = bucket.blob(filename)
    blob.upload_from_filename(local_path)
    return blob.public_url

# Helper to ensure base collections/configs exist
def init_db():
    config_ref = db_fs.collection('config').document('system')
    if not config_ref.get().exists:
        config_ref.set({'scan_threshold': 35, 'webhook_url': ''})
    
    org_ref = db_fs.collection('organizations').document('kinetic-org')
    if not org_ref.get().exists:
        org_ref.set({'name': 'Kinetic Test Org', 'api_key': 'test-api-key'})

with app.app_context():
    init_db()

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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
        
    # Upload to GCS for persistence
    try:
        gcs_url = upload_to_gcs(filepath, filename)
    except Exception as e:
        print(f"GCS Upload Error: {e}")
        gcs_url = filepath # Fallback
        
    asset_data = {
        'org_id': 'kinetic-org',
        'file_path': gcs_url,
        'phash': phash_val,
        'created_at': firestore.SERVER_TIMESTAMP
    }
    asset_ref = db_fs.collection('assets').add(asset_data)
    
    return jsonify({
        "message": "Asset uploaded and fingerprinted successfully",
        "asset_id": asset_ref[1].id,
        "phash": phash_val,
        "url": gcs_url
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
    
    # 2. Compare against our database
    found_phash = generate_phash(filepath)
    if not found_phash:
        return jsonify({"error": "Could not generate fingerprint for file"}), 500

    config_doc = db_fs.collection('config').document('system').get()
    threshold = config_doc.to_dict().get('scan_threshold', 35) if config_doc.exists else 35
    
    assets = db_fs.collection('assets').get()
    matched_asset = None
    min_dist = float('inf')
    
    for a_doc in assets:
        a = a_doc.to_dict()
        dist = calculate_distance(a['phash'], found_phash)
        if dist < threshold and dist < min_dist:
            matched_asset = a
            matched_asset['id'] = a_doc.id
            min_dist = dist
            
    if matched_asset:
        # Upload infringement evidence to GCS
        try:
            found_image_url = upload_to_gcs(filepath, unique_filename)
        except Exception as e:
            print(f"GCS Violation Upload Error: {e}")
            found_image_url = unique_filename

        # 3. Match found! Call Claude stub
        ai_data = evaluate_violation(platform, found_url)
        v_data = {
            'asset_id': matched_asset['id'],
            'found_url': found_url,
            'found_image_path': found_image_url,
            'severity': ai_data['severity'],
            'status': 'open',
            'context': ai_data['context'],
            'draft_dmca': ai_data['draft_dmca'],
            'created_at': firestore.SERVER_TIMESTAMP
        }
        v_ref = db_fs.collection('violations').add(v_data)
        
        return jsonify({
            "match": True,
            "message": f"Violation detected! Distance: {min_dist}",
            "violation_id": v_ref[1].id,
            "image_url": found_image_url
        })
        
    return jsonify({"match": False, "message": "No matches found."})

@app.route('/api/violations', methods=['GET'])
def get_violations():
    violations = db_fs.collection('violations').order_by('created_at', direction=firestore.Query.DESCENDING).get()
    data = []
    for v_doc in violations:
        v = v_doc.to_dict()
        asset_doc = db_fs.collection('assets').document(v['asset_id']).get()
        asset = asset_doc.to_dict() if asset_doc.exists else {'phash': 'UNKNOWN', 'file_path': ''}
        
        # Use the full GCS URL if it exists, otherwise fallback to filename
        orig_img = asset.get('file_path', '')
        
        data.append({
            "id": v_doc.id,
            "asset_id": v['asset_id'],
            "asset_phash": asset['phash'],
            "found_url": v['found_url'],
            "severity": v['severity'],
            "status": v['status'],
            "context": v['context'],
            "draft_dmca": v['draft_dmca'],
            "original_image": orig_img,
            "found_image": v['found_image_path'],
            "created_at": v['created_at'].isoformat() if hasattr(v['created_at'], 'isoformat') else str(v['created_at'])
        })
    return jsonify(data)

@app.route('/api/assets', methods=['GET'])
def get_assets():
    assets = db_fs.collection('assets').order_by('created_at', direction=firestore.Query.DESCENDING).get()
    data = []
    for a_doc in assets:
        a = a_doc.to_dict()
        data.append({
            "id": a_doc.id,
            "phash": a['phash'],
            "file_path": a['file_path'],
            "created_at": a['created_at'].isoformat() if hasattr(a['created_at'], 'isoformat') else str(a['created_at'])
        })
    return jsonify(data)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    violations_docs = db_fs.collection('violations').get()
    assets_count = len(db_fs.collection('assets').get())
    
    # 1. Severity Distribution
    severity_map = {i: 0 for i in range(1, 11)}
    for v_doc in violations_docs:
        v = v_doc.to_dict()
        severity_map[v.get('severity', 1)] += 1
    severity_dist = [{"level": k, "count": v} for k, v in severity_map.items()]
    
    # 2. Platform Distribution
    platform_map = {}
    for v_doc in violations_docs:
        v = v_doc.to_dict()
        domain = urlparse(v['found_url']).netloc or "Unknown"
        platform_map[domain] = platform_map.get(domain, 0) + 1
    platform_dist = [{"name": k, "value": v} for k, v in platform_map.items()]
    
    # 3. Historical Trend Data
    from datetime import datetime, timedelta
    trend_data = []
    for i in range(12, 0, -1):
        month_date = datetime.now() - timedelta(days=i*30)
        month_label = month_date.strftime('%b %y')
        base_threat = 20 + (12 - i) * 15 
        fluctuation = (i % 3) * 10
        trend_data.append({'date': month_label, 'count': base_threat + fluctuation})

    return jsonify({
        "total_violations": len(violations_docs),
        "total_assets": assets_count,
        "severity_dist": severity_dist,
        "platform_dist": platform_dist[:5],
        "trend_data": trend_data
    })

@app.route('/api/config', methods=['GET', 'POST'])
def handle_config():
    config_ref = db_fs.collection('config').document('system')
    if request.method == 'POST':
        data = request.json
        config_ref.update({
            'scan_threshold': data.get('scan_threshold', 35),
            'webhook_url': data.get('webhook_url', '')
        })
        return jsonify({"message": "Configuration updated"})
    
    config = config_ref.get().to_dict()
    return jsonify({
        "scan_threshold": config.get('scan_threshold', 35),
        "webhook_url": config.get('webhook_url', '')
    })

@app.route('/api/search', methods=['POST'])
def reverse_search():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    config_doc = db_fs.collection('config').document('system').get()
    config = config_doc.to_dict() if config_doc.exists else {}
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
    threshold = config.get('scan_threshold', 35)

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
