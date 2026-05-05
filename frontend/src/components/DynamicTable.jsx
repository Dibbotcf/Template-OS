import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Trash2, Eye, Download } from 'lucide-react';

export default function DynamicTable({ template, data, onEdit, onDelete, selectedIds = new Set(), onSelectionChange }) {
  const [viewingEntry, setViewingEntry] = useState(null);

  const parseValue = (raw) => {
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.url) return parsed;
      return parsed;
    } catch {
      return raw;
    }
  };

  const getFieldValue = (entry, fieldId) => {
    const valObj = entry.values?.find(v => v.field_id === fieldId);
    if (!valObj || valObj.value === null) return '-';
    const parsed = parseValue(valObj.value);
    if (parsed && typeof parsed === 'object' && parsed.url) return parsed.name || 'File';
    if (Array.isArray(parsed)) return parsed.join(', ');
    return String(parsed ?? '-');
  };

  const renderViewValue = (field, entry) => {
    const valObj = entry.values?.find(v => v.field_id === field.id);
    if (!valObj || valObj.value === null || valObj.value === '') {
      return <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic', fontSize: '0.9rem' }}>Not provided</span>;
    }

    const parsed = parseValue(valObj.value);

    if (field.type === 'image_upload' && parsed?.url) {
      return (
        <div style={{ marginTop: '0.25rem' }}>
          <img
            src={`http://localhost:4000${parsed.url}`}
            alt={parsed.name}
            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px', objectFit: 'contain', border: '1px solid var(--color-border)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          />
          <div style={{ marginTop: '0.75rem' }}>
            <a
              href={`http://localhost:4000${parsed.url}`}
              download={parsed.name}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <Download size={14} /> Download Image
            </a>
          </div>
        </div>
      );
    }

    if (field.type === 'file_upload' && parsed?.url) {
      return (
        <a
          href={`http://localhost:4000${parsed.url}`}
          download={parsed.name}
          target="_blank"
          rel="noreferrer"
          style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.75rem', 
            color: 'var(--primary)', fontWeight: 600, padding: '0.75rem 1rem', 
            background: 'rgba(0, 94, 164, 0.05)', border: '1px solid rgba(0, 94, 164, 0.1)', 
            borderRadius: '10px', textDecoration: 'none', width: '100%'
          }}
        >
          <div style={{ background: 'white', padding: '0.4rem', borderRadius: '6px', display: 'flex', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Download size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{parsed.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 400 }}>Click to download file</div>
          </div>
        </a>
      );
    }

    if (field.type === 'rating') {
      const rating = Number(parsed) || 0;
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '2px' }}>
            {[1,2,3,4,5].map(s => (
              <span key={s} style={{ color: s <= rating ? '#ffc107' : '#e0e0e0', fontSize: '1.4rem' }}>★</span>
            ))}
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-midnight)' }}>{rating}/5</span>
        </div>
      );
    }

    if (field.type === 'linear_scale') {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', maxWidth: '300px' }}>
          <div style={{ flex: 1, height: '8px', background: '#eee', borderRadius: '4px', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${(parsed / 5) * 100}%`, background: 'var(--primary)', borderRadius: '4px' }} />
          </div>
          <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{parsed} / 5</span>
        </div>
      );
    }

    if (Array.isArray(parsed)) {
      return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
          {parsed.map(tag => (
            <span key={tag} style={{ padding: '0.2rem 0.6rem', background: 'var(--color-ice)', color: 'var(--color-ocean)', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 500 }}>
              {tag}
            </span>
          ))}
        </div>
      );
    }

    return (
      <div style={{ 
        whiteSpace: 'pre-wrap', 
        padding: '0.75rem 1rem', 
        background: '#f8f9fa', 
        borderRadius: '8px', 
        borderLeft: `4px solid var(--template-color)`,
        fontSize: '0.95rem'
      }}>
        {String(parsed ?? '—')}
      </div>
    );
  };

  return (
    <div className="glass" style={{ height: '100%', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ overflow: 'auto', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: 'var(--color-surface)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <tr>
              <th style={{ padding: '0.75rem 1rem', width: '40px', borderBottom: '1px solid var(--color-border)' }}>
                <input type="checkbox"
                  checked={data.length > 0 && data.every(e => selectedIds.has(e.id))}
                  onChange={e => {
                    if (!onSelectionChange) return;
                    if (e.target.checked) onSelectionChange(new Set(data.map(r => r.id)));
                    else onSelectionChange(new Set());
                  }}
                  style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                />
              </th>
              <th style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>#</th>
              {template.fields.map(f => (
                <th key={f.id} style={{ padding: '1rem', textAlign: 'left', color: 'var(--color-midnight)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>
                  {f.label}
                </th>
              ))}
              <th style={{ padding: '1rem', textAlign: 'right', color: 'var(--color-text-muted)', fontWeight: 600, borderBottom: '1px solid var(--color-border)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={template.fields.length + 3} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                  No data found. Add your first entry!
                </td>
              </tr>
            ) : (
              data.map((entry, rowIndex) => {
                const isSelected = selectedIds.has(entry.id);
                return (
                  <tr key={entry.id} style={{ borderBottom: '1px solid var(--color-border)', background: isSelected ? 'rgba(0,94,164,0.04)' : 'transparent', transition: 'background 0.1s' }}>
                    <td style={{ padding: '0.75rem 1rem', width: '40px' }}>
                      <input type="checkbox" checked={isSelected}
                        onChange={e => {
                          if (!onSelectionChange) return;
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(entry.id); else next.delete(entry.id);
                          onSelectionChange(next);
                        }}
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      />
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)' }}>#{rowIndex + 1}</td>
                    {template.fields.map(f => (
                      <td key={f.id} style={{ padding: '1rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {getFieldValue(entry, f.id)}
                      </td>
                    ))}
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button onClick={() => setViewingEntry(entry)} style={{ color: 'var(--color-ocean)' }} title="View"><Eye size={18} /></button>
                        <button onClick={() => onEdit(entry)} style={{ color: 'var(--color-text-main)' }} title="Edit"><Edit2 size={18} /></button>
                        <button onClick={() => onDelete(entry.id)} style={{ color: '#e53e3e' }} title="Delete"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      {viewingEntry && createPortal(
        <div className="modal-overlay modal-blur" onClick={() => setViewingEntry(null)}>
          <div className="modal-content glass" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '16px' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.4rem', color: 'var(--color-midnight)' }}>Entry Details</h2>
              <button onClick={() => setViewingEntry(null)} style={{ background: 'rgba(0,0,0,0.05)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div className="modal-body" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
              {template.fields.map(f => (
                <div key={f.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    {f.label}
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--color-midnight)', lineHeight: 1.6 }}>
                    {renderViewValue(f, viewingEntry)}
                  </div>
                </div>
              ))}
              
              <div style={{ 
                marginTop: '1rem', 
                padding: '1rem', 
                background: 'rgba(0,0,0,0.02)', 
                borderRadius: '8px', 
                fontSize: '0.8rem', 
                color: 'var(--color-text-muted)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span>Created by: <strong>{viewingEntry.created_by_name || 'System'}</strong></span>
                <span>{new Date(viewingEntry.created_at).toLocaleDateString()} at {new Date(viewingEntry.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
            <div className="modal-footer" style={{ borderTop: 'none', padding: '1.5rem' }}>
              <button onClick={() => setViewingEntry(null)} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', borderRadius: '10px' }}>Done</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
