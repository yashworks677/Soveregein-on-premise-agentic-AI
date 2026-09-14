import os
import shutil
import uuid
import time
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.config import (
    STORAGE_DIR, UPLOADS_DIR, DELIVERABLES_DIR, CHARTS_DIR, KNOWLEDGE_DIR, 
    SAMPLE_DATA_DIR, ENCLAVE_MODE, EXTERNAL_API_STATUS, DB_PATH
)
from backend.models import (
    User, Token, LoginRequest, TaskResult, AuditEntry, 
    KnowledgeDoc, SystemStatus
)
from backend.auth import (
    authenticate_user, create_access_token, get_current_user, require_admin
)
from backend.audit import (
    log_event, get_audit_logs, get_task_history, get_task_by_id,
    get_registered_knowledge
)
from backend.rag.qdrant_store import qdrant_store
from backend.tools.doc_tools import parse_document
from backend.agent.workflow import execute_sovereign_task

app = FastAPI(
    title="SovereignAI Workbench API",
    description="Confidential Air-Gapped Industrial & Defence AI Enclave",
    version="1.0.0"
)

# Enable CORS for frontend local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static directories for deliverables and charts
app.mount("/static/charts", StaticFiles(directory=str(CHARTS_DIR)), name="charts")

@app.on_event("startup")
async def startup_init():
    # Ensure storage directories exist
    for d in [STORAGE_DIR, UPLOADS_DIR, DELIVERABLES_DIR, CHARTS_DIR, KNOWLEDGE_DIR, SAMPLE_DATA_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    
    # Check if sample files exist; if not, generate them
    sop_sample = SAMPLE_DATA_DIR / "Safety_SOP_Refinery_Pressure_Vessels.pdf"
    if not sop_sample.exists():
        try:
            from backend.sample_data.generate_samples import (
                create_inspection_pdf, create_safety_sop_pdf, 
                create_plant_metrics_xlsx, create_comparison_reports
            )
            create_inspection_pdf(SAMPLE_DATA_DIR / "Inspection_Report_Distillation_Unit_7.pdf")
            create_safety_sop_pdf(sop_sample)
            create_plant_metrics_xlsx(SAMPLE_DATA_DIR / "Plant_Performance_Metrics_Q3.xlsx")
            create_comparison_reports(SAMPLE_DATA_DIR)
        except Exception as e:
            print(f"Sample generation warning: {e}")

    # Check if knowledge base is seeded
    try:
        docs = get_registered_knowledge()
        if not docs and sop_sample.exists():
            doc = parse_document(sop_sample)
            qdrant_store.add_document(
                doc_id="doc_sop_504",
                filename=sop_sample.name,
                title="SOP-504: Statutory Integrity Standards for Refinery Pressure Vessels",
                text=doc["raw_text"],
                uploaded_by="admin",
                description="Official Refinery Safety Standard on Wall Thickness & PRV Tolerances"
            )
    except Exception as e:
        print(f"Knowledge base seeding warning: {e}")

# --- AUTH ENDPOINTS ---

@app.post("/api/auth/login", response_model=Token)
async def login(req: LoginRequest):
    user = authenticate_user(req.username, req.password)
    if not user:
        log_event(
            username=req.username,
            role="UNKNOWN",
            action="LOGIN_FAILED",
            status="FAILED",
            details="Invalid enclave authentication credentials"
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Sovereign credentials."
        )
    
    token = create_access_token(user)
    log_event(
        username=user.username,
        role=user.role,
        action="LOGIN_SUCCESS",
        status="SUCCESS",
        details=f"Session established for {user.full_name} ({user.department})"
    )
    return Token(access_token=token, token_type="bearer", user=user)

@app.get("/api/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

# --- WORKBENCH TASK EXECUTION ---

@app.get("/api/workbench/sample-cases")
async def get_sample_cases():
    """Returns curated industrial test cases for live demonstration."""
    return [
        {
            "id": "case_pdf_inspection",
            "title": "Atmospheric Column Inspection & Approval Note",
            "file_type": "PDF",
            "sample_file": "Inspection_Report_Distillation_Unit_7.pdf",
            "recommended_prompt": "Analyze this report, identify the critical issues and create a professional approval report.",
            "description": "Examines ultrasonic wall thinning, PRV leakage, and synthesizes a formal DOCX/PDF memorandum."
        },
        {
            "id": "case_xlsx_telemetry",
            "title": "Refinery Telemetry Anomaly Detection & Charting",
            "file_type": "XLSX",
            "sample_file": "Plant_Performance_Metrics_Q3.xlsx",
            "recommended_prompt": "Analyze this dataset, calculate statistics, identify anomalies, create charts and generate a cleaned Excel file.",
            "description": "Runs statistical profiling, detects outliers via IQR, renders real Matplotlib charts, and outputs cleaned XLSX."
        },
        {
            "id": "case_sop_compliance",
            "title": "Safety SOP Compliance & Statutory Clearance",
            "file_type": "PDF + RAG",
            "sample_file": "Inspection_Report_Distillation_Unit_7.pdf",
            "recommended_prompt": "Check this inspection report against the organization's safety SOP and identify critical deviations.",
            "description": "Queries private Qdrant store for NRC-HSE-SOP-504 and cites exact section non-conformances."
        },
        {
            "id": "case_multi_doc",
            "title": "Multi-Month Inspection Variance Comparison",
            "file_type": "Multi-PDF",
            "sample_files": ["Report_January_Unit7.pdf", "Report_February_Unit7.pdf"],
            "recommended_prompt": "Compare these two sequential inspection reports, analyze degradation trends, and produce a consolidated report.",
            "description": "Cross-evaluates two sequential inspection cycles to identify wall thickness decay rates."
        }
    ]

@app.post("/api/workbench/run")
async def run_task(
    requirement: str = Form(...),
    sample_case_id: Optional[str] = Form(None),
    files: List[UploadFile] = File([]),
    current_user: User = Depends(get_current_user)
):
    task_id = f"task_{uuid.uuid4().hex[:8]}"
    saved_file_paths: List[str] = []

    # Handle Sample Case selection if no manual files uploaded
    if sample_case_id and not files:
        if sample_case_id in ["case_pdf_inspection", "case_sop_compliance"]:
            src = SAMPLE_DATA_DIR / "Inspection_Report_Distillation_Unit_7.pdf"
            dst = UPLOADS_DIR / f"{task_id}_{src.name}"
            shutil.copyfile(src, dst)
            saved_file_paths.append(str(dst))
        elif sample_case_id == "case_xlsx_telemetry":
            src = SAMPLE_DATA_DIR / "Plant_Performance_Metrics_Q3.xlsx"
            dst = UPLOADS_DIR / f"{task_id}_{src.name}"
            shutil.copyfile(src, dst)
            saved_file_paths.append(str(dst))
        elif sample_case_id == "case_multi_doc":
            for fname in ["Report_January_Unit7.pdf", "Report_February_Unit7.pdf"]:
                src = SAMPLE_DATA_DIR / fname
                dst = UPLOADS_DIR / f"{task_id}_{src.name}"
                shutil.copyfile(src, dst)
                saved_file_paths.append(str(dst))

    # Save uploaded files
    for upload in files:
        if upload.filename:
            file_dst = UPLOADS_DIR / f"{task_id}_{upload.filename}"
            with open(file_dst, "wb") as buffer:
                shutil.copyfileobj(upload.file, buffer)
            saved_file_paths.append(str(file_dst))
            
            log_event(
                username=current_user.username,
                role=current_user.role,
                action="FILE_UPLOADED",
                status="SUCCESS",
                details=f"Securely saved confidential file '{upload.filename}' ({file_dst.stat().st_size} bytes) to local enclave storage"
            )

    if not saved_file_paths:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No confidential files provided for execution. Please upload files or select a sample case."
        )

    # Execute LangGraph Sovereign Agent
    try:
        result_state = execute_sovereign_task(
            task_id=task_id,
            requirement=requirement.strip(),
            file_paths=saved_file_paths,
            username=current_user.username,
            role=current_user.role
        )

        return {
            "task_id": task_id,
            "status": result_state["status"],
            "task_type": result_state["classification"].get("task_type", "General Task"),
            "routed_capability": result_state["classification"].get("routed_capability", "Local Engine"),
            "processing_time_sec": result_state.get("duration_sec", 1.2),
            "input_files": [Path(p).name for p in saved_file_paths],
            "requirement": requirement,
            "executive_summary": result_state.get("executive_summary", ""),
            "key_findings": result_state.get("key_findings", []),
            "critical_issues": result_state.get("critical_issues", []),
            "recommendations": result_state.get("recommendations", []),
            "sources_used": result_state.get("rag_sources", []),
            "deliverables": result_state.get("deliverables", []),
            "charts": result_state.get("charts", []),
            "data_preview": result_state.get("data_analysis"),
            "created_at": time.strftime("%Y-%m-%d %H:%M:%S UTC")
        }
    except Exception as e:
        log_event(
            username=current_user.username,
            role=current_user.role,
            action="TASK_FAILED",
            status="ERROR",
            details=f"Task {task_id} failed: {str(e)}"
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Local execution error: {str(e)}"
        )

# --- DELIVERABLES & CHARTS DOWNLOAD ---

@app.get("/api/download/{filename}")
async def download_file(filename: str, current_user: User = Depends(get_current_user)):
    file_path = DELIVERABLES_DIR / filename
    if not file_path.exists():
        # Check charts dir
        file_path = CHARTS_DIR / filename
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Requested deliverable not found.")

    log_event(
        username=current_user.username,
        role=current_user.role,
        action="FILE_DOWNLOADED",
        status="SUCCESS",
        details=f"Exported deliverable '{filename}' ({file_path.stat().st_size} bytes) from enclave"
    )

    media_type = "application/octet-stream"
    if filename.endswith(".pdf"):
        media_type = "application/pdf"
    elif filename.endswith(".docx"):
        media_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    elif filename.endswith(".xlsx"):
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    elif filename.endswith(".png"):
        media_type = "image/png"

    return FileResponse(
        path=str(file_path),
        filename=filename,
        media_type=media_type
    )

# --- KNOWLEDGE BASE / QDRANT RAG ENDPOINTS ---

@app.get("/api/knowledge")
async def list_knowledge(current_user: User = Depends(get_current_user)):
    return get_registered_knowledge()

@app.post("/api/knowledge/upload")
async def upload_knowledge(
    title: str = Form(...),
    description: str = Form(""),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    doc_id = f"doc_{uuid.uuid4().hex[:8]}"
    file_path = KNOWLEDGE_DIR / f"{doc_id}_{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Parse and index into Qdrant store
    doc_data = parse_document(file_path)
    chunks_count = qdrant_store.add_document(
        doc_id=doc_id,
        filename=file.filename,
        title=title,
        text=doc_data["raw_text"],
        uploaded_by=current_user.username,
        description=description
    )

    log_event(
        username=current_user.username,
        role=current_user.role,
        action="KNOWLEDGE_INDEXED",
        status="SUCCESS",
        details=f"Indexed confidential document '{file.filename}' into Qdrant Vector Enclave ({chunks_count} chunks)"
    )

    return {
        "id": doc_id,
        "filename": file.filename,
        "title": title,
        "chunks_count": chunks_count,
        "status": "INDEXED"
    }

@app.delete("/api/knowledge/{doc_id}")
async def delete_knowledge(doc_id: str, current_user: User = Depends(require_admin)):
    deleted = qdrant_store.delete_document(doc_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Knowledge item not found.")
    
    log_event(
        username=current_user.username,
        role=current_user.role,
        action="KNOWLEDGE_DELETED",
        status="SUCCESS",
        details=f"Deleted knowledge document {doc_id} from Qdrant vector store"
    )
    return {"status": "DELETED", "id": doc_id}

@app.post("/api/knowledge/search")
async def search_knowledge(
    query: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    results = qdrant_store.search(query, top_k=5, score_threshold=0.1)
    return {"query": query, "results": results}

# --- TASK HISTORY & AUDIT LOGS ---

@app.get("/api/tasks")
async def list_tasks(current_user: User = Depends(get_current_user)):
    return get_task_history(50)

@app.get("/api/tasks/{task_id}")
async def get_task_detail(task_id: str, current_user: User = Depends(get_current_user)):
    task = get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task record not found.")
    return task

@app.get("/api/audit")
async def list_audit_logs(current_user: User = Depends(get_current_user)):
    return get_audit_logs(100)

# --- SYSTEM & ENCLAVE HEALTH ---

@app.get("/api/system/status", response_model=SystemStatus)
async def get_system_status(current_user: User = Depends(get_current_user)):
    tasks = get_task_history(1000)
    audit = get_audit_logs(1000)
    knowledge = get_registered_knowledge()

    return SystemStatus(
        enclave_mode=ENCLAVE_MODE,
        external_ai_status=EXTERNAL_API_STATUS,
        local_vector_db="Qdrant Local Air-Gapped Store (Cosine Metric)",
        total_tasks_completed=len(tasks),
        total_knowledge_docs=len(knowledge),
        total_audit_events=len(audit),
        active_user=f"{current_user.full_name} ({current_user.role})"
    )

# --- FRONTEND STATIC ASSETS & SPA CLIENT-SIDE ROUTING ---
FRONTEND_DIST = Path(__file__).resolve().parent.parent / "frontend" / "dist"
INDEX_FILE = FRONTEND_DIST / "index.html"

# Mount /assets if the directory exists
ASSETS_DIR = FRONTEND_DIST / "assets"
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="frontend_assets")

@app.get("/")
async def serve_root():
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))
    return {"message": "SovereignAI Workbench backend is active. Build frontend to view UI."}

@app.get("/{full_path:path}")
async def serve_spa_frontend(full_path: str):
    # Skip /api, /static, and docs paths so errors are properly handled by FastAPI
    if (full_path.startswith("api/") or 
        full_path.startswith("static/") or 
        full_path.startswith("docs") or 
        full_path.startswith("openapi.json")):
        raise HTTPException(status_code=404, detail="Resource not found")

    # Serve specific static file from frontend/dist if present (e.g. vite.svg, favicon.ico)
    requested_file = FRONTEND_DIST / full_path
    if requested_file.is_file():
        return FileResponse(str(requested_file))

    # Otherwise fallback to index.html for client-side React routes (/workbench, /dashboard, /settings, etc.)
    if INDEX_FILE.exists():
        return FileResponse(str(INDEX_FILE))

    return {"message": "SovereignAI Workbench backend is active. Build frontend to view UI."}
