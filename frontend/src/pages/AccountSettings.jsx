import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Bell, Globe, ShieldCheck, Trash2, LogOut, Save, Check, Moon, Sun, Monitor } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Toggle = ({ value, onChange, label, description }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0', borderBottom: '1px solid var(--outline-variant)' }}>
    <div>
      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.2rem' }}>{label}</div>
      {description && <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{description}</div>}
    </div>
    <button
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
        background: value ? 'var(--primary)' : '#e2e8f0',
        position: 'relative', transition: 'background 0.2s', flexShrink: 0
      }}
    >
      <div style={{
        position: 'absolute', top: '2px',
        left: value ? '22px' : '2px',
        width: '20px', height: '20px', borderRadius: '50%', background: 'white',
        transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </button>
  </div>
);

export default function AccountSettings() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Notification preferences (stored in localStorage)
  const [notifSettings, setNotifSettings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('notif_settings') || '{}'); }
    catch { return {}; }
  });

  const [timezone, setTimezone] = useState(localStorage.getItem('timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [theme, setTheme]       = useState(localStorage.getItem('theme') || 'light');
  const [saved, setSaved]       = useState(false);
  const [deleting, setDeleting] = useState(false);

  const setNotif = (key, val) => setNotifSettings(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('notif_settings', JSON.stringify(notifSettings));
    localStorage.setItem('timezone', timezone);
    localStorage.setItem('theme', theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const TIMEZONES = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'America/Chicago',
    'Europe/London', 'Europe/Paris', 'Europe/Berlin',
    'Asia/Dhaka', 'Asia/Kolkata', 'Asia/Tokyo', 'Asia/Shanghai',
    'Australia/Sydney', 'Pacific/Auckland',
  ];

  const THEMES = [
    { value: 'light', label: 'Light', icon: <Sun size={16} /> },
    { value: 'dark',  label: 'Dark',  icon: <Moon size={16} /> },
    { value: 'system',label: 'System',icon: <Monitor size={16} /> },
  ];

  return (
    <div style={{ padding: '2.5rem', maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>Account Settings</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', margin: 0 }}>Configure notifications, display preferences, and account options.</p>
      </div>

      {/* Notification Preferences */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--outline-variant)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Bell size={20} color="var(--primary)" /> Notification Preferences
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--on-surface-variant)', marginBottom: '0.5rem' }}>Choose what activity triggers notifications for you.</p>

        <Toggle
          value={notifSettings.template_created !== false}
          onChange={v => setNotif('template_created', v)}
          label="Template Created"
          description="Notify when a new template is created in the workspace."
        />
        <Toggle
          value={notifSettings.data_added !== false}
          onChange={v => setNotif('data_added', v)}
          label="New Data Entry"
          description="Notify when a new entry is submitted to any template."
        />
        <Toggle
          value={notifSettings.user_joined !== false}
          onChange={v => setNotif('user_joined', v)}
          label="New Member Joined"
          description="Notify when a new user joins the workspace."
        />
        <Toggle
          value={notifSettings.deletion_requests !== false}
          onChange={v => setNotif('deletion_requests', v)}
          label="Deletion Requests"
          description="Notify when a deletion request is submitted or reviewed."
        />
        <Toggle
          value={notifSettings.digest !== false}
          onChange={v => setNotif('digest', v)}
          label="Weekly Digest"
          description="Receive a weekly summary of workspace activity."
        />
      </div>

      {/* Display Preferences */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--outline-variant)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Globe size={20} color="var(--primary)" /> Display & Region
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Theme Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--on-surface-variant)' }}>Theme</label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '12px', cursor: 'pointer',
                    border: `2px solid ${theme === t.value ? 'var(--primary)' : 'var(--outline-variant)'}`,
                    background: theme === t.value ? 'rgba(0,94,164,0.07)' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    fontWeight: 600, fontSize: '0.875rem',
                    color: theme === t.value ? 'var(--primary)' : 'var(--on-surface)',
                    transition: 'all 0.2s'
                  }}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.4rem' }}>Theme switching is saved to your preferences. (Full dark mode coming soon)</div>
          </div>

          {/* Timezone Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>Timezone</label>
            <select
              value={timezone}
              onChange={e => setTimezone(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.9rem', background: 'white' }}
            >
              {TIMEZONES.map(tz => (
                <option key={tz} value={tz}>{tz.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.7rem 2rem', fontSize: '0.95rem', transition: 'all 0.2s' }}
        >
          {saved ? <><Check size={16} /> Saved!</> : <><Save size={16} /> Save Settings</>}
        </button>
      </div>

      {/* Danger Zone */}
      <div style={{ padding: '2rem', borderRadius: '20px', border: '1px solid #fecaca', background: '#fef2f2' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#991b1b' }}>
          <ShieldCheck size={20} /> Danger Zone
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#7f1d1d', marginBottom: '1.5rem', lineHeight: 1.5 }}>
          These actions are irreversible. Please be certain before proceeding.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.6rem 1.2rem', borderRadius: '10px',
              border: '1px solid #fca5a5', background: 'white', color: '#dc2626',
              fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'white'; }}
          >
            <LogOut size={16} /> Sign Out of All Devices
          </button>
          {user?.role === 'admin' && (
            <div style={{ fontSize: '0.8rem', color: '#7f1d1d', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <ShieldCheck size={14} /> Admin accounts cannot be self-deleted. Contact the system owner.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
