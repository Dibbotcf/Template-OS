import React from 'react';
import { Filter, ArrowUpDown, Plus, MoreVertical, Globe, Smartphone, BookOpen, AlertTriangle } from 'lucide-react';

export default function Database() {
  const projects = [
    {
      name: 'Website Redesign Q3',
      icon: <Globe size={14} />,
      iconBg: 'var(--primary-fixed)',
      iconColor: 'var(--on-primary-fixed-variant)',
      status: 'Active',
      statusColor: 'var(--tertiary-container)',
      statusText: 'var(--on-tertiary-container)',
      date: 'Oct 12, 2023',
      owner: 'Sarah Jenkins',
      ownerImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn9K9TTYehjjWv3k0R7_N2KFdtUSKZMJ8XgDj51w7Q3KDqBDURXQk10pLLJc17v0TviFJWMbwjQzuW59Wxt4bEZH8DxqK9oH8aKR7X4gD-G4M3crCUY8ehuUSvcxfJiV4lUBWj-U3ndyC_oX4o4Ew7qr3HAx9BeQks_4G2mmlPXybesn345ilbUL0V21VT4uTGvoFMvtIFThwtl1xsWCuQhZ__t24bfpBYd5MuIstcw04H3ti4ECC5oMAke6XYiWxU1mBTWrBcHXf1'
    },
    {
      name: 'Mobile App V2',
      icon: <Smartphone size={14} />,
      iconBg: 'var(--secondary-fixed)',
      iconColor: 'var(--on-secondary-fixed)',
      status: 'In Progress',
      statusColor: '#93bdfd',
      statusText: '#194c84',
      date: 'Nov 04, 2023',
      owner: 'Marcus Cole',
      ownerImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdkkB1sF_9KbvfVR8y2Ca5A_3ahNi8sihA-4TvOSfdiYc3IRaYVvVJypKysk3JylD5AcJiwL0AHqraxSa5yYT4zYWmzI8A8zGFWZU7WQ4C-bPsMV1u8m2jc6Qe3zit1Tw_L1McnvkL59qCCDqC0bVKvI7duMmqlrfzv5ZHjE171RUtjk5O1-bxu7ovhnp8uFn6RF6yXG6nCPntXArrogGQ5f1SsKWqQvoS1nkgu4gFrVL0DkyxzhWy8BiWINGKU499EonVm-1iuGVe'
    },
    {
      name: 'Brand Guidelines Refresh',
      icon: <BookOpen size={14} />,
      iconBg: 'var(--surface-variant)',
      iconColor: 'var(--on-surface-variant)',
      status: 'Planning',
      statusColor: 'var(--surface-container-high)',
      statusText: 'var(--on-surface-variant)',
      date: 'Nov 18, 2023',
      owner: 'Elena Lopez',
      ownerInitials: 'EL'
    },
    {
      name: 'Legacy System Migration',
      icon: <AlertTriangle size={14} />,
      iconBg: '#ffdad6',
      iconColor: '#93000a',
      status: 'At Risk',
      statusColor: '#ffdad6',
      statusText: '#93000a',
      date: 'Dec 01, 2023',
      owner: 'David Chen',
      ownerImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAVQG1Bsms5ZVQQicrohf_8okAIx188FJDGSKF2fW7LoEwhXOMhTTXnXVNdKgNGOSYGft3h4KWdSN7cJU-cOX3sF7ST_St_JP-oFBGEWIhD4YhVny5T593GFpjqvwr-ux6IE6N6_aq2LNA6MnOH9hSbDJVqR-dD5K6Y8L_aQZPygYfoMFJ6WXqjzUNCkIOh9WoT-GcOh_tQMe1w7nYtnRVU4v5namMS9KU9Rae3C6BollS5uO3AIG4sal4qP10FxoDO7MtVDAUmK_Xq'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: 'var(--surface)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem', flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--surface-variant)', backgroundColor: 'var(--surface-container-lowest)' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Master Project Index
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)', margin: 0 }}>
            Manage and track all ongoing initiatives across teams.
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>
            <Filter size={18} /> Filter
          </button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>
            <ArrowUpDown size={18} /> Sort
          </button>
          <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--surface-variant)', margin: '0 4px' }}></div>
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}>
            <Plus size={18} /> Add Record
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        <div style={{ 
          backgroundColor: 'var(--surface-container-lowest)', 
          borderRadius: '8px', 
          border: '1px solid var(--outline-variant)', 
          boxShadow: '0px 4px 20px rgba(0,94,164,0.05)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', textAlign: 'left', whiteSpace: 'nowrap', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: 'var(--surface-container-low)', borderBottom: '1px solid var(--outline-variant)', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                <th style={{ padding: '1rem', width: '48px', textAlign: 'center' }}>
                  <input type="checkbox" style={{ cursor: 'pointer' }} />
                </th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Name
                </th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Status
                </th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Date Created
                </th>
                <th style={{ padding: '1rem', fontSize: '0.75rem', fontWeight: 500, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Owner
                </th>
                <th style={{ padding: '1rem', width: '48px' }}></th>
              </tr>
            </thead>
            <tbody style={{ backgroundColor: 'var(--surface-container-lowest)' }}>
              {projects.map((p, i) => (
                <tr key={i} style={{ borderBottom: i === projects.length - 1 ? 'none' : '1px solid var(--surface-variant)', transition: 'background-color 0.2s' }} onMouseOver={e => e.currentTarget.style.backgroundColor = 'var(--surface)'} onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <input type="checkbox" style={{ cursor: 'pointer' }} />
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: 'var(--on-surface)', fontSize: '0.875rem' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '4px', backgroundColor: p.iconBg, color: p.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {p.icon}
                      </div>
                      {p.name}
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '9999px', fontSize: '11px', fontWeight: 600,
                      backgroundColor: p.statusColor, color: p.statusText, border: `1px solid ${p.statusText}33`
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: p.statusText, marginRight: '6px' }}></span>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
                    {p.date}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--on-surface)' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'var(--surface-variant)', overflow: 'hidden', border: '1px solid var(--outline-variant)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 'bold', color: 'var(--on-surface-variant)' }}>
                        {p.ownerImg ? (
                          <img src={p.ownerImg} alt={p.owner} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          p.ownerInitials
                        )}
                      </div>
                      {p.owner}
                    </div>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--outline)' }}>
                    <MoreVertical size={18} style={{ cursor: 'pointer' }} />
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={6} style={{ padding: '0.75rem', textAlign: 'center', borderTop: '1px solid var(--surface-variant)' }}>
                  <button style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', width: '100%', padding: '0.5rem' }}>
                    <Plus size={16} /> Add new row
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
