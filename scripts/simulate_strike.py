import requests
import os

BACKEND_URL = "https://kinetic-backend-22665471971.us-central1.run.app"
SAMPLES_DIR = "d:/Project/Kinetic Armor/test_samples"

def register_asset(filename):
    print(f"[*] Registering {filename}...")
    filepath = os.path.join(SAMPLES_DIR, filename)
    with open(filepath, 'rb') as f:
        files = {'file': (filename, f, 'image/png')}
        response = requests.post(f"{BACKEND_URL}/api/upload", files=files)
        if response.status_code == 201:
            print(f"[+] Asset registered: {response.json().get('asset_id')}")
            return True
        else:
            print(f"[-] Failed to register: {response.text}")
            return False

def trigger_strike(filename, fake_url):
    print(f"[*] Simulating strike for {filename} found at {fake_url}...")
    filepath = os.path.join(SAMPLES_DIR, filename)
    with open(filepath, 'rb') as f:
        files = {'file': (filename, f, 'image/png')}
        data = {'url': fake_url, 'platform': 'Instagram'}
        response = requests.post(f"{BACKEND_URL}/api/scan", files=files, data=data)
        if response.status_code == 200:
            res_json = response.json()
            if res_json.get('match'):
                print(f"[!] STRIKE DETECTED! Violation ID: {res_json.get('violation_id')}")
            else:
                print(f"[-] No match detected: {res_json.get('message')}")
        else:
            print(f"[-] Scan failed: {response.text}")

if __name__ == "__main__":
    # 1. Register both samples
    if register_asset("sample1.png"):
        # 2. Trigger a strike for sample 1
        trigger_strike("sample1.png", "https://instagram.com/p/C8k2L9xJv02/")
    
    if register_asset("sample2.png"):
        # 2. Trigger a strike for sample 2
        trigger_strike("sample2.png", "https://artstation.com/artwork/stolen-chrome-99")
