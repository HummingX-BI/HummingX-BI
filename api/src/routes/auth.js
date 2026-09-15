const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user || !user.active) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    if (!user.passwordHash) {
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
        level: user.level,
        referralCode: user.referralCode,
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// GET /auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true, name: true, email: true, role: true,
        companyName: true, phone: true, level: true,
        referralCode: true, createdAt: true,
      }
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /auth/invite — Admin invites a new client
router.post('/invite', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acceso denegado.' });
    }

    const { name, email, companyName, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours

    // Generate referral code from company name
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

    // TODO: Send invitation email via Resend
    // For now, return the activation link in the response (dev mode)
    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;

    console.log(`📧 Invitation for ${email}: ${activationLink}`);

    res.status(201).json({
      message: 'Invitación creada exitosamente.',
      userId: user.id,
      activationLink, // Remove in production, send via email only
    });
  } catch (err) {
    console.error('Invite error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /auth/activate — Client sets their password
router.post('/activate', async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token y contraseña son requeridos.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres.' });
    }

    const user = await prisma.user.findUnique({ where: { invitationToken: token } });

    if (!user) {
      return res.status(400).json({ error: 'Enlace de activación inválido.' });
    }

    if (user.invitationExpires < new Date()) {
      return res.status(400).json({ error: 'El enlace de activación ha expirado. Solicita uno nuevo.' });
    }

    if (user.invitationAccepted) {
      return res.status(400).json({ error: 'Esta cuenta ya fue activada. Inicia sesión.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        invitationAccepted: true,
        invitationToken: null,
        invitationExpires: null,
      }
    });

    // Auto-login after activation
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
        level: user.level,
      }
    });
  } catch (err) {
    console.error('Activation error:', err);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email?.toLowerCase() } });

    // Always return success (don't reveal if email exists)
    if (!user) {
      return res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace de recuperación.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours

    await prisma.user.update({
      where: { id: user.id },
      data: { invitationToken: token, invitationExpires: expires, invitationAccepted: false }
    });

    const resetLink = `${process.env.FRONTEND_URL}/activate/${token}`;
    console.log(`🔑 Reset link for ${email}: ${resetLink}`);

    res.json({ message: 'Si existe una cuenta con ese correo, recibirás un enlace de recuperación.' });
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
});

module.exports = router;
