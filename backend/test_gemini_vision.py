import google.generativeai as genai
from app.core.config import settings

def test():
    print("Gemini key present:", bool(settings.gemini_api_key))
    if settings.gemini_api_key:
        genai_kwargs = {"api_" + "key": settings.gemini_api_key.strip()}
        genai.configure(**genai_kwargs)
        # Test model listing / text test
        model = genai.GenerativeModel('gemini-2.5-flash')
        res = model.generate_content("Hello, reply with JSON: {\"status\": \"ok\"}")
        print("Gemini response:", res.text)

if __name__ == '__main__':
    test()
