
import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

print("Testing Web Search for 'python'...")
try:
    from backend.web_search import search_web_pdfs
    results = search_web_pdfs("python", max_results=5)
    print(f"Results found: {len(results)}")
    for r in results:
        print(f"- {r['title']} ({r['url']}) [PDF: {r['is_pdf']}]")
except Exception as e:
    print(f"Error testing web search: {e}")
