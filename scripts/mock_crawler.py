import requests
import sys

def run_crawler():
    if len(sys.argv) < 2:
        print("Usage: python mock_crawler.py <path_to_altered_image_file>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    
    print(f"[*] Crawling simulation using local visual asset: {image_path}")
    print("[*] Submitting to Digital Asset Protection API...")
    
    url = "http://localhost:5000/api/scan"
    
    with open(image_path, 'rb') as f:
        files = {'file': f}
        data = {
            'url': 'https://piratesite.com/stolen.jpg',
            'platform': 'piratesite.com'
        }
        res = requests.post(url, files=files, data=data)
        
    print(res.status_code)
    try:
        print(res.json())
    except:
        print(res.text)

if __name__ == '__main__':
    run_crawler()
