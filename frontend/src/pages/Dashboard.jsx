import React, { useState, useEffect } from 'react';
import api from '../api';
import { LayoutGrid, Users, Database, AlertCircle, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: '2rem' }}>Loading dashboard...</div>;

  const statCards = [
    { label: 'Templates', value: stats?.counts.templates, icon: <LayoutGrid />, color: 'var(--primary)', path: '/templates' },
    { label: 'Data Entries', value: stats?.counts.entries, icon: <Database />, color: '#10b981', path: '/templates' },
    { label: 'Active Users', value: stats?.counts.users, icon: <Users />, color: '#6366f1', path: '/admin' },
    { label: 'Pending Requests', value: stats?.counts.pendingDeletes, icon: <AlertCircle />, color: '#f59e0b', path: '/admin' },
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Welcome Section */}
      <div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
          Welcome Back!
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', margin: 0 }}>
          Here's what's happening in your workspace today.
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        {statCards.map((card, i) => (
          <div 
            key={i}
            onClick={() => navigate(card.path)}
            style={{ 
              padding: '1.5rem', background: 'white', borderRadius: '16px', border: '1px solid var(--outline-variant)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.03)', cursor: 'pointer', transition: 'all 0.2s ease'
            }}
            onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '12px', background: `${card.color}15`, color: card.color }}>
                {React.cloneElement(card.icon, { size: 24 })}
              </div>
              <TrendingUp size={16} color="var(--outline)" />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--on-surface)' }}>{card.value}</div>
            <div style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', fontWeight: 500 }}>{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
        {/* Recent Activity */}
        <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--outline-variant)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={20} color="var(--primary)" /> Recent Activity
            </h3>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }} onClick={() => navigate('/admin')}>
              View Logs
            </button>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {stats?.recentActivity.map((log, i) => (
              <div key={log.id} style={{ 
                padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem',
                borderBottom: i === stats.recentActivity.length - 1 ? 'none' : '1px solid var(--surface-variant)'
              }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface-container-low)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem' }}>
                  {log.user_name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.9rem', color: 'var(--on-surface)' }}>
                    <span style={{ fontWeight: 700 }}>{log.user_name}</span> {log.action.replace('_', ' ')}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', border: '1px solid var(--outline-variant)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>Top Templates</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats?.topTemplates.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.color }}></div>
                  <div style={{ flex: 1, fontSize: '0.9rem', fontWeight: 600 }}>{t.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--on-surface-variant)' }}>{t.count} entries</div>
                </div>
              ))}
            </div>
            <button 
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', padding: '0.75rem' }}
              onClick={() => navigate('/templates')}
            >
              Manage Templates <ArrowRight size={18} />
            </button>
          </div>

          <div style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #0077c8 100%)', padding: '1.5rem', borderRadius: '20px', color: 'white' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Workspace Growth</h3>
            <p style={{ fontSize: '0.8rem', opacity: 0.9, marginBottom: '1.5rem' }}>You've collected {stats?.counts.entries} data points. Keep it up!</p>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '40px' }}>
              {(stats?.trend?.length > 0
                ? (() => {
                    const maxVal = Math.max(...stats.trend.map(d => d.count), 1);
                    return stats.trend.slice(-7).map((d, i) => ({
                      h: Math.max(Math.round((d.count / maxVal) * 100), 8),
                      key: i
                    }));
                  })()
                : [30,45,25,60,40,75,90].map((h,i) => ({ h, key: i }))
              ).map(({ h, key }) => (
                <div key={key} style={{ flex: 1, height: `${h}%`, background: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
