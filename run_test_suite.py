import requests
import os
import time

BASE_URL = "http://localhost:5000/api"
SAMPLES_DIR = "test_samples"

def run_suite():
    print("=== STARTING KINETIC ARMOR TEST SUITE (10 TESTCASES) ===")
    
    platforms = [
        "reddit.com/r/piracy", "twitter.com/leaked", "t.me/warez_group",
        "facebook.com/marketplace", "instagram.com/repost", "imgur.com/gallery",
        "pinterest.com/pin", "tumblr.com/post", "discord.gg/invites", "unknown-site.ru"
    ]

    # 1. Register 10 Assets
    print("\n[STEP 1] Registering 10 Original Assets...")
    for i in range(1, 11):
        path = os.path.join(SAMPLES_DIR, f"asset_{i}_orig.jpg")
        with open(path, 'rb') as f:
            res = requests.post(f"{BASE_URL}/upload", files={'file': f})
            if res.status_code == 201:
                print(f"  [+] Registered Asset #{i}")
            else:
                print(f"  [!] Failed Asset #{i}: {res.text}")

    # 2. Simulate 10 Violations (Strikes)
    print("\n[STEP 2] Simulating 10 Web Violations (Strikes)...")
    for i in range(1, 11):
        path = os.path.join(SAMPLES_DIR, f"asset_{i}_violation.jpg")
        platform = platforms[i-1]
        with open(path, 'rb') as f:
            data = {
                'url': f"https://{platform}/infringement_{i}",
                'platform': platform
            }
            res = requests.post(f"{BASE_URL}/scan", files={'file': f}, data=data)
            if res.status_code == 200:
                match = res.json().get('match')
                print(f"  [!] Violation #{i} on {platform} -> Match: {match}")
            else:
                print(f"  [!] Error on Violation #{i}: {res.text}")
        time.sleep(0.1) # Small delay

    print("\n=== TEST SUITE COMPLETE ===")

if __name__ == '__main__':
    run_suite()
