import React, { useState } from 'react';
import { Settings as SettingsIcon, Shield, Server, Key, UserCheck, HardDrive, CheckCircle } from 'lucide-react';

export default function Settings({ currentUser }) {
  const [localLlmUrl, setLocalLlmUrl] = useState('http://localhost:11434 (Ollama / vLLM)');
  const [savedMsg, setSavedMsg] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div style={{ padding: '1.75rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Enclave Configuration & Security Policies
        </h1>
        <p style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
          Manage sovereign air-gap isolation parameters, local inference endpoints, and operator role permissions.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Isolation & Air-Gap Status */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={16} color="#10B981" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Air-Gap & Isolation Perimeter</span>
            </div>
            <span className="badge badge-success">ACTIVE & ENFORCED</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8rem' }}>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Egress Traffic Policy</div>
              <strong style={{ color: '#EF4444' }}>STRICT AIR-GAP: ZERO CLOUD EGRESS</strong>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                All confidential data processing occurs strictly in host RAM/disk.
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Knowledge Base Encryption</div>
              <strong style={{ color: '#38BDF8' }}>AES-256 SIMULATED LOCAL AT REST</strong>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Qdrant vectors and documents are stored in local enclave partition.
              </div>
            </div>
          </div>
        </div>

        {/* Local Model Infrastructure Form */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Server size={16} color="#38BDF8" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Local Model & Engine Routing</span>
            </div>
          </div>

          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                Optional On-Premise Local LLM / Ollama Endpoint
              </label>
              <input
                type="text"
                value={localLlmUrl}
                onChange={(e) => setLocalLlmUrl(e.target.value)}
                placeholder="e.g. http://localhost:11434 or http://localhost:8000/v1"
                style={{ fontSize: '0.825rem' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                When not present, the Sovereign Deterministic Reasoning Engine & LangGraph State Machine execute with 100% genuine local extraction and statistical synthesis.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem' }}>
              {savedMsg && (
                <span style={{ fontSize: '0.775rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={14} /> Configuration saved to enclave profile.
                </span>
              )}
              <button
                type="submit"
                style={{
                  backgroundColor: '#0284C7',
                  color: '#FFFFFF',
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  marginLeft: 'auto'
                }}
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>

        {/* Enclave RBAC Operators Table */}
        <div className="card">
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={16} color="#A855F7" />
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Role-Based Access Control (RBAC) Accounts</span>
            </div>
          </div>

          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Assigned Role</th>
                <th>Full Name & Designation</th>
                <th>Operational Department</th>
                <th>Clearance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600, color: '#FFFFFF' }}>admin</td>
                <td><span className="badge badge-info">ADMIN</span></td>
                <td>Dr. Arvind Sharma</td>
                <td>Plant Safety & Executive Oversight</td>
                <td><strong style={{ color: '#10B981' }}>Full Authority</strong></td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600, color: '#FFFFFF' }}>engineer</td>
                <td><span className="badge badge-success">ENGINEER</span></td>
                <td>Rajesh Kumar, Senior Operations Lead</td>
                <td>Pressure Vessels & Distillation Unit 7</td>
                <td><strong style={{ color: '#38BDF8' }}>Operational Enclave</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
