import re
from pathlib import Path
from typing import Dict, Any, List
import pymupdf
import docx

def parse_document(file_path: Path) -> Dict[str, Any]:
    """
    Parses document file (PDF, DOCX, TXT, PY, JS, etc.) using genuine local extractors.
    """
    suffix = file_path.suffix.lower()
    result = {
        "filename": file_path.name,
        "extension": suffix,
        "size_bytes": file_path.stat().st_size,
        "page_count": 1,
        "raw_text": "",
        "sections": [],
        "metadata": {},
        "is_scanned_or_empty": False
    }

    if suffix == ".pdf":
        try:
            doc = pymupdf.open(str(file_path))
            result["page_count"] = len(doc)
            result["metadata"] = {k: v for k, v in doc.metadata.items() if v}
            full_text_list = []
            
            for page_num in range(len(doc)):
                page = doc[page_num]
                page_text = page.get_text("text")
                if page_text.strip():
                    full_text_list.append(f"--- PAGE {page_num + 1} ---\n" + page_text.strip())
            
            result["raw_text"] = "\n\n".join(full_text_list)
            if not result["raw_text"].strip():
                result["is_scanned_or_empty"] = True
                result["raw_text"] = "[Document contains no extractable text layer. Scanned PDF requires OCR module.]"
        except Exception as e:
            result["raw_text"] = f"[Error parsing PDF: {str(e)}]"

    elif suffix in [".docx", ".doc"]:
        try:
            doc = docx.Document(str(file_path))
            paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
            
            # Extract table content if present
            table_texts = []
            for table in doc.tables:
                for row in table.rows:
                    row_data = [cell.text.strip() for cell in row.cells if cell.text.strip()]
                    if row_data:
                        table_texts.append(" | ".join(row_data))
            
            combined = paragraphs + (["--- TABLES ---"] + table_texts if table_texts else [])
            result["raw_text"] = "\n\n".join(combined)
            result["page_count"] = max(1, len(paragraphs) // 10)
        except Exception as e:
            result["raw_text"] = f"[Error parsing DOCX: {str(e)}]"

    elif suffix in [".txt", ".log", ".md", ".py", ".js", ".json", ".sql", ".sh"]:
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                result["raw_text"] = f.read()
        except Exception as e:
            result["raw_text"] = f"[Error reading file: {str(e)}]"

    # Extract high-level sections
    lines = result["raw_text"].split("\n")
    sections = []
    current_sec = "Overview"
    for line in lines:
        line_clean = line.strip()
        if (line_clean.isupper() and 4 < len(line_clean) < 60) or line_clean.startswith("#") or line_clean.startswith("SECTION"):
            current_sec = line_clean.lstrip("#").strip()
            if current_sec not in sections:
                sections.append(current_sec)
    result["sections"] = sections[:10]
    return result
