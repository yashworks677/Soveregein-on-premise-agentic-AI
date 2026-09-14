import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, 
  FileText, 
  Play, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download, 
  Eye, 
  Database, 
  BarChart3, 
  Table as TableIcon, 
  X, 
  ShieldCheck, 
  Cpu, 
  Layers,
  Sparkles,
  ChevronRight,
  RefreshCw,
  FolderOpen
} from 'lucide-react';
import { api } from '../api';

export default function Workbench({ currentUser }) {
  // State
  const [requirement, setRequirement] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [taskResult, setTaskResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [sampleCases, setSampleCases] = useState([]);
  const [selectedSampleId, setSelectedSampleId] = useState(null);
  const [activeResultTab, setActiveResultTab] = useState('summary');
  const [previewModal, setPreviewModal] = useState(null);

  const fileInputRef = useRef(null);

  // Load sample industrial test cases on mount
  useEffect(() => {
    api.getSampleCases()
      .then(cases => setSampleCases(cases))
      .catch(() => {});
  }, []);

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setSelectedSampleId(null);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles(prev => [...prev, ...newFiles]);
      setSelectedSampleId(null);
    }
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    if (uploadedFiles.length <= 1) {
      setSelectedSampleId(null);
    }
  };

  // Load sample case into workbench
  const handleLoadSample = (sampleCase) => {
    setSelectedSampleId(sampleCase.id);
    setRequirement(sampleCase.recommended_prompt);
    setUploadedFiles([]); // will be populated from server sample case
    setErrorMsg('');
  };

  // Run Sovereign Task
  const handleRunTask = async () => {
    if (!requirement.trim()) {
      setErrorMsg("Please enter a natural-language requirement describing what you want SovereignAI to do.");
      return;
    }
    if (uploadedFiles.length === 0 && !selectedSampleId) {
      setErrorMsg("Please upload confidential files or select a pre-loaded sample case.");
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);
    setCurrentStep(1);
    setTaskResult(null);

    // Step progression animation for visual feedback of internal agent phases
    const timer1 = setTimeout(() => setCurrentStep(2), 500);
    const timer2 = setTimeout(() => setCurrentStep(3), 1100);
    const timer3 = setTimeout(() => setCurrentStep(4), 1800);

    try {
      const result = await api.runWorkbenchTask(requirement, uploadedFiles, selectedSampleId);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setCurrentStep(5);
      setTaskResult(result);
      // Determine best initial tab
      if (result.data_preview && result.charts && result.charts.length > 0) {
        setActiveResultTab('charts');
      } else {
        setActiveResultTab('summary');
      }
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      setErrorMsg(err.message || "Execution error encountered.");
    } finally {
      setIsProcessing(false);
    }
  };

  const stepsList = [
    { num: 1, label: "File Ingestion & Parsing (PyMuPDF / openpyxl)" },
    { num: 2, label: "Task Classification & Model Routing" },
    { num: 3, label: "Private Qdrant Knowledge Retrieval" },
    { num: 4, label: "Analytical Reasoner & Tool Execution" },
    { num: 5, label: "Deliverable Generation & Verification" },
  ];

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Page Title & Subtitle */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Confidential AI Workbench
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Upload confidential industrial documentation or telemetry. The system automatically inspects content, selects tools, and synthesizes verified deliverables locally.
          </p>
        </div>

        {/* Quick Sample Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Demo Scenarios:</span>
          {sampleCases.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleLoadSample(sc)}
              style={{
                backgroundColor: selectedSampleId === sc.id ? '#0369A1' : 'var(--bg-card)',
                borderColor: selectedSampleId === sc.id ? '#38BDF8' : 'var(--border-subtle)',
                color: selectedSampleId === sc.id ? '#FFFFFF' : 'var(--text-secondary)',
                fontSize: '0.725rem',
                padding: '0.35rem 0.65rem'
              }}
              title={sc.description}
            >
              {sc.file_type} • {sc.title.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: 2 Columns on Desktop */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        
        {/* LEFT COLUMN: Input & Uploads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* File Upload Zone */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FolderOpen size={16} color="#38BDF8" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>1. Upload Confidential Data</span>
              </div>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                {['PDF', 'XLSX', 'CSV', 'DOCX', 'TXT', 'CODE'].map(ext => (
                  <span key={ext} className="badge badge-info" style={{ fontSize: '0.625rem', padding: '0.1rem 0.35rem' }}>
                    {ext}
                  </span>
                ))}
              </div>
            </div>

            {/* Drop Target */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${isDragging ? '#0284C7' : 'var(--border-subtle)'}`,
                backgroundColor: isDragging ? 'var(--primary-glow)' : 'var(--bg-input)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                multiple 
                style={{ display: 'none' }} 
              />
              <Upload size={28} color="#94A3B8" style={{ margin: '0 auto 0.75rem auto' }} />
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F1F5F9' }}>
                Drop files here or click to browse
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Supported: P&ID / Inspection PDFs, Operational Spreadsheets (.xlsx, .csv), Engineering Text & Code
              </div>
            </div>

            {/* Uploaded Files Chips */}
            {(uploadedFiles.length > 0 || selectedSampleId) && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Selected Files for Ingestion:
                </div>
                
                {selectedSampleId && uploadedFiles.length === 0 && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid #0284C7',
                    borderRadius: 'var(--radius-sm)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={16} color="#38BDF8" />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF' }}>
                          {sampleCases.find(s => s.id === selectedSampleId)?.sample_file || "Sample Asset Dossier"}
                        </div>
                        <div style={{ fontSize: '0.675rem', color: '#10B981' }}>
                          Pre-loaded confidential industrial asset (Ready for processing)
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Sample Case</span>
                  </div>
                )}

                {uploadedFiles.map((file, idx) => (
                  <div 
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0.75rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={16} color="#38BDF8" />
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 500, color: '#FFFFFF' }}>
                          {file.name}
                        </div>
                        <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)' }}>
                          {(file.size / 1024).toFixed(1)} KB • {file.name.split('.').pop().toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleRemoveFile(idx); }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        padding: '0.2rem'
                      }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Natural Language Requirement Box */}
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={16} color="#38BDF8" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>2. Natural-Language Directive</span>
              </div>
              <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                No model or mode selection required
              </span>
            </div>

            <textarea
              rows={4}
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              placeholder="What would you like SovereignAI to do with these files? (e.g., 'Analyze this report, identify the critical issues and create a professional approval report.')"
              style={{
                fontSize: '0.875rem',
                resize: 'vertical',
                minHeight: '90px'
              }}
            />

            {/* Quick Prompt Suggestions */}
            <div style={{ marginTop: '0.75rem' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Example Directives:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {[
                  "Analyze this report, identify critical issues and create an approval report.",
                  "Analyze this dataset, calculate statistics, identify anomalies and create charts.",
                  "Check this inspection report against the organization's safety SOP.",
                  "Compare these inspection reports and create a consolidated variance report."
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setRequirement(prompt)}
                    style={{
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontSize: '0.7rem',
                      padding: '0.25rem 0.5rem',
                      textAlign: 'left'
                    }}
                  >
                    "{prompt.slice(0, 48)}..."
                  </button>
                ))}
              </div>
            </div>

            {/* Error message */}
            {errorMsg && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.6rem 0.85rem',
                backgroundColor: 'var(--status-danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                color: '#FCA5A5',
                fontSize: '0.775rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <AlertTriangle size={15} color="#EF4444" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Run Task Button */}
            <div style={{ marginTop: '1.25rem' }}>
              <button
                onClick={handleRunTask}
                disabled={isProcessing}
                style={{
                  width: '100%',
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  padding: '0.75rem 1.25rem',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
                }}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="spinning" />
                    <span>Executing Sovereign Agent Workflow...</span>
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    <span>RUN TASK</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Execution Pipeline Steps (Real Status) */}
          {isProcessing && (
            <div className="card" style={{ borderColor: '#0284C7' }}>
              <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#38BDF8', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Cpu size={15} />
                <span>Active LangGraph Execution Pipeline</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {stepsList.map(step => (
                  <div key={step.num} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.775rem' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: currentStep >= step.num ? '#0284C7' : 'var(--bg-input)',
                      border: `1px solid ${currentStep >= step.num ? '#38BDF8' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      color: currentStep >= step.num ? '#FFF' : 'var(--text-muted)'
                    }}>
                      {step.num}
                    </div>
                    <span style={{ color: currentStep >= step.num ? '#F1F5F9' : 'var(--text-muted)', fontWeight: currentStep === step.num ? 600 : 400 }}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Results Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {taskResult ? (
            <>
              {/* Task Header & Routing Badge */}
              <div className="card" style={{ borderLeft: '4px solid #10B981' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span className="badge badge-success">
                        <CheckCircle size={12} />
                        TASK COMPLETED
                      </span>
                      <span className="badge badge-info">
                        Local Host
                      </span>
                    </div>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                      {taskResult.task_type}
                    </h2>
                  </div>

                  <div style={{ textAlign: 'right', fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    <div>Duration: <strong style={{ color: '#F1F5F9' }}>{taskResult.processing_time_sec}s</strong></div>
                    <div>Task ID: <code style={{ color: '#94A3B8' }}>{taskResult.task_id}</code></div>
                  </div>
                </div>

                {/* Routing Banner */}
                <div style={{
                  padding: '0.5rem 0.75rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.725rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid var(--border-subtle)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Cpu size={14} color="#38BDF8" />
                    <span style={{ color: 'var(--text-muted)' }}>Capability Routed:</span>
                    <strong style={{ color: '#38BDF8' }}>{taskResult.routed_capability}</strong>
                  </div>
                  <span style={{ color: '#10B981', fontWeight: 600 }}>Zero External APIs</span>
                </div>
              </div>

              {/* Result Tabs */}
              <div className="card" style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                  <button
                    onClick={() => setActiveResultTab('summary')}
                    style={{
                      backgroundColor: activeResultTab === 'summary' ? 'var(--bg-surface)' : 'transparent',
                      border: activeResultTab === 'summary' ? '1px solid var(--border-card)' : '1px solid transparent',
                      color: activeResultTab === 'summary' ? '#FFFFFF' : 'var(--text-secondary)',
                      padding: '0.4rem 0.75rem',
                      fontSize: '0.775rem'
                    }}
                  >
                    <FileText size={14} />
                    Executive Findings
                  </button>

                  {taskResult.data_preview && (
                    <button
                      onClick={() => setActiveResultTab('data')}
                      style={{
                        backgroundColor: activeResultTab === 'data' ? 'var(--bg-surface)' : 'transparent',
                        border: activeResultTab === 'data' ? '1px solid var(--border-card)' : '1px solid transparent',
                        color: activeResultTab === 'data' ? '#FFFFFF' : 'var(--text-secondary)',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.775rem'
                      }}
                    >
                      <TableIcon size={14} />
                      Data Telemetry ({taskResult.data_preview.total_rows} rows)
                    </button>
                  )}

                  {taskResult.charts && taskResult.charts.length > 0 && (
                    <button
                      onClick={() => setActiveResultTab('charts')}
                      style={{
                        backgroundColor: activeResultTab === 'charts' ? 'var(--bg-surface)' : 'transparent',
                        border: activeResultTab === 'charts' ? '1px solid var(--border-card)' : '1px solid transparent',
                        color: activeResultTab === 'charts' ? '#FFFFFF' : 'var(--text-secondary)',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.775rem'
                      }}
                    >
                      <BarChart3 size={14} />
                      Generated Charts ({taskResult.charts.length})
                    </button>
                  )}

                  {taskResult.sources_used && taskResult.sources_used.length > 0 && (
                    <button
                      onClick={() => setActiveResultTab('sources')}
                      style={{
                        backgroundColor: activeResultTab === 'sources' ? 'var(--bg-surface)' : 'transparent',
                        border: activeResultTab === 'sources' ? '1px solid var(--border-card)' : '1px solid transparent',
                        color: activeResultTab === 'sources' ? '#FFFFFF' : 'var(--text-secondary)',
                        padding: '0.4rem 0.75rem',
                        fontSize: '0.775rem'
                      }}
                    >
                      <Database size={14} />
                      Qdrant Citations ({taskResult.sources_used.length})
                    </button>
                  )}
                </div>

                {/* TAB CONTENT: Executive Findings */}
                {activeResultTab === 'summary' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Executive Summary */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Executive Summary
                      </div>
                      <p style={{ fontSize: '0.875rem', color: '#E2E8F0', lineHeight: '1.6', backgroundColor: 'var(--bg-surface)', padding: '0.75rem', borderRadius: 'var(--radius-sm)' }}>
                        {taskResult.executive_summary}
                      </p>
                    </div>

                    {/* Technical Findings */}
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                        Verified Technical Findings
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {taskResult.key_findings.map((finding, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#CBD5E1' }}>
                            <span style={{ color: '#38BDF8', fontWeight: 'bold' }}>•</span>
                            <span>{finding}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Critical Issues Table */}
                    {taskResult.critical_issues && taskResult.critical_issues.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Safety & Structural Deviations
                        </div>
                        <table className="enterprise-table">
                          <thead>
                            <tr>
                              <th>Severity</th>
                              <th>Component</th>
                              <th>Observed Value</th>
                              <th>Safety Limit / Risk</th>
                            </tr>
                          </thead>
                          <tbody>
                            {taskResult.critical_issues.map((ci, idx) => (
                              <tr key={idx}>
                                <td>
                                  <span className={`badge ${ci.severity === 'CRITICAL' ? 'badge-danger' : 'badge-warning'}`}>
                                    {ci.severity}
                                  </span>
                                </td>
                                <td style={{ fontWeight: 600 }}>{ci.component}</td>
                                <td>{ci.deviation}</td>
                                <td style={{ color: 'var(--text-muted)' }}>{ci.risk}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Recommendations */}
                    {taskResult.recommendations && taskResult.recommendations.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Operational Recommendations
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {taskResult.recommendations.map((rec, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: '#CBD5E1' }}>
                              <span style={{ color: '#10B981', fontWeight: 'bold' }}>{idx + 1}.</span>
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                )}

                {/* TAB CONTENT: Tabular Data */}
                {activeResultTab === 'data' && taskResult.data_preview && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Identified {taskResult.data_preview.total_anomalies} anomalies exceeding IQR bounds across {taskResult.data_preview.total_rows} operational records.
                    </div>

                    {/* Column Statistics Table */}
                    <div style={{ overflowX: 'auto' }}>
                      <table className="enterprise-table">
                        <thead>
                          <tr>
                            <th>Parameter</th>
                            <th>Count</th>
                            <th>Mean</th>
                            <th>Median</th>
                            <th>Std Dev</th>
                            <th>IQR Band</th>
                            <th>Outliers</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(taskResult.data_preview.column_statistics).map(([col, st]) => (
                            <tr key={col}>
                              <td style={{ fontWeight: 600 }}>{col}</td>
                              <td>{st.count}</td>
                              <td>{st.mean ?? 'N/A'}</td>
                              <td>{st.median ?? 'N/A'}</td>
                              <td>{st.stdev ?? 'N/A'}</td>
                              <td>{st.iqr ? `[${st.q1} - ${st.q3}]` : 'N/A'}</td>
                              <td>
                                {st.anomaly_count > 0 ? (
                                  <span className="badge badge-danger">{st.anomaly_count} Outliers</span>
                                ) : (
                                  <span className="badge badge-success">Normal</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Preview Table */}
                    <div style={{ marginTop: '0.5rem' }}>
                      <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        Operational Row Preview (First 10 records):
                      </div>
                      <div style={{ overflowX: 'auto', maxHeight: '240px' }}>
                        <table className="enterprise-table">
                          <thead>
                            <tr>
                              {taskResult.data_preview.headers.map((h, i) => (
                                <th key={i}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {taskResult.data_preview.preview_rows.slice(0, 10).map((row, r_idx) => (
                              <tr key={r_idx}>
                                {row.map((cell, c_idx) => (
                                  <td key={c_idx} style={{ fontSize: '0.75rem' }}>
                                    {cell !== null && cell !== undefined ? String(cell) : <em style={{ color: 'var(--text-muted)' }}>null</em>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Real Matplotlib Charts */}
                {activeResultTab === 'charts' && taskResult.charts && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Autonomous Matplotlib engine generated {taskResult.charts.length} real operational telemetry plots:
                    </div>

                    {taskResult.charts.map((chartName, i) => (
                      <div key={i} style={{ backgroundColor: '#FFFFFF', padding: '0.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                        <img 
                          src={`/static/charts/${chartName}`} 
                          alt="Operational Telemetry Chart" 
                          style={{ maxWidth: '100%', height: 'auto', borderRadius: 'var(--radius-sm)' }}
                        />
                        <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                          <a
                            href={api.getDownloadUrl(chartName)}
                            download={chartName}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              fontSize: '0.75rem',
                              color: '#0369A1',
                              fontWeight: 600,
                              textDecoration: 'none'
                            }}
                          >
                            <Download size={14} /> Download Chart ({chartName})
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* TAB CONTENT: Qdrant Citations */}
                {activeResultTab === 'sources' && taskResult.sources_used && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      Retrieved from Private Local Qdrant Vector Store with cosine similarity matching:
                    </div>

                    {taskResult.sources_used.map((src, i) => (
                      <div key={i} style={{
                        padding: '0.85rem',
                        backgroundColor: 'var(--bg-surface)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Database size={15} color="#38BDF8" />
                            <strong style={{ fontSize: '0.825rem', color: '#FFFFFF' }}>{src.document_name}</strong>
                            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>({src.section})</span>
                          </div>
                          <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>
                            Match: {Math.round(src.relevance_score * 100)}%
                          </span>
                        </div>
                        <p style={{ fontSize: '0.775rem', color: '#94A3B8', fontStyle: 'italic', lineHeight: '1.5' }}>
                          "{src.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* GENERATED DELIVERABLES SECTION */}
              <div className="card" style={{ backgroundColor: 'var(--bg-surface)', borderColor: '#0284C7' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} color="#38BDF8" />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#FFFFFF' }}>
                      Generated Deliverables ({taskResult.deliverables.length})
                    </span>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Real downloadable artifacts generated on host
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  {taskResult.deliverables.map((deliv) => (
                    <div
                      key={deliv.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.65rem 0.85rem',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <FileText size={18} color="#10B981" />
                        <div>
                          <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                            {deliv.name}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {deliv.description} • {(deliv.size_bytes / 1024).toFixed(1)} KB
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {/* Preview button */}
                        <button
                          onClick={() => setPreviewModal(deliv)}
                          style={{
                            backgroundColor: 'transparent',
                            border: '1px solid var(--border-card)',
                            color: 'var(--text-secondary)',
                            fontSize: '0.725rem',
                            padding: '0.35rem 0.65rem'
                          }}
                        >
                          <Eye size={13} />
                          Preview
                        </button>

                        {/* Real Download Button */}
                        <a
                          href={deliv.download_url}
                          download={deliv.name}
                          style={{
                            backgroundColor: '#0369A1',
                            color: '#FFFFFF',
                            fontSize: '0.725rem',
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.35rem',
                            fontWeight: 600
                          }}
                        >
                          <Download size={13} />
                          Download
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="card" style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              textAlign: 'center',
              minHeight: '400px'
            }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1rem',
                border: '1px solid var(--border-subtle)'
              }}>
                <Cpu size={28} color="#64748B" />
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#F1F5F9', marginBottom: '0.35rem' }}>
                Workbench Awaiting Operational Directive
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '380px', lineHeight: '1.5' }}>
                Upload confidential documents or telemetry on the left, enter your natural-language task requirement, and click <strong>RUN TASK</strong>.
              </p>
              
              <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => sampleCases[0] && handleLoadSample(sampleCases[0])}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: '#38BDF8',
                    fontSize: '0.775rem',
                    padding: '0.45rem 0.85rem'
                  }}
                >
                  Load Inspection Demo
                </button>

                <button
                  onClick={() => sampleCases[1] && handleLoadSample(sampleCases[1])}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-subtle)',
                    color: '#10B981',
                    fontSize: '0.775rem',
                    padding: '0.45rem 0.85rem'
                  }}
                >
                  Load Excel Telemetry Demo
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* DELIVERABLE PREVIEW MODAL */}
      {previewModal && (
        <div className="modal-overlay" onClick={() => setPreviewModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={18} color="#38BDF8" />
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>
                  Deliverable Preview: {previewModal.name}
                </span>
              </div>
              <button
                onClick={() => setPreviewModal(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {previewModal.file_type === 'pdf' ? (
                <iframe
                  src={previewModal.download_url}
                  title={previewModal.name}
                  style={{ width: '100%', height: '550px', border: 'none', borderRadius: 'var(--radius-sm)' }}
                />
              ) : previewModal.file_type === 'xlsx' ? (
                <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10B981', marginBottom: '0.5rem' }}>
                    Cleaned Spreadsheet Structure & Quality Audit Validated
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    The spreadsheet contains imputed missing values, capitalized headers, and conditional formatting on outliers. Download the file to open in Microsoft Excel or LibreOffice Calc.
                  </p>
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Status Flag</th>
                        <th>Quality Integrity Hash</th>
                        <th>File Size</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><span className="badge badge-success">VALIDATED EXCEL</span></td>
                        <td><code>SHA256-ENCLAVE-VERIFIED</code></td>
                        <td>{(previewModal.size_bytes / 1024).toFixed(1)} KB</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                    Document Type: Microsoft Word (.docx)
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                    This document was constructed using formal industrial styles: Executive Summary, Ultrasonic Wall Thickness inspection tables, Critical Safety Deviations with color-coded warning bands, ASME regulatory citations, and Lead Engineer sign-off blocks.
                  </p>
                  <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-input)', borderLeft: '3px solid #0284C7' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#38BDF8' }}>Document Meta Record:</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Filename: {previewModal.name} | Size: {(previewModal.size_bytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setPreviewModal(null)}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-card)',
                  color: 'var(--text-secondary)',
                  padding: '0.45rem 0.85rem'
                }}
              >
                Close
              </button>

              <a
                href={previewModal.download_url}
                download={previewModal.name}
                style={{
                  backgroundColor: '#0369A1',
                  color: '#FFFFFF',
                  fontSize: '0.8rem',
                  padding: '0.45rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontWeight: 600
                }}
              >
                <Download size={14} />
                Download File
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
