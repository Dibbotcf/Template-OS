import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import { TemplateContext } from '../context/TemplateContext';
import { ArrowLeft, Plus, Save, Trash2, GripVertical, ArrowUp, ArrowDown, X } from 'lucide-react';

const COLORS = [
  { name: 'Midnight', hex: '#042C53' },
  { name: 'Navy', hex: '#0C447C' },
  { name: 'Ocean', hex: '#185FA5' },
  { name: 'Sky', hex: '#378ADD' },
  { name: 'Mist', hex: '#85B7EB' },
  { name: 'Frost', hex: '#B5D4F4' },
];

const FIELD_TYPES = [
  { value: 'short_text', label: 'Short answer' },
  { value: 'paragraph', label: 'Paragraph' },
  { value: 'multiple_choice', label: 'Multiple choice' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'dropdown', label: 'Drop-down' },
  { value: 'file_upload', label: 'File upload' },
  { value: 'image_upload', label: 'Image upload' },
  { value: 'linear_scale', label: 'Linear scale' },
  { value: 'rating', label: 'Rating' },
  { value: 'multiple_choice_grid', label: 'Multiple-choice grid' },
  { value: 'tick_box_grid', label: 'Tick box grid' },
  { value: 'date', label: 'Date' },
  { value: 'time', label: 'Time' },
  { value: 'number', label: 'Number' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
];

// Parse options which may include rows/columns for grid types
const parseOptions = (raw) => {
  if (!raw) return { options: [], rows: [], columns: [] };
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return {
        options: parsed.options || [],
        rows: parsed.rows || ['Row 1', 'Row 2'],
        columns: parsed.columns || ['Column 1', 'Column 2', 'Column 3'],
      };
    }
    if (Array.isArray(parsed)) return { options: parsed, rows: ['Row 1', 'Row 2'], columns: ['Column 1', 'Column 2', 'Column 3'] };
  } catch {}
  return { options: [], rows: ['Row 1', 'Row 2'], columns: ['Column 1', 'Column 2', 'Column 3'] };
};

export default function TemplateBuilder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addTemplate, updateTemplateList } = useContext(TemplateContext);

  const [name, setName] = useState('');
  const [color, setColor] = useState('#378ADD');
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [draggedItemIndex, setDraggedItemIndex] = useState(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState(null);
  const [activeDragIndex, setActiveDragIndex] = useState(null);
  const topRef = useRef(null);

  useEffect(() => {
    if (id && id !== 'new') {
      const fetchTemplate = async () => {
        try {
          const res = await api.get(`/templates/${id}`);
          setName(res.data.name);
          setColor(res.data.color);
          const normalizedFields = (res.data.fields || []).map(f => ({
            ...f,
            type: f.type || 'short_text',
            _parsed: parseOptions(f.options),
          }));
          setFields(normalizedFields);
        } catch (e) { console.error(e); }
      };
      fetchTemplate();
    }
  }, [id]);

  const addField = () => {
    setFields([...fields, {
      id: null,
      label: 'New Field',
      type: 'short_text',
      placeholder: '',
      is_required: false,
      default_value: '',
      options: [],
      position: fields.length,
      _parsed: { options: [], rows: ['Row 1', 'Row 2'], columns: ['Column 1', 'Column 2', 'Column 3'] },
    }]);
  };

  const updateField = (index, key, val) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], [key]: val };
    setFields(updated);
  };

  // For grid fields: update rows/columns inside _parsed
  const updateGridPart = (index, part, val) => {
    const updated = [...fields];
    const parsed = { ...(updated[index]._parsed || { options: [], rows: [], columns: [] }), [part]: val };
    updated[index] = { ...updated[index], _parsed: parsed };
    setFields(updated);
  };

  const removeField = (index) => {
    const updated = [...fields];
    updated.splice(index, 1);
    setFields(updated);
  };

  const moveField = (index, dir) => {
    if (dir === -1 && index === 0) return;
    if (dir === 1 && index === fields.length - 1) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[index + dir];
    updated[index + dir] = temp;
    updated.forEach((f, i) => f.position = i);
    setFields(updated);
  };

  const handleDragStart = (e, index) => {
    setDraggedItemIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => { e.target.style.opacity = '0.5'; }, 0);
  };
  const handleDragEnter = (e, index) => { e.preventDefault(); setDragOverItemIndex(index); };
  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    if (draggedItemIndex !== null && dragOverItemIndex !== null && draggedItemIndex !== dragOverItemIndex) {
      const updated = [...fields];
      const draggedItem = updated[draggedItemIndex];
      updated.splice(draggedItemIndex, 1);
      updated.splice(dragOverItemIndex, 0, draggedItem);
      updated.forEach((f, i) => f.position = i);
      setFields(updated);
    }
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };

  const handleTypeChange = (index, newType) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], type: newType };
    if (newType === 'phone') updated[index].placeholder = 'e.g. +1 234 567 8900';
    else if (newType === 'email') updated[index].placeholder = 'e.g. name@example.com';
    else if (newType === 'date') updated[index].placeholder = 'MM/DD/YYYY';
    else if (newType === 'number') updated[index].placeholder = 'e.g. 100';
    else updated[index].placeholder = '';
    // Init grid defaults
    if (['multiple_choice_grid', 'tick_box_grid'].includes(newType) && !updated[index]._parsed?.rows?.length) {
      updated[index]._parsed = { options: [], rows: ['Row 1', 'Row 2'], columns: ['Column 1', 'Column 2', 'Column 3'] };
    }
    setFields(updated);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError(true);
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    setNameError(false);
    setLoading(true);
    try {
      const formattedFields = fields.map(f => {
        let opts;
        const isGrid = ['multiple_choice_grid', 'tick_box_grid'].includes(f.type);
        if (isGrid && f._parsed) {
          // Store rows + columns as structured JSON
          opts = { rows: f._parsed.rows || [], columns: f._parsed.columns || [] };
        } else {
          let rawOpts = f.options;
          if (typeof rawOpts === 'string') {
            rawOpts = rawOpts.split(',').map(s => s.trim()).filter(Boolean);
          } else if (f._parsed?.options?.length) {
            rawOpts = f._parsed.options;
          }
          opts = Array.isArray(rawOpts) ? rawOpts : [];
        }
        return { ...f, type: f.type || 'short_text', options: opts };
      });
      const payload = { name, color, fields: formattedFields };
      if (id && id !== 'new') {
        const res = await api.put(`/templates/${id}`, payload);
        updateTemplateList(res.data);
        navigate(`/templates/${id}`);
      } else {
        const res = await api.post('/templates', payload);
        addTemplate(res.data);
        navigate(`/templates/${res.data.id}`);
      }
    } catch (e) {
      const status = e.response?.status;
      if (status === 400) {
        alert(`Save failed: ${e.response?.data?.errors?.map(x => x.msg).join(', ') || e.response?.data?.error}`);
      } else if (status !== 401) {
        alert('Error saving template. Please try again.');
      }
      console.error('Save template error:', e);
    } finally {
      setLoading(false);
    }
  };

  const inputSectionStyle = { background: 'rgba(0,0,0,0.02)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)' };
  const tagStyle = { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.25rem 0.6rem', background: 'var(--color-ice)', color: 'var(--color-ocean)', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500 };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', height: '100%', overflowY: 'auto' }}>
      <button onClick={() => navigate(-1)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div ref={topRef} className="glass" style={{ padding: '2rem', borderRadius: '12px', marginBottom: '2rem', borderTop: `6px solid ${color}` }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <input
              type="text" value={name}
              onChange={e => { setName(e.target.value); setNameError(false); }}
              placeholder="Template Name"
              style={{ fontSize: '2rem', fontWeight: 700, width: '100%', border: nameError ? '2px solid #e53e3e' : 'none', background: 'transparent', padding: '0.5rem', outline: 'none', color: 'var(--color-midnight)', borderRadius: '8px' }}
            />
            {nameError && <div style={{ color: '#e53e3e', fontSize: '0.875rem', marginTop: '0.25rem', marginLeft: '0.5rem' }}>Template name is required</div>}
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem', textAlign: 'right' }}>Theme Color</div>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {COLORS.map(c => (
                <button key={c.hex} onClick={() => setColor(c.hex)} title={c.name}
                  style={{ width: '30px', height: '30px', borderRadius: '50%', background: c.hex, border: color === c.hex ? '3px solid white' : 'none', boxShadow: color === c.hex ? '0 0 0 2px var(--color-midnight)' : 'none', cursor: 'pointer' }}
                />
              ))}
              <div style={{ width: '1px', height: '24px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }} />
              <input type="color" value={color} onChange={e => setColor(e.target.value)}
                style={{ width: '32px', height: '32px', padding: 0, border: 'none', borderRadius: '50%', cursor: 'pointer', overflow: 'hidden', boxShadow: !COLORS.find(c => c.hex === color) ? '0 0 0 2px var(--color-midnight)' : 'none' }}
                title="Custom Color"
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {fields.map((f, i) => {
          const showPlaceholder = ['short_text', 'paragraph', 'email', 'phone', 'date', 'number'].includes(f.type);
          const showOptions = ['dropdown', 'multiple_choice', 'checkbox'].includes(f.type);
          const isGrid = ['multiple_choice_grid', 'tick_box_grid'].includes(f.type);
          const isDragOver = dragOverItemIndex === i;
          const parsed = f._parsed || parseOptions(f.options);

          return (
            <div key={i} className="glass"
              draggable={activeDragIndex === i}
              onDragStart={(e) => handleDragStart(e, i)}
              onDragEnter={(e) => handleDragEnter(e, i)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              style={{ padding: '1.5rem', borderRadius: '8px', display: 'flex', gap: '1rem', borderTop: isDragOver && draggedItemIndex > i ? '3px solid var(--primary)' : 'none', borderBottom: isDragOver && draggedItemIndex < i ? '3px solid var(--primary)' : 'none' }}
            >
              <div onMouseEnter={() => setActiveDragIndex(i)} onMouseLeave={() => setActiveDragIndex(null)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--color-mist)', cursor: 'grab' }}>
                <button onClick={() => moveField(i, -1)} disabled={i === 0}><ArrowUp size={16} /></button>
                <GripVertical size={20} style={{ pointerEvents: 'none' }} />
                <button onClick={() => moveField(i, 1)} disabled={i === fields.length - 1}><ArrowDown size={16} /></button>
              </div>

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {/* Label + Type Row */}
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <input type="text" value={f.label} onChange={e => updateField(i, 'label', e.target.value)}
                    placeholder="Question / Field Label"
                    style={{ flex: 1, fontSize: '1.1rem', fontWeight: 500 }}
                    onMouseDown={e => e.stopPropagation()}
                  />
                  <select value={f.type} onMouseDown={e => e.stopPropagation()}
                    onChange={e => { e.stopPropagation(); handleTypeChange(i, e.target.value); }}
                    style={{ width: '200px' }}>
                    {FIELD_TYPES.map(ft => <option key={ft.value} value={ft.value}>{ft.label}</option>)}
                  </select>
                </div>

                {/* Placeholder */}
                {showPlaceholder && (
                  <input type="text" value={f.placeholder || ''} onChange={e => updateField(i, 'placeholder', e.target.value)}
                    placeholder="Placeholder text (optional)" style={{ width: '100%' }} />
                )}

                {/* File/Image preview */}
                {['file_upload', 'image_upload'].includes(f.type) && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(0, 94, 164, 0.06)', border: '1px dashed var(--primary)', borderRadius: '8px' }}>
                    <span style={{ fontSize: '1.5rem' }}>{f.type === 'image_upload' ? '🖼️' : '📁'}</span>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary)' }}>
                        {f.type === 'image_upload' ? 'Image Upload Field' : 'File Upload Field'}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>Users will see a drag-and-drop upload area.</div>
                    </div>
                  </div>
                )}

                {/* Linear Scale preview */}
                {f.type === 'linear_scale' && (
                  <div style={inputSectionStyle}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Linear Scale: 1 → 5</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 700 }}>1</span>
                      <div style={{ flex: 1, height: '6px', borderRadius: '3px', background: 'var(--color-border)', position: 'relative' }}>
                        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '60%', background: 'var(--primary)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontWeight: 700 }}>5</span>
                    </div>
                  </div>
                )}

                {/* Rating preview */}
                {f.type === 'rating' && (
                  <div style={inputSectionStyle}>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '0.4rem' }}>Star Rating (1–5)</div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[1,2,3,4,5].map(s => <span key={s} style={{ fontSize: '1.6rem', color: s <= 3 ? '#ffc107' : '#ddd' }}>★</span>)}
                    </div>
                  </div>
                )}

                {/* Options for choice/dropdown */}
                {showOptions && (
                  <div style={inputSectionStyle}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Options <span style={{ fontWeight: 400, color: 'var(--color-text-muted)' }}>(comma separated)</span></div>
                    <input type="text"
                      value={Array.isArray(f.options) ? f.options.join(', ') : (f.options || '')}
                      onChange={e => updateField(i, 'options', e.target.value)}
                      onMouseDown={e => e.stopPropagation()}
                      placeholder="e.g. Option A, Option B, Option C"
                      style={{ width: '100%' }}
                    />
                    {/* Preview tags */}
                    {(() => {
                      const opts = (typeof f.options === 'string' ? f.options.split(',') : (f.options || [])).map(o => o.toString().trim()).filter(Boolean);
                      return opts.length > 0 ? (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                          {opts.map(o => <span key={o} style={tagStyle}>{f.type === 'multiple_choice' ? '◉' : f.type === 'dropdown' ? '▾' : '☑'} {o}</span>)}
                        </div>
                      ) : null;
                    })()}
                  </div>
                )}

                {/* Grid (multiple_choice_grid / tick_box_grid) */}
                {isGrid && (
                  <div style={inputSectionStyle}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--color-midnight)' }}>
                      {f.type === 'multiple_choice_grid' ? 'Multiple-choice Grid' : 'Tick Box Grid'} — Configure Rows & Columns
                    </div>

                    {/* Rows */}
                    <div style={{ marginBottom: '0.75rem' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rows</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {(parsed.rows || []).map((row, ri) => (
                          <div key={ri} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="text" value={row}
                              onChange={e => {
                                const newRows = [...parsed.rows];
                                newRows[ri] = e.target.value;
                                updateGridPart(i, 'rows', newRows);
                              }}
                              placeholder={`Row ${ri + 1}`}
                              style={{ flex: 1, fontSize: '0.88rem' }}
                            />
                            <button type="button" onClick={() => {
                              const newRows = parsed.rows.filter((_, idx) => idx !== ri);
                              updateGridPart(i, 'rows', newRows);
                            }} style={{ color: '#e53e3e', padding: '0.2rem' }} disabled={parsed.rows.length <= 1}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => updateGridPart(i, 'rows', [...(parsed.rows || []), `Row ${(parsed.rows || []).length + 1}`])}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--primary)', background: 'none', border: '1px dashed var(--primary)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                          <Plus size={12} /> Add Row
                        </button>
                      </div>
                    </div>

                    {/* Columns */}
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Columns</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        {(parsed.columns || []).map((col, ci) => (
                          <div key={ci} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <input type="text" value={col}
                              onChange={e => {
                                const newCols = [...parsed.columns];
                                newCols[ci] = e.target.value;
                                updateGridPart(i, 'columns', newCols);
                              }}
                              placeholder={`Column ${ci + 1}`}
                              style={{ flex: 1, fontSize: '0.88rem' }}
                            />
                            <button type="button" onClick={() => {
                              const newCols = parsed.columns.filter((_, idx) => idx !== ci);
                              updateGridPart(i, 'columns', newCols);
                            }} style={{ color: '#e53e3e', padding: '0.2rem' }} disabled={parsed.columns.length <= 1}>
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        <button type="button" onClick={() => updateGridPart(i, 'columns', [...(parsed.columns || []), `Column ${(parsed.columns || []).length + 1}`])}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--primary)', background: 'none', border: '1px dashed var(--primary)', borderRadius: '6px', padding: '0.3rem 0.6rem', cursor: 'pointer' }}>
                          <Plus size={12} /> Add Column
                        </button>
                      </div>
                    </div>

                    {/* Grid preview */}
                    {(parsed.rows?.length > 0 && parsed.columns?.length > 0) && (
                      <div style={{ marginTop: '0.75rem', overflowX: 'auto' }}>
                        <table style={{ borderCollapse: 'collapse', fontSize: '0.78rem', width: '100%' }}>
                          <thead>
                            <tr>
                              <th style={{ padding: '0.3rem 0.5rem' }} />
                              {parsed.columns.map((c, ci) => <th key={ci} style={{ padding: '0.3rem 0.5rem', textAlign: 'center', color: 'var(--color-text-muted)', fontWeight: 600 }}>{c}</th>)}
                            </tr>
                          </thead>
                          <tbody>
                            {parsed.rows.map((r, ri) => (
                              <tr key={ri}>
                                <td style={{ padding: '0.3rem 0.5rem', fontWeight: 500, color: 'var(--color-midnight)', whiteSpace: 'nowrap' }}>{r}</td>
                                {parsed.columns.map((_, ci) => (
                                  <td key={ci} style={{ padding: '0.3rem 0.5rem', textAlign: 'center' }}>
                                    <div style={{ width: '14px', height: '14px', borderRadius: f.type === 'tick_box_grid' ? '3px' : '50%', border: '2px solid var(--primary)', margin: '0 auto' }} />
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

                {/* Required + Remove */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', marginTop: '0.25rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!f.is_required} onChange={e => updateField(i, 'is_required', e.target.checked)} />
                    Required
                  </label>
                  <button onClick={() => removeField(i)} style={{ color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Trash2 size={16} /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        <button onClick={addField} className="btn-secondary"
          style={{ width: '100%', padding: '1rem', borderStyle: 'dashed', borderWidth: '2px', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
          <Plus size={20} /> Add Field
        </button>
      </div>

      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={handleSave} className="btn-primary" disabled={loading} style={{ backgroundColor: color }}>
          <Save size={18} /> {loading ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </div>
  );
}
