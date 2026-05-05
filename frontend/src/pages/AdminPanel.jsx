import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Trash2, CheckCircle, XCircle, Plus, Filter, ChevronLeft, ChevronRight, MoreVertical, Search, Edit2, Eye, Users, Home } from 'lucide-react';
import AdminSidebar from '../components/AdminSidebar';

export default function AdminPanel() {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('users'); // users, deletion-requests, activity-logs

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [logs, setLogs] = useState([]);

  // new user form state
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'employee' });

  const fetchUsers = async () => {
    try { const res = await api.get('/admin/users'); setUsers(res.data); } catch(e) {}
  };

  const fetchRequests = async () => {
    try { const res = await api.get('/delete-requests'); setRequests(res.data); } catch(e) {}
  };

  const fetchLogs = async () => {
    try { const res = await api.get('/admin/logs'); setLogs(res.data.logs || []); } catch(e) {}
  };

  useEffect(() => {
    if (user?.role !== 'admin') return;
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'deletion-requests') fetchRequests();
    if (activeTab === 'activity-logs') fetchLogs();
  }, [activeTab, user]);

  if (user?.role !== 'admin') {
    return (
      <div style={{ 
        height: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'linear-gradient(135deg, var(--color-ice) 0%, #ffffff 100%)', padding: '2rem' 
      }}>
        <div className="glass" style={{ 
          maxWidth: '440px', width: '100%', padding: '3rem 2.5rem', borderRadius: '24px', textAlign: 'center',
          boxShadow: '0 20px 50px rgba(4, 44, 83, 0.08)', border: '1px solid rgba(255,255,255,0.6)'
        }}>
          <div style={{ 
            width: '80px', height: '80px', background: '#ffdad6', color: '#93000a', 
            borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 1.5rem', fontSize: '2.5rem'
          }}>
            <XCircle size={40} />
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--color-midnight)', marginBottom: '0.75rem' }}>
            Access Denied
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            You don't have the required permissions to access the Admin Console. Please contact your administrator if you believe this is an error.
          </p>
          <button 
            onClick={() => window.location.href = '/'}
            className="btn-primary" 
            style={{ 
              width: '100%', justifyContent: 'center', padding: '0.85rem', 
              borderRadius: '12px', fontSize: '1rem', fontWeight: 600, gap: '0.75rem' 
            }}
          >
            <Home size={20} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUser);
      setNewUser({ name: '', email: '', password: '', role: 'employee' });
      setShowAddUser(false);
      fetchUsers();
    } catch (e) {
      alert(e.response?.data?.error || 'Error creating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (e) { alert("Error deleting user"); }
  };

  const handleRequest = async (id, action) => {
    try {
      await api.put(`/delete-requests/${id}/${action}`);
      fetchRequests();
    } catch (e) { alert("Error processing request"); }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Helper for activity log styling
  const getLogStyle = (actionStr) => {
    const action = actionStr.toLowerCase();
    if (action.includes('delete') || action.includes('remove')) return { bg: '#ffdad6', text: '#93000a', icon: <Trash2 size={14} /> };
    if (action.includes('update') || action.includes('edit')) return { bg: '#d2e4ff', text: '#004880', icon: <Edit2 size={14} /> };
    if (action.includes('create') || action.includes('add')) return { bg: '#93bdfd', text: '#194c84', icon: <Plus size={14} /> };
    if (action.includes('permission') || action.includes('role')) return { bg: '#d2e4ff', text: '#004880', icon: <Users size={14} /> };
    return { bg: '#e0e2ea', text: '#414751', icon: <Eye size={14} /> }; // default view
  };

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%', backgroundColor: 'var(--surface)' }}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div style={{ flex: 1, marginLeft: '256px', display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Top Header */}
        <div style={{ padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
              {activeTab === 'users' && 'User Management'}
              {activeTab === 'deletion-requests' && 'Pending Deletions'}
              {activeTab === 'activity-logs' && 'Activity Logs'}
              {activeTab === 'settings' && 'System Settings'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
              {activeTab === 'users' && 'Manage platform access, roles, and user statuses.'}
              {activeTab === 'deletion-requests' && 'Review and manage workspace template removal requests.'}
              {activeTab === 'activity-logs' && 'System-wide audit trail of user and entity actions.'}
              {activeTab === 'settings' && 'Configure workspace behaviour, security policies, and data management.'}
            </p>
          </div>
          {activeTab === 'users' && (
            <button 
              onClick={() => setShowAddUser(!showAddUser)}
              className="btn-primary" 
              style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Plus size={18} /> Add User
            </button>
          )}
        </div>

        {/* Content Area */}
        <div style={{ flex: 1, padding: '0 2.5rem 2.5rem 2.5rem', overflowY: 'auto' }}>
          {showAddUser && activeTab === 'users' && (
            <div style={{ backgroundColor: 'var(--surface-container-lowest)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--outline-variant)', marginBottom: '1.5rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', color: '#0f172a' }}>Create New User</h3>
              <form onSubmit={handleCreateUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <input type="text" placeholder="Full Name" required value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                <input type="email" placeholder="Email Address" required value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                <input type="password" placeholder="Password" required minLength="4" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})}>
                  <option value="employee">Employee</option>
                  <option value="admin">Admin</option>
                </select>
                <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setShowAddUser(false)} className="btn-secondary">Cancel</button>
                  <button type="submit" className="btn-primary">Save User</button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'users' && (
            <div style={{ 
              backgroundColor: 'var(--surface-container-lowest)', 
              borderRadius: '12px', 
              border: '1px solid var(--outline-variant)', 
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {/* Table Tools (Tabs & Filter) */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 600, color: '#0f172a', padding: '0.25rem 0.5rem', backgroundColor: 'var(--surface-container-low)', borderRadius: '9999px' }}>
                    All Users ({users.length})
                  </span>
                  <span style={{ color: '#64748b', padding: '0.25rem 0.5rem' }}>Admins</span>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <Filter size={16} /> Filter
                </button>
              </div>

              {/* Users Table */}
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                  <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--outline-variant)' }}>
                    <tr>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Name</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Email</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Role</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                      <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u.id} style={{ borderBottom: i === users.length - 1 ? 'none' : '1px solid var(--surface-variant)' }}>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                              {getInitials(u.name)}
                            </div>
                            <span style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{u.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', color: '#475569', fontSize: '0.875rem' }}>{u.email}</td>
                        <td style={{ padding: '1rem 1.5rem', color: '#0f172a', fontSize: '0.875rem', textTransform: 'capitalize' }}>{u.role}</td>
                        <td style={{ padding: '1rem 1.5rem' }}>
                          <span style={{ 
                            display: 'inline-flex', alignItems: 'center', padding: '0.125rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600,
                            backgroundColor: u.role === 'admin' ? '#dbeafe' : '#f1f5f9', 
                            color: u.role === 'admin' ? '#1e40af' : '#475569',
                            border: `1px solid ${u.role === 'admin' ? '#bfdbfe' : '#e2e8f0'}`
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: u.role === 'admin' ? '#2563eb' : '#64748b', marginRight: '6px' }}></span>
                            Active
                          </span>
                        </td>
                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                          <button onClick={() => handleDeleteUser(u.id)} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }} title="Delete User">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Showing 1 to {users.length} of {users.length} entries</span>
                <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
                  <button style={{ padding: '0.25rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronLeft size={16}/></button>
                  <button style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.875rem', fontWeight: 600, border: 'none' }}>1</button>
                  <button style={{ padding: '0.25rem', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}><ChevronRight size={16}/></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'deletion-requests' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem', gap: '0.5rem' }}>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface)' }}><Filter size={18} /> Filter</button>
                <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--surface)' }}><Filter size={18} /> Sort</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {requests.map(r => (
                  <div key={r.id} style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '12px', padding: '1.5rem', display: 'flex', flexDirection: 'column', boxShadow: '0px 4px 20px rgba(0,94,164,0.05)', border: '1px solid transparent', transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.borderColor = '#B5D4F4'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <span style={{ backgroundColor: 'var(--surface-container-high)', color: 'var(--on-surface-variant)', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500 }}>
                        {r.status === 'pending' ? 'Pending' : r.status}
                      </span>
                      <span style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 500 }}>{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--on-surface)', marginBottom: '0.25rem' }}>{r.template_name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ height: '24px', width: '24px', borderRadius: '50%', backgroundColor: 'var(--surface-container-high)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontSize: '0.625rem', fontWeight: 'bold' }}>
                        {getInitials(r.requester_name)}
                      </div>
                      <span style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>{r.requester_name}</span>
                    </div>
                    <div style={{ backgroundColor: 'var(--surface-container-low)', padding: '0.5rem', borderRadius: '8px', marginBottom: '1rem', flexGrow: 1 }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--on-surface)', fontStyle: 'italic', margin: 0 }}>"{r.reason || 'No reason provided.'}"</p>
                    </div>
                    {r.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.5rem', borderTop: '1px solid rgba(181, 212, 244, 0.5)' }}>
                        <button onClick={() => handleRequest(r.id, 'reject')} style={{ flex: 1, padding: '0.5rem', backgroundColor: '#ffdad6', color: '#93000a', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Reject</button>
                        <button onClick={() => handleRequest(r.id, 'approve')} style={{ flex: 1, padding: '0.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer' }}>Approve</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'activity-logs' && (
            <>
              {/* Filters & Search */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--surface-container-lowest)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ position: 'relative', width: '256px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
                    <input type="text" placeholder="Search logs..." style={{ width: '100%', padding: '0.5rem 1rem 0.5rem 2.5rem', backgroundColor: 'var(--surface-container-lowest)', border: '1px solid var(--outline-variant)', borderRadius: '4px', outline: 'none' }} />
                  </div>
                  <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Filter size={18} /> Filters</button>
                </div>
                <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.75rem', fontWeight: 500 }}>
                  Showing 1-{Math.min(10, logs.length)} of {logs.length} entries
                </div>
              </div>

              {/* Data Table */}
              <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '12px', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', whiteSpace: 'nowrap' }}>
                    <thead style={{ backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)' }}>
                      <tr>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>User</th>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Action</th>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Entity</th>
                        <th style={{ padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l, i) => {
                        const style = getLogStyle(l.action);
                        return (
                          <tr key={l.id} style={{ borderBottom: i === logs.length - 1 ? 'none' : '1px solid var(--surface-variant)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <td style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#93bdfd', color: '#194c84', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', fontWeight: 600 }}>
                                {getInitials(l.user_name)}
                              </div>
                              <span style={{ color: 'var(--on-surface)' }}>{l.user_name}</span>
                            </td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <span style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500,
                                backgroundColor: style.bg, color: style.text, border: style.bg === '#e0e2ea' ? '1px solid var(--outline-variant)' : 'none'
                              }}>
                                {style.icon} {l.action}
                              </span>
                            </td>
                            <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--on-surface)' }}>{l.entity_type}: {l.entity_id}</td>
                            <td style={{ padding: '1rem 1.5rem', color: 'var(--on-surface-variant)' }}>{new Date(l.timestamp).toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div style={{ padding: '1rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
                  <button style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--outline-variant)', borderRadius: '4px', color: 'var(--on-surface)', backgroundColor: 'transparent', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }} disabled>Previous</button>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', backgroundColor: 'var(--primary)', color: 'white', fontSize: '0.875rem', border: 'none' }}>1</button>
                  </div>
                  <button style={{ padding: '0.25rem 0.75rem', border: '1px solid var(--outline-variant)', borderRadius: '4px', color: 'var(--on-surface)', backgroundColor: 'transparent', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer' }}>Next</button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'settings' && (
            <AdminSettings />
          )}
        </div>
      </div>
    </div>
  );
}

function AdminSettings() {
  const [ws, setWs] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_settings') || '{}'); } catch { return {}; }
  });
  const [saved, setSaved] = React.useState(false);

  const set = (key, val) => setWs(prev => ({ ...prev, [key]: val }));

  const handleSave = () => {
    localStorage.setItem('admin_settings', JSON.stringify(ws));
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Row = ({ label, desc, children }) => (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1.5rem 0', borderBottom: '1px solid var(--outline-variant)', alignItems: 'start' }}>
      <div>
        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{desc}</div>}
      </div>
      <div>{children}</div>
    </div>
  );

  const inputStyle = { width: '100%', padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid var(--outline-variant)', fontSize: '0.875rem', background: 'white' };
  const selectStyle = { ...inputStyle };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Workspace */}
      <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '12px', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Workspace Configuration</h3>
        </div>
        <div style={{ padding: '0 1.5rem' }}>
          <Row label="Workspace Name" desc="The display name for your Template OS workspace.">
            <input style={inputStyle} value={ws.workspace_name || 'Template OS'} onChange={e => set('workspace_name', e.target.value)} placeholder="Template OS" />
          </Row>
          <Row label="Default User Role" desc="Role assigned to new users when they are created without a specified role.">
            <select style={selectStyle} value={ws.default_role || 'employee'} onChange={e => set('default_role', e.target.value)}>
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </Row>
          <Row label="Max Templates per User" desc="Limit how many templates each non-admin user can create. 0 = unlimited.">
            <input style={inputStyle} type="number" min={0} value={ws.max_templates ?? 0} onChange={e => set('max_templates', Number(e.target.value))} />
          </Row>
        </div>
      </div>

      {/* Security */}
      <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '12px', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Security & Sessions</h3>
        </div>
        <div style={{ padding: '0 1.5rem' }}>
          <Row label="Session Timeout" desc="How long before an inactive session is automatically logged out.">
            <select style={selectStyle} value={ws.session_timeout || '8h'} onChange={e => set('session_timeout', e.target.value)}>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="8h">8 Hours (Default)</option>
              <option value="24h">24 Hours</option>
              <option value="never">Never</option>
            </select>
          </Row>
          <Row label="Minimum Password Length" desc="Minimum number of characters required for user passwords.">
            <input style={inputStyle} type="number" min={4} max={32} value={ws.min_password ?? 4} onChange={e => set('min_password', Number(e.target.value))} />
          </Row>
          <Row label="Require Admin Approval for Deletions" desc="When enabled, users must submit a deletion request that admins must approve.">
            <select style={selectStyle} value={ws.require_deletion_approval ?? 'yes'} onChange={e => set('require_deletion_approval', e.target.value)}>
              <option value="yes">Yes (Recommended)</option>
              <option value="no">No — Allow direct deletion</option>
            </select>
          </Row>
        </div>
      </div>

      {/* Data */}
      <div style={{ backgroundColor: 'var(--surface-container-lowest)', borderRadius: '12px', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', background: '#f8fafc' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Data & Export</h3>
        </div>
        <div style={{ padding: '0 1.5rem' }}>
          <Row label="Activity Log Retention" desc="How long activity logs are kept before automatic cleanup.">
            <select style={selectStyle} value={ws.log_retention || '90'} onChange={e => set('log_retention', e.target.value)}>
              <option value="30">30 Days</option>
              <option value="90">90 Days (Default)</option>
              <option value="180">180 Days</option>
              <option value="365">1 Year</option>
              <option value="forever">Forever</option>
            </select>
          </Row>
          <Row label="Default Export Format" desc="Preferred format when users export template data.">
            <select style={selectStyle} value={ws.export_format || 'csv'} onChange={e => set('export_format', e.target.value)}>
              <option value="csv">CSV</option>
              <option value="xlsx">Excel (XLSX)</option>
              <option value="json">JSON</option>
            </select>
          </Row>
          <Row label="Analytics Data Range" desc="Default date range shown in the Analytics overview page.">
            <select style={selectStyle} value={ws.analytics_default || '30'} onChange={e => set('analytics_default', e.target.value)}>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days (Default)</option>
              <option value="90">Last 90 Days</option>
              <option value="0">All Time</option>
            </select>
          </Row>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
        <button
          onClick={handleSave}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.75rem' }}
        >
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
