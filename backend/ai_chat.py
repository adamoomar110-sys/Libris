import google.generativeai as genai
import os
from dotenv import load_dotenv
from search import search_engine

load_dotenv() # Load variables from .env

def chat_with_library(query: str, api_key: str):
    """
    Performs RAG: 1. Search local library. 2. Ask Gemini with context.
    """
    # Use provided key or fallback to environment variable
    final_key = api_key or os.environ.get("GEMINI_API_KEY")
    
    if not final_key:
        return "Error: API Key is required (provide in UI or set GEMINI_API_KEY env var)."

    try:
        genai.configure(api_key=final_key)
        model = genai.GenerativeModel('gemini-1.5-flash')
        
        # 1. Retrieve context
        search_results = search_engine.search(query)
        
        # Limit context to top 5 results to fit in context window and reduce noise
        context_snippets = []
        for res in search_results[:5]:
            context_snippets.append(f"File: {res['filename']} (Page {res['page']}):\n{res['snippet']}")
            
        context_str = "\n\n".join(context_snippets)
        
        if not context_str:
            prompt = f"User Question: {query}\n\nNo relevant context found in local library. Answer to the best of your general knowledge, but mention you couldn't find specific info in the documents."
        else:
            prompt = f"""You are a helpful assistant for a PDF library. 
Answer the user's question based PRIMARILY on the following context/excerpts from their documents.
If the answer is not in the context, say so.

CONTEXT:
{context_str}

USER QUESTION:
{query}
"""

        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        return f"AI Error: {str(e)}"
