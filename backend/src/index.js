require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const templateRoutes = require('./routes/templates');
const dataRoutes = require('./routes/data');
const userRoutes = require('./routes/users');
const deleteRequestRoutes = require('./routes/deleteRequests');
const activityLogRoutes = require('./routes/activityLogs');
const uploadRoute = require('./routes/upload');
const statsRoutes = require('./routes/stats');

const app = express();

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api', dataRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/delete-requests', deleteRequestRoutes);
app.use('/api/admin/logs', activityLogRoutes);
app.use('/api/upload', uploadRoute);
app.use('/api/stats', statsRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', ts: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Template OS API running on http://localhost:${PORT}`);
});
