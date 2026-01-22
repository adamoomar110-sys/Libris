import google.generativeai as genai
import os
from dotenv import load_dotenv
from search import search_engine

load_dotenv()

def get_model(api_key: str):
    final_key = api_key or os.environ.get("GEMINI_API_KEY")
    if not final_key:
        raise ValueError("API Key is required.")
    genai.configure(api_key=final_key)
    return genai.GenerativeModel('gemini-1.5-flash')

def chat_with_library(query: str, api_key: str):
    """
    RAG for local library.
    """
    try:
        model = get_model(api_key)
        search_results = search_engine.search(query)
        
        context_snippets = []
        for res in search_results[:5]:
            context_snippets.append(f"Archivo: {res['filename']} (Pág {res['page']}):\n{res['snippet']}")
            
        context_str = "\n\n".join(context_snippets)
        
        if not context_str:
            prompt = f"Consulta: {query}\n\nNo se encontró contexto relevante en los documentos locales. Responde con tu conocimiento general pero advierte que no hay info específica en la biblioteca."
        else:
            prompt = f"""Eres un asistente para una biblioteca de PDFs. 
Responde la pregunta basándote PRINCIPALMENTE en este contexto extraído de los documentos.
Si la respuesta no está en el contexto, menciónalo pero intenta ayudar con lo que sepas.

CONTEXTO:
{context_str}

PREGUNTA:
{query}
"""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error IA (Local): {str(e)}"

def web_search_intelligence(query: str, web_results: list, api_key: str):
    """
    Synthesize web search results into an intelligent answer.
    """
    try:
        if not web_results:
            return "No se encontraron resultados en la web para esta consulta."
            
        model = get_model(api_key)
        
        context_snippets = []
        for r in web_results[:5]:
            context_snippets.append(f"Título: {r['title']}\nSnippet: {r['snippet']}\nURL: {r['url']}")
            
        context_str = "\n\n".join(context_snippets)
        
        prompt = f"""Has realizado una búsqueda web sobre: "{query}".
A continuación tienes los fragmentos de los resultados encontrados. 
Por favor, genera una respuesta inteligente, coherente y resumida que responda a la duda del usuario basándote en estos resultados.
Cita o menciona fuentes si es relevante basándote en los títulos/URLs proporcionados.

RESULTADOS WEB:
{context_str}

PREGUNTA DEL USUARIO:
{query}
"""
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error IA (Web): {str(e)}"

def summarize_document(book: dict, api_key: str):
    """
    Generates a high-level summary of the entire document.
    """
    try:
        model = get_model(api_key)
        
        # Combine snippets from first 10 pages for a representative summary
        pages_to_use = book['content'][:10]
        context = "\n\n".join([f"Pág {p['page']}: {p['text'][:1000]}" for p in pages_to_use])
        
        prompt = f"""Eres un experto analista de documentos. 
Por favor, genera un resumen ejecutivo y conciso del siguiente documento. 
Identifica los temas principales y el propósito del texto.

CONTENIDO (Extractos):
{context}

Resumen en español:"""
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error al resumir: {str(e)}"

def translate_document(book: dict, api_key: str):
    """
    Translates the document content to Spanish (or target language).
    Returns a new content list.
    """
    try:
        model = get_model(api_key)
        translated_content = []
        
        # Translate page by page (limiting to first 5 for performance/demo)
        for p in book['content'][:5]:
            prompt = f"Traduce el siguiente texto al español de forma natural, manteniendo el sentido original:\n\n{p['text']}"
            response = model.generate_content(prompt)
            translated_content.append({
                "page": p['page'],
                "text": response.text
            })
            
        return translated_content
    except Exception as e:
        print(f"Translation error: {e}")
        return book['content'] # Fallback to original
