from typing import List, Dict

class SearchEngine:
    def __init__(self):
        # In-memory index for now: List of {file: str, page: int, text: str}
        self.index = []

    def add_document(self, filename: str, pages: List[Dict]):
        """
        pages: list of dicts with 'page' (int) and 'text' (str)
        """
        for p in pages:
            self.index.append({
                "filename": filename,
                "page": p['page'],
                "text": p['text']
            })

    def search(self, query: str) -> List[Dict]:
        results = []
        query_lower = query.lower()
        for item in self.index:
            if query_lower in item['text'].lower():
                # Extract a snippet
                idx = item['text'].lower().find(query_lower)
                start = max(0, idx - 30)
                end = min(len(item['text']), idx + 30 + len(query))
                snippet = "..." + item['text'][start:end].replace("\n", " ") + "..."
                
                results.append({
                    "filename": item['filename'],
                    "page": item['page'],
                    "snippet": snippet
                })
        return results

search_engine = SearchEngine()
