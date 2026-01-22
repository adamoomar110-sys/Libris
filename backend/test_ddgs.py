from duckduckgo_search import DDGS
import json

def test_search():
    queries = ["python programming", "calculus basics filetype:pdf"]
    try:
        with DDGS() as ddgs:
            for q in queries:
                print(f"\n--- Results for: {q} ---")
                results = list(ddgs.text(q, max_results=5))
                print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
