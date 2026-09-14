import React from 'react';
import { 
  Terminal, 
  LayoutDashboard, 
  BookOpen, 
  Clock, 
  FileText, 
  Settings,
  Cpu,
  Layers
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser }) {
  const navItems = [
    { id: 'workbench', label: 'AI Workbench', icon: Terminal, primary: true },
    { id: 'dashboard', label: 'Operations Dashboard', icon: LayoutDashboard },
    { id: 'knowledge', label: 'Private Knowledge Base', icon: BookOpen },
    { id: 'tasks', label: 'Task History', icon: Clock },
    { id: 'audit', label: 'Security Audit Logs', icon: FileText },
    { id: 'settings', label: 'Enclave Settings', icon: Settings },
  ];

  return (
    <aside style={{
      width: '240px',
      backgroundColor: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '1.25rem 0.75rem',
      flexShrink: 0
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ 
          fontSize: '0.675rem', 
          fontWeight: 700, 
          letterSpacing: '0.08em', 
          color: 'var(--text-muted)', 
          padding: '0.25rem 0.75rem',
          textTransform: 'uppercase'
        }}>
          Workstation Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                justifyContent: 'flex-start',
                padding: '0.65rem 0.85rem',
                backgroundColor: isActive ? 'var(--bg-card)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--border-card)' : '1px solid transparent',
                borderRadius: 'var(--radius-md)',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon size={16} color={isActive ? '#38BDF8' : 'var(--text-muted)'} />
              <span style={{ fontSize: '0.85rem' }}>{item.label}</span>
              {item.primary && (
                <span style={{ 
                  marginLeft: 'auto', 
                  fontSize: '0.65rem', 
                  backgroundColor: '#0369A1', 
                  color: '#FFF', 
                  padding: '0.1rem 0.35rem', 
                  borderRadius: '2px',
                  fontWeight: 600
                }}>
                  CORE
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Enclave Hardware & Security Status Widget */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          <Cpu size={14} color="#0284C7" />
          <span>Local Engine Status</span>
        </div>

        <div style={{ fontSize: '0.675rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          <div>Node: <strong style={{ color: '#F1F5F9' }}>SOV-LOCAL-AIRGAP-01</strong></div>
          <div>Agent: <strong style={{ color: '#38BDF8' }}>LangGraph StateGraph</strong></div>
          <div>Storage: <strong style={{ color: '#10B981' }}>Encrypted Enclave</strong></div>
        </div>

        <div style={{
          marginTop: '0.2rem',
          paddingTop: '0.4rem',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.675rem',
          color: 'var(--text-secondary)'
        }}>
          <span>Enclave Mode:</span>
          <span className="badge badge-success" style={{ fontSize: '0.6rem', padding: '0.1rem 0.4rem' }}>
            ACTIVE
          </span>
        </div>
      </div>
    </aside>
  );
}
