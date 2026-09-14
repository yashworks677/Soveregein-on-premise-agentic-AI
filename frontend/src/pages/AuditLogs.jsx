import React, { useState, useEffect } from 'react';
import { FileText, Shield, Filter, Search, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../api';

export default function AuditLogs({ currentUser }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = () => {
    setLoading(true);
    api.getAuditLogs()
      .then(data => {
        setLogs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesSearch = searchQuery === '' || 
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const uniqueActions = ['ALL', ...Array.from(new Set(logs.map(l => l.action)))];

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            Sovereign Security Audit Trail
          </h1>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            Immutable, timestamped event log recording all enclave authentication, file ingestion, task routing, knowledge retrievals, and deliverable exports.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            padding: '0.45rem 0.85rem',
            fontSize: '0.775rem'
          }}
        >
          <RefreshCw size={13} /> Refresh Log
        </button>
      </div>

      <div className="card">
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, maxWidth: '360px' }}>
            <Search size={16} color="var(--text-muted)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search audit trail by operator or keyword..."
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="var(--text-muted)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Action:</span>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem', width: 'auto' }}
            >
              {uniqueActions.map(act => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading audit records...
          </div>
        ) : filteredLogs.length > 0 ? (
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Operator</th>
                <th>Role</th>
                <th>Action</th>
                <th>Status</th>
                <th>Operational Details</th>
                <th>Network Source</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(l => (
                <tr key={l.id}>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {l.timestamp}
                  </td>
                  <td style={{ fontWeight: 600, color: '#FFFFFF' }}>
                    {l.username}
                  </td>
                  <td>
                    <span className={`badge ${l.role === 'ADMIN' ? 'badge-info' : 'badge-success'}`} style={{ fontSize: '0.625rem' }}>
                      {l.role}
                    </span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.725rem', color: '#38BDF8' }}>{l.action}</code>
                  </td>
                  <td>
                    <span className={`badge ${l.status === 'SUCCESS' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.625rem' }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
                    {l.details}
                  </td>
                  <td style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                    {l.ip_address}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No audit records match the selected filter.
          </div>
        )}
      </div>

    </div>
  );
}
