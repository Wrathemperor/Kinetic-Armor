import requests
import os
import sys

# Change this to your Cloud Run URL or keep as localhost for local testing
API_URL = "https://kinetic-backend-22665471971.us-central1.run.app"

def trigger_live_leak(image_path, target_url, platform="Demo Site"):
    if not os.path.exists(image_path):
        print(f"Error: File {image_path} not found.")
        return

    print(f"--- ENGAGING KINETIC RADAR ---")
    print(f"Targeting: {target_url}")
    print(f"Scanning Asset: {os.path.basename(image_path)}")

    files = {'file': open(image_path, 'rb')}
    data = {'url': target_url, 'platform': platform}

    try:
        response = requests.post(f"{API_URL}/api/scan", files=files, data=data)
        result = response.json()

        if response.status_code == 200 and result.get('match'):
            print(f"\n[!] MATCH FOUND!")
            print(f"Violation ID: {result['violation_id']}")
            print(f"Status: SECURED & LOGGED")
            print(f"\nCheck your dashboard at: https://kinetic-armor.web.app")
        else:
            print(f"\n[-] No Match: {result.get('message', 'Unknown error')}")
            print("Make sure this image is already registered in your Vault!")
            
    except Exception as e:
        print(f"Error connecting to server: {e}")

if __name__ == "__main__":
    print("=== KINETIC ARMOR: LIVE DEMO PROTOCOL ===")
    
    # 1. Provide the path to an image you ALREADY registered in the Vault
    # Example: 'test_samples/logo_leak.jpg'
    img = input("Enter local path to the registered image: ").strip()
    
    # 2. Provide the REAL URL where the image is "leaked"
    # Example: 'https://twitter.com/YourProfile/status/12345'
    url = input("Enter the REAL URL of the leak: ").strip()
    
    # 3. Provide the platform name
    plat = input("Enter platform name (e.g., Twitter, Reddit, Personal Blog): ").strip()

    trigger_live_leak(img, url, plat)
