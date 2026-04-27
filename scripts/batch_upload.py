import requests
import os

BACKEND_URL = "https://kinetic-backend-22665471971.us-central1.run.app"
SAMPLES_DIR = "d:/Project/Kinetic Armor/test_samples"

def register_asset(filename):
    print(f"[*] Registering {filename}...")
    filepath = os.path.join(SAMPLES_DIR, filename)
    with open(filepath, 'rb') as f:
        files = {'file': (filename, f, 'image/jpeg' if filename.endswith('.jpg') else 'image/png')}
        response = requests.post(f"{BACKEND_URL}/api/upload", files=files)
        if response.status_code == 201:
            print(f"[+] Asset registered: {response.json().get('asset_id')}")
            return True
        else:
            print(f"[-] Failed to register {filename}: {response.text}")
            return False

if __name__ == "__main__":
    # Filter for original assets only
    all_files = os.listdir(SAMPLES_DIR)
    originals = [f for f in all_files if f.endswith('_orig.jpg') or f in ['sample1.png', 'sample2.png', 'sample_blue.jpg', 'sample_red.jpg']]
    
    print(f"[*] Found {len(originals)} original assets to register.")
    
    success_count = 0
    for filename in originals:
        if register_asset(filename):
            success_count += 1
            
    print(f"\n[!] Batch Upload Complete!")
    print(f"[!] Successfully registered {success_count} / {len(originals)} assets.")
