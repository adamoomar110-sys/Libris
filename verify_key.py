
from dotenv import load_dotenv
import os
import google.generativeai as genai

load_dotenv()
key = os.getenv("GEMINI_API_KEY")

if not key:
    print("FAIL: Key not found in environment.")
else:
    print(f"SUCCESS: Key found (starts with {key[:4]}).")
    try:
        genai.configure(api_key=key)
        model = genai.GenerativeModel('gemini-1.5-flash-001')
        print("SUCCESS: GenAI configured.")
    except Exception as e:
        print(f"FAIL: GenAI configuration error: {e}")
