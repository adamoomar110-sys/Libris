from duckduckgo_search import DDGS

def search_web_pdfs(query: str, max_results=10):
    """
    Searches for PDFs on the web using DuckDuckGo.
    Try multiple patterns to ensure results.
    """
    results = []
    # Search patterns
    patterns = [f"{query} filetype:pdf", f"{query} ext:pdf"]
    
    try:
        with DDGS() as ddgs:
            for pattern in patterns:
                if len(results) >= max_results:
                    break
                    
                print(f"Searching pattern: {pattern}")
                search_gen = ddgs.text(pattern, max_results=5)
                for r in search_gen:
                    url = r.get("href", "#")
                    title = r.get("title", "Doc")
                    snippet = r.get("body", "")
                    
                    # Deduplicate
                    if any(res['url'] == url for res in results):
                        continue
                        
                    # Score and prioritize PDFs
                    is_pdf = ".pdf" in url.lower() or "pdf" in title.lower() or "pdf" in snippet.lower()
                    
                    results.append({
                        "title": title,
                        "url": url,
                        "snippet": snippet,
                        "is_pdf": is_pdf
                    })
                
                # Tiny sleep to avoid block
                import time
                time.sleep(1)
                
        # Sort so PDFs are first
        results.sort(key=lambda x: x['is_pdf'], reverse=True)
                
    except Exception as e:
        print(f"Web Search Error: {e}")
        
    return results[:max_results]
