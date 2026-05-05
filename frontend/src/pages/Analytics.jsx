import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { BarChart3, PieChart, TrendingUp, Calendar, Download, ChevronDown } from 'lucide-react';

const DATE_RANGES = [
  { label: 'Last 7 Days',  days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'Last 90 Days', days: 90 },
  { label: 'All Time',     days: null },
];

function getDateRange(days) {
  if (!days) return { from: null, to: null };
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().split('T')[0],
    to:   to.toISOString().split('T')[0],
  };
}

export default function Analytics() {
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [selectedRange, setSelected] = useState(DATE_RANGES[1]); // Last 30 Days
  const [showDateMenu, setShowDate] = useState(false);
  const dateRef = useRef(null);

  const fetchStats = async (range) => {
    setLoading(true);
    try {
      const { from, to } = getDateRange(range.days);
      const params = {};
      if (from) params.from = from;
      if (to)   params.to   = to;
      const res = await api.get('/stats', { params });
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(selectedRange);
  }, []);

  // Close date dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dateRef.current && !dateRef.current.contains(e.target)) setShowDate(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleRangeChange = (range) => {
    setSelected(range);
    setShowDate(false);
    fetchStats(range);
  };

  const handleExport = () => {
    if (!stats) return;
    const rows = [
      ['Template Name', 'Entry Count', 'Percentage'],
      ...stats.topTemplates.map(t => [
        t.name,
        t.count,
        `${stats.counts.entries > 0 ? ((t.count / stats.counts.entries) * 100).toFixed(1) : 0}%`
      ]),
      [],
      ['Date', 'Entries'],
      ...stats.trend.map(d => [d.date, d.count]),
      [],
      ['Metric', 'Value'],
      ['Total Templates', stats.counts.templates],
      ['Total Entries', stats.counts.entries],
      ['Active Users', stats.counts.users],
      ['Pending Requests', stats.counts.pendingDeletes],
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `template-os-report-${selectedRange.label.replace(/ /g, '-').toLowerCase()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const maxTrend = stats?.trend.length > 0 ? Math.max(...stats.trend.map(d => d.count), 1) : 1;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--surface-variant)', paddingBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.5rem' }}>
            Analytics Overview
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--on-surface-variant)', margin: 0 }}>
            Deep dive into your workspace data and performance metrics.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {/* Date Range Picker */}
          <div style={{ position: 'relative' }} ref={dateRef}>
            <button
              className="btn-secondary"
              onClick={() => setShowDate(!showDateMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '160px', justifyContent: 'space-between' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={16} /> {selectedRange.label}
              </span>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: showDateMenu ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </button>
            {showDateMenu && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '180px',
                background: 'white', borderRadius: '10px', border: '1px solid var(--outline-variant)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 50
              }}>
                {DATE_RANGES.map(r => (
                  <button
                    key={r.label}
                    onClick={() => handleRangeChange(r)}
                    style={{
                      width: '100%', padding: '0.65rem 1rem', textAlign: 'left', border: 'none', cursor: 'pointer',
                      background: selectedRange.label === r.label ? 'rgba(0,94,164,0.07)' : 'white',
                      color: selectedRange.label === r.label ? 'var(--primary)' : 'var(--on-surface)',
                      fontWeight: selectedRange.label === r.label ? 700 : 400,
                      fontSize: '0.875rem',
                      transition: 'background 0.15s'
                    }}
                    onMouseOver={e => { if (selectedRange.label !== r.label) e.currentTarget.style.background = '#f8fafc'; }}
                    onMouseOut={e =>  { if (selectedRange.label !== r.label) e.currentTarget.style.background = 'white'; }}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report */}
          <button
            className="btn-primary"
            onClick={handleExport}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={loading}
          >
            <Download size={18} /> Export Report
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--on-surface-variant)' }}>
          Loading analytics...
        </div>
      ) : (
        <>
          {/* Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
              <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Data Volume</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)' }}>{stats?.counts.entries ?? 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.5rem', fontWeight: 700 }}>{selectedRange.label}</div>
            </div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
              <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Active Templates</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)' }}>{stats?.counts.templates ?? 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#6366f1', marginTop: '0.5rem', fontWeight: 700 }}>Total workspace templates</div>
            </div>
            <div className="glass" style={{ padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
              <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.5rem' }}>Active Users</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--on-surface)' }}>{stats?.counts.users ?? 0}</div>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem', fontWeight: 700 }}>{stats?.counts.pendingDeletes ?? 0} pending deletion requests</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '2rem' }}>
            {/* Data Trend Chart */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--outline-variant)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={20} color="var(--primary)" /> Data Collection Trend
                </h3>
                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <div style={{ width: '12px', height: '12px', background: 'var(--primary)', borderRadius: '3px' }}></div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', fontWeight: 600 }}>Daily Entries</span>
                </div>
              </div>
              
              {stats?.trend.length === 0 ? (
                <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>
                  No data for the selected period.
                </div>
              ) : (
                <div style={{ height: '280px', display: 'flex', alignItems: 'flex-end', gap: '6px', paddingBottom: '2rem', position: 'relative' }}>
                  {/* Grid lines */}
                  {[25, 50, 75].map(pct => (
                    <div key={pct} style={{ position: 'absolute', left: 0, right: 0, height: '1px', background: '#f0f4f8', bottom: `calc(2rem + ${pct}% * (280px - 2rem) / 100)` }} />
                  ))}
                  {stats.trend.map((day, i) => {
                    const pct = Math.max((day.count / maxTrend) * 100, 4);
                    return (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', zIndex: 1 }}>
                        <div style={{ width: '100%', height: `${pct}%`, background: 'var(--primary)', borderRadius: '6px 6px 0 0', position: 'relative', minHeight: '12px', transition: 'height 0.3s' }}
                          title={`${day.date}: ${day.count} entries`}>
                          <div style={{ position: 'absolute', top: '-22px', width: '100%', textAlign: 'center', fontSize: '0.7rem', fontWeight: 700, color: 'var(--on-surface)' }}>
                            {day.count}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--on-surface-variant)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                          {new Date(day.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Template Distribution */}
            <div style={{ background: 'white', padding: '2rem', borderRadius: '24px', border: '1px solid var(--outline-variant)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PieChart size={20} color="var(--primary)" /> Entry Distribution
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {stats?.topTemplates.length === 0 ? (
                  <div style={{ color: 'var(--on-surface-variant)', fontSize: '0.9rem' }}>No entries in this period.</div>
                ) : (
                  stats.topTemplates.map((t, i) => {
                    const total = stats.counts.entries || 1;
                    const percentage = ((t.count / total) * 100).toFixed(1);
                    return (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                          <span>{t.name}</span>
                          <span style={{ color: 'var(--primary)' }}>{t.count} ({percentage}%)</span>
                        </div>
                        <div style={{ height: '8px', width: '100%', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${percentage}%`, background: t.color || 'var(--primary)', borderRadius: '4px', transition: 'width 0.4s ease' }}></div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              
              {stats?.topTemplates.length > 0 && (
                <div style={{ marginTop: '2.5rem', padding: '1.25rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid var(--outline-variant)' }}>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Top Performer</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', lineHeight: 1.5, margin: 0 }}>
                    <strong>{stats.topTemplates[0]?.name}</strong> has the highest activity with <strong>{stats.topTemplates[0]?.count}</strong> entries this period.
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
