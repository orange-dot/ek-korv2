#!/usr/bin/env python3
"""
Extract text from Infineon AURIX PDF documentation.
Focuses on key sections relevant for TC3xx emulator development.
"""

import os
import sys

try:
    import fitz  # PyMuPDF
except ImportError:
    print("Installing PyMuPDF...")
    os.system(f"{sys.executable} -m pip install PyMuPDF")
    import fitz

def extract_pdf_text(pdf_path, max_pages=None):
    """Extract text from PDF, optionally limiting pages."""
    doc = fitz.open(pdf_path)
    text = []
    total_pages = len(doc)
    pages_to_read = min(max_pages, total_pages) if max_pages else total_pages

    for page_num in range(pages_to_read):
        page = doc[page_num]
        text.append(f"\n{'='*60}\nPAGE {page_num + 1}/{total_pages}\n{'='*60}\n")
        text.append(page.get_text())

    doc.close()
    return "".join(text)

def extract_toc(pdf_path):
    """Extract table of contents."""
    doc = fitz.open(pdf_path)
    toc = doc.get_toc()
    doc.close()
    return toc

def search_pdf(pdf_path, keywords):
    """Search for keywords in PDF and return matching pages."""
    doc = fitz.open(pdf_path)
    results = {}

    for keyword in keywords:
        results[keyword] = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text().lower()
            if keyword.lower() in text:
                results[keyword].append(page_num + 1)

    doc.close()
    return results

def get_pdf_info(pdf_path):
    """Get basic PDF info."""
    doc = fitz.open(pdf_path)
    info = {
        "pages": len(doc),
        "title": doc.metadata.get("title", "Unknown"),
        "author": doc.metadata.get("author", "Unknown"),
    }
    doc.close()
    return info

def main():
    pdf_dir = os.path.dirname(os.path.abspath(__file__))

    # Key PDFs for emulator development
    key_pdfs = {
        "arch_vol1": "infineon-aurix-architecture-vol1-usermanual-en.pdf",
        "arch_vol2": "infineon-aurix-architecture-vol2-usermanual-en.pdf",
        "dcdc": "infineon-an1102-hvlv-dcdc-converter-with-aurix-tc3xx-applicationnotes-en.pdf",
        "edsadc": "infineon-enhanced-delta-sigma-adc-edsadc-basics-applicationnotes-en.pdf",
        "dma": "infineon-dma-linked-list-modes-applicationnotes-en.pdf",
    }

    # Keywords relevant for emulator
    emulator_keywords = [
        "tricore", "cpu", "register", "memory map", "interrupt",
        "timer", "pwm", "adc", "can", "spi", "uart", "gpio",
        "gtm", "gpt12", "vadc", "dsadc", "dma", "trap"
    ]

    print("=" * 70)
    print("INFINEON AURIX TC3xx PDF ANALYSIS")
    print("=" * 70)

    # Find matching PDFs
    all_pdfs = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]

    for short_name, pattern in key_pdfs.items():
        matching = [p for p in all_pdfs if pattern in p]
        if matching:
            pdf_path = os.path.join(pdf_dir, matching[0])
            print(f"\n{'='*60}")
            print(f"PDF: {short_name}")
            print(f"File: {matching[0][:60]}...")

            info = get_pdf_info(pdf_path)
            print(f"Pages: {info['pages']}")

            # Extract TOC
            toc = extract_toc(pdf_path)
            if toc:
                print(f"\nTable of Contents ({len(toc)} entries):")
                for level, title, page in toc[:20]:  # First 20 entries
                    indent = "  " * (level - 1)
                    print(f"  {indent}{title} (p.{page})")
                if len(toc) > 20:
                    print(f"  ... and {len(toc) - 20} more entries")

            # Search for keywords
            print(f"\nKeyword search:")
            results = search_pdf(pdf_path, emulator_keywords)
            for kw, pages in results.items():
                if pages:
                    page_list = pages[:5]
                    more = f"... +{len(pages)-5}" if len(pages) > 5 else ""
                    print(f"  {kw}: pages {page_list}{more}")

    print("\n" + "=" * 70)
    print("To extract specific pages, run:")
    print("  python extract_pdf.py <pdf_name> <start_page> <end_page>")
    print("=" * 70)

if __name__ == "__main__":
    if len(sys.argv) == 4:
        # Extract specific pages
        pdf_pattern = sys.argv[1]
        start_page = int(sys.argv[2])
        end_page = int(sys.argv[3])

        pdf_dir = os.path.dirname(os.path.abspath(__file__))
        all_pdfs = [f for f in os.listdir(pdf_dir) if f.endswith('.pdf')]
        matching = [p for p in all_pdfs if pdf_pattern in p]

        if matching:
            pdf_path = os.path.join(pdf_dir, matching[0])
            doc = fitz.open(pdf_path)

            for page_num in range(start_page - 1, min(end_page, len(doc))):
                print(f"\n{'='*60}")
                print(f"PAGE {page_num + 1}")
                print("=" * 60)
                print(doc[page_num].get_text())

            doc.close()
        else:
            print(f"No PDF matching '{pdf_pattern}' found")
    else:
        main()