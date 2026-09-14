# SovereignAI Workbench — Confidential Industrial & Defence AI Enclave

> **"We don't send confidential data to AI. We bring AI to the confidential data."**

SovereignAI Workbench is an on-premise, air-gapped AI-powered workstation designed specifically for organizations handling highly sensitive operational and technical information — such as **refineries, public sector undertakings (PSUs), defence installations, and industrial manufacturing plants**.

---

## 1. Project Overview & Architecture

Organizations operating critical infrastructure process classified and confidential assets:
- **Engineering documents & P&IDs**
- **Non-Destructive Testing (NDT) inspection dossiers**
- **Standard Operating Procedures (SOPs) & statutory safety standards**
- **Plant operational telemetry & SCADA sensor records (.xlsx, .csv)**
- **Equipment maintenance logs & approval notes**

Sending these files to public cloud AI APIs creates severe legal, regulatory, and national security vulnerabilities.

**SovereignAI Workbench brings AI models, local deterministic reasoning, vector search, and analytical tools entirely inside ONE self-contained service.**

```
┌─────────────────────────────────────────────────────────────┐
│                 RENDER UNIFIED WEB SERVICE                  │
│                                                             │
│   Client Browser                                            │
│        │                                                    │
│        ▼                                                    │
│   FastAPI Gateway (Port $PORT on 0.0.0.0)                   │
│        ├── GET /            ──► Serves React index.html     │
│        ├── GET /assets/...  ──► Serves compiled JS/CSS      │
│        ├── GET /{spa_path}  ──► SPA Fallback to index.html  │
│        └── /api/...         ──► REST Endpoints & Tasks      │
│                                      │                      │
│   LangGraph Agent Orchestrator       ▼                      │
│   ├── Document Parser (PyMuPDF for PDFs, python-docx)       │
│   ├── Spreadsheet Engine (openpyxl, statistics, IQR bounds) │
│   ├── Anomaly Detection & Matplotlib Chart Plotting (.png)  │
│   ├── Qdrant Vector RAG (Confidential SOP Citations)        │
│   ├── Formal Deliverable Generators (.docx, .pdf, .xlsx)    │
│   └── SQLite Immutable Security Audit Trail                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Production Deployment on Render (ONE Single Service)

This repository is pre-configured with a production-ready `Dockerfile` that builds the React frontend, packages the FastAPI backend, and serves both through **ONE public Render URL**.

### Step-by-Step Render Setup

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Configure production single-service deployment for Render"
   git push origin main
   ```

2. **Create a New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click **New +** $\to$ **Web Service**
   - Connect your GitHub repository: `yashworks677/Soveregein-on-premise-agentic-AI` (or your fork)

3. **Configure the Service Settings**:
   - **Name**: `sovereignai-workbench` (or your preferred name)
   - **Region**: Any (e.g. *Singapore*, *Frankfurt*, *Oregon*)
   - **Language / Environment**: **Docker** (Render will detect the `Dockerfile` at root automatically)
   - **Branch**: `main`
   - **Plan**: *Free* or *Starter*

4. **Environment Variables**:
   *(Optional)*:
   - `SOVEREIGN_SECRET_KEY`: (auto-generated if omitted)

5. **Deploy**:
   - Click **Deploy Web Service**.
   - Render will build the Docker container:
     - Installs Python 3.11 dependencies
     - Installs Node.js 20 & npm
     - Installs frontend packages and builds the React bundle
     - Pre-seeds sample industrial test files and the Qdrant safety SOP index
     - Starts FastAPI on `0.0.0.0` bound to `$PORT`
   - Your complete application will be live at:
     `https://<your-service-name>.onrender.com`

---

## 3. Verified Real Functionality (Zero Mocking)

Every feature in the application operates on actual uploaded data:
1. **PyMuPDF Extraction**: Extracts genuine text, tables, and ultrasonic wall-thickness readings from uploaded PDFs.
2. **Statistical Telemetry & Anomaly Profiling**: Performs genuine `statistics` calculations over every column, identifying specific outlier rows using IQR bounds.
3. **Real Matplotlib Charts**: Dynamically renders and saves high-resolution PNG charts (`telemetry_scatter_*.png`, `metric_means_*.png`) downloadable directly from the UI.
4. **Qdrant Vector Knowledge Base**: Indexes confidential SOPs into vector chunks and performs real cosine similarity matching with verified percentage scores.
5. **Real Deliverables**: Generates real `.docx` documents using `python-docx` and formal `.pdf` dossiers using ReportLab.
6. **Immutable SQLite Audit Logging**: Every login, upload, classification, retrieval, and download is written to `sovereign_audit.db`.

---

## 4. Local Development Setup

If you want to run the project locally on your development machine:

### Backend
```bash
# Install Python packages
pip install -r requirements.txt

# Run FastAPI
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```
Local dev runs on `http://127.0.0.1:5173` with Vite automatically proxying `/api` and `/static` requests to port `8000`.

---

## 5. Pre-Configured Enclave Credentials

| Role | Username | Password | Operational Designation |
|---|---|---|---|
| **ENGINEER** | `engineer` | `eng123` | Rajesh Kumar, Senior Operations Lead (Distillation Unit 7) |
| **ADMIN** | `admin` | `admin123` | Dr. Arvind Sharma, Plant Safety & Executive Oversight Director |

---

## 6. Pre-Loaded Demonstration Scenarios

The workbench UI includes one-click demo cases in the top right:
1. **Atmospheric Column Inspection (PDF)**:
   - File: `Inspection_Report_Distillation_Unit_7.pdf`
   - Directive: *"Analyze this report, identify the critical issues and create a professional approval report."*
   - Deliverable: Formal DOCX Approval Note and PDF Evaluation Dossier.
2. **Refinery Telemetry Anomaly Detection (XLSX)**:
   - File: `Plant_Performance_Metrics_Q3.xlsx`
   - Directive: *"Analyze this dataset, calculate statistics, identify anomalies, create charts and generate a cleaned Excel file."*
   - Deliverable: Real Matplotlib Telemetry Plots and Cleaned XLSX spreadsheet.
3. **Safety SOP Compliance (PDF + Qdrant RAG)**:
   - File: `Inspection_Report_Distillation_Unit_7.pdf`
   - Directive: *"Check this inspection report against the organization's safety SOP and identify critical deviations."*
   - Deliverable: Direct citation of `NRC-HSE-SOP-504` Section 3.2 and Section 4.1.
4. **Multi-Month Inspection Variance (Multi-PDF)**:
   - Files: `Report_January_Unit7.pdf` and `Report_February_Unit7.pdf`
   - Directive: *"Compare these two sequential inspection reports, analyze degradation trends, and produce a consolidated report."*
