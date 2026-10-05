require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const authRoutes = require('./_src/routes/auth');
const projectRoutes = require('./_src/routes/projects');
const adminRoutes = require('./_src/routes/admin');
const referralRoutes = require('./_src/routes/referrals');
const paymentRoutes = require('./_src/routes/payments');

const {
  globalApiLimiter,
  sanitizeBody,
} = require('./_src/middleware/security');

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Trust proxy (Render / Cloudflare) ───────────────────────────────────────
// CRITICAL: Only set to 1 when behind exactly one trusted proxy.
// Without this, express-rate-limit sees Cloudflare's IP, not the real client IP.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// ─── Security Headers (Helmet) ────────────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false, // Portal loads iframes (design previews)
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
}));

// ─── CORS — Allowlist only ────────────────────────────────────────────────────
const allowedOrigins = [
  // Production domains
  'https://hummingxbi.com',
  'https://www.hummingxbi.com',
  'https://portal.hummingxbi.com',
  // Vercel preview deployments
  process.env.FRONTEND_URL,
  // Local development
  'http://localhost:5177',
  'http://127.0.0.1:5177',
  'http://localhost:5180',
  'http://127.0.0.1:5180',
  'http://localhost:3000',
  'https://hummingx-portal.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: Origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Body parsing — payload size limits ──────────────────────────────────────
// Limits: prevents memory exhaustion from huge JSON payloads (DoS vector).
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Global rate limiting ─────────────────────────────────────────────────────
app.use('/auth', globalApiLimiter);
app.use('/admin', globalApiLimiter);
app.use('/projects', globalApiLimiter);
app.use('/referrals', globalApiLimiter);
app.use('/payments', globalApiLimiter);

// ─── Input sanitization (all routes) ─────────────────────────────────────────
app.use(sanitizeBody);

// ─── Request logging ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/projects', projectRoutes);
app.use('/admin', adminRoutes);
app.use('/referrals', referralRoutes);
app.use('/payments', paymentRoutes);

// ─── Health check (no auth needed, no sensitive data) ────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada.' }));

// ─── Global error handler — NEVER expose stack traces in production ───────────
app.use((err, _req, res, _next) => {
  // Log full error internally
  console.error('[ERROR]', err.message || err);

  // Return sanitized response (no internal paths, no stack traces)
  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? (err.message || 'Error interno del servidor.') : 'Error interno del servidor.',
  });
});

// Export the app for Vercel Serverless Functions
module.exports = app;

// Only start the server locally if not running in a serverless environment
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 HummingX Portal API running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   Frontend: ${process.env.FRONTEND_URL || 'http://localhost:5177'}\n`);
  });
}
