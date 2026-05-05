import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Grid, Menu, X, Check, LogOut, User, Settings, Shield } from 'lucide-react';
import { SearchContext } from '../context/SearchContext';
import { AuthContext } from '../context/AuthContext';

export default function TopNav({ onMenuClick, fullWidth = false }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const { searchQuery, setSearchQuery, notifications, unreadCount, markAsRead, markAllAsRead } = useContext(SearchContext);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const notificationRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      right: 0,
      left: fullWidth ? 0 : '256px',
      height: '64px',
      borderBottom: '1px solid var(--outline-variant)',
      zIndex: 40,
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      color: 'var(--on-surface-variant)'
    }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {fullWidth && (
          <div style={{ display: 'flex', alignItems: 'center', width: '256px', flexShrink: 0 }}>
            <Link to="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                Template OS
              </h1>
            </Link>
          </div>
        )}
        <button onClick={onMenuClick} style={{ display: 'none', color: 'inherit' }} className="mobile-menu-btn">
          <Menu size={24} />
        </button>
        <div style={{ position: 'relative', width: '100%', maxWidth: '400px' }}>
          <Search size={20} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)' }} />
          <input 
            type="text" 
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 1rem 0.5rem 2.5rem',
              backgroundColor: 'var(--surface-container-low)',
              border: '1px solid var(--outline-variant)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--on-surface)',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 1px var(--primary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--outline-variant)';
              e.target.style.boxShadow = 'none';
            }}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--outline)', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            style={{ 
              width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', 
              borderRadius: '50%', color: 'var(--on-surface-variant)', transition: 'background-color 0.2s',
              position: 'relative', background: showNotifications ? 'var(--surface-container-low)' : 'transparent'
            }}
            onMouseOver={e => !showNotifications && (e.currentTarget.style.backgroundColor = 'var(--surface-container-low)')}
            onMouseOut={e => !showNotifications && (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span style={{ 
                position: 'absolute', top: '4px', right: '4px', width: '8px', height: '8px', 
                background: '#e53e3e', borderRadius: '50%', border: '2px solid white' 
              }} />
            )}
          </button>

          {showNotifications && (
            <div style={{ 
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '320px', 
              background: 'white', borderRadius: '12px', border: '1px solid var(--outline-variant)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden'
            }}>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700 }}>Notifications</h4>
                <button onClick={markAllAsRead} style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                  Mark all as read
                </button>
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--outline)' }}>
                    No notifications
                  </div>
                ) : (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => markAsRead(n.id)}
                      style={{ 
                        padding: '1rem', borderBottom: '1px solid var(--outline-variant)', 
                        background: n.read ? 'transparent' : 'rgba(0, 94, 164, 0.03)',
                        cursor: 'pointer', transition: 'background-color 0.2s'
                      }}
                      onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.02)'}
                      onMouseOut={e => e.currentTarget.style.backgroundColor = n.read ? 'transparent' : 'rgba(0, 94, 164, 0.03)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{n.title}</span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--outline)' }}>{n.time}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }} ref={profileRef}>
          <div 
            onClick={() => setShowProfile(!showProfile)}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              backgroundColor: '#d2e4ff', 
              marginLeft: '0.5rem',
              overflow: 'hidden',
              border: `2px solid ${showProfile ? 'var(--primary)' : 'var(--outline-variant)'}`,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=005EA4&color=fff`} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {showProfile && (
            <div style={{ 
              position: 'absolute', top: 'calc(100% + 10px)', right: 0, width: '240px', 
              background: 'white', borderRadius: '12px', border: '1px solid var(--outline-variant)', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)', overflow: 'hidden', padding: '0.5rem'
            }}>
              <div style={{ padding: '0.75rem', borderBottom: '1px solid var(--outline-variant)', marginBottom: '0.5rem' }}>
                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{user?.email}</div>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '0.5rem',
                  padding: '2px 8px', borderRadius: '4px', background: 'var(--surface-container-low)',
                  fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase'
                }}>
                  <Shield size={10} /> {user?.role}
                </div>
              </div>

              <button className="dropdown-item" style={dropdownItemStyle} onClick={() => { setShowProfile(false); navigate('/profile'); }}>
                <User size={16} /> My Profile
              </button>
              <button className="dropdown-item" style={dropdownItemStyle} onClick={() => { setShowProfile(false); navigate('/settings'); }}>
                <Settings size={16} /> Account Settings
              </button>
              
              <div style={{ height: '1px', background: 'var(--outline-variant)', margin: '0.5rem 0' }} />
              
              <button 
                className="dropdown-item" 
                style={{ ...dropdownItemStyle, color: '#e53e3e' }} 
                onClick={handleLogout}
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const dropdownItemStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 0.75rem',
  border: 'none',
  background: 'none',
  borderRadius: '6px',
  fontSize: '0.85rem',
  color: '#475569',
  cursor: 'pointer',
  transition: 'background-color 0.2s',
  textAlign: 'left'
};
