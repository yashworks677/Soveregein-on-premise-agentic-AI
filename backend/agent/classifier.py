from typing import List, Dict, Any
from pathlib import Path

def classify_task_intent(file_paths: List[Path], requirement: str) -> Dict[str, Any]:
    """
    Intelligently analyzes uploaded files and natural-language requirements
    to infer the required workflow, tools, models, and deliverable targets.
    Does NOT require the user to pick a mode manually.
    """
    req_lower = requirement.lower()
    extensions = [p.suffix.lower() for p in file_paths]
    file_names = [p.name.lower() for p in file_paths]

    has_pdf = any(ext == ".pdf" for ext in extensions)
    has_excel = any(ext in [".xlsx", ".xls", ".csv"] for ext in extensions)
    has_code = any(ext in [".py", ".js", ".ts", ".html", ".css", ".sql", ".sh"] for ext in extensions)
    has_multiple_files = len(file_paths) > 1

    # Check for RAG / SOP / Standard keywords
    rag_keywords = ["sop", "procedure", "standard", "guideline", "policy", "compliance", "check against", "deviat", "regulation"]
    needs_rag = any(kw in req_lower for kw in rag_keywords)

    # Check for cleaning / spreadsheet keywords
    clean_keywords = ["clean", "sanitize", "impute", "deduplicate", "fix missing", "new excel", "cleaned excel"]
    needs_cleaning = any(kw in req_lower for kw in clean_keywords) or (has_excel and "clean" in req_lower)

    # Check for chart keywords
    chart_keywords = ["chart", "plot", "graph", "visualiz", "scatter", "histogram", "trend"]
    needs_charts = any(kw in req_lower for kw in chart_keywords) or (has_excel and any(w in req_lower for w in ["analyze", "anomal", "outlier", "statistic"]))

    # Check for report / approval keywords
    report_keywords = ["report", "approval", "memorandum", "note", "summary", "document", "consolidat", "formal"]
    needs_report = any(kw in req_lower for kw in report_keywords) or (has_pdf and len(req_lower) > 5)

    # Classification logic
    if has_multiple_files and any(w in req_lower for w in ["compare", "difference", "consolidat", "versus", "vs"]):
        task_type = "Multi-Document Comparative Analysis"
        routed_capability = "Multi-Doc PyMuPDF Parser + Semantic Diff Engine + ReportLab PDF Generator"
    elif needs_rag:
        task_type = "SOP Compliance & Private Knowledge Evaluation"
        routed_capability = "Qdrant Vector RAG + Document Parser + Safety Compliance Reasoner"
    elif has_excel:
        if needs_cleaning:
            task_type = "Spreadsheet Cleaning & Data Quality Assurance"
            routed_capability = "openpyxl Engine + Statistical Imputer + Clean XLSX Exporter"
        else:
            task_type = "Industrial Data Analysis & Anomaly Detection"
            routed_capability = "Tabular Data Analyst + IQR Outlier Detection + Matplotlib Plotter"
    elif has_code:
        task_type = "Code Security & Logic Integrity Analysis"
        routed_capability = "Static Code Reasoner + AST Pattern Inspector + Formal Review Report"
    elif has_pdf:
        if any(w in req_lower for w in ["approval", "critical", "issue", "inspect", "refinery", "pressure", "vessel"]):
            task_type = "Inspection Report Analysis & Approval Memorandum"
            routed_capability = "PyMuPDF Industrial Extractor + Technical Reasoner + python-docx / ReportLab"
        else:
            task_type = "Document Understanding & Technical Synthesis"
            routed_capability = "PyMuPDF Document Parser + Local Synthesis Engine + Deliverable Exporter"
    else:
        task_type = "General Technical Task"
        routed_capability = "Local Deterministic Processing Engine"

    return {
        "task_type": task_type,
        "routed_capability": routed_capability,
        "needs_rag": needs_rag,
        "needs_data_tool": has_excel,
        "needs_charts": needs_charts and has_excel,
        "needs_cleaning": needs_cleaning and has_excel,
        "needs_docx": needs_report,
        "needs_pdf": needs_report or has_pdf or has_multiple_files,
        "is_multi_file": has_multiple_files
    }
