from duckduckgo_search import DDGS

def search_web_pdfs(query: str, max_results=10):
    """
    Searches for PDFs on the web using DuckDuckGo.
    """
    results = []
    # Append "filetype:pdf" to the query to ensure we get PDFs
    full_query = f"{query} filetype:pdf"
    
    with DDGS() as ddgs:
        for r in ddgs.text(full_query, max_results=max_results):
            results.append({
                "title": r.get("title"),
                "url": r.get("href"),
                "snippet": r.get("body")
            })
    return results
