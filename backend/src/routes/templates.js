const express = require('express');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const router = express.Router();

// Helper: log activity
async function logActivity(userId, action, entityType, entityId, details = null) {
  try {
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch (e) { /* non-blocking */ }
}

// GET /api/templates
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        t.id, t.name, t.color, t.created_at, t.updated_at,
        ${req.user.role === 'admin' ? 't.created_by,' : ''}
        (SELECT COUNT(*) FROM template_fields WHERE template_id = t.id) as field_count,
        (SELECT COUNT(*) FROM template_data WHERE template_id = t.id) as entry_count
      FROM templates t
      WHERE t.is_deleted = 0 
      ORDER BY t.created_at DESC
    `);
    return res.json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/templates
router.post(
  '/',
  auth,
  [
    body('name').notEmpty().withMessage('Template name is required'),
    body('color').optional().isLength({ min: 4, max: 7 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, color = '#378ADD', fields = [] } = req.body;
    const conn = await db.getConnection();

    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        'INSERT INTO templates (name, color, created_by) VALUES (?, ?, ?)',
        [name, color, req.user.id]
      );
      const templateId = result.insertId;

      if (fields.length > 0) {
        const fieldValues = fields.map((f, i) => [
          templateId, f.label, f.type,
          f.placeholder || null, f.is_required ? 1 : 0,
          f.default_value || null,
          f.options ? JSON.stringify(f.options) : null,
          f.position !== undefined ? f.position : i,
        ]);
        await conn.query(
          `INSERT INTO template_fields
           (template_id, label, type, placeholder, is_required, default_value, options, position)
           VALUES ?`,
          [fieldValues]
        );
      }

      await conn.commit();
      await logActivity(req.user.id, 'template_created', 'template', templateId, { name });

      const [template] = await db.query('SELECT * FROM templates WHERE id = ?', [templateId]);
      const [templateFields] = await db.query(
        'SELECT * FROM template_fields WHERE template_id = ? ORDER BY position ASC',
        [templateId]
      );

      const parsedFields = templateFields.map(f => ({
        ...f,
        options: f.options ? JSON.parse(f.options) : []
      }));
      return res.status(201).json({ ...template[0], fields: parsedFields });
    } catch (err) {
      await conn.rollback();
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    } finally {
      conn.release();
    }
  }
);

// GET /api/templates/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM templates WHERE id = ? AND is_deleted = 0',
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Template not found' });

    const template = rows[0];
    if (req.user.role !== 'admin') delete template.created_by;

    const [fields] = await db.query(
      'SELECT * FROM template_fields WHERE template_id = ? ORDER BY position ASC',
      [req.params.id]
    );

    const parsedFields = fields.map(f => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : []
    }));
    return res.json({ ...template, fields: parsedFields });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/templates/:id
router.put('/:id', auth, async (req, res) => {
  const { name, color, fields } = req.body;
  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const updates = [];
    const vals = [];
    if (name !== undefined) { updates.push('name = ?'); vals.push(name); }
    if (color !== undefined) { updates.push('color = ?'); vals.push(color); }
    if (updates.length > 0) {
      vals.push(req.params.id);
      await conn.query(`UPDATE templates SET ${updates.join(', ')} WHERE id = ?`, vals);
    }

    if (fields !== undefined) {
      // Delete removed fields (those not in the new list)
      const existingIds = fields.filter(f => f.id).map(f => f.id);
      if (existingIds.length > 0) {
        await conn.query(
          `DELETE FROM template_fields WHERE template_id = ? AND id NOT IN (${existingIds.map(() => '?').join(',')})`,
          [req.params.id, ...existingIds]
        );
      } else {
        await conn.query('DELETE FROM template_fields WHERE template_id = ?', [req.params.id]);
      }

      for (let i = 0; i < fields.length; i++) {
        const f = fields[i];
        const pos = f.position !== undefined ? f.position : i;
        const opts = f.options ? JSON.stringify(f.options) : null;
        if (f.id) {
          await conn.query(
            `UPDATE template_fields SET label=?, type=?, placeholder=?, is_required=?, default_value=?, options=?, position=?
             WHERE id=? AND template_id=?`,
            [f.label, f.type, f.placeholder||null, f.is_required?1:0, f.default_value||null, opts, pos, f.id, req.params.id]
          );
        } else {
          await conn.query(
            `INSERT INTO template_fields (template_id, label, type, placeholder, is_required, default_value, options, position)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.params.id, f.label, f.type, f.placeholder||null, f.is_required?1:0, f.default_value||null, opts, pos]
          );
        }
      }
    }

    await conn.commit();
    await logActivity(req.user.id, 'template_updated', 'template', req.params.id, { name, color });

    const [template] = await db.query('SELECT * FROM templates WHERE id = ?', [req.params.id]);
    const [templateFields] = await db.query(
      'SELECT * FROM template_fields WHERE template_id = ? ORDER BY position ASC',
      [req.params.id]
    );
    const parsedFields = templateFields.map(f => ({
      ...f,
      options: f.options ? JSON.parse(f.options) : []
    }));
    return res.json({ ...template[0], fields: parsedFields });
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// DELETE /api/templates/:id — Admin only
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE templates SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    await logActivity(req.user.id, 'template_deleted', 'template', req.params.id);
    return res.json({ message: 'Template deleted' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
