import fitz  # PyMuPDF
import os

def scan_directory(directory_path: str):
    pdf_files = []
    for root, _, files in os.walk(directory_path):
        for file in files:
            if file.lower().endswith(".pdf"):
                pdf_files.append(os.path.join(root, file))
    return pdf_files

def extract_text_from_pdf(pdf_path: str):
    doc = fitz.open(pdf_path)
    text_content = []
    for page_num, page in enumerate(doc):
        text = page.get_text()
        text_content.append({"page": page_num + 1, "text": text})
    return text_content
