import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';
import { User, Mail, Shield, Lock, Save, Check, Camera } from 'lucide-react';

export default function MyProfile() {
  const { user, login } = useContext(AuthContext);

  const [name, setName]         = useState(user?.name || '');
  const [currentPw, setCurrent] = useState('');
  const [newPw, setNewPw]       = useState('');
  const [confirmPw, setConfirm] = useState('');

  const [profileSaving, setProfileSaving] = useState(false);
  const [pwSaving, setPwSaving]           = useState(false);
  const [profileMsg, setProfileMsg]       = useState(null);
  const [pwMsg, setPwMsg]                 = useState(null);

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=005EA4&color=fff&size=128`;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      await api.put(`/admin/users/${user.id}`, { name });
      // Update localStorage user
      const updated = { ...user, name };
      localStorage.setItem('user', JSON.stringify(updated));
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ type: 'error', text: 'All password fields are required.' });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPw.length < 4) {
      setPwMsg({ type: 'error', text: 'New password must be at least 4 characters.' });
      return;
    }
    setPwSaving(true);
    setPwMsg(null);
    try {
      await api.put(`/admin/users/${user.id}`, { password: newPw });
      setCurrent(''); setNewPw(''); setConfirm('');
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.error || 'Failed to update password.' });
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div style={{ padding: '2.5rem', maxWidth: '760px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--on-surface)', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>My Profile</h1>
        <p style={{ color: 'var(--on-surface-variant)', fontSize: '0.95rem', margin: 0 }}>Manage your personal information and account security.</p>
      </div>

      {/* Avatar + Identity Card */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={avatarUrl}
            alt="Avatar"
            style={{ width: '96px', height: '96px', borderRadius: '50%', border: '3px solid var(--primary)', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute', bottom: 2, right: 2,
            width: '28px', height: '28px', borderRadius: '50%',
            background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid white', cursor: 'pointer'
          }} title="Avatar is auto-generated from your name">
            <Camera size={13} color="white" />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Mail size={14} /> {user?.email}
          </div>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            padding: '4px 12px', borderRadius: '999px',
            background: user?.role === 'admin' ? '#dbeafe' : '#f1f5f9',
            color: user?.role === 'admin' ? '#1e40af' : '#475569',
            fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            <Shield size={11} /> {user?.role}
          </span>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--outline-variant)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <User size={20} color="var(--primary)" /> Personal Information
        </h2>
        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--on-surface-variant)' }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your full name"
              required
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.95rem' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--on-surface-variant)' }}>Email Address</label>
            <input
              type="email"
              value={user?.email || ''}
              readOnly
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.95rem', background: '#f8fafc', color: '#94a3b8', cursor: 'not-allowed' }}
            />
            <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', marginTop: '0.3rem' }}>Email cannot be changed. Contact an admin if needed.</div>
          </div>

          {profileMsg && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: profileMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: profileMsg.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '0.875rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              {profileMsg.type === 'success' && <Check size={16} />}
              {profileMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={profileSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}>
              <Save size={16} /> {profileSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--outline-variant)' }}>
        <h2 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Lock size={20} color="var(--primary)" /> Change Password
        </h2>
        <form onSubmit={handlePasswordSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--on-surface-variant)' }}>Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrent(e.target.value)} placeholder="••••••••"
              style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.95rem' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--on-surface-variant)' }}>New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.95rem' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--on-surface-variant)' }}>Confirm Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirm(e.target.value)} placeholder="••••••••"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.95rem' }} />
            </div>
          </div>

          {pwMsg && (
            <div style={{
              padding: '0.75rem 1rem', borderRadius: '10px',
              background: pwMsg.type === 'success' ? '#ecfdf5' : '#fef2f2',
              color: pwMsg.type === 'success' ? '#065f46' : '#991b1b',
              fontSize: '0.875rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.5rem'
            }}>
              {pwMsg.type === 'success' && <Check size={16} />}
              {pwMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn-primary" disabled={pwSaving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem' }}>
              <Lock size={16} /> {pwSaving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
