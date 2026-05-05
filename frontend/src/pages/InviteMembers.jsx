import React, { useState, useEffect, useContext } from 'react';
import { Mail, Users, UserPlus, Shield, Copy, Share2, Check, Trash2 } from 'lucide-react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';

export default function InviteMembers() {
  const { user } = useContext(AuthContext);
  const [email, setEmail]   = useState('');
  const [name, setName]     = useState('');
  const [password, setPass] = useState('');
  const [role, setRole]     = useState('employee');
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [msg, setMsg]       = useState(null);

  const fetchMembers = async () => {
    try {
      const res = await api.get('/admin/users');
      setMembers(res.data);
    } catch (e) {
      console.error('Failed to load members', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email || !name || !password) return;
    setSubmitting(true);
    setMsg(null);
    try {
      await api.post('/admin/users', { name, email, password, role });
      setName(''); setEmail(''); setPass('');
      setMsg({ type: 'success', text: `${name} has been added to the workspace as ${role}.` });
      fetchMembers();
    } catch (err) {
      const errMsg = err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed to add member.';
      setMsg({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, memberName) => {
    if (!window.confirm(`Remove ${memberName} from the workspace?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setMembers(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert('Failed to remove member.');
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/login`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const getInitials = (n) => n?.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase() || 'U';
  const getRoleColor = (r) => r === 'admin'
    ? { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' }
    : { bg: '#f1f5f9', text: '#475569', border: '#e2e8f0' };

  const isAdmin = user?.role === 'admin';

  return (
    <div style={{ padding: '2rem', maxWidth: '1050px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Invite Members
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', margin: 0 }}>
          Expand your team and collaborate on dynamic templates together.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2.5rem' }}>
        {/* Left: Invite Form */}
        <div className="glass" style={{ padding: '2rem', borderRadius: '20px', border: '1px solid var(--outline-variant)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UserPlus size={24} color="var(--primary)" /> Add New Member
          </h2>

          {!isAdmin ? (
            <div style={{ padding: '1.25rem', borderRadius: '12px', background: '#fef9c3', border: '1px solid #fde047', color: '#854d0e', fontSize: '0.875rem', fontWeight: 500 }}>
              <Shield size={16} style={{ display: 'inline', marginRight: '6px' }} />
              Only Admins can invite new members. Contact your workspace admin.
            </div>
          ) : (
            <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>Full Name</label>
                <input
                  type="text" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} required
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                  <input
                    type="email" placeholder="name@company.com" value={email} onChange={e => setEmail(e.target.value)} required
                    style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.25rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--on-surface-variant)' }}>Temporary Password</label>
                <input
                  type="text" placeholder="e.g. Welcome123" value={password} onChange={e => setPass(e.target.value)} required minLength={4}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid var(--outline-variant)', fontSize: '0.9rem' }}
                />
                <div style={{ fontSize: '0.73rem', color: 'var(--on-surface-variant)', marginTop: '0.3rem' }}>Share this password with the new member. They can change it in their profile.</div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--on-surface-variant)' }}>Workspace Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {[{ id: 'employee', label: 'Employee', desc: 'Can view and add data to templates.' }, { id: 'admin', label: 'Admin', desc: 'Full control over templates and users.' }].map(r => (
                    <button key={r.id} type="button" onClick={() => setRole(r.id)} style={{
                      padding: '1rem', borderRadius: '12px', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                      border: `2px solid ${role === r.id ? 'var(--primary)' : 'var(--outline-variant)'}`,
                      background: role === r.id ? 'rgba(0, 94, 164, 0.05)' : 'white',
                    }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem', color: role === r.id ? 'var(--primary)' : 'var(--on-surface)' }}>{r.label}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {msg && (
                <div style={{
                  padding: '0.75rem 1rem', borderRadius: '10px', fontSize: '0.875rem', fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  background: msg.type === 'success' ? '#ecfdf5' : '#fef2f2',
                  color: msg.type === 'success' ? '#065f46' : '#991b1b',
                }}>
                  {msg.type === 'success' && <Check size={16} />}
                  {msg.text}
                </div>
              )}

              <button type="submit" className="btn-primary" disabled={submitting}
                style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', borderRadius: '10px', fontSize: '1rem', fontWeight: 700 }}>
                {submitting ? 'Adding...' : 'Add Member'}
              </button>
            </form>
          )}

          {/* Quick Link */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                <Share2 size={18} />
              </div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>Share Login Link</div>
                <div style={{ fontSize: '0.73rem', color: 'var(--on-surface-variant)' }}>Copy app URL to share with members</div>
              </div>
            </div>
            <button onClick={copyLink} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.45rem 0.9rem', fontSize: '0.82rem' }}>
              {copied ? <><Check size={14} color="#10b981" /> Copied!</> : <><Copy size={14} /> Copy Link</>}
            </button>
          </div>
        </div>

        {/* Right: Workspace Members */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={20} /> Workspace Members
            <span style={{ marginLeft: 'auto', fontSize: '0.8rem', fontWeight: 500, color: 'var(--on-surface-variant)', background: 'var(--surface-container-low)', padding: '2px 8px', borderRadius: '999px' }}>
              {members.length} total
            </span>
          </h3>

          {loading ? (
            <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>Loading members...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {members.map(m => {
                const roleColor = getRoleColor(m.role);
                return (
                  <div key={m.id} style={{
                    padding: '1rem', borderRadius: '12px', background: 'white',
                    border: '1px solid var(--outline-variant)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                        background: 'rgba(0,94,164,0.1)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.85rem'
                      }}>
                        {getInitials(m.name)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                          {m.name} {m.id === user?.id && <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: 600 }}>(You)</span>}
                        </div>
                        <div style={{ fontSize: '0.73rem', color: 'var(--on-surface-variant)', marginTop: '1px' }}>{m.email}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)', marginTop: '2px' }}>
                          Joined {new Date(m.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{
                        padding: '0.2rem 0.6rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 700,
                        background: roleColor.bg, color: roleColor.text, border: `1px solid ${roleColor.border}`,
                        textTransform: 'capitalize'
                      }}>
                        {m.role}
                      </span>
                      {isAdmin && m.id !== user?.id && (
                        <button onClick={() => handleDelete(m.id, m.name)} title="Remove member"
                          style={{ color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', transition: 'all 0.15s' }}
                          onMouseOver={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                          onMouseOut={e => { e.currentTarget.style.color = '#cbd5e1'; e.currentTarget.style.background = 'none'; }}>
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'rgba(0, 94, 164, 0.03)', borderRadius: '16px', border: '1px dashed rgba(0, 94, 164, 0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <Shield size={18} color="var(--primary)" />
              <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>Security Note</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', margin: 0, lineHeight: 1.5 }}>
              Only workspace admins can add or remove members. New members should change their temporary password after first login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
