import React, { useState } from 'react';
import { ShieldCheck, Lock, User, AlertCircle, ArrowRight, HardDrive } from 'lucide-react';
import { api } from '../api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('engineer');
  const [password, setPassword] = useState('eng123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.login(username, password);
      onLoginSuccess(data.user);
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (u, p) => {
    setUsername(u);
    setPassword(p);
    setLoading(true);
    setError('');
    api.login(u, p)
      .then(data => onLoginSuccess(data.user))
      .catch(err => {
        setError(err.message || 'Quick login failed');
        setLoading(false);
      });
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-app)',
      padding: '1.5rem'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '2.25rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        
        {/* Header Icon & Title */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#0369A1',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            marginBottom: '0.75rem'
          }}>
            <ShieldCheck size={28} />
          </div>

          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
            SOVEREIGNAI WORKBENCH
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Air-Gapped Confidential Industrial AI Enclave
          </p>
          <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.675rem', color: '#10B981' }}>
            <HardDrive size={12} />
            <span>HOST SECURED • ZERO DATA EGRESS</span>
          </div>
        </div>

        {error && (
          <div style={{
            marginBottom: '1rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--status-danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#FCA5A5',
            fontSize: '0.775rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={15} color="#EF4444" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Operator ID / Username
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="engineer or admin"
                style={{ paddingLeft: '2.2rem' }}
              />
              <User size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
              Security Passkey
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ paddingLeft: '2.2rem' }}
              />
              <Lock size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '0.5rem',
              backgroundColor: '#0284C7',
              color: '#FFFFFF',
              padding: '0.7rem',
              fontWeight: 600,
              fontSize: '0.875rem'
            }}
          >
            {loading ? 'Authenticating...' : 'Access Confidential Enclave'}
            <ArrowRight size={15} />
          </button>
        </form>

        {/* Quick Demo Access Buttons */}
        <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.6rem', textAlign: 'center' }}>
            Preset Enclave Operator Credentials:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('engineer', 'eng123')}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.55rem 0.85rem',
                fontSize: '0.75rem',
                justifyContent: 'space-between'
              }}
            >
              <span><strong>Rajesh Kumar</strong> (Operations Engineer)</span>
              <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>ENGINEER</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'admin123')}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                padding: '0.55rem 0.85rem',
                fontSize: '0.75rem',
                justifyContent: 'space-between'
              }}
            >
              <span><strong>Dr. Arvind Sharma</strong> (Plant Safety Director)</span>
              <span className="badge badge-info" style={{ fontSize: '0.6rem' }}>ADMIN</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
