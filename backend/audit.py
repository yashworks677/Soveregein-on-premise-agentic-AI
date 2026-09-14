import sqlite3
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.config import DB_PATH
import json

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Audit log table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        action TEXT NOT NULL,
        status TEXT NOT NULL,
        details TEXT NOT NULL,
        ip_address TEXT DEFAULT '127.0.0.1 (Localhost)'
    )
    """)
    
    # Tasks history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS task_history (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        username TEXT NOT NULL,
        task_type TEXT NOT NULL,
        requirement TEXT NOT NULL,
        input_files TEXT NOT NULL,
        status TEXT NOT NULL,
        routed_capability TEXT NOT NULL,
        deliverables TEXT NOT NULL,
        result_json TEXT NOT NULL
    )
    """)

    # Knowledge registry table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS knowledge_registry (
        id TEXT PRIMARY KEY,
        filename TEXT NOT NULL,
        title TEXT NOT NULL,
        file_type TEXT NOT NULL,
        size_bytes INTEGER NOT NULL,
        chunks_count INTEGER NOT NULL,
        uploaded_at TEXT NOT NULL,
        uploaded_by TEXT NOT NULL,
        description TEXT NOT NULL
    )
    """)
    
    conn.commit()
    conn.close()

def log_event(username: str, role: str, action: str, status: str, details: str, ip_address: str = "127.0.0.1 (Localhost)"):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    cursor.execute("""
    INSERT INTO audit_logs (timestamp, username, role, action, status, details, ip_address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (ts, username, role, action, status, details, ip_address))
    conn.commit()
    conn.close()

def get_audit_logs(limit: int = 100) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM audit_logs ORDER BY id DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def save_task_history(task_id: str, username: str, task_type: str, requirement: str, 
                      input_files: List[str], status: str, routed_capability: str, 
                      deliverables: List[Dict[str, Any]], result_dict: Dict[str, Any]):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    cursor.execute("""
    INSERT OR REPLACE INTO task_history 
    (id, timestamp, username, task_type, requirement, input_files, status, routed_capability, deliverables, result_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        task_id, ts, username, task_type, requirement,
        json.dumps(input_files), status, routed_capability,
        json.dumps(deliverables), json.dumps(result_dict)
    ))
    conn.commit()
    conn.close()

def get_task_history(limit: int = 50) -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM task_history ORDER BY timestamp DESC LIMIT ?", (limit,))
    rows = cursor.fetchall()
    conn.close()
    results = []
    for r in rows:
        d = dict(r)
        d["input_files"] = json.loads(d["input_files"]) if d["input_files"] else []
        d["deliverables"] = json.loads(d["deliverables"]) if d["deliverables"] else []
        d["result"] = json.loads(d["result_json"]) if d["result_json"] else {}
        results.append(d)
    return results

def get_task_by_id(task_id: str) -> Optional[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM task_history WHERE id = ?", (task_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    d["input_files"] = json.loads(d["input_files"]) if d["input_files"] else []
    d["deliverables"] = json.loads(d["deliverables"]) if d["deliverables"] else []
    d["result"] = json.loads(d["result_json"]) if d["result_json"] else {}
    return d

def register_knowledge_doc(id: str, filename: str, title: str, file_type: str, 
                           size_bytes: int, chunks_count: int, uploaded_by: str, description: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    ts = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    cursor.execute("""
    INSERT OR REPLACE INTO knowledge_registry 
    (id, filename, title, file_type, size_bytes, chunks_count, uploaded_at, uploaded_by, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (id, filename, title, file_type, size_bytes, chunks_count, ts, uploaded_by, description))
    conn.commit()
    conn.close()

def get_registered_knowledge() -> List[Dict[str, Any]]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM knowledge_registry ORDER BY uploaded_at DESC")
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

def delete_registered_knowledge(doc_id: str) -> bool:
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM knowledge_registry WHERE id = ?", (doc_id,))
    deleted = cursor.rowcount > 0
    conn.commit()
    conn.close()
    return deleted

# Initialize database schema immediately
init_db()
