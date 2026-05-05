import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import api from '../api';
import DynamicTable from './DynamicTable';
import DynamicFormModal from './DynamicFormModal';
import { Plus, Settings, AlertTriangle, Search, Columns2, Filter, X, ChevronDown, ChevronUp, Download, Upload, FileSpreadsheet, Trash2 } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const FILTER_OPERATORS = [
  { value: 'contains', label: 'Contains' },
  { value: 'not_contains', label: 'Does not contain' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not equals' },
  { value: 'is_empty', label: 'Is empty' },
  { value: 'is_not_empty', label: 'Is not empty' },
];

function applyFilters(data, filters, fields) {
  if (!filters.length) return data;
  return data.filter(entry =>
    filters.every(filter => {
      if (!filter.fieldId) return true;
      const valObj = entry.values?.find(v => v.field_id === Number(filter.fieldId));
      const raw = valObj?.value ?? '';
      const val = raw.toLowerCase();
      const term = (filter.value || '').toLowerCase();
      switch (filter.operator) {
        case 'contains': return val.includes(term);
        case 'not_contains': return !val.includes(term);
        case 'equals': return val === term;
        case 'not_equals': return val !== term;
        case 'is_empty': return !raw || raw === '' || raw === 'null';
        case 'is_not_empty': return !!raw && raw !== '' && raw !== 'null';
        default: return true;
      }
    })
  );
}

function getFieldValue(entry, fieldId) {
  const v = entry.values?.find(v => v.field_id === fieldId);
  return v?.value ?? '';
}

export default function TemplateDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const importRef = useRef(null);

  const [template, setTemplate] = useState(null);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState(new Set());

  const [visibleColumns, setVisibleColumns] = useState(null);
  const [showColumnsPanel, setShowColumnsPanel] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState([]);
  const [importing, setImporting] = useState(false);

  const columnsPanelRef = useRef(null);
  const filtersPanelRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (columnsPanelRef.current && !columnsPanelRef.current.contains(e.target)) setShowColumnsPanel(false);
      if (filtersPanelRef.current && !filtersPanelRef.current.contains(e.target)) setShowFiltersPanel(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (template && visibleColumns === null) {
      const saved = localStorage.getItem(`cols_${id}`);
      if (saved) {
        try { setVisibleColumns(JSON.parse(saved)); } catch { setVisibleColumns(template.fields.map(f => f.id)); }
      } else {
        setVisibleColumns(template.fields.map(f => f.id));
      }
    }
  }, [template]);

  const saveColumns = (cols) => { setVisibleColumns(cols); localStorage.setItem(`cols_${id}`, JSON.stringify(cols)); };
  const toggleColumn = (fieldId) => {
    const next = visibleColumns.includes(fieldId) ? visibleColumns.filter(c => c !== fieldId) : [...visibleColumns, fieldId];
    saveColumns(next);
  };

  const fetchData = async (p = page, s = search) => {
    try {
      const res = await api.get(`/templates/${id}/data?page=${p}&limit=20&search=${encodeURIComponent(s)}`);
      setData(res.data.data);
      setTotal(res.data.total);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const fetchTemplate = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/templates/${id}`);
        setTemplate(res.data);
        document.documentElement.style.setProperty('--template-color', res.data.color);
        await fetchData(1, '');
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchTemplate();
    setPage(1); setSearch(''); setVisibleColumns(null); setFilters([]); setSelectedIds(new Set());
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => { fetchData(1, search); setPage(1); }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleSaveData = async (values) => {
    try {
      if (editingEntry) await api.put(`/data/${editingEntry.id}`, { values });
      else await api.post(`/templates/${id}/data`, { values });
      setIsModalOpen(false);
      fetchData(page, search);
    } catch (e) { alert('Error saving data'); }
  };

  const handleDeleteData = async (dataId) => {
    if (!window.confirm('Delete this entry?')) return;
    try { await api.delete(`/data/${dataId}`); fetchData(page, search); }
    catch (e) { alert('Error deleting data'); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedIds.size} selected entries?`)) return;
    try {
      await api.post(`/templates/${id}/data/bulk-delete`, { ids: [...selectedIds] });
      setSelectedIds(new Set());
      fetchData(page, search);
    } catch (e) { alert('Error deleting entries'); }
  };

  const handleRequestDeletion = async () => {
    const reason = window.prompt('Reason for deletion request?');
    if (reason === null) return;
    try { await api.post('/delete-requests', { template_id: id, reason }); alert('Deletion request submitted.'); }
    catch (e) { alert(e.response?.data?.error || 'Error submitting request'); }
  };

  // ─── EXPORT DATA ────────────────────────────────────────────────────────────
  const handleExportData = async () => {
    if (!template) return;
    let exportRows;
    if (selectedIds.size > 0) {
      exportRows = filteredData.filter(e => selectedIds.has(e.id));
    } else {
      try {
        const res = await api.get(`/templates/${id}/data/all`);
        exportRows = res.data.data;
      } catch { exportRows = data; }
    }
    const headers = ['#', ...template.fields.map(f => f.label)];
    const rows = exportRows.map((entry, i) => {
      const row = { '#': i + 1 };
      template.fields.forEach(f => { row[f.label] = getFieldValue(entry, f.id); });
      return row;
    });
    const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, template.name.substring(0, 31));
    XLSX.writeFile(wb, `${template.name.replace(/[^a-z0-9]/gi, '_')}_data.xlsx`);
  };

  // ─── DOWNLOAD SAMPLE ────────────────────────────────────────────────────────
  const handleDownloadSample = () => {
    if (!template) return;
    const headers = template.fields.map(f => f.label);
    const sampleRow = {};
    template.fields.forEach(f => {
      const t = f.type;
      if (t === 'number') sampleRow[f.label] = 0;
      else if (t === 'date') sampleRow[f.label] = new Date().toISOString().split('T')[0];
      else if (t === 'checkbox') sampleRow[f.label] = 'true';
      else if (t === 'email') sampleRow[f.label] = 'example@email.com';
      else if (t === 'phone') sampleRow[f.label] = '+1234567890';
      else sampleRow[f.label] = 'Sample Value';
    });
    const ws = XLSX.utils.json_to_sheet([sampleRow], { header: headers });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sample');
    XLSX.writeFile(wb, `${template.name.replace(/[^a-z0-9]/gi, '_')}_sample.xlsx`);
  };

  // ─── IMPORT DATA ────────────────────────────────────────────────────────────
  const handleImportFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !template) return;
    e.target.value = '';
    setImporting(true);
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (jsonRows.length === 0) { alert('No data rows found in the file.'); return; }

      // Map column headers → field IDs
      const labelToField = {};
      template.fields.forEach(f => { labelToField[f.label.toLowerCase().trim()] = f; });

      const rows = jsonRows.map(row => {
        const mapped = {};
        Object.entries(row).forEach(([col, val]) => {
          const field = labelToField[col.toLowerCase().trim()];
          if (field) mapped[field.id] = String(val);
        });
        return mapped;
      });

      const validRows = rows.filter(r => Object.keys(r).length > 0);
      if (validRows.length === 0) { alert('No matching columns found. Please use the sample file as a template.'); return; }

      await api.post(`/templates/${id}/data/import`, { rows: validRows });
      alert(`✅ Successfully imported ${validRows.length} entries!`);
      fetchData(page, search);
    } catch (err) {
      alert(err.response?.data?.error || 'Import failed. Please check the file format.');
    } finally {
      setImporting(false);
    }
  };

  const addFilter = () => setFilters(f => [...f, { id: Date.now(), fieldId: template?.fields[0]?.id || '', operator: 'contains', value: '' }]);
  const removeFilter = (fid) => setFilters(f => f.filter(fi => fi.id !== fid));
  const updateFilter = (fid, key, val) => setFilters(f => f.map(fi => fi.id === fid ? { ...fi, [key]: val } : fi));

  const activeFilterCount = filters.filter(f => f.fieldId).length;
  const filteredData = template ? applyFilters(data, filters.filter(f => f.fieldId), template.fields) : data;
  const visibleFields = template && visibleColumns ? template.fields.filter(f => visibleColumns.includes(f.id)) : (template?.fields || []);

  const btnStyle = (color = 'rgba(255,255,255,0.12)') => ({
    background: color, border: '1px solid rgba(255,255,255,0.25)', color: 'white',
    padding: '0.45rem 0.9rem', borderRadius: '7px', display: 'flex', gap: '0.45rem',
    alignItems: 'center', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s'
  });

  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>;
  if (!template) return <div style={{ padding: '2rem' }}>Template not found.</div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--color-bg)' }}>
      {/* Header */}
      <div style={{ padding: '1.5rem 2rem', background: `linear-gradient(90deg, ${template.color} 0%, var(--color-midnight) 100%)`, color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>{template.name}</h1>
            <p style={{ margin: 0, opacity: 0.8, fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {visibleFields.length} of {template.fields.length} columns visible
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
            {user?.role === 'employee' && (
              <button onClick={handleRequestDeletion} style={btnStyle()}>
                <AlertTriangle size={16} /> Request Deletion
              </button>
            )}

            {/* Download Sample */}
            <button onClick={handleDownloadSample} style={btnStyle()} title="Download Excel sample with headers">
              <FileSpreadsheet size={16} /> Download Sample Data
            </button>

            {/* Import Data */}
            <input ref={importRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleImportFile} style={{ display: 'none' }} />
            <button onClick={() => importRef.current?.click()} style={btnStyle()} disabled={importing}>
              <Upload size={16} /> {importing ? 'Importing…' : 'Import Data'}
            </button>

            {/* Export Data */}
            <button onClick={handleExportData} style={btnStyle('rgba(255,255,255,0.18)')}>
              <Download size={16} />
              Export Data{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
            </button>

            <button onClick={() => navigate(`/templates/${id}/edit`)} style={btnStyle()}>
              <Settings size={16} /> Configure Template
            </button>
            <button onClick={() => { setEditingEntry(null); setIsModalOpen(true); }}
              style={{ background: 'white', color: template.color, padding: '0.45rem 0.9rem', borderRadius: '7px', fontWeight: 700, display: 'flex', gap: '0.45rem', alignItems: 'center', fontSize: '0.85rem', cursor: 'pointer', border: 'none' }}>
              <Plus size={16} /> Add New Entry
            </button>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ padding: '0.65rem 2rem', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--color-surface)', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input type="text" placeholder="Search all text fields…" value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '2.2rem', paddingRight: '0.75rem' }} />
        </div>

        <div style={{ flex: 1 }} />

        {/* Bulk delete bar */}
        {selectedIds.size > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '0.3rem 0.75rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#991b1b' }}>{selectedIds.size} selected</span>
            <button onClick={handleBulkDelete}
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '0.3rem 0.65rem', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer' }}>
              <Trash2 size={13} /> Delete Selected
            </button>
            <button onClick={() => setSelectedIds(new Set())}
              style={{ color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.8rem' }}>
              <X size={14} />
            </button>
          </div>
        )}

        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>Total: {total}</span>

        {/* Columns */}
        <div style={{ position: 'relative' }} ref={columnsPanelRef}>
          <button onClick={() => { setShowColumnsPanel(v => !v); setShowFiltersPanel(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 500, border: '1px solid var(--color-border)', background: showColumnsPanel ? 'var(--primary)' : 'var(--color-surface)', color: showColumnsPanel ? 'white' : 'var(--color-text-main)' }}>
            <Columns2 size={15} /> Columns {showColumnsPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {showColumnsPanel && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200, background: 'white', border: '1px solid var(--color-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '1rem', minWidth: '260px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Toggle Columns</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {template.fields.map(f => {
                  const isVisible = visibleColumns?.includes(f.id);
                  return (
                    <button key={f.id} onClick={() => toggleColumn(f.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.65rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: 500, border: `1px solid ${isVisible ? 'var(--primary)' : 'var(--color-border)'}`, background: isVisible ? 'var(--primary)' : '#f5f5f5', color: isVisible ? 'white' : 'var(--color-text-muted)', cursor: 'pointer' }}>
                      {isVisible ? <><X size={11} /> {f.label}</> : <>+ {f.label}</>}
                    </button>
                  );
                })}
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => saveColumns(template.fields.map(f => f.id))} style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 500 }}>Show all</button>
                <span style={{ color: 'var(--color-border)' }}>·</span>
                <button onClick={() => saveColumns([])} style={{ fontSize: '0.78rem', color: '#e53e3e', fontWeight: 500 }}>Hide all</button>
              </div>
            </div>
          )}
        </div>

        {/* Filters */}
        <div style={{ position: 'relative' }} ref={filtersPanelRef}>
          <button onClick={() => { setShowFiltersPanel(v => !v); setShowColumnsPanel(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.85rem', borderRadius: '6px', fontSize: '0.88rem', fontWeight: 500, border: `1px solid ${activeFilterCount > 0 ? 'var(--primary)' : 'var(--color-border)'}`, background: showFiltersPanel || activeFilterCount > 0 ? 'var(--primary)' : 'var(--color-surface)', color: showFiltersPanel || activeFilterCount > 0 ? 'white' : 'var(--color-text-main)' }}>
            <Filter size={15} /> Filters
            {activeFilterCount > 0 && <span style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', padding: '0 6px', fontSize: '0.75rem', fontWeight: 700 }}>{activeFilterCount}</span>}
            {showFiltersPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          {showFiltersPanel && (
            <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, zIndex: 200, background: 'white', border: '1px solid var(--color-border)', borderRadius: '10px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', padding: '1rem', minWidth: '380px' }}>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Filters</div>
              {filters.length === 0 && <div style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>No filters set</div>}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '0.75rem' }}>
                {filters.map(filter => (
                  <div key={filter.id} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                    <select value={filter.fieldId} onChange={e => updateFilter(filter.id, 'fieldId', e.target.value)} style={{ flex: 1, fontSize: '0.82rem', padding: '0.3rem 0.5rem' }}>
                      {template.fields.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}
                    </select>
                    <select value={filter.operator} onChange={e => updateFilter(filter.id, 'operator', e.target.value)} style={{ flex: 1, fontSize: '0.82rem', padding: '0.3rem 0.5rem' }}>
                      {FILTER_OPERATORS.map(op => <option key={op.value} value={op.value}>{op.label}</option>)}
                    </select>
                    {!['is_empty', 'is_not_empty'].includes(filter.operator) && (
                      <input type="text" placeholder="Value…" value={filter.value} onChange={e => updateFilter(filter.id, 'value', e.target.value)} style={{ flex: 1, fontSize: '0.82rem', padding: '0.3rem 0.5rem' }} />
                    )}
                    <button onClick={() => removeFilter(filter.id)} style={{ color: '#e53e3e', padding: '0.2rem' }}><X size={15} /></button>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button onClick={addFilter} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}><Plus size={14} /> Add Filter</button>
                {filters.length > 0 && <button onClick={() => setFilters([])} style={{ fontSize: '0.78rem', color: '#e53e3e', fontWeight: 500 }}>Clear all</button>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilterCount > 0 && (
        <div style={{ padding: '0.4rem 2rem', background: '#fff8e1', borderBottom: '1px solid #ffe082', display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#b8860b', fontWeight: 600 }}>Filters active:</span>
          {filters.filter(f => f.fieldId).map(filter => {
            const field = template.fields.find(f => f.id === Number(filter.fieldId));
            const op = FILTER_OPERATORS.find(o => o.value === filter.operator);
            return (
              <span key={filter.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.2rem 0.6rem', borderRadius: '20px', fontSize: '0.78rem', fontWeight: 500, background: '#fff3cd', border: '1px solid #ffe082', color: '#856404' }}>
                {field?.label} <em style={{ fontWeight: 400 }}>{op?.label}</em>
                {!['is_empty', 'is_not_empty'].includes(filter.operator) && filter.value && <> "{filter.value}"</>}
                <button onClick={() => removeFilter(filter.id)} style={{ color: '#b8860b', lineHeight: 1 }}><X size={10} /></button>
              </span>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, overflow: 'hidden', padding: '2rem' }}>
        <DynamicTable
          template={{ ...template, fields: visibleFields }}
          allFields={template.fields}
          data={filteredData}
          onEdit={(entry) => { setEditingEntry(entry); setIsModalOpen(true); }}
          onDelete={handleDeleteData}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
        />
        {total > 20 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button disabled={page === 1} onClick={() => { setPage(p => p - 1); fetchData(page - 1, search); }} className="btn-secondary">Previous</button>
            <span style={{ display: 'flex', alignItems: 'center' }}>Page {page} of {Math.ceil(total / 20)}</span>
            <button disabled={page >= Math.ceil(total / 20)} onClick={() => { setPage(p => p + 1); fetchData(page + 1, search); }} className="btn-secondary">Next</button>
          </div>
        )}
      </div>

      {isModalOpen && (
        <DynamicFormModal template={template} entry={editingEntry} onClose={() => setIsModalOpen(false)} onSave={handleSaveData} />
      )}
    </div>
  );
}
