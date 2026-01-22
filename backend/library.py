import json
import os
import uuid
from typing import List, Dict, Optional

class LibraryManager:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir
        self.library_file = os.path.join(data_dir, "library.json")
        self.docs_dir = os.path.join(data_dir, "documents")
        
        if not os.path.exists(self.docs_dir):
            os.makedirs(self.docs_dir)
            
        if not os.path.exists(self.library_file):
            with open(self.library_file, 'w') as f:
                json.dump([], f)

    def _load(self) -> List[Dict]:
        with open(self.library_file, 'r') as f:
            return json.load(f)

    def _save(self, data: List[Dict]):
        with open(self.library_file, 'w') as f:
            json.dump(data, f, indent=4)

    def add_book(self, filename: str, content: List[Dict], original_path: Optional[str] = None):
        library = self._load()
        doc_id = str(uuid.uuid4())
        
        # In a real app we might copy the file to docs_dir
        # For now we'll just store metadata and content
        book_entry = {
            "doc_id": doc_id,
            "filename": filename,
            "total_pages": len(content),
            "content": content, # List of {page: int, text: str}
            "summary": None,
            "translated_title": None,
            "original_path": original_path
        }
        
        library.append(book_entry)
        self._save(library)
        return doc_id

    def get_library(self):
        # Return without the heavy content for listing
        library = self._load()
        return [{k: v for k, v in b.items() if k != "content"} for b in library]

    def get_book(self, doc_id: str):
        library = self._load()
        for b in library:
            if b['doc_id'] == doc_id:
                return b
        return None

    def update_book(self, doc_id: str, updates: Dict):
        library = self._load()
        for i, b in enumerate(library):
            if b['doc_id'] == doc_id:
                library[i].update(updates)
                self._save(library)
                return True
        return False

    def delete_book(self, doc_id: str):
        library = self._load()
        new_library = [b for b in library if b['doc_id'] != doc_id]
        if len(new_library) < len(library):
            self._save(new_library)
            return True
        return False

# Initialize a global manager
# This is a bit hacky for a script but fits the current structure
backend_dir = os.path.dirname(os.path.abspath(__file__))
library_manager = LibraryManager(backend_dir)
