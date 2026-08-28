import httpx
import json
from app.core.config import settings

def test():
    key = settings.gemini_api_key.strip()
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key={key}"
    payload = {
        "contents": [{
            "parts": [{"text": "Extract medications from: Tab Metformin 500mg BD x 1 month, Tab Telmisartan 40mg OD. Output valid JSON: {\"detected_medications\": [{\"name\": \"...\", \"dosage\": \"...\", \"frequency\": \"...\", \"duration\": \"...\"}]}"}]
        }],
        "generationConfig": {"response_mime_type": "application/json"}
    }
    res = httpx.post(url, json=payload, timeout=15.0)
    print("Gemini 3.6 Flash Status:", res.status_code)
    if res.status_code == 200:
        print("RESULT:\n", res.json()["candidates"][0]["content"]["parts"][0]["text"])
    else:
        print(res.text)

if __name__ == '__main__':
    test()
