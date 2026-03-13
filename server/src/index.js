require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const dealRoutes = require('./routes/deal');
const chatRoutes = require('./routes/chat');
const analyticsRoutes = require('./routes/analytics');
const dealImportRoutes = require('./routes/dealImport');
const adminRoutes = require('./routes/admin');
const configRoutes = require('./routes/config');
const publicRoutes = require('./routes/public');
const teamRoutes = require('./routes/team');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
const clientOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(',').map(s => s.trim()).filter(Boolean)
  : ['http://localhost:5173'];
app.use(cors({
  origin: clientOrigins.length === 1 ? clientOrigins[0] : clientOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: 'Too many requests. Please try again in a minute.' },
});
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Chat rate limit reached. Please wait a moment.' },
});
// Auth: 10/min is tight for dev (verify on load + register retries). Use higher limit in dev.
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 120,
  message: { error: 'Too many login attempts. Please try again later.' },
});

app.use('/api/', generalLimiter);
app.use('/api/chat', chatLimiter);
app.use('/api/auth', authLimiter);
app.use('/api/admin/login', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/deal', dealRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', dealImportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', configRoutes);
app.use('/api', teamRoutes);
app.use('/api', publicRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

app.listen(PORT, () => {
  console.log(`[Server] Gray Capital Deal Room API running on port ${PORT}`);
});
