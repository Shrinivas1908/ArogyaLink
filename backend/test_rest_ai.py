import httpx
import json
import base64
from app.core.config import settings

def test():
    print("Gemini key:", settings.gemini_api_key[:10] if settings.gemini_api_key else None)
    print("Groq key:", settings.groq_api_key[:10] if settings.groq_api_key else None)
    
    # 1. Test Groq
    if settings.groq_api_key:
        try:
            headers = {
                "Authorization": f"Bearer {settings.groq_api_key.strip()}",
                "Content-Type": "application/json",
            }
            payload = {
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": "Reply in JSON: {\"status\": \"groq_ok\"}"}],
                "response_format": {"type": "json_object"}
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post("https://api.groq.com/openai/v1/chat/completions", headers=headers, json=payload)
                print("Groq status:", res.status_code, res.text[:200])
        except Exception as e:
            print("Groq error:", e)

    # 2. Test Gemini REST API
    if settings.gemini_api_key:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.gemini_api_key.strip()}"
            payload = {
                "contents": [{
                    "parts": [{"text": "Reply with valid JSON: {\"status\": \"gemini_ok\"}"}]
                }],
                "generationConfig": {"response_mime_type": "application/json"}
            }
            with httpx.Client(timeout=10.0) as client:
                res = client.post(url, json=payload)
                print("Gemini status:", res.status_code, res.text[:200])
        except Exception as e:
            print("Gemini error:", e)

if __name__ == '__main__':
    test()
