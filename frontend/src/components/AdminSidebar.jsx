import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Users, 
  Trash2, 
  History, 
  Settings, 
  LogOut,
  ArrowLeft
} from 'lucide-react';

export default function AdminSidebar({ activeTab, setActiveTab }) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'users', label: 'User Management', icon: <Users size={18} /> },
    { id: 'deletion-requests', label: 'Deletion Requests', icon: <Trash2 size={18} /> },
    { id: 'activity-logs', label: 'Activity Logs', icon: <History size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      top: '64px', // Below TopNav
      height: 'calc(100% - 64px)',
      width: '256px',
      borderRight: '1px solid var(--outline-variant)',
      backgroundColor: 'var(--surface-container-lowest)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      zIndex: 30 // Below TopNav
    }}>
      {/* Brand Header for Admin */}
      <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--outline-variant)' }}>
        <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2, margin: 0 }}>Admin Console</h1>
        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, marginTop: '4px', fontWeight: 500 }}>System Infrastructure</p>
      </div>

      {/* Main Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', padding: '1rem', gap: '0.25rem' }}>
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.15s',
              color: activeTab === item.id ? 'var(--primary)' : '#475569',
              backgroundColor: activeTab === item.id ? 'var(--surface-container-low)' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%'
            }}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)', backgroundColor: 'rgba(0, 94, 164, 0.1)', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', marginBottom: '0.5rem' }}>
          <ArrowLeft size={18} /> Back to Main OS
        </button>
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 500, color: '#475569', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%' }}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </nav>
  );
}
