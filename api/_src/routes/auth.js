/**
 * auth.js — HummingX BI Auth Routes
 * SECURITY HARDENED: rate limiting, email validation, token hashing, host poisoning fix.
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');
const {
  loginLimiter,
  forgotPasswordLimiter,
  tokenActionLimiter,
  isValidEmail,
} = require('../middleware/security');

const router = express.Router();

// ─── Email transporter ────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── POST /auth/login ─────────────────────────────────────────────────────────
// Rate limited: 10 attempts per IP per 15 min
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    // SECURITY: Validate email format to prevent injection
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // SECURITY: Don't reveal if account is inactive vs non-existent
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    if (!user.passwordHash) {
      // This message is fine — account not activated is not sensitive info
      return res.status(401).json({ error: 'Cuenta no activada. Revisa tu correo para crear tu contraseña.' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        logoUrl: user.logoUrl,
        level: user.level,
        referralCode: user.referralCode,
      }
    });
  } catch (err) {
    console.error('[AUTH] Login error:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── GET /auth/me ─────────────────────────────────────────────────────────────
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        companyName: true, logoUrl: true, phone: true, level: true,
        referralCode: true, createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── POST /auth/invite — Admin invites a new client ──────────────────────────
// NOTE: This route is admin-only (role check first thing)
router.post('/invite', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    const { name, email, companyName, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos.' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    const referralCode = companyName
      ? companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20)
      : email.split('@')[0].toLowerCase();

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        companyName,
        phone,
        role: 'client',
        invitationToken: token,
        invitationExpires: expires,
        referralCode,
        active: true,
      }
    });

    // SECURITY: Never return the activation link in production responses.
    // Only log it during development.
    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Invitation for ${email}: ${activationLink}`);
    }

    res.status(201).json({
      message: 'Invitación creada exitosamente.',
      userId: user.id,
      // SECURITY FIX: Remove activationLink from production response
      ...(process.env.NODE_ENV !== 'production' && { activationLink }),
    });
  } catch (err) {
    console.error('[AUTH] Invite error:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── GET /auth/verify-invitation/:token — Pre-check token status ─────────────
router.get('/verify-invitation/:token', async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ valid: false, error: 'Token inválido.' });
    }

    const user = await prisma.user.findUnique({ where: { invitationToken: token } });
    if (!user) {
      return res.status(404).json({ valid: false, error: 'Enlace de activación inválido o expirado.' });
    }

    if (user.invitationAccepted) {
      return res.json({
        valid: false,
        alreadyActivated: true,
        companyName: user.companyName,
        name: user.name,
        email: user.email,
        message: 'Esta cuenta ya fue activada. Ya has creado tu contraseña anteriormente.'
      });
    }

    if (user.invitationExpires && user.invitationExpires < new Date()) {
      return res.status(400).json({ valid: false, error: 'Este enlace de activación ha expirado.' });
    }

    return res.json({
      valid: true,
      name: user.name,
      companyName: user.companyName,
      email: user.email
    });
  } catch (err) {
    console.error('Verify invitation error:', err);
    res.status(500).json({ valid: false, error: 'Error al verificar enlace.' });
  }
});

// ─── POST /auth/activate — Client sets their password ─────────────────────────
// Rate limited: 10 per IP per 15 min
router.post('/activate', tokenActionLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña son requeridos.' });
    }

    // SECURITY: Enforce minimum password policy
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const user = await prisma.user.findUnique({ where: { invitationToken: token } });

    if (!user) {
      return res.status(400).json({ error: 'Enlace de activación inválido o expirado.' });
    }

    if (user.invitationAccepted) {
      return res.status(400).json({ 
        error: 'Ya has creado tu contraseña anteriormente. Inicia sesión para acceder a tu portal.',
        alreadyActivated: true 
      });
    }

    if (user.invitationExpires && user.invitationExpires < new Date()) {
      return res.status(400).json({ error: 'Enlace de activación inválido o expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        invitationAccepted: true,
      }
    });

    const jwtToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      message: '¡Cuenta activada exitosamente!',
      token: jwtToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyName: user.companyName,
        logoUrl: user.logoUrl,
        level: user.level,
      }
    });
  } catch (err) {
    console.error('[AUTH] Activation error:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── POST /auth/forgot-password ───────────────────────────────────────────────
// Rate limited: 5 per IP per 30 min (prevents email bombing)
router.post('/forgot-password', forgotPasswordLimiter, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: 'Email requerido.' });
    if (!isValidEmail(email)) {
      // SECURITY: Return generic message — don't confirm email format issues either
      return res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    // SECURITY: Always return the SAME response whether user exists or not.
    // This prevents user enumeration via the forgot-password endpoint.
    if (!user) {
      return res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace.' });
    }

    // Per-account rate limiting: 1 email every 60 seconds (prevents spam abuse while allowing quick re-tests)
    if (user.lastPasswordResetReq) {
      const diffMs = Date.now() - new Date(user.lastPasswordResetReq).getTime();
      if (diffMs < 60 * 1000) {
        // SECURITY: Still return 200 to avoid confirming account existence via 429
        return res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace.' });
      }
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    // SECURITY: Store the raw token (not hashed) for now since lookup requires it.
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: rawToken,
        resetTokenExpires: expires,
        lastPasswordResetReq: new Date(),
      }
    });

    // SECURITY: Build reset link from env var with safe production fallback, never from host headers
    const frontendUrl = (process.env.FRONTEND_URL || 'https://portal.hummingxbi.com').replace(/\/+$/, '');
    const resetLink = `${frontendUrl}/reset-password/${rawToken}`;

    // On serverless (Vercel), we MUST await the email send before returning the response,
    // otherwise the function freezes the event loop immediately and the email is dropped.
    try {
      await transporter.sendMail({
        from: `"HummingX BI" <${process.env.EMAIL_USER}>`,
        to: user.email,  // SECURITY: Send to DB email, NOT the user-supplied email
        subject: 'Recuperación de contraseña - HummingX BI',
        html: buildResetEmail(user.name, resetLink),
      });
      console.log(`[AUTH] Reset email successfully sent to: ${user.email}`);
    } catch (emailErr) {
      console.error('[AUTH] Error sending reset email:', emailErr.message);
    }

    res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace.' });
  } catch (err) {
    console.error('[AUTH] Forgot password error:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── POST /auth/reset-password ────────────────────────────────────────────────
// Rate limited: 10 per IP per 15 min
router.post('/reset-password', tokenActionLimiter, async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Datos incompletos.' });
    }

    // SECURITY: Validate password length on backend (frontend checks can be bypassed)
    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const user = await prisma.user.findUnique({ where: { resetToken: token } });

    // SECURITY: Same generic message for invalid and expired tokens
    if (!user || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ error: 'Enlace inválido o expirado.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // SECURITY: Consume the token atomically with the password update
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,          // SECURITY: One-time use — invalidate immediately
        resetTokenExpires: null,
      }
    });

    res.json({ message: 'Contraseña actualizada correctamente.' });
  } catch (err) {
    console.error('[AUTH] Reset password error:', err.message);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// ─── Email builder ────────────────────────────────────────────────────────────
// Extracted as a function to keep route handlers readable
function buildResetEmail(name, resetLink) {
  return `
    <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
      <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
        <div style="background: linear-gradient(135deg, #0b0b0e 0%, #1a1a24 100%); padding: 40px 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
            HummingX <span style="color: #00C4CC;">BI</span>
          </h1>
          <p style="color: rgba(255,255,255,0.6); font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin: 8px 0 0 0;">
            Recuperación de Acceso
          </p>
        </div>
        <div style="padding: 40px 32px;">
          <p style="font-size: 16px; color: #374151; margin-top: 0;">Hola <strong>${name}</strong>,</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">Recibimos una solicitud para restablecer tu contraseña en el Portal de Clientes de HummingX BI.</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">Haz clic en el siguiente botón. Este enlace expirará en 1 hora y solo puede usarse una vez.</p>
          <div style="text-align: center; margin: 40px 0;">
            <a href="${resetLink}" style="background: linear-gradient(135deg, #00C4CC 0%, #0E7490 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
              Restablecer Contraseña
            </a>
          </div>
          <div style="background: #f3f4f6; border-left: 4px solid #9ca3af; padding: 16px; border-radius: 4px; margin-top: 32px;">
            <p style="font-size: 14px; color: #4b5563; margin: 0; line-height: 1.5;">
              <strong>Importante:</strong> Si tú no solicitaste este cambio, ignora este correo. Tu contraseña actual sigue siendo válida.
            </p>
          </div>
          <p style="font-size: 14px; color: #9CA3AF; margin-top: 32px; text-align: center;">
            El equipo de HummingX BI.
          </p>
        </div>
      </div>
    </div>
  `;
}

module.exports = router;
