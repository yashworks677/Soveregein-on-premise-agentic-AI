import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Workbench from './pages/Workbench';
import Dashboard from './pages/Dashboard';
import KnowledgeBase from './pages/KnowledgeBase';
import TaskHistory from './pages/TaskHistory';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { api, getUser, getToken, removeToken, removeUser } from './api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('workbench');
  const [loading, setLoading] = useState(true);

  // Check existing session on mount
  useEffect(() => {
    const storedUser = getUser();
    const token = getToken();
    if (storedUser && token) {
      setCurrentUser(storedUser);
      // Optional background verification
      api.getMe()
        .then(u => setCurrentUser(u))
        .catch(() => {
          // Keep current user in air-gapped demo mode
        });
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('workbench');
  };

  const handleLogout = () => {
    removeToken();
    removeUser();
    setCurrentUser(null);
  };

  const handleSwitchUser = () => {
    if (!currentUser) return;
    const newUsername = currentUser.username === 'engineer' ? 'admin' : 'engineer';
    const newPassword = newUsername === 'admin' ? 'admin123' : 'eng123';
    api.login(newUsername, newPassword)
      .then(data => {
        setCurrentUser(data.user);
      })
      .catch(() => {
        handleLogout();
      });
  };

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-secondary)',
        fontSize: '0.875rem'
      }}>
        Initializing Sovereign Air-Gapped Enclave...
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <Header 
        currentUser={currentUser} 
        onLogout={handleLogout} 
        onSwitchUser={handleSwitchUser} 
      />

      {/* Main Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <Sidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          currentUser={currentUser} 
        />

        {/* Page Content Viewport */}
        <main style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'var(--bg-app)',
          position: 'relative'
        }}>
          {activeTab === 'workbench' && <Workbench currentUser={currentUser} />}
          {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} currentUser={currentUser} />}
          {activeTab === 'knowledge' && <KnowledgeBase currentUser={currentUser} />}
          {activeTab === 'tasks' && <TaskHistory currentUser={currentUser} />}
          {activeTab === 'audit' && <AuditLogs currentUser={currentUser} />}
          {activeTab === 'settings' && <Settings currentUser={currentUser} />}
        </main>
      </div>
    </div>
  );
}
