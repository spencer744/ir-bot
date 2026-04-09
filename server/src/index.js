require('dotenv').config();
const path = require('path');
const fs = require('fs');
const Sentry = require('@sentry/node');
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

// Initialize Sentry before anything else
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    tracesSampleRate: 0.1,
  });
  console.log('[Sentry] Error monitoring initialized');
}

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
  res.json({ status: 'ok', deal: 'fairmont-apartments', version: '2.0.0', timestamp: new Date().toISOString() });
});

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
  app.use(Sentry.expressErrorHandler());
}

// Error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});


// Serve React client build
const clientBuildPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));
  app.get('/{*path}', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}
app.listen(PORT, () => {
  console.log(`[Server] Gray Capital Deal Room API running on port ${PORT}`);
});



