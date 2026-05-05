const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleCheck');
const router = express.Router();

// GET /api/admin/logs
router.get('/', auth, requireAdmin, async (req, res) => {
  const { user_id, entity_type, from, to, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let conditions = [];
    const params = [];

    if (user_id) { conditions.push('al.user_id = ?'); params.push(user_id); }
    if (entity_type) { conditions.push('al.entity_type = ?'); params.push(entity_type); }
    if (from) { conditions.push('al.timestamp >= ?'); params.push(from); }
    if (to) { conditions.push('al.timestamp <= ?'); params.push(to); }

    const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM activity_logs al ${where}`,
      params
    );

    const [rows] = await db.query(
      `SELECT al.*, u.name as user_name, u.email as user_email
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${where}
       ORDER BY al.timestamp DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    return res.json({ logs: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
