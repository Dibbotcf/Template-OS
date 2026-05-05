const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const router = express.Router();

async function logActivity(userId, action, entityType, entityId, details = null) {
  try {
    await db.query(
      'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entityType, entityId, details ? JSON.stringify(details) : null]
    );
  } catch (e) {}
}

// POST /api/delete-requests
router.post('/', auth, async (req, res) => {
  if (req.user.role === 'admin') {
    return res.status(400).json({ error: 'Admins can delete directly' });
  }
  const { template_id, reason } = req.body;
  if (!template_id) return res.status(400).json({ error: 'template_id required' });

  try {
    // Check no pending request already exists
    const [existing] = await db.query(
      "SELECT id FROM delete_requests WHERE template_id = ? AND requested_by = ? AND status = 'pending'",
      [template_id, req.user.id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A pending request already exists for this template' });
    }

    const [result] = await db.query(
      'INSERT INTO delete_requests (template_id, requested_by, reason) VALUES (?, ?, ?)',
      [template_id, req.user.id, reason || null]
    );
    await logActivity(req.user.id, 'deletion_requested', 'delete_request', result.insertId, { template_id });
    return res.status(201).json({ id: result.insertId, status: 'pending' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/delete-requests — Admin only
router.get('/', auth, requireAdmin, async (req, res) => {
  const { status = 'pending' } = req.query;
  try {
    let q = `SELECT dr.*, COALESCE(t.name, '[Deleted]') as template_name, u.name as requester_name
             FROM delete_requests dr
             LEFT JOIN templates t ON t.id = dr.template_id
             JOIN users u ON u.id = dr.requested_by`;
    const params = [];
    if (status !== 'all') { q += ' WHERE dr.status = ?'; params.push(status); }
    q += ' ORDER BY dr.created_at DESC';

    const [rows] = await db.query(q, params);
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/delete-requests/my — Employee sees own requests
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT dr.*, t.name as template_name FROM delete_requests dr
       JOIN templates t ON t.id = dr.template_id
       WHERE dr.requested_by = ? ORDER BY dr.created_at DESC`,
      [req.user.id]
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// PUT /api/delete-requests/:id/approve — Admin only
router.put('/:id/approve', auth, requireAdmin, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query('SELECT * FROM delete_requests WHERE id = ?', [req.params.id]);
    if (rows.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Request not found' }); }
    const request = rows[0];

    await conn.query(
      "UPDATE delete_requests SET status = 'approved', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
      [req.user.id, req.params.id]
    );
    await conn.query('UPDATE templates SET is_deleted = 1 WHERE id = ?', [request.template_id]);

    await conn.commit();
    await logActivity(req.user.id, 'deletion_approved', 'delete_request', req.params.id, { template_id: request.template_id });
    return res.json({ message: 'Request approved, template deleted' });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ error: 'Server error' });
  } finally {
    conn.release();
  }
});

// PUT /api/delete-requests/:id/reject — Admin only
router.put('/:id/reject', auth, requireAdmin, async (req, res) => {
  try {
    await db.query(
      "UPDATE delete_requests SET status = 'rejected', reviewed_by = ?, reviewed_at = NOW() WHERE id = ?",
      [req.user.id, req.params.id]
    );
    await logActivity(req.user.id, 'deletion_rejected', 'delete_request', req.params.id);
    return res.json({ message: 'Request rejected' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
