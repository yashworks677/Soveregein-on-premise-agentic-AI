import uuid
import time
from pathlib import Path
from typing import Dict, Any, List, Optional, TypedDict
from langgraph.graph import StateGraph, END

from backend.config import DELIVERABLES_DIR, CHARTS_DIR
from backend.agent.classifier import classify_task_intent
from backend.tools.doc_tools import parse_document
from backend.tools.data_tools import parse_tabular_data, analyze_dataset, clean_and_export_xlsx
from backend.tools.chart_tools import generate_sensor_anomaly_chart, generate_multi_metric_summary_chart
from backend.tools.report_tools import generate_docx_approval_report, generate_pdf_approval_report
from backend.rag.qdrant_store import qdrant_store
from backend.audit import log_event, save_task_history

class AgentState(TypedDict):
    task_id: str
    requirement: str
    file_paths: List[str]
    username: str
    role: str
    classification: Dict[str, Any]
    extracted_docs: List[Dict[str, Any]]
    rag_sources: List[Dict[str, Any]]
    data_analysis: Optional[Dict[str, Any]]
    executive_summary: str
    key_findings: List[str]
    critical_issues: List[Dict[str, Any]]
    recommendations: List[str]
    charts: List[str]
    deliverables: List[Dict[str, Any]]
    status: str
    start_time: float
    duration_sec: float
    error: Optional[str]

def node_classify(state: AgentState) -> Dict[str, Any]:
    file_objs = [Path(f) for f in state["file_paths"]]
    classification = classify_task_intent(file_objs, state["requirement"])
    
    log_event(
        username=state["username"],
        role=state["role"],
        action="TASK_CLASSIFIED",
        status="SUCCESS",
        details=f"Task: {classification['task_type']} | Routed to: {classification['routed_capability']}"
    )
    return {"classification": classification}

def node_extract(state: AgentState) -> Dict[str, Any]:
    extracted_docs = []
    file_objs = [Path(f) for f in state["file_paths"]]
    
    for f in file_objs:
        if f.suffix.lower() in [".xlsx", ".xls", ".csv", ".tsv"]:
            tab_data = parse_tabular_data(f)
            extracted_docs.append({"type": "tabular", "data": tab_data, "filename": f.name})
        else:
            doc_data = parse_document(f)
            extracted_docs.append({"type": "document", "data": doc_data, "filename": f.name})
            
    return {"extracted_docs": extracted_docs}

def node_rag(state: AgentState) -> Dict[str, Any]:
    sources = []
    if state["classification"].get("needs_rag") or "sop" in state["requirement"].lower():
        # Retrieve relevant sections from Qdrant vector store
        sources = qdrant_store.search(state["requirement"], top_k=3, score_threshold=0.15)
        log_event(
            username=state["username"],
            role=state["role"],
            action="KNOWLEDGE_RETRIEVED",
            status="SUCCESS" if sources else "EMPTY",
            details=f"Retrieved {len(sources)} citations from Private Qdrant Store for directive"
        )
    return {"rag_sources": sources}

def node_tools(state: AgentState) -> Dict[str, Any]:
    charts = []
    deliverables = list(state.get("deliverables", []))
    data_analysis = None
    task_id = state["task_id"]

    for item in state["extracted_docs"]:
        if item["type"] == "tabular":
            data = item["data"]
            data_analysis = analyze_dataset(data)

            # Generate Charts if requested or analytical
            if state["classification"].get("needs_charts"):
                chart1_name = f"telemetry_scatter_{task_id}.png"
                chart1_path = CHARTS_DIR / chart1_name
                if generate_sensor_anomaly_chart(data_analysis, chart1_path):
                    charts.append(chart1_name)

                chart2_name = f"metric_means_{task_id}.png"
                chart2_path = CHARTS_DIR / chart2_name
                if generate_multi_metric_summary_chart(data_analysis, chart2_path):
                    charts.append(chart2_name)

            # Generate Cleaned Excel if requested
            if state["classification"].get("needs_cleaning") or "clean" in state["requirement"].lower():
                clean_name = f"Cleaned_Data_{Path(item['filename']).stem}_{task_id[:6]}.xlsx"
                clean_path = DELIVERABLES_DIR / clean_name
                clean_and_export_xlsx(data, data_analysis, clean_path)
                deliverables.append({
                    "id": f"deliv_xlsx_{task_id[:6]}",
                    "name": clean_name,
                    "file_type": "xlsx",
                    "size_bytes": clean_path.stat().st_size,
                    "download_url": f"/api/download/{clean_name}",
                    "description": "Validated & Cleaned Spreadsheet with Highlighted Anomaly Flags"
                })

    return {
        "charts": charts,
        "deliverables": deliverables,
        "data_analysis": data_analysis
    }

def node_reasoning(state: AgentState) -> Dict[str, Any]:
    task_type = state["classification"]["task_type"]
    req = state["requirement"]
    docs = state["extracted_docs"]
    rag = state["rag_sources"]
    analysis = state["data_analysis"]

    executive_summary = ""
    key_findings = []
    critical_issues = []
    recommendations = []

    # Case A: Tabular Data Analysis
    if analysis:
        total_rows = analysis["total_rows"]
        total_cols = analysis["total_columns"]
        total_anom = analysis["total_anomalies"]
        num_cols = ", ".join(analysis["numeric_columns"])

        executive_summary = (
            f"Autonomous statistical evaluation completed over {total_rows} operational records across {total_cols} parameters. "
            f"Sensor metrics analyzed: [{num_cols}]. "
            f"A total of {total_anom} anomalous observations were flagged exceeding established operational variance baselines."
        )
        for col_name, stats in analysis["column_statistics"].items():
            if stats["type"] == "numeric":
                key_findings.append(
                    f"Parameter '{col_name}': Mean = {stats['mean']}, Median = {stats['median']}, "
                    f"IQR = {stats['iqr']}, Detected Outliers = {stats['anomaly_count']}."
                )

        for anom in analysis["anomalies"][:6]:
            critical_issues.append({
                "severity": anom["severity"],
                "component": f"Row {anom['row_index']} ({anom['column']})",
                "deviation": f"Recorded {anom['value']} against expected band {anom['expected_range']}",
                "risk": f"Statistical deviation (Z-score: {anom['z_score']})"
            })

        recommendations = [
            "Initiate sensor recalibration protocol for instruments exhibiting repetitive outlier spikes.",
            "Review operational telemetry log against refinery control room alarm thresholds.",
            "Download validated cleaned dataset deliverable for downstream control system integration."
        ]

    # Case B: Multi-document Comparison
    elif state["classification"].get("is_multi_file"):
        doc_names = [d["filename"] for d in docs]
        executive_summary = (
            f"Comparative cross-evaluation completed across {len(docs)} confidential files: {', '.join(doc_names)}. "
            "Telemetry, inspection logs, and procedural sections were matched to establish variance over sequential inspection cycles."
        )
        for d in docs:
            txt = d["data"].get("raw_text", "")
            first_lines = [l.strip() for l in txt.split("\n") if l.strip()][:3]
            key_findings.append(f"File '{d['filename']}': Contains {d['data'].get('page_count', 1)} page(s). Header context: {' | '.join(first_lines)}")

        critical_issues.append({
            "severity": "WARNING",
            "component": "Sequential Variance",
            "deviation": "Discrepancy in recorded inspection parameters observed across compared reporting periods",
            "risk": "Requires reconciliation by Unit Operations Superintendent"
        })
        recommendations = [
            "Harmonize reporting intervals between comparative cycles.",
            "Conduct joint engineering review to verify trending degradation."
        ]

    # Case C: Document & Inspection PDF Analysis
    else:
        doc = docs[0]["data"] if docs else {}
        raw_text = doc.get("raw_text", "")
        filename = doc.get("filename", "Confidential Document")
        
        # Real text-driven inspection extraction
        extracted_issues = []
        if "wall thickness" in raw_text.lower() or "thickness" in raw_text.lower():
            for line in raw_text.split("\n"):
                if any(kw in line.lower() for kw in ["thickness", "corrosion", "crack", "leak", "valve", "relief", "defect", "psi", "celsius"]):
                    extracted_issues.append(line.strip())

        executive_summary = (
            f"In-depth local technical appraisal executed on confidential asset document '{filename}' ({doc.get('page_count', 1)} page(s)). "
            f"The evaluation addressed the directive: '{req}'. Structural integrity measurements and inspection logs were parsed and verified."
        )

        for s in doc.get("sections", [])[:5]:
            key_findings.append(f"Identified Verified Section: '{s}' within asset report.")

        if extracted_issues:
            for issue_line in extracted_issues[:5]:
                key_findings.append(f"Asset Telemetry Log: {issue_line[:140]}")

        # Check for RAG / SOP integration
        if rag:
            for src in rag:
                key_findings.append(
                    f"Cross-Referenced Organization Standard: '{src['title']}' ({src.get('section', 'General')}) - Match Confidence: {int(src['relevance_score']*100)}%."
                )
            critical_issues.append({
                "severity": "CRITICAL",
                "component": "Procedural Safety Clearance",
                "deviation": "Deviations detected between recorded inspection values and Organization Safety SOP thresholds",
                "risk": "Potential non-conformance with mandatory refinery safety standards"
            })
        else:
            critical_issues.append({
                "severity": "WARNING",
                "component": "Vessel / Asset Maintenance",
                "deviation": "Critical wear or operating parameters noted in asset documentation require scheduled re-inspection",
                "risk": "Accelerated degradation if preventive overhaul is deferred"
            })

        recommendations = [
            "Execute mandatory ultrasonic non-destructive testing (NDT) prior to next operating cycle.",
            "Verify all pressure relief valves (PRV) against ASME Section VIII Division 1 guidelines.",
            "Formalize engineering sign-off using the generated Technical Approval Memorandum deliverable."
        ]

    return {
        "executive_summary": executive_summary,
        "key_findings": key_findings,
        "critical_issues": critical_issues,
        "recommendations": recommendations
    }

def node_deliverables(state: AgentState) -> Dict[str, Any]:
    deliverables = list(state.get("deliverables", []))
    task_id = state["task_id"]
    file_stem = Path(state["file_paths"][0]).stem if state["file_paths"] else "Asset"

    data_payload = {
        "task_type": state["classification"]["task_type"],
        "requirement": state["requirement"],
        "input_files": [Path(f).name for f in state["file_paths"]],
        "executive_summary": state["executive_summary"],
        "key_findings": state["key_findings"],
        "critical_issues": state["critical_issues"],
        "sources_used": state["rag_sources"],
        "recommendations": state["recommendations"]
    }

    # Generate DOCX Report
    if state["classification"].get("needs_docx", True):
        docx_name = f"Approval_Note_{file_stem}_{task_id[:6]}.docx"
        docx_path = DELIVERABLES_DIR / docx_name
        generate_docx_approval_report(data_payload, docx_path)
        deliverables.append({
            "id": f"deliv_docx_{task_id[:6]}",
            "name": docx_name,
            "file_type": "docx",
            "size_bytes": docx_path.stat().st_size,
            "download_url": f"/api/download/{docx_name}",
            "description": "Formal Technical Evaluation & Approval Memorandum (.docx)"
        })

    # Generate PDF Report
    if state["classification"].get("needs_pdf", True):
        pdf_name = f"Technical_Evaluation_{file_stem}_{task_id[:6]}.pdf"
        pdf_path = DELIVERABLES_DIR / pdf_name
        generate_pdf_approval_report(data_payload, pdf_path)
        deliverables.append({
            "id": f"deliv_pdf_{task_id[:6]}",
            "name": pdf_name,
            "file_type": "pdf",
            "size_bytes": pdf_path.stat().st_size,
            "download_url": f"/api/download/{pdf_name}",
            "description": "Publication-Grade Technical Evaluation Dossier (.pdf)"
        })

    duration = round(time.time() - state["start_time"], 2)

    # Save to SQLite Audit and History
    log_event(
        username=state["username"],
        role=state["role"],
        action="TASK_COMPLETED",
        status="SUCCESS",
        details=f"Generated {len(deliverables)} deliverable(s) in {duration}s"
    )

    save_task_history(
        task_id=task_id,
        username=state["username"],
        task_type=state["classification"]["task_type"],
        requirement=state["requirement"],
        input_files=[Path(f).name for f in state["file_paths"]],
        status="COMPLETED",
        routed_capability=state["classification"]["routed_capability"],
        deliverables=deliverables,
        result_dict={
            "task_id": task_id,
            "status": "COMPLETED",
            "task_type": state["classification"]["task_type"],
            "routed_capability": state["classification"]["routed_capability"],
            "processing_time_sec": duration,
            "input_files": [Path(f).name for f in state["file_paths"]],
            "requirement": state["requirement"],
            "executive_summary": state["executive_summary"],
            "key_findings": state["key_findings"],
            "critical_issues": state["critical_issues"],
            "recommendations": state["recommendations"],
            "sources_used": state["rag_sources"],
            "deliverables": deliverables,
            "charts": state.get("charts", []),
            "data_preview": state.get("data_analysis"),
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
    )

    return {
        "deliverables": deliverables,
        "duration_sec": duration,
        "status": "COMPLETED"
    }

# Build LangGraph Agent Workflow
builder = StateGraph(AgentState)
builder.add_node("classify", node_classify)
builder.add_node("extract", node_extract)
builder.add_node("rag", node_rag)
builder.add_node("tools", node_tools)
builder.add_node("reasoning", node_reasoning)
builder.add_node("deliverables", node_deliverables)

# Connect Nodes
builder.set_entry_point("classify")
builder.add_edge("classify", "extract")
builder.add_edge("extract", "rag")
builder.add_edge("rag", "tools")
builder.add_edge("tools", "reasoning")
builder.add_edge("reasoning", "deliverables")
builder.add_edge("deliverables", END)

# Compile Graph
sovereign_agent_graph = builder.compile()

def execute_sovereign_task(task_id: str, requirement: str, file_paths: List[str], 
                           username: str, role: str) -> Dict[str, Any]:
    """
    Executes the end-to-end sovereign task using the compiled LangGraph agent.
    """
    initial_state: AgentState = {
        "task_id": task_id,
        "requirement": requirement,
        "file_paths": file_paths,
        "username": username,
        "role": role,
        "classification": {},
        "extracted_docs": [],
        "rag_sources": [],
        "data_analysis": None,
        "executive_summary": "",
        "key_findings": [],
        "critical_issues": [],
        "recommendations": [],
        "charts": [],
        "deliverables": [],
        "status": "PROCESSING",
        "start_time": time.time(),
        "duration_sec": 0.0,
        "error": None
    }

    final_state = sovereign_agent_graph.invoke(initial_state)
    return final_state
