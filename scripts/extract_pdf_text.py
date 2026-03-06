#!/usr/bin/env python3
"""
Extrait tout le texte d'un PDF et l'affiche pour copier-coller.
- PDF avec texte natif : extraction directe
- PDF scanné (images) : OCR avec pytesseract (nécessite Tesseract installé)
Usage: python scripts/extract_pdf_text.py "chemin/vers/fichier.pdf"
"""

import sys
import subprocess
from pathlib import Path

def install_if_needed(package: str, import_name: str | None = None):
    try:
        __import__(import_name or package)
    except ImportError:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])

def extract_with_pypdf(pdf_path: Path) -> list[str]:
    from pypdf import PdfReader
    reader = PdfReader(str(pdf_path))
    return [page.extract_text() or "" for page in reader.pages]

def extract_with_ocr(pdf_path: Path) -> list[str]:
    """Utilise PyMuPDF + EasyOCR (pas besoin de Tesseract)."""
    install_if_needed("pymupdf", "fitz")
    install_if_needed("easyocr", "easyocr")
    install_if_needed("Pillow", "PIL")
    import fitz  # PyMuPDF
    import easyocr
    from PIL import Image
    import numpy as np

    reader = easyocr.Reader(["fr"], gpu=False, verbose=False)
    doc = fitz.open(str(pdf_path))
    texts = []
    for i in range(len(doc)):
        page = doc.load_page(i)
        mat = fitz.Matrix(2, 2)
        pix = page.get_pixmap(matrix=mat, alpha=False)
        img = np.array(Image.frombytes("RGB", [pix.width, pix.height], pix.samples))
        result = reader.readtext(img, paragraph=True)
        page_text = "\n".join([r[1] for r in result])
        texts.append(page_text)
    doc.close()
    return texts

def main():
    if len(sys.argv) < 2:
        print("Usage: python extract_pdf_text.py <chemin_vers_pdf>")
        print('Exemple: python extract_pdf_text.py "C:\\...\\Statuts association.pdf"')
        sys.exit(1)

    pdf_path = Path(sys.argv[1])
    if not pdf_path.exists():
        print(f"Fichier non trouvé: {pdf_path}")
        sys.exit(1)

    install_if_needed("pypdf", "pypdf")

    texts = extract_with_pypdf(pdf_path)
    needs_ocr = all(not (t and t.strip()) for t in texts)

    if needs_ocr:
        print("PDF scanné détecté. Extraction par OCR (peut prendre 1-2 min)...", file=sys.stderr)
        try:
            texts = extract_with_ocr(pdf_path)
        except Exception as e:
            print(f"OCR échoué: {e}", file=sys.stderr)
            print("Installez Tesseract: https://github.com/UB-Mannheim/tesseract/wiki", file=sys.stderr)
            sys.exit(1)

    full_text = []
    for i, text in enumerate(texts):
        block = text.strip() if text else ""
        full_text.append(f"--- Page {i + 1} ---\n{block}" if block else f"--- Page {i + 1} ---\n(vide)")

    result = "\n\n".join(full_text)
    print(result)
    print("\n" + "=" * 50)
    print("Texte ci-dessus prêt à copier-coller.")

if __name__ == "__main__":
    main()
