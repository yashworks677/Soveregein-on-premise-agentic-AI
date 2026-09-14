import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  CheckCircle, 
  BookOpen, 
  FileText, 
  HardDrive, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight,
  Download,
  AlertCircle
} from 'lucide-react';
import { api } from '../api';

export default function Dashboard({ setActiveTab, currentUser }) {
  const [status, setStatus] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getSystemStatus(),
      api.getTasks()
    ]).then(([sysStatus, taskList]) => {
      setStatus(sysStatus);
      setTasks(taskList);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Operational Enclave Dashboard
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Real-time status of local air-gapped sovereign AI node, analytical deliverables, and private knowledge stores.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('workbench')}
          style={{
            backgroundColor: '#0284C7',
            color: '#FFFFFF',
            padding: '0.5rem 1rem',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          Launch AI Workbench <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '1.5rem' }}>
        
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Enclave Node</span>
            <ShieldCheck size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
            Air-Gapped
          </div>
          <div style={{ fontSize: '0.725rem', color: '#10B981', marginTop: '0.25rem' }}>
            ● Zero Cloud Data Transmission
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Completed Tasks</span>
            <CheckCircle size={16} color="#38BDF8" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
            {status ? status.total_tasks_completed : '--'}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Verified Industrial Deliverables
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Knowledge Base</span>
            <BookOpen size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
            {status ? status.total_knowledge_docs : '--'} Docs
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Indexed in Qdrant Vector Store
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Audit Logs</span>
            <FileText size={16} color="#A855F7" />
          </div>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
            {status ? status.total_audit_events : '--'}
          </div>
          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Immutable Security Audit Entries
          </div>
        </div>

      </div>

      {/* Grid: Recent Tasks and Architecture Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        
        {/* Recent Tasks */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={16} color="#38BDF8" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Recent Enclave Tasks</span>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              style={{ background: 'transparent', border: 'none', color: '#38BDF8', fontSize: '0.75rem' }}
            >
              View All History →
            </button>
          </div>

          {tasks.length > 0 ? (
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Input Files</th>
                  <th>Status</th>
                  <th>Generated Deliverable</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {tasks.slice(0, 6).map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{t.task_type}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.timestamp}</div>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {t.input_files.join(', ') || 'Direct Input'}
                    </td>
                    <td>
                      <span className="badge badge-success">
                        {t.status}
                      </span>
                    </td>
                    <td>
                      {t.deliverables.length > 0 ? (
                        <div style={{ fontSize: '0.75rem', color: '#38BDF8' }}>
                          {t.deliverables[0].name}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None</span>
                      )}
                    </td>
                    <td>
                      {t.deliverables.length > 0 && (
                        <a
                          href={t.deliverables[0].download_url}
                          download
                          style={{
                            color: '#10B981',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            fontSize: '0.75rem',
                            textDecoration: 'none'
                          }}
                        >
                          <Download size={13} />
                          Download
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              No tasks executed in this session yet. Launch the Workbench to process confidential documents.
            </div>
          )}
        </div>

        {/* Security & Enclave Enclosure Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="card">
            <div className="card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <HardDrive size={16} color="#10B981" />
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Sovereign Node Specs</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>VERIFIED LOCAL</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Enclave Mode:</span>
                <strong style={{ color: '#F1F5F9' }}>Air-Gapped Host</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>External Cloud AI:</span>
                <strong style={{ color: '#EF4444' }}>Disabled / Blocked</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Vector Store:</span>
                <strong style={{ color: '#38BDF8' }}>Qdrant Air-Gapped Store</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Orchestrator:</span>
                <strong style={{ color: '#F1F5F9' }}>LangGraph StateGraph</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.4rem 0' }}>
                <span style={{ color: 'var(--text-muted)' }}>User Session:</span>
                <strong style={{ color: '#10B981' }}>{currentUser.role} ({currentUser.full_name.split(',')[0]})</strong>
              </div>
            </div>
          </div>

          <div className="card" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div style={{ fontSize: '0.775rem', fontWeight: 600, color: '#38BDF8', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertCircle size={15} />
              <span>Sovereignty Principle</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              Confidential engineering drawings, P&IDs, refinery telemetry, and statutory inspection reports remain strictly within the host perimeter. All reasoning and document generation run locally without leaking data to third-party endpoints.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
