import React, { useState, useContext, useMemo, useEffect } from 'react';
import { SortAsc, Layers, Plus, Search, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TemplateContext } from '../context/TemplateContext';
import { SearchContext } from '../context/SearchContext';

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const { templates, fetchTemplates } = useContext(TemplateContext);
  const { searchQuery } = useContext(SearchContext);
  
  useEffect(() => {
    fetchTemplates();
  }, []);
  
  const [sortBy, setSortBy] = useState('name'); // name, date
  const [showSort, setShowSort] = useState(false);

  const filteredTemplates = useMemo(() => {
    let result = [...templates];

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => 
        t.name.toLowerCase().includes(q) || 
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'date') return new Date(b.created_at) - new Date(a.created_at);
      return 0;
    });

    return result;
  }, [templates, searchQuery, sortBy]);

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid var(--surface-variant)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.25rem', letterSpacing: '-0.02em' }}>
            Template Library
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface-variant)', margin: 0 }}>
            Start your next project faster with pre-built templates.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
          {/* Sort Button & Popover */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowSort(!showSort)}
              className="btn-secondary" 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.4rem', 
                backgroundColor: showSort ? 'var(--primary)' : 'var(--surface-container-lowest)', 
                color: showSort ? 'white' : 'var(--on-surface-variant)',
                borderColor: 'var(--outline-variant)',
                padding: '0.4rem 0.75rem',
                fontSize: '0.85rem'
              }}
            >
              <SortAsc size={16} /> Sort: {sortBy === 'name' ? 'Name' : 'Recent'}
            </button>
            {showSort && (
              <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '150px', background: 'white', borderRadius: '8px', border: '1px solid var(--outline-variant)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', zIndex: 10, overflow: 'hidden' }}>
                <button onClick={() => { setSortBy('name'); setShowSort(false); }} style={{ width: '100%', padding: '0.6rem 0.85rem', textAlign: 'left', border: 'none', background: sortBy === 'name' ? 'var(--surface-container-low)' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  Name {sortBy === 'name' && <Check size={14} color="var(--primary)" />}
                </button>
                <button onClick={() => { setSortBy('date'); setShowSort(false); }} style={{ width: '100%', padding: '0.6rem 0.85rem', textAlign: 'left', border: 'none', background: sortBy === 'date' ? 'var(--surface-container-low)' : 'white', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  Most Recent {sortBy === 'date' && <Check size={14} color="var(--primary)" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', 
        gap: '1.25rem' 
      }}>
        {/* Create New Card */}
        {!searchQuery && (
          <div 
            onClick={() => navigate('/templates/new')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'white',
              border: '2px dashed var(--outline-variant)',
              borderRadius: '12px',
              overflow: 'hidden',
              transition: 'all 0.2s ease',
              height: '100%',
              minHeight: '280px',
              cursor: 'pointer',
              color: 'var(--primary)',
              padding: '1.5rem'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'var(--primary)';
              e.currentTarget.style.backgroundColor = 'var(--surface-container-lowest)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'var(--outline-variant)';
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'rgba(0,94,164,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Plus size={20} />
            </div>
            <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>New Template</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginTop: '0.25rem', textAlign: 'center' }}>Build a custom structure</p>
          </div>
        )}

        {/* Existing Templates */}
        {filteredTemplates.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--on-surface-variant)' }}>
            <Search size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.2 }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>No results</h3>
          </div>
        ) : filteredTemplates.map((t) => (
          <div key={t.id} style={{
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            border: '1px solid var(--outline-variant)',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            height: '100%',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.06)';
            e.currentTarget.style.borderColor = t.color || 'var(--primary)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
            e.currentTarget.style.borderColor = 'var(--outline-variant)';
          }}
          >
            {/* Template Banner */}
            <div style={{ 
              height: '100px', 
              backgroundColor: t.color ? `${t.color}10` : 'rgba(0,94,164,0.05)', 
              borderBottom: '1px solid var(--outline-variant)', 
              position: 'relative', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '1rem',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: 800, 
                color: t.color || 'var(--primary)', 
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
                zIndex: 1
              }}>
                {t.name}
              </h2>
            </div>
            
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--on-surface)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {t.name}
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', flex: 1, marginBottom: '1rem', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {t.field_count || 0} smart fields • {t.entry_count || 0} entries collected.
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--outline-variant)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--outline)', fontSize: '0.75rem', fontWeight: 500 }}>
                  <Layers size={14} /> Dashboard
                </div>
                <button 
                  onClick={() => navigate(`/templates/${t.id}`)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    backgroundColor: t.color ? `${t.color}15` : 'rgba(0, 94, 164, 0.08)',
                    color: t.color || 'var(--primary)',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.backgroundColor = t.color || 'var(--primary)'; e.currentTarget.style.color = 'white'; }}
                  onMouseOut={(e) => { e.currentTarget.style.backgroundColor = t.color ? `${t.color}15` : 'rgba(0, 94, 164, 0.08)'; e.currentTarget.style.color = t.color || 'var(--primary)'; }}
                >
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


