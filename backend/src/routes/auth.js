const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');
const router = express.Router();

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').notEmpty().withMessage('Email/ID is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    let { email, password } = req.body;

    // Allow 'TCF' as admin alias
    if (email === 'TCF') email = 'admin@templateos.com';

    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ? AND is_deleted = 0',
        [email]
      );

      if (rows.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: 'Invalid credentials' });

      // Update last_login
      await db.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

      const token = jwt.sign(
        { user_id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
      );

      return res.json({
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }
);

// POST /api/auth/logout (client discards token)
router.post('/logout', (req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

module.exports = router;
