from duckduckgo_search import DDGS

def search_web_pdfs(query: str, max_results=10):
    """
    Searches for PDFs on the web using DuckDuckGo.
    Try multiple patterns to ensure results.
    """
    results = []
    # Search patterns
    # 1. High precision: Strict PDF filetype
    # 2. Medium precision: "pdf" keyword
    # 3. Fallback: Raw query (e.g. for "endodoncia", usually wiki or articles appear)
    strict_patterns = [f"{query} filetype:pdf"]
    broad_patterns = [f"{query} pdf", query] 
    
    try:
        with DDGS() as ddgs:
            # Phase 1: Strict PDF Search
            for pattern in strict_patterns:
                if len(results) >= max_results:
                    break
                print(f"Searching strict: {pattern}")
                try:
                    for r in ddgs.text(pattern, max_results=5):
                        url = r.get("href", "#")
                        if any(res['url'] == url for res in results): continue
                        
                        results.append({
                            "title": r.get("title", ""),
                            "url": url,
                            "snippet": r.get("body", ""),
                            "is_pdf": True # It's filetype:pdf, so almost certainly yes
                        })
                except Exception as e:
                    print(f"Strict search error: {e}")

            # Phase 2: Broader Search if we need more
            if len(results) < max_results:
                for pattern in broad_patterns:
                    if len(results) >= max_results: break
                    print(f"Searching broad: {pattern}")
                    try:
                        for r in ddgs.text(pattern, max_results=5):
                            url = r.get("href", "#")
                            if any(res['url'] == url for res in results): continue
                            
                            # Heuristic detection
                            is_pdf = url.lower().endswith(".pdf")
                            if not is_pdf:
                                title_lower = r.get("title", "").lower()
                                if "pdf" in title_lower or "[pdf]" in title_lower:
                                    is_pdf = True
                                    
                            results.append({
                                "title": r.get("title", ""),
                                "url": url,
                                "snippet": r.get("body", ""),
                                "is_pdf": is_pdf
                            })
                    except Exception as e:
                        print(f"Broad search error: {e}")

            # Sort: PDFs first
            results.sort(key=lambda x: x['is_pdf'], reverse=True)
            
    except Exception as e:
        print(f"Web Search Critical Error: {e}")
        
    return results[:max_results]
