from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from indexer import scan_directory, extract_text_from_pdf
from search import search_engine

app = FastAPI(title="Libris API", version="1.0")

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "Libris"}

class SearchResult(BaseModel):
    filename: str
    page: int
    snippet: str

class ScanRequest(BaseModel):
    path: str

@app.post("/scan")
def scan_pdfs(request: ScanRequest):
    if not os.path.isdir(request.path):
        raise HTTPException(status_code=400, detail="Invalid directory path")
    
    pdf_files = scan_directory(request.path)
    count = 0
    for pdf_path in pdf_files:
        try:
            pages = extract_text_from_pdf(pdf_path)
            search_engine.add_document(os.path.basename(pdf_path), pages)
            count += 1
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")
            
    return {"message": f"Scanned {count} files", "files": pdf_files}

@app.get("/search", response_model=List[SearchResult])
def search(q: str):
    if not q:
        return []
    return search_engine.search(q)

@app.get("/web-search")
def web_search(q: str):
    from web_search import search_web_pdfs
    return search_web_pdfs(q)

class ChatRequest(BaseModel):
    query: str
    api_key: Optional[str] = None

@app.post("/chat")
def chat(request: ChatRequest):
    from ai_chat import chat_with_library
    response = chat_with_library(request.query, request.api_key)
    return {"response": response}

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount Frontend (Static Files)
# Usually ../frontend/dist from backend/
# Or ./frontend/dist if running from root with start_app.py having backend in path, 
# but we need absolute path to be safe
frontend_dist = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/")
    async def serve_index():
        return FileResponse(os.path.join(frontend_dist, "index.html"))
    
    # Catch-all for React Router
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Allow API routes to pass through if they didn't match above (though they are defined before)
        if full_path.startswith("api"):
             raise HTTPException(status_code=404, detail="API route not found")
        return FileResponse(os.path.join(frontend_dist, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
