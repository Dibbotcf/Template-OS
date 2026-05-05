import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

// ── File Upload Zone Component ──────────────────────────────────────────────
function FileUploadZone({ fieldId, fieldType, value, onUpload, onClear }) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef(null);
  const isImage = fieldType === 'image_upload';

  let fileObj = null;
  if (value) {
    try { fileObj = typeof value === 'string' ? JSON.parse(value) : value; } catch {}
  }

  const doUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    const fd = new FormData();
    fd.append('file', file);

    // Simulate progress while uploading
    const fakeProgress = setInterval(() => {
      setProgress(p => p < 85 ? p + 10 : p);
    }, 150);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      clearInterval(fakeProgress);
      setProgress(100);
      if (data.url) {
        onUpload(JSON.stringify({ name: file.name, url: data.url, size: file.size }));
      } else {
        alert('Upload failed: ' + (data.error || 'Unknown error'));
      }
    } catch {
      clearInterval(fakeProgress);
      alert('File upload failed. Make sure the backend is running.');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) doUpload(file);
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div>
      {/* Drop Zone */}
      <div
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        style={{
          border: `2px dashed ${dragging ? 'var(--primary)' : 'var(--color-border)'}`,
          borderRadius: '10px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          background: dragging ? 'rgba(0, 94, 164, 0.05)' : 'var(--surface-container-low, #f8f9ff)',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
          {isImage ? '🖼️' : '📄'}
        </div>
        <div style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
          Drag & Drop or{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'underline' }}>
            Choose file
          </span>{' '}
          to upload
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
          {isImage ? 'PNG, JPG, GIF, WEBP' : 'Any file type'}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={isImage ? 'image/*' : '*'}
        style={{ display: 'none' }}
        onChange={e => doUpload(e.target.files[0])}
      />

      {/* Uploading progress */}
      {uploading && (
        <div style={{ marginTop: '0.75rem', padding: '0.75rem 1rem', background: '#f0f4ff', borderRadius: '8px', border: '1px solid #d0e0ff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <span style={{ fontWeight: 500 }}>Uploading…</span>
            <span style={{ color: 'var(--primary)' }}>{progress}%</span>
          </div>
          <div style={{ height: '4px', background: '#d0e0ff', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progress}%`, background: 'var(--primary)', borderRadius: '4px', transition: 'width 0.15s ease' }} />
          </div>
        </div>
      )}

      {/* Selected file chip */}
      {fileObj && !uploading && (
        <div style={{
          marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
          padding: '0.6rem 1rem', background: '#f0f7ff', borderRadius: '8px', border: '1px solid #c3daf9',
        }}>
          <span style={{ fontSize: '1.2rem' }}>{isImage ? '🖼️' : '📁'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fileObj.name}</div>
            {fileObj.size && <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{formatSize(fileObj.size)}</div>}
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            style={{ color: '#e53e3e', fontSize: '1rem', lineHeight: 1, padding: '0 4px' }}
            title="Remove file"
          >✕</button>
        </div>
      )}

      {/* Image preview */}
      {fileObj?.url && isImage && !uploading && (
        <div style={{ marginTop: '0.5rem' }}>
          <img
            src={`http://localhost:4000${fileObj.url}`}
            alt={fileObj.name}
            style={{ maxWidth: '100%', maxHeight: '160px', borderRadius: '8px', objectFit: 'contain', border: '1px solid var(--color-border)' }}
          />
        </div>
      )}
    </div>
  );
}


// ── Main Modal ───────────────────────────────────────────────────────────────
export default function DynamicFormModal({ template, entry, onClose, onSave }) {
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const initData = {};
    if (entry) {
      entry.values.forEach(v => {
        try { initData[v.field_id] = JSON.parse(v.value); }
        catch { initData[v.field_id] = v.value; }
      });
    } else {
      template.fields.forEach(f => {
        initData[f.id] = f.type === 'checkbox' ? [] : (f.default_value || '');
      });
    }
    setFormData(initData);
  }, [entry, template]);

  const handleChange = (fieldId, val) =>
    setFormData(prev => ({ ...prev, [fieldId]: val }));

  const handleCheckboxChange = (fieldId, option, checked) => {
    setFormData(prev => {
      const current = Array.isArray(prev[fieldId]) ? prev[fieldId] : [];
      return { ...prev, [fieldId]: checked ? [...current, option] : current.filter(o => o !== option) };
    });
  };

  const handleSubmit = (e) => { e.preventDefault(); onSave(formData); };

  const renderField = (field) => {
    const value = formData[field.id] !== undefined ? formData[field.id] : '';
    const isReq = !!field.is_required;
    const fieldType = (field.type || '').trim();

    switch (fieldType) {
      case 'short_text':
      case 'email':
      case 'phone':
        return (
          <input
            type={fieldType === 'email' ? 'email' : fieldType === 'phone' ? 'tel' : 'text'}
            value={value} onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder} required={isReq} style={{ width: '100%' }}
          />
        );

      case 'number':
        return (
          <input type="number" value={value} onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder} required={isReq} style={{ width: '100%' }} />
        );

      case 'date':
        return (
          <input type="date" value={value} onChange={e => handleChange(field.id, e.target.value)}
            required={isReq} style={{ width: '100%' }} />
        );

      case 'time':
        return (
          <input type="time" value={value} onChange={e => handleChange(field.id, e.target.value)}
            required={isReq} style={{ width: '100%' }} />
        );

      case 'paragraph':
        return (
          <textarea value={value} onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder} required={isReq} rows={4}
            style={{ width: '100%', resize: 'vertical' }} />
        );

      case 'dropdown':
        return (
          <select value={value} onChange={e => handleChange(field.id, e.target.value)}
            required={isReq} style={{ width: '100%' }}>
            <option value="">{field.placeholder || 'Select an option'}</option>
            {Array.isArray(field.options) && field.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        );

      case 'multiple_choice':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.isArray(field.options) && field.options.map(o => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="radio" name={`field_${field.id}`} value={o}
                  checked={value === o} onChange={e => handleChange(field.id, e.target.value)} />
                {o}
              </label>
            ))}
          </div>
        );

      case 'checkbox': {
        const checkedArr = Array.isArray(value) ? value : [];
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {Array.isArray(field.options) && field.options.map(o => (
              <label key={o} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={checkedArr.includes(o)}
                  onChange={e => handleCheckboxChange(field.id, o, e.target.checked)} />
                {o}
              </label>
            ))}
          </div>
        );
      }

      case 'linear_scale':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontWeight: 600 }}>1</span>
            <input type="range" min="1" max="5" value={value || 3}
              onChange={e => handleChange(field.id, e.target.value)} style={{ flex: 1 }} />
            <span style={{ fontWeight: 600 }}>5</span>
            <span style={{ minWidth: '28px', textAlign: 'center', color: 'var(--primary)', fontWeight: 700 }}>
              {value || 3}
            </span>
          </div>
        );

      case 'rating':
        return (
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button key={star} type="button" onClick={() => handleChange(field.id, star)}
                style={{ color: star <= (Number(value) || 0) ? '#ffc107' : '#ddd', fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px' }}>
                ★
              </button>
            ))}
          </div>
        );

      case 'multiple_choice_grid':
      case 'tick_box_grid':
        return (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', padding: '0.75rem', background: '#f8f9fa', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
            Grid fields — configure options after saving.
          </div>
        );

      case 'image_upload':
      case 'file_upload':
        return (
          <FileUploadZone
            fieldId={field.id}
            fieldType={fieldType}
            value={value}
            onUpload={(val) => handleChange(field.id, val)}
            onClear={() => handleChange(field.id, '')}
          />
        );

      default:
        return (
          <input type="text" value={value} onChange={e => handleChange(field.id, e.target.value)}
            placeholder={field.placeholder || ''} style={{ width: '100%' }} />
        );
    }
  };

  return createPortal(
    <div className="modal-overlay modal-blur" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{entry ? 'Edit Entry' : 'Add New Entry'}</h2>
          <button type="button" onClick={onClose} style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {template.fields.map(field => (
              <div key={field.id}>
                <label style={{ display: 'block', fontWeight: 500, marginBottom: '0.5rem' }}>
                  {field.label}
                  {!!field.is_required && <span style={{ color: '#e53e3e', marginLeft: '3px' }}>*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}
          </div>
          <div className="modal-footer">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--template-color)' }}>
              Save Entry
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
