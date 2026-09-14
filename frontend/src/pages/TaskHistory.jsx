import React, { useState, useEffect } from 'react';
import { Clock, FileText, Download, Eye, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../api';

export default function TaskHistory() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  useEffect(() => {
    api.getTasks()
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const toggleExpand = (taskId) => {
    setExpandedTaskId(prev => (prev === taskId ? null : taskId));
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Enclave Task History & Deliverables
        </h1>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Audit trail of historical operational directives, automated task classifications, and generated engineering deliverables.
        </p>
      </div>

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Clock size={16} color="#38BDF8" />
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>
              Recorded Tasks ({tasks.length})
            </span>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading historical task registry...
          </div>
        ) : tasks.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {tasks.map((t) => {
              const isExpanded = expandedTaskId === t.id;
              return (
                <div
                  key={t.id}
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Task Summary Row */}
                  <div
                    onClick={() => toggleExpand(t.id)}
                    style={{
                      padding: '0.85rem 1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--bg-card)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10B981'
                      }}>
                        <CheckCircle size={18} />
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#FFFFFF' }}>
                            {t.task_type}
                          </span>
                          <span className="badge badge-success" style={{ fontSize: '0.625rem' }}>
                            {t.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                          Directive: "{t.requirement.slice(0, 90)}..."
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          Operator: {t.username} • {t.timestamp} • Inputs: {t.input_files.join(', ') || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: '#38BDF8', fontWeight: 600 }}>
                          {t.deliverables.length} Deliverables
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div style={{
                      padding: '1rem',
                      borderTop: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-card)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.85rem'
                    }}>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        Routed Capability: <strong style={{ color: '#38BDF8' }}>{t.routed_capability}</strong>
                      </div>

                      {t.result && t.result.executive_summary && (
                        <div>
                          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                            Executive Summary
                          </div>
                          <p style={{ fontSize: '0.8rem', color: '#E2E8F0', lineHeight: '1.5' }}>
                            {t.result.executive_summary}
                          </p>
                        </div>
                      )}

                      {/* Deliverables List */}
                      <div>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                          Generated Artifacts:
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {t.deliverables.map((deliv, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '0.5rem 0.75rem',
                                backgroundColor: 'var(--bg-surface)',
                                border: '1px solid var(--border-subtle)',
                                borderRadius: 'var(--radius-sm)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                              }}
                            >
                              <FileText size={15} color="#10B981" />
                              <span style={{ fontSize: '0.775rem', color: '#FFFFFF', fontWeight: 500 }}>
                                {deliv.name}
                              </span>
                              <a
                                href={`http://127.0.0.1:8000${deliv.download_url}`}
                                download
                                style={{
                                  color: '#0284C7',
                                  fontSize: '0.725rem',
                                  fontWeight: 600,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.2rem',
                                  marginLeft: '0.35rem',
                                  textDecoration: 'none'
                                }}
                              >
                                <Download size={13} />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No recorded tasks in the enclave history. Run tasks in the Workbench to populate history.
          </div>
        )}
      </div>
    </div>
  );
}
