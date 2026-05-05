const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

async function logActivity(userId, action, entityType, entityId, details = null) {
  try {
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch (e) {}
}

// GET /api/templates/:id/data/all — fetch ALL rows (no pagination) for export
router.get('/templates/:id/data/all', auth, async (req, res) => {
  const templateId = req.params.id;
  try {
    const [fields] = await db.query(
      'SELECT * FROM template_fields WHERE template_id = ? ORDER BY position ASC',
      [templateId]
    );
    const [entries] = await db.query(
      `SELECT td.*, u.name as created_by_name FROM template_data td
       LEFT JOIN users u ON u.id = td.created_by
       WHERE td.template_id = ? ORDER BY td.created_at ASC`,
      [templateId]
    );
    if (entries.length === 0) return res.json({ data: [], fields });
    const ids = entries.map(e => e.id);
    const [values] = await db.query(
      `SELECT * FROM template_data_values WHERE data_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );
    const result = entries.map(entry => ({
      ...entry,
      values: values.filter(v => v.data_id === entry.id),
    }));
    return res.json({ data: result, fields });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/templates/:id/data/bulk-delete — delete multiple entries
router.post('/templates/:id/data/bulk-delete', auth, async (req, res) => {
  const { ids = [] } = req.body;
  if (!ids.length) return res.status(400).json({ error: 'No IDs provided' });
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `DELETE FROM template_data WHERE id IN (${ids.map(() => '?').join(',')}) AND template_id = ?`,
      [...ids, req.params.id]
    );
    await conn.commit();
    await logActivity(req.user.id, 'data_bulk_deleted', 'template_data', req.params.id, { count: ids.length });
    return res.json({ message: `${ids.length} entries deleted` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// POST /api/templates/:id/data/import — import entries from parsed Excel rows
router.post('/templates/:id/data/import', auth, async (req, res) => {
  const { rows = [] } = req.body; // rows: [{fieldId: value, ...}, ...]
  if (!rows.length) return res.status(400).json({ error: 'No data rows provided' });
  const templateId = req.params.id;
  const conn = await db.getConnection();
  let inserted = 0;
  try {
    await conn.beginTransaction();
    for (const row of rows) {
      const [result] = await conn.query(
        'INSERT INTO template_data (template_id, created_by) VALUES (?, ?)',
        [templateId, req.user.id]
      );
      const dataId = result.insertId;
      const valueEntries = Object.entries(row).filter(([k]) => !isNaN(Number(k)));
      if (valueEntries.length > 0) {
        const valueRows = valueEntries.map(([fieldId, val]) => [
          dataId, parseInt(fieldId),
          Array.isArray(val) ? JSON.stringify(val) : (val !== undefined && val !== null ? String(val) : null),
        ]);
        await conn.query('INSERT INTO template_data_values (data_id, field_id, value) VALUES ?', [valueRows]);
      }
      inserted++;
    }
    await conn.commit();
    await logActivity(req.user.id, 'data_imported', 'template_data', templateId, { count: inserted });
    return res.status(201).json({ message: `${inserted} entries imported successfully` });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// GET /api/templates/:id/data — paginated with search
router.get('/templates/:id/data', auth, async (req, res) => {
  const { page = 1, limit = 20, search = '' } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const templateId = req.params.id;

  try {
    // Get fields for this template
    const [fields] = await db.query(
      'SELECT * FROM template_fields WHERE template_id = ? ORDER BY position ASC',
      [templateId]
    );

    let dataIds;
    if (search) {
      // Search across text-type fields
      const textTypes = ['short_text','paragraph','email','phone'];
      const textFieldIds = fields.filter(f => textTypes.includes(f.type)).map(f => f.id);
      if (textFieldIds.length > 0) {
        const [searchRows] = await db.query(
          `SELECT DISTINCT td.id FROM template_data td
           JOIN template_data_values tdv ON tdv.data_id = td.id
           WHERE td.template_id = ?
           AND tdv.field_id IN (${textFieldIds.map(() => '?').join(',')})
           AND tdv.value LIKE ?
           ORDER BY td.created_at DESC LIMIT ? OFFSET ?`,
          [templateId, ...textFieldIds, `%${search}%`, parseInt(limit), offset]
        );
        dataIds = searchRows.map(r => r.id);
      } else {
        dataIds = [];
      }

      const [[{ total }]] = await db.query(
        `SELECT COUNT(DISTINCT td.id) as total FROM template_data td
         JOIN template_data_values tdv ON tdv.data_id = td.id
         WHERE td.template_id = ?
         AND tdv.field_id IN (${textFieldIds.length > 0 ? textFieldIds.map(() => '?').join(',') : '0'})
         AND tdv.value LIKE ?`,
        [templateId, ...textFieldIds, `%${search}%`]
      );

      if (dataIds.length === 0) {
        return res.json({ data: [], fields, total: 0, page: parseInt(page), limit: parseInt(limit) });
      }

      const [values] = await db.query(
        `SELECT tdv.* FROM template_data_values tdv WHERE tdv.data_id IN (${dataIds.map(() => '?').join(',')})`,
        dataIds
      );
      const [entries] = await db.query(
        `SELECT td.*, u.name as created_by_name FROM template_data td
         LEFT JOIN users u ON u.id = td.created_by
         WHERE td.id IN (${dataIds.map(() => '?').join(',')}) ORDER BY td.created_at DESC`,
        dataIds
      );

      const result = entries.map(entry => ({
        ...entry,
        values: values.filter(v => v.data_id === entry.id),
      }));

      return res.json({ data: result, fields, total, page: parseInt(page), limit: parseInt(limit) });
    }

    // No search
    const [[{ total }]] = await db.query(
      'SELECT COUNT(*) as total FROM template_data WHERE template_id = ?',
      [templateId]
    );

    const [entries] = await db.query(
      `SELECT td.*, u.name as created_by_name FROM template_data td
       LEFT JOIN users u ON u.id = td.created_by
       WHERE td.template_id = ? ORDER BY td.created_at DESC LIMIT ? OFFSET ?`,
      [templateId, parseInt(limit), offset]
    );

    if (entries.length === 0) {
      return res.json({ data: [], fields, total, page: parseInt(page), limit: parseInt(limit) });
    }

    const ids = entries.map(e => e.id);
    const [values] = await db.query(
      `SELECT * FROM template_data_values WHERE data_id IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    const result = entries.map(entry => ({
      ...entry,
      values: values.filter(v => v.data_id === entry.id),
    }));

    return res.json({ data: result, fields, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/templates/:id/data
router.post('/templates/:id/data', auth, async (req, res) => {
  const templateId = req.params.id;
  const { values = {} } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO template_data (template_id, created_by) VALUES (?, ?)',
      [templateId, req.user.id]
    );
    const dataId = result.insertId;

    const valueEntries = Object.entries(values);
    if (valueEntries.length > 0) {
      const valueRows = valueEntries.map(([fieldId, val]) => [
        dataId, parseInt(fieldId),
        Array.isArray(val) ? JSON.stringify(val) : (val !== undefined && val !== null ? String(val) : null),
      ]);
      await conn.query(
        'INSERT INTO template_data_values (data_id, field_id, value) VALUES ?',
        [valueRows]
      );
    }

    await conn.commit();
    await logActivity(req.user.id, 'data_created', 'template_data', dataId, { template_id: templateId });

    const [entry] = await db.query('SELECT * FROM template_data WHERE id = ?', [dataId]);
    const [entryValues] = await db.query('SELECT * FROM template_data_values WHERE data_id = ?', [dataId]);
    return res.status(201).json({ ...entry[0], values: entryValues });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// GET /api/data/:dataId
router.get('/data/:dataId', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT td.*, u.name as created_by_name FROM template_data td
       LEFT JOIN users u ON u.id = td.created_by WHERE td.id = ?`,
      [req.params.dataId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Entry not found' });

    const [values] = await db.query(
      'SELECT * FROM template_data_values WHERE data_id = ?',
      [req.params.dataId]
    );
    return res.json({ ...rows[0], values });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/data/:dataId
router.put('/data/:dataId', auth, async (req, res) => {
  const { values = {} } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();
    await conn.query('UPDATE template_data SET updated_at = NOW() WHERE id = ?', [req.params.dataId]);

    for (const [fieldId, val] of Object.entries(values)) {
      const strVal = Array.isArray(val) ? JSON.stringify(val) : (val !== undefined && val !== null ? String(val) : null);
      const [existing] = await conn.query(
        'SELECT id FROM template_data_values WHERE data_id = ? AND field_id = ?',
        [req.params.dataId, parseInt(fieldId)]
      );
      if (existing.length > 0) {
        await conn.query(
          'UPDATE template_data_values SET value = ? WHERE data_id = ? AND field_id = ?',
          [strVal, req.params.dataId, parseInt(fieldId)]
        );
      } else {
        await conn.query(
          'INSERT INTO template_data_values (data_id, field_id, value) VALUES (?, ?, ?)',
          [req.params.dataId, parseInt(fieldId), strVal]
        );
      }
    }

    await conn.commit();
    await logActivity(req.user.id, 'data_updated', 'template_data', req.params.dataId, { values });

    const [entry] = await db.query('SELECT * FROM template_data WHERE id = ?', [req.params.dataId]);
    const [entryValues] = await db.query('SELECT * FROM template_data_values WHERE data_id = ?', [req.params.dataId]);
    return res.json({ ...entry[0], values: entryValues });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// DELETE /api/data/:dataId
router.delete('/data/:dataId', auth, async (req, res) => {
  try {
    await db.query('DELETE FROM template_data WHERE id = ?', [req.params.dataId]);
    await logActivity(req.user.id, 'data_deleted', 'template_data', req.params.dataId);
    return res.json({ message: 'Entry deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
