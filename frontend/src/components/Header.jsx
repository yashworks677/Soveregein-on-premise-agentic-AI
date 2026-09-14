import React from 'react';
import { ShieldCheck, HardDrive, Lock, User, LogOut, RefreshCw } from 'lucide-react';

export default function Header({ currentUser, onLogout, onSwitchUser }) {
  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-sidebar)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand & Security Enclave Flag */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: '#0369A1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#FFFFFF'
        }}>
          <ShieldCheck size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.04em', color: '#FFFFFF' }}>
              SOVEREIGNAI WORKBENCH
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
              LOCAL WORKSPACE
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Confidential Air-Gapped Industrial Enclave (Refinery & PSU Operations)
          </div>
        </div>
      </div>

      {/* Honest Local Infrastructure Indicators */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderRight: '1px solid var(--border-subtle)', paddingRight: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <HardDrive size={14} color="#10B981" />
            <span>Processing: <strong style={{ color: '#F1F5F9' }}>Local Host</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <Lock size={14} color="#0284C7" />
            <span>External AI API: <strong style={{ color: '#94A3B8' }}>Not Configured</strong></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span>Knowledge: <strong style={{ color: '#F1F5F9' }}>Private Qdrant</strong></span>
          </div>
        </div>

        {/* User Badge & Switch Role */}
        {currentUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.825rem', fontWeight: 600, color: '#FFFFFF' }}>
                {currentUser.full_name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {currentUser.department} • <strong style={{ color: currentUser.role === 'ADMIN' ? '#38BDF8' : '#10B981' }}>{currentUser.role}</strong>
              </div>
            </div>

            <button
              onClick={onSwitchUser}
              title={`Switch role (currently ${currentUser.role})`}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-card)',
                color: 'var(--text-secondary)',
                padding: '0.35rem 0.6rem',
                fontSize: '0.725rem'
              }}
            >
              <RefreshCw size={13} />
              Switch
            </button>

            <button
              onClick={onLogout}
              title="Sign Out"
              style={{
                background: 'transparent',
                border: '1px solid var(--border-card)',
                color: 'var(--status-danger)',
                padding: '0.35rem 0.6rem',
                fontSize: '0.725rem'
              }}
            >
              <LogOut size={13} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
