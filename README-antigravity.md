# SovereignAI Workbench — Confidential Industrial & Defence AI Enclave

> **"We don't send confidential data to AI. We bring AI to the confidential data."**

SovereignAI Workbench is an on-premise, air-gapped AI-powered workstation designed specifically for organizations handling highly sensitive operational and technical information — such as **refineries, public sector undertakings (PSUs), defence installations, and industrial manufacturing plants**.

---

## 1. Project Overview & Problem Statement

Organizations operating critical infrastructure process classified and confidential assets:
- **Engineering documents & P&IDs**
- **Non-Destructive Testing (NDT) inspection dossiers**
- **Standard Operating Procedures (SOPs) & statutory safety standards**
- **Plant operational telemetry & SCADA sensor records (.xlsx, .csv)**
- **Equipment maintenance logs & approval notes**

Sending these files to public cloud AI APIs creates severe legal, regulatory, and national security vulnerabilities. Conversely, manual engineering analysis is bottlenecked, error-prone, and slow.

**SovereignAI Workbench solves this by bringing AI models, vector search, and analytical tools entirely inside the enterprise host perimeter.**

---

## 2. The Main User Experience

The entire interface operates on one simple workflow:

$$\text{Upload Confidential Data} + \text{Natural-Language Directive} = \text{Verified Industrial Deliverable}$$

The operator does **not** select models, frameworks, or modes. The system automatically inspects the input files and requirement, classifies the task, routes to local deterministic and statistical tools, cross-references private Qdrant SOPs, and synthesizes real deliverables.

---

## 3. Architecture & Internal Workflow

```
┌─────────────────────────────────────────────────────────────┐
│             FRONTEND (React + Vite + Lucide)                │
│    Confidential Workbench | Dashboard | Qdrant KB | Audit   │
└──────────────────────────────┬──────────────────────────────┘
                               │ REST + JWT Bearer Auth
┌──────────────────────────────▼──────────────────────────────┐
│             BACKEND GATEWAY (FastAPI on Port 8000)          │
│    JWT Authentication & RBAC (ADMIN / ENGINEER Roles)       │
│    Immutable SQLite Audit Trail & Historical Task Registry  │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│           LANGGRAPH AGENT WORKFLOW ORCHESTRATOR             │
│                                                             │
│  [1. Ingest & Inspect]                                      │
│       ├── PyMuPDF 1.28 (PDF text, tables, metadata)         │
│       ├── openpyxl & csv (Tabular telemetry rows & headers) │
│       └── python-docx (DOCX parsing)                        │
│                                                             │
│  [2. Task Classification & Capability Router]               │
│       └── Automatic NLP intent & asset mapping              │
│                                                             │
│  [3. Private Knowledge Retrieval (Qdrant Vector RAG)]       │
│       └── Cosine similarity retrieval of confidential SOPs  │
│                                                             │
│  [4. Local Tool Execution]                                  │
│       ├── Statistical Engine (Mean, Median, Std, IQR)       │
│       ├── Anomaly Detection (IQR bounds & Z-scores)         │
│       └── Matplotlib (Publication-grade sensor plots)       │
│                                                             │
│  [5. Industrial Reasoning & Synthesis Engine]               │
│       └── Technical evaluation, non-conformances, findings  │
│                                                             │
│  [6. Deliverable Generation]                                │
│       ├── python-docx -> Formal Approval Memorandum (.docx) │
│       ├── ReportLab   -> Technical Evaluation Dossier (.pdf)│
│       └── openpyxl    -> Cleaned Spreadsheet (.xlsx)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Real Functionality Guarantee (Zero Mocking)

Every feature in the application operates on actual uploaded data:
1. **PyMuPDF Document Extraction**: Extracts genuine text, page counts, and ultrasonic wall-thickness readings from uploaded PDFs.
2. **Statistical Telemetry & Anomaly Profiling**: Performs genuine `statistics` calculations over every column, identifying specific outlier rows.
3. **Real Matplotlib Charts**: Dynamically renders and saves high-resolution PNG charts (`telemetry_scatter_*.png`, `metric_means_*.png`) downloadable directly from the UI.
4. **Qdrant Vector Knowledge Base**: Indexes confidential SOPs into vector chunks and performs real cosine similarity matching with verified percentage scores.
5. **Real Deliverables**: Generates real `.docx` documents using `python-docx` and formal `.pdf` dossiers using ReportLab.
6. **Immutable SQLite Audit Logging**: Every login, upload, classification, retrieval, and download is written to `sovereign_audit.db`.

---

## 5. Quickstart & Setup Instructions

### Prerequisites
- Python 3.10+ (tested on Python 3.14)
- Node.js 18+ and npm

### Backend Setup
```bash
# 1. Install required Python packages
python -m pip install fastapi uvicorn pydantic python-multipart pyjwt pymupdf python-docx openpyxl reportlab matplotlib langgraph langchain-core requests

# 2. Generate sample industrial test files & pre-index Safety SOP
python -m backend.sample_data.generate_samples

# 3. Launch FastAPI Server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend will be live at `http://127.0.0.1:8000`.

### Frontend Setup
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Launch Vite Dev Server
npm run dev -- --host 127.0.0.1 --port 5173
```
Frontend will be live at `http://127.0.0.1:5173`.

---

## 6. Pre-Configured Enclave Credentials

| Role | Username | Password | Operational Designation |
|---|---|---|---|
| **ENGINEER** | `engineer` | `eng123` | Rajesh Kumar, Senior Operations Lead (Distillation Unit 7) |
| **ADMIN** | `admin` | `admin123` | Dr. Arvind Sharma, Plant Safety & Executive Oversight Director |

---

## 7. Pre-Loaded Hackathon Demonstration Cases

The workbench UI includes instant one-click demo cases in the top right:
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
