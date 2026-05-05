import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { TemplateContext } from '../context/TemplateContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  Database, 
  BarChart2, 
  Users, 
  Settings, 
  Plus, 
  Layers
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);
  const { templates } = useContext(TemplateContext);
  const navigate = useNavigate();

  return (
    <nav style={{
      position: 'fixed',
      left: 0,
      top: 0,
      height: '100%',
      width: '256px',
      borderRight: '1px solid var(--outline-variant)',
      backgroundColor: 'var(--surface-container-lowest)',
      display: 'flex',
      flexDirection: 'column',
      padding: '1rem',
      zIndex: 50
    }}>
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          backgroundColor: 'var(--primary)', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold'
        }}>
          <Layers size={20} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>Template OS</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, fontWeight: 500 }}>Professional Plan</p>
        </div>
      </div>

      <button 
        onClick={() => navigate('/templates/new')}
        style={{
          width: '100%',
          backgroundColor: 'var(--primary)',
          color: 'white',
          borderRadius: '8px',
          padding: '0.5rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          transition: 'background-color 0.2s'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--color-navy)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'var(--primary)'}
      >
        <Plus size={18} /> New Project
      </button>

      {/* Main Navigation */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink to="/dashboard" style={getNavStyle}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/templates" style={getNavStyle}>
          <Layers size={20} /> Templates
        </NavLink>
        <NavLink to="/analytics" style={getNavStyle}>
          <BarChart2 size={20} /> Analytics
        </NavLink>

        {/* Dynamic Template Links */}
        {templates.length > 0 && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--outline-variant)' }}>
            <div style={{ padding: '0 0.75rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>
              Your Templates
            </div>
            {templates.map(t => (
              <NavLink key={t.id} to={`/templates/${t.id}`} style={getNavStyle}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: t.color }}></div>
                {t.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <NavLink to="/invite" style={getNavStyle}>
          <Users size={20} /> Invite Members
        </NavLink>
        <NavLink to="/admin" style={getNavStyle}>
          <Settings size={20} /> Admin Panel
        </NavLink>
      </div>
    </nav>
  );
}

function getNavStyle({ isActive }) {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.5rem 0.75rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.875rem',
    fontWeight: 500,
    transition: 'all 0.15s',
    color: isActive ? 'var(--primary)' : '#475569',
    backgroundColor: isActive ? 'rgba(0, 94, 164, 0.1)' : 'transparent',
  };
}
