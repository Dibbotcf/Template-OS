const express = require('express');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
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

// GET /api/admin/users
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, email, role, created_at, last_login, is_deleted FROM users WHERE is_deleted = 0 ORDER BY created_at ASC'
    );
    return res.json(rows);
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/admin/users
router.post(
  '/',
  auth,
  requireAdmin,
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 4 }),
    body('role').isIn(['admin', 'employee']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, role } = req.body;
    try {
      const hash = await bcrypt.hash(password, 12);
      const [result] = await db.query(
        'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
        [name, email, hash, role]
      );
      await logActivity(req.user.id, 'user_created', 'user', result.insertId, { name, email, role });
      return res.status(201).json({ id: result.insertId, name, email, role });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Email already exists' });
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// PUT /api/admin/users/:id
router.put('/:id', auth, requireAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const updates = [];
    const vals = [];
    if (name) { updates.push('name = ?'); vals.push(name); }
    if (email) { updates.push('email = ?'); vals.push(email); }
    if (role) { updates.push('role = ?'); vals.push(role); }
    if (password) {
      const hash = await bcrypt.hash(password, 12);
      updates.push('password = ?');
      vals.push(hash);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    vals.push(req.params.id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, vals);
    return res.json({ message: 'User updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /api/admin/users/:id
router.delete('/:id', auth, requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE users SET is_deleted = 1 WHERE id = ?', [req.params.id]);
    await logActivity(req.user.id, 'user_deleted', 'user', req.params.id);
    return res.json({ message: 'User deleted' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
