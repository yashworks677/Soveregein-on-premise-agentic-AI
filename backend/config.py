import os
from pathlib import Path

# Base directories
BASE_DIR = Path(__file__).resolve().parent
WORKSPACE_DIR = BASE_DIR.parent
STORAGE_DIR = BASE_DIR / "storage"
UPLOADS_DIR = STORAGE_DIR / "uploads"
DELIVERABLES_DIR = STORAGE_DIR / "deliverables"
CHARTS_DIR = STORAGE_DIR / "charts"
KNOWLEDGE_DIR = STORAGE_DIR / "knowledge"
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"

# Create required directories
for d in [STORAGE_DIR, UPLOADS_DIR, DELIVERABLES_DIR, CHARTS_DIR, KNOWLEDGE_DIR, SAMPLE_DATA_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# Security
SECRET_KEY = os.getenv("SOVEREIGN_SECRET_KEY", "sovereign-ai-refinery-defence-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

# Database
DB_PATH = STORAGE_DIR / "sovereign_audit.db"

# Enclave Status
ENCLAVE_MODE = "AIR-GAPPED LOCAL HOST"
EXTERNAL_API_STATUS = "NOT CONFIGURED / DISABLED"
STORAGE_ENCRYPTION = "LOCAL AES-256 SIMULATION"
