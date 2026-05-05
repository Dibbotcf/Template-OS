const express = require('express');
const db = require('../db');
const auth = require('../middleware/auth');
const router = express.Router();

router.get('/', auth, async (req, res) => {
  const { from, to } = req.query;

  // Build date filter clause for entry-based queries
  const dateConditions = [];
  const dateParams = [];
  if (from) { dateConditions.push('created_at >= ?'); dateParams.push(from); }
  if (to)   { dateConditions.push('created_at <= ?'); dateParams.push(to + ' 23:59:59'); }
  const dateWhere = dateConditions.length > 0 ? 'WHERE ' + dateConditions.join(' AND ') : '';

  try {
    // Basic Counts
    const [templateCount] = await db.query('SELECT COUNT(*) as count FROM templates WHERE is_deleted = 0');
    const [entryCount] = await db.query(`SELECT COUNT(*) as count FROM template_data ${dateWhere}`, dateParams);
    const [userCount] = await db.query('SELECT COUNT(*) as count FROM users WHERE is_deleted = 0');
    const [pendingDeletes] = await db.query('SELECT COUNT(*) as count FROM delete_requests WHERE status = "pending"');

    // Recent Activity (Last 10 logs)
    const [recentActivity] = await db.query(`
      SELECT a.*, u.name as user_name 
      FROM activity_logs a 
      JOIN users u ON a.user_id = u.id 
      ORDER BY a.timestamp DESC 
      LIMIT 10
    `);

    // Top Templates by Entry Count (date-filtered)
    const topDateWhere = dateConditions.length > 0 
      ? 'AND d.created_at >= ? ' + (to ? 'AND d.created_at <= ? ' : '')
      : '';
    const topParams = dateConditions.length > 0 ? [...dateParams] : [];
    const [topTemplates] = await db.query(`
      SELECT t.name, t.color, COUNT(d.id) as count
      FROM templates t
      LEFT JOIN template_data d ON t.id = d.template_id ${topDateWhere.replace('AND', 'AND')}
      WHERE t.is_deleted = 0 ${topDateWhere}
      GROUP BY t.id
      ORDER BY count DESC
      LIMIT 5
    `, [...topParams, ...topParams]);

    // Daily Entry Trend (respect date range, default 30 days)
    let trendWhere = 'WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
    const trendParams = [];
    if (from || to) {
      const parts = [];
      if (from) { parts.push('created_at >= ?'); trendParams.push(from); }
      if (to)   { parts.push('created_at <= ?'); trendParams.push(to + ' 23:59:59'); }
      trendWhere = 'WHERE ' + parts.join(' AND ');
    }
    const [trend] = await db.query(`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM template_data
      ${trendWhere}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `, trendParams);

    return res.json({
      counts: {
        templates: templateCount[0].count,
        entries: entryCount[0].count,
        users: userCount[0].count,
        pendingDeletes: pendingDeletes[0].count
      },
      recentActivity,
      topTemplates,
      trend
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
