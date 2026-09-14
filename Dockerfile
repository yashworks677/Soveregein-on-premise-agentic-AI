# Production Dockerfile for SovereignAI Workbench (Unified Full-Stack on Render)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    DEBIAN_FRONTEND=noninteractive \
    PORT=8000

# Install system dependencies, curl, and Node.js 20 LTS
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python backend dependencies first for Docker layer caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install frontend dependencies and build React app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

# Copy application code
COPY . .

# Build the React production bundle into /app/frontend/dist
RUN cd frontend && npm run build

# Pre-generate sample industrial test files and seed the local Qdrant knowledge base
RUN python -m backend.sample_data.generate_samples && \
    python -c "from pathlib import Path; from backend.rag.qdrant_store import qdrant_store; from backend.tools.doc_tools import parse_document; sop_path = Path('backend/sample_data/Safety_SOP_Refinery_Pressure_Vessels.pdf'); doc = parse_document(sop_path); qdrant_store.add_document('doc_sop_504', sop_path.name, 'SOP-504: Statutory Integrity Standards for Refinery Pressure Vessels', doc['raw_text'], 'admin', 'Official Refinery Safety Standard on Wall Thickness & PRV Tolerances')"

# Expose default port
EXPOSE 8000

# Start unified FastAPI server on 0.0.0.0 using Render's dynamic $PORT
CMD sh -c "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"
