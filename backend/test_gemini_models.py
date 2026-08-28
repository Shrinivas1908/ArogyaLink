import httpx
import json
from app.core.config import settings

def test():
    key = settings.gemini_api_key.strip()
    models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.5-flash", "gemini-2.0-flash-lite"]
    for m in models:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{m}:generateContent?key={key}"
            payload = {
                "contents": [{"parts": [{"text": "Hello, respond with JSON: {\"model\": \"working\"}"}]}],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                print(f"Model {m} -> Status: {res.status_code}")
                if res.status_code == 200:
                    print("SUCCESS:", res.json()["candidates"][0]["content"]["parts"][0]["text"])
                    break
        except Exception as e:
            print(f"Error testing {m}:", e)

if __name__ == '__main__':
    test()
