/**
 * security.js — HummingX BI Portal API
 * Centraliza todas las medidas de seguridad: rate limiting, headers y sanitización.
 */

const rateLimit = require('express-rate-limit');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const rateLimitResponse = (windowMinutes, maxRequests) => ({
  windowMs: windowMinutes * 60 * 1000,
  max: maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: `Demasiados intentos. Intenta de nuevo en ${windowMinutes} minutos.` },
  // Trust Render/Cloudflare proxy so X-Forwarded-For is used for IP detection
  // Only enable if deployed behind a trusted proxy (set in index.js)
});

// ─── Rate Limiters ────────────────────────────────────────────────────────────

/**
 * Login: 10 intentos por IP en 15 minutos.
 * Protege contra brute-force y credential stuffing.
 */
const loginLimiter = rateLimit({
  ...rateLimitResponse(15, 10),
  skipSuccessfulRequests: true, // Los logins exitosos no cuentan contra el límite
});

/**
 * Forgot-password: 5 solicitudes por IP en 30 minutos.
 * Previene email bombing y abuso de cuota SMTP.
 */
const forgotPasswordLimiter = rateLimit({
  ...rateLimitResponse(30, 5),
  skipSuccessfulRequests: false,
});

/**
 * Activate / Reset-password: 10 intentos por IP en 15 min.
 * Previene enumeración de tokens válidos por fuerza bruta.
 */
const tokenActionLimiter = rateLimit({
  ...rateLimitResponse(15, 10),
  skipSuccessfulRequests: true,
});

/**
 * Limiter global de API: 200 req/min por IP.
 * Primer escudo contra scrapers y DDoS de capa 7.
 */
const globalApiLimiter = rateLimit({
  ...rateLimitResponse(1, 200),
});

/**
 * Admin endpoints: 60 req/min por IP.
 */
const adminLimiter = rateLimit({
  ...rateLimitResponse(1, 60),
});

// ─── Input sanitization helpers ───────────────────────────────────────────────

/**
 * Elimina caracteres de control y recorta whitespace.
 * NO reemplaza a una librería de sanitización completa, pero cierra
 * el vector básico de header injection en campos de texto libre.
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str
    .replace(/[\r\n\t\x00-\x1F\x7F]/g, '') // control chars (previene header injection)
    .trim()
    .slice(0, 500); // longitud máxima razonable
};

/**
 * Middleware: sanitiza campos string del body antes de que lleguen a las rutas.
 */
const sanitizeBody = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (typeof value === 'string') {
        req.body[key] = sanitizeString(value);
      }
    }
  }
  next();
};

// ─── Email validation helper ──────────────────────────────────────────────────

/**
 * Valida que un correo sea RFC-5321 válido usando regex estricta.
 * Se usa en rutas que aceptan email como entrada.
 */
const isValidEmail = (email) => {
  if (typeof email !== 'string') return false;
  // Simple but effective: rejects common injection chars (\r, \n, etc.)
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

module.exports = {
  loginLimiter,
  forgotPasswordLimiter,
  tokenActionLimiter,
  globalApiLimiter,
  adminLimiter,
  sanitizeBody,
  isValidEmail,
};
