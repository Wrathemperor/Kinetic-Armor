import os
import google.generativeai as genai

# Configure Gemini
api_key = os.getenv('GEMINI_API_KEY')
if api_key:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-1.5-flash')
else:
    print("WARNING: GEMINI_API_KEY not found. Using mock AI responses.")

def evaluate_violation(platform, found_url):
    """
    Evaluates a violation using Google Gemini if API_KEY is available.
    Otherwise falls back to high-fidelity mock data.
    """
    if not api_key:
        return get_mock_response(platform, found_url)

    try:
        prompt = f"""
        Analyze a potential copyright violation.
        Platform: {platform}
        URL: {found_url}
        
        Provide:
        1. Severity (1-10) - 1 is low risk (e.g. fan art), 10 is blatant commercial piracy.
        2. Context - A short tag (e.g. "COMMERCIAL MISUSE", "FAN CONTENT").
        3. Draft DMCA - A professional takedown notice.
        
        Return ONLY valid JSON in this format:
        {{
            "severity": number,
            "context": "string",
            "draft_dmca": "string"
        }}
        """
        response = model.generate_content(prompt)
        # Simple extraction logic (assuming the model returns clean JSON)
        import json
        text = response.text.strip()
        if text.startswith('```json'):
            text = text[7:-3].strip()
        data = json.loads(text)
        return data
    except Exception as e:
        print(f"Gemini API Error: {e}. Falling back to mock.")
        return get_mock_response(platform, found_url)

def get_mock_response(platform, found_url):
    severity = 8
    context = "COMMERCIAL MISUSE DETECTED"
    if "reddit.com" in found_url:
        severity = 2
        context = "FAN CONTENT (LOW RISK)"
    
    draft_dmca = f"""
Dear Abuse Team at {platform},

We are the authorized representative for the intellectual property in question. 
It has come to our attention that your platform is hosting an infringed asset at:
{found_url}

Please remove this content under the DMCA.

Sincerely,
Kinetic Digital Asset Protection
"""
    return {
        "severity": severity,
        "context": context,
        "draft_dmca": draft_dmca.strip()
    }
