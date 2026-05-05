require('dotenv').config();
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true,
  });

  try {
    const fs = require('fs');
    const schema = fs.readFileSync(__dirname + '/schema.sql', 'utf8');
    console.log('📦 Re-initializing Database with 10 Premium Templates...');
    await conn.query('DROP DATABASE IF EXISTS templateos');
    await conn.query(schema);
    await conn.query('USE templateos');

    const hash = await bcrypt.hash('ADMINCRM', 12);
    await conn.query(
      `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
      ['Admin', 'admin@templateos.com', hash, 'admin']
    );

    const templates = [
      { name: 'Global Sales CRM', color: '#0ea5e9', fields: [
        { label: 'Company Name', type: 'short_text' },
        { label: 'Contact Person', type: 'short_text' },
        { label: 'Deal Size ($)', type: 'number' },
        { label: 'Stage', type: 'dropdown', options: ['Discovery', 'Demo', 'Proposal', 'Closing', 'Won'] },
        { label: 'Success Probability', type: 'linear_scale' }
      ]},
      { name: 'IT Infrastructure Audit', color: '#6366f1', fields: [
        { label: 'Asset Tag', type: 'short_text' },
        { label: 'Hardware Type', type: 'dropdown', options: ['Server', 'Workstation', 'Network Switch', 'Storage'] },
        { label: 'Manufacturer', type: 'short_text' },
        { label: 'Criticality', type: 'rating' },
        { label: 'Last Inspection', type: 'date' }
      ]},
      { name: 'Talent Acquisition', color: '#ec4899', fields: [
        { label: 'Candidate Name', type: 'short_text' },
        { label: 'Position', type: 'dropdown', options: ['Frontend Eng', 'Backend Eng', 'UI/UX Designer', 'PM'] },
        { label: 'Experience (Years)', type: 'number' },
        { label: 'Interview Score', type: 'rating' },
        { label: 'Recruiter Notes', type: 'paragraph' }
      ]},
      { name: 'Vehicle Fleet Ops', color: '#f59e0b', fields: [
        { label: 'Vehicle ID', type: 'short_text' },
        { label: 'Current Driver', type: 'short_text' },
        { label: 'Fuel Level (%)', type: 'number' },
        { label: 'Next Service Due', type: 'date' },
        { label: 'Safety Check', type: 'dropdown', options: ['Pass', 'Needs Attention', 'Critical Fail'] }
      ]},
      { name: 'Patient Health Record', color: '#10b981', fields: [
        { label: 'Patient MRN', type: 'short_text' },
        { label: 'Blood Type', type: 'dropdown', options: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
        { label: 'Heart Rate (BPM)', type: 'number' },
        { label: 'Pain Intensity', type: 'linear_scale' },
        { label: 'Medical History', type: 'paragraph' }
      ]},
      { name: 'Product Inventory', color: '#8b5cf6', fields: [
        { label: 'Product Name', type: 'short_text' },
        { label: 'SKU Code', type: 'short_text' },
        { label: 'Stock Level', type: 'number' },
        { label: 'Warehouse Section', type: 'dropdown', options: ['Zone A', 'Zone B', 'Zone C', 'Cold Storage'] },
        { label: 'Restock Urgency', type: 'rating' }
      ]},
      { name: 'Customer Support Tickets', color: '#14b8a6', fields: [
        { label: 'Ticket ID', type: 'short_text' },
        { label: 'Requester Email', type: 'short_text' },
        { label: 'SLA Priority', type: 'dropdown', options: ['P1 - Critical', 'P2 - High', 'P3 - Medium', 'P4 - Low'] },
        { label: 'Agent Rating', type: 'rating' },
        { label: 'Resolution Summary', type: 'paragraph' }
      ]},
      { name: 'Marketing Campaign Tracking', color: '#ef4444', fields: [
        { label: 'Campaign Title', type: 'short_text' },
        { label: 'Channel', type: 'dropdown', options: ['Social Media', 'Email', 'PPC', 'SEO', 'Direct'] },
        { label: 'Budget Allocated', type: 'number' },
        { label: 'CTR (%)', type: 'number' },
        { label: 'Creative Feedback', type: 'paragraph' }
      ]},
      { name: 'Real Estate Portfolio', color: '#f97316', fields: [
        { label: 'Property Address', type: 'short_text' },
        { label: 'Property Type', type: 'dropdown', options: ['Residential', 'Commercial', 'Industrial', 'Land'] },
        { label: 'Asking Price', type: 'number' },
        { label: 'Market Interest', type: 'rating' },
        { label: 'Broker Notes', type: 'paragraph' }
      ]},
      { name: 'Supply Chain Audit', color: '#4b5563', fields: [
        { label: 'Supplier Name', type: 'short_text' },
        { label: 'Compliance Level', type: 'dropdown', options: ['Fully Compliant', 'Minor Issues', 'Non-Compliant'] },
        { label: 'Quality Score', type: 'linear_scale' },
        { label: 'Audit Date', type: 'date' },
        { label: 'Corrective Actions', type: 'paragraph' }
      ]}
    ];

    for (const t of templates) {
      const [tRes] = await conn.query('INSERT INTO templates (name, color, created_by) VALUES (?, ?, ?)', [t.name, t.color, 1]);
      const tId = tRes.insertId;

      for (let i = 0; i < t.fields.length; i++) {
        const f = t.fields[i];
        await conn.query(
          'INSERT INTO template_fields (template_id, label, type, options, position) VALUES (?, ?, ?, ?, ?)',
          [tId, f.label, f.type, f.options ? JSON.stringify(f.options) : null, i]
        );
      }

      // Add 8-12 entries for each
      const entryCount = Math.floor(Math.random() * 5) + 8;
      for (let e = 1; e <= entryCount; e++) {
        const [dataRes] = await conn.query('INSERT INTO template_data (template_id, created_by) VALUES (?, ?)', [tId, 1]);
        const dataId = dataRes.insertId;

        const [fields] = await conn.query('SELECT * FROM template_fields WHERE template_id = ?', [tId]);
        for (const f of fields) {
          let val = 'Sample Entry';
          if (f.label.includes('Company') || f.label.includes('Supplier')) val = ['Acme Corp', 'TechFlow', 'Stellar Systems', 'Nexus Inc', 'Global Ltd'][Math.floor(Math.random()*5)];
          if (f.type === 'number') val = (Math.floor(Math.random() * 10000) + 100).toString();
          if (f.type === 'dropdown') {
            const opts = JSON.parse(f.options);
            val = opts[Math.floor(Math.random() * opts.length)];
          }
          if (f.type === 'rating' || f.type === 'linear_scale') val = (Math.floor(Math.random() * 5) + 1).toString();
          if (f.type === 'date') val = `2026-0${Math.floor(Math.random()*4)+1}-0${Math.floor(Math.random()*9)+1}`;
          if (f.type === 'paragraph') val = 'Detailed operational notes recorded for system analysis and reporting.';

          await conn.query(
            'INSERT INTO template_data_values (data_id, field_id, value) VALUES (?, ?, ?)',
            [dataId, f.id, val]
          );
        }
      }
    }

    console.log('📈 10 templates and ~100 entries seeded successfully.');
    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await conn.end();
  }
}

seed();
