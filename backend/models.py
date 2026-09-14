from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

class User(BaseModel):
    username: str
    role: str  # "ADMIN" or "ENGINEER"
    full_name: str
    department: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user: User

class LoginRequest(BaseModel):
    username: str
    password: str

class TaskRequest(BaseModel):
    requirement: str
    uploaded_files: List[str] = []

class Deliverable(BaseModel):
    id: str
    name: str
    file_type: str  # "docx", "pdf", "xlsx", "png"
    size_bytes: int
    download_url: str
    description: str

class SourceCitation(BaseModel):
    document_name: str
    section: str
    snippet: str
    relevance_score: float

class TaskResult(BaseModel):
    task_id: str
    status: str  # "COMPLETED", "FAILED"
    task_type: str  # "Document Analysis", "Data Analysis", "RAG Compliance", etc.
    routed_capability: str
    processing_time_sec: float
    input_files: List[str]
    requirement: str
    executive_summary: str
    key_findings: List[str]
    critical_issues: List[Dict[str, Any]]
    recommendations: List[str]
    sources_used: List[SourceCitation] = []
    deliverables: List[Deliverable] = []
    charts: List[str] = []
    data_preview: Optional[Dict[str, Any]] = None
    created_at: str

class AuditEntry(BaseModel):
    id: Optional[int] = None
    timestamp: str
    username: str
    role: str
    action: str
    status: str
    details: str
    ip_address: str = "127.0.0.1 (Localhost)"

class KnowledgeDoc(BaseModel):
    id: str
    filename: str
    title: str
    file_type: str
    size_bytes: int
    chunks_count: int
    uploaded_at: str
    uploaded_by: str
    description: str

class SystemStatus(BaseModel):
    enclave_mode: str
    external_ai_status: str
    local_vector_db: str
    total_tasks_completed: int
    total_knowledge_docs: int
    total_audit_events: int
    active_user: str
