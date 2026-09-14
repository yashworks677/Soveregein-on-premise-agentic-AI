import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Upload, 
  Search, 
  Trash2, 
  FileText, 
  Database, 
  CheckCircle, 
  AlertCircle,
  X,
  Layers
} from 'lucide-react';
import { api } from '../api';

export default function KnowledgeBase({ currentUser }) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  
  // Upload Form
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  const loadDocs = () => {
    setLoading(true);
    api.getKnowledgeDocs()
      .then(data => {
        setDocs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    try {
      const res = await api.searchKnowledge(searchQuery.trim());
      setSearchResults(res.results);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFile) {
      setStatusMsg({ type: 'error', text: 'Please provide document title and select a file.' });
      return;
    }

    setIsUploading(true);
    setStatusMsg({ type: '', text: '' });

    try {
      await api.uploadKnowledgeDoc(uploadTitle.trim(), uploadDesc.trim(), uploadFile);
      setStatusMsg({ type: 'success', text: `Successfully indexed '${uploadFile.name}' into Qdrant Vector Enclave.` });
      setShowUploadModal(false);
      setUploadTitle('');
      setUploadDesc('');
      setUploadFile(null);
      loadDocs();
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Upload failed' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (docId, title) => {
    if (currentUser.role !== 'ADMIN') {
      alert("Administrative privileges required to delete confidential knowledge assets.");
      return;
    }
    if (confirm(`Are you sure you want to remove '${title}' from the Sovereign Qdrant Store?`)) {
      try {
        await api.deleteKnowledgeDoc(docId);
        loadDocs();
      } catch (err) {
        alert(err.message || "Failed to delete");
      }
    }
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Private Organizational Knowledge Base
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Confidential Standard Operating Procedures (SOPs), manuals, inspection criteria, and statutory standards indexed into local Qdrant vector database.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          <Upload size={14} /> Ingest Knowledge Document
        </button>
      </div>

      {statusMsg.text && (
        <div style={{
          marginBottom: '1rem',
          padding: '0.65rem 1rem',
          backgroundColor: statusMsg.type === 'error' ? 'var(--status-danger-bg)' : 'var(--status-success-bg)',
          border: `1px solid ${statusMsg.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
          borderRadius: 'var(--radius-sm)',
          color: statusMsg.type === 'error' ? '#FCA5A5' : '#86EFAC',
          fontSize: '0.8rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {statusMsg.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle size={15} />}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Grid: Documents list + Vector Search Tester */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Left: Registered Knowledge Assets */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={16} color="#38BDF8" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                Indexed Enclave Documents ({docs.length})
              </span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              Qdrant Vector Store
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading knowledge assets...
            </div>
          ) : docs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {docs.map((d) => (
                <div 
                  key={d.id}
                  style={{
                    padding: '0.85rem 1rem',
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-card)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#38BDF8',
                      flexShrink: 0
                    }}>
                      <FileText size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FFFFFF' }}>
                        {d.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                        File: <code style={{ color: '#94A3B8' }}>{d.filename}</code> • {(d.size_bytes / 1024).toFixed(1)} KB • {d.chunks_count} Vector Chunks
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {d.description || 'Internal Operating Guideline'} • Uploaded by {d.uploaded_by} on {d.uploaded_at}
                      </div>
                    </div>
                  </div>

                  {currentUser.role === 'ADMIN' && (
                    <button
                      onClick={() => handleDelete(d.id, d.title)}
                      title="Delete from Qdrant Store (Admin Only)"
                      style={{
                        background: 'transparent',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--status-danger)',
                        padding: '0.35rem 0.6rem',
                        fontSize: '0.725rem'
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No documents in private knowledge store yet. Click "Ingest Knowledge Document" to upload organization SOPs.
            </div>
          )}
        </div>

        {/* Right: Real Qdrant Vector Semantic Search Tester */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Search size={16} color="#10B981" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Qdrant Vector Search Tester</span>
              </div>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query SOP (e.g. 'minimum wall thickness', 'PRV calibration')"
                style={{ fontSize: '0.8rem' }}
              />
              <button
                type="submit"
                disabled={isSearching}
                style={{
                  backgroundColor: '#0369A1',
                  color: '#FFFFFF',
                  padding: '0.5rem 0.85rem',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  flexShrink: 0
                }}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </form>

            {searchResults ? (
              searchResults.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                    Top Semantic Matches (Cosine Metric):
                  </div>
                  {searchResults.map((r, i) => (
                    <div key={i} style={{
                      padding: '0.65rem',
                      backgroundColor: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.775rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <strong style={{ color: '#38BDF8' }}>{r.document_name}</strong>
                        <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>
                          {Math.round(r.relevance_score * 100)}% Match
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Section: {r.section}
                      </div>
                      <div style={{ color: '#CBD5E1', fontStyle: 'italic', fontSize: '0.75rem', lineHeight: '1.4' }}>
                        "{r.snippet.slice(0, 180)}..."
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                  No vector chunks matched above similarity threshold.
                </div>
              )
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>
                Test the air-gapped vector store. Matches are retrieved using real cosine distance ranking over dense embeddings.
              </div>
            )}
          </div>

          <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#10B981', marginBottom: '0.35rem' }}>
              Qdrant Air-Gapped Architecture
            </div>
            <p style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              When refinery engineers execute compliance verification tasks in the Workbench, the agent automatically cross-references these stored SOP chunks, citing exact sections and safety thresholds in the synthesized findings.
            </p>
          </div>

        </div>

      </div>

      {/* Ingest Knowledge Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#FFFFFF' }}>
                Ingest Confidential SOP / Standard
              </span>
              <button onClick={() => setShowUploadModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Document Title / Standard Identifier *
                  </label>
                  <input
                    type="text"
                    required
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                    placeholder="e.g. NRC-SOP-504: Pressure Vessel Integrity Standards"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Operational Scope / Description
                  </label>
                  <input
                    type="text"
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                    placeholder="e.g. Mandatory ultrasonic wall thickness and PRV tolerances"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Confidential File (.pdf, .docx, .txt) *
                  </label>
                  <input
                    type="file"
                    required
                    accept=".pdf,.docx,.txt,.doc"
                    onChange={(e) => setUploadFile(e.target.files[0])}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--border-card)',
                    color: 'var(--text-secondary)',
                    padding: '0.45rem 0.85rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  style={{
                    backgroundColor: '#0284C7',
                    color: '#FFFFFF',
                    padding: '0.45rem 1rem',
                    fontWeight: 600
                  }}
                >
                  {isUploading ? 'Chunking & Indexing...' : 'Index Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
