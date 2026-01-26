from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
from indexer import scan_directory, extract_text_from_pdf
from search import search_engine
from library import library_manager
from fastapi import UploadFile, File
import shutil

app = FastAPI(title="Libris API", version="1.5")

@app.get("/health")
def health_check():
    return {"status": "ok", "app": "Libris"}



class SearchResult(BaseModel):
    filename: str
    page: int
    snippet: str

class ScanRequest(BaseModel):
    path: str

class SaveWebURLRequest(BaseModel):
    url: str
    filename: str

@app.post("/api/scan")
def scan_pdfs(request: ScanRequest):
    if not os.path.isdir(request.path):
        raise HTTPException(status_code=400, detail="Invalid directory path")
    
    pdf_files = scan_directory(request.path)
    count = 0
    for pdf_path in pdf_files:
        try:
            filename = os.path.basename(pdf_path)
            # Check if already in library
            existing = [b for b in library_manager.get_library() if b['filename'] == filename]
            if not existing:
                pages = extract_text_from_pdf(pdf_path)
                library_manager.add_book(filename, pages, pdf_path)
                search_engine.add_document(filename, pages)
                count += 1
        except Exception as e:
            print(f"Error processing {pdf_path}: {e}")
            
    return {"message": f"Scanned {count} files", "files": pdf_files}

@app.get("/api/library")
def get_library():
    return library_manager.get_library()

@app.post("/api/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")
    
    # Save temp file
    temp_path = os.path.join(library_manager.docs_dir, file.filename)
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        pages = extract_text_from_pdf(temp_path)
        doc_id = library_manager.add_book(file.filename, pages, temp_path)
        search_engine.add_document(file.filename, pages)
        return {"doc_id": doc_id, "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/delete/{doc_id}")
def delete_book(doc_id: str):
    if library_manager.delete_book(doc_id):
        return {"message": "Book deleted"}
    raise HTTPException(status_code=404, detail="Book not found")

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

@app.post("/api/intelligent-search")
def intelligent_search(request: ChatRequest):
    from ai_chat import chat_with_library
    from search import search_engine
    
    # 1. Get raw results for reference
    raw_results = search_engine.search(request.query)
    # 2. Get intelligent response
    ai_response = chat_with_library(request.query, request.api_key)
    
    return {
        "ai_response": ai_response,
        "results": raw_results
    }

@app.post("/api/intelligent-web-search")
def intelligent_web_search(request: ChatRequest):
    from ai_chat import web_search_intelligence
    from web_search import search_web_pdfs
    
    # 1. Get raw web results
    web_results = search_web_pdfs(request.query)
    # 2. Get intelligent summary
    ai_response = web_search_intelligence(request.query, web_results, request.api_key)
    
    return {
        "ai_response": ai_response,
        "results": web_results
    }

@app.post("/api/save-from-web")
def save_from_web(request: SaveWebURLRequest):
    import requests
    from indexer import extract_text_from_pdf
    
    try:
        # 1. Download the PDF
        response = requests.get(request.url, timeout=20, stream=True)
        response.raise_for_status()
        
        # 2. Clean filename
        clean_name = request.filename.split('?')[0].split('#')[0]
        if not clean_name.lower().endswith(".pdf"):
            clean_name += ".pdf"
        
        # Avoid duplicate names in docs_dir
        file_path = os.path.join(library_manager.docs_dir, clean_name)
        
        with open(file_path, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
            
        # 3. Extract text and add to library
        pages = extract_text_from_pdf(file_path)
        doc_id = library_manager.add_book(clean_name, pages, file_path)
        search_engine.add_document(clean_name, pages)
        
        return {"status": "success", "doc_id": doc_id, "filename": clean_name}
    except Exception as e:
        print(f"Error saving web PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/summarize/{doc_id}")
def summarize_doc(doc_id: str, request: ChatRequest):
    from ai_chat import summarize_document
    book = library_manager.get_book(doc_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    summary = summarize_document(book, request.api_key)
    library_manager.update_book(doc_id, {"summary": summary})
    return {"summary": summary}

@app.post("/api/translate/{doc_id}")
def translate_doc(doc_id: str, request: ChatRequest):
    from ai_chat import translate_document
    book = library_manager.get_book(doc_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    
    translated_content = translate_document(book, request.api_key)
    library_manager.update_book(doc_id, {
        "content": translated_content,
        "translated_title": f"Traducción: {book['filename']}"
    })
    return {"message": "Book translated successfully"}

# Standard Path Resolution
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
frontend_dist = os.path.join(base_dir, "frontend", "dist")

@app.on_event("startup")
async def startup_event():
    print(f"Libris Backend starting...")
    print(f"Base dir: {base_dir}")
    print(f"Frontend dist path: {frontend_dist}")
    
    # Reload search index
    print("Loading library into search index...")
    books = library_manager.get_library()
    count = 0 
    for book in books:
        # We need the full content to index, so we get the full book
        full_book = library_manager.get_book(book['doc_id'])
        if full_book and full_book.get('content'):
            search_engine.add_document(full_book['filename'], full_book['content'])
            count += 1
    print(f"Loaded {count} books into search index.")

# All your API routes here... (already defined)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# Mount Frontend (Static Files)
if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")
    
    @app.get("/")
    async def serve_index():
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "index.html not found", "path": index_path}
    
    # Catch-all for React Router
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        if full_path.startswith("api") or full_path.startswith("assets"):
             raise HTTPException(status_code=404, detail="Not found")
        index_path = os.path.join(frontend_dist, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"error": "SPA index.html not found"}
else:
    @app.get("/")
    def no_frontend():
        return {"error": "Frontend dist not found", "path": frontend_dist}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
