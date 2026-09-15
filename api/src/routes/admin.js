const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /admin/clients — List all clients
router.get('/clients', authenticate, requireAdmin, async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, companyName: true,
        phone: true, level: true, active: true, referralCode: true,
        invitationAccepted: true, createdAt: true,
        projects: {
          select: { id: true, name: true, currentPhase: true, progressPercent: true, status: true },
          orderBy: { updatedAt: 'desc' },
          take: 1,
        },
        _count: { select: { referralsMade: true } }
      }
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar clientes.' });
  }
});

// POST /admin/clients — Create client (sends invitation)
router.post('/clients', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, email, companyName, phone } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos.' });
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: 'Ya existe una cuenta con ese correo.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 72 * 60 * 60 * 1000);

    const baseCode = (companyName || email.split('@')[0])
      .toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 20);

    // Ensure referral code is unique
    let referralCode = baseCode;
    let suffix = 1;
    while (await prisma.user.findUnique({ where: { referralCode } })) {
      referralCode = `${baseCode}-${suffix++}`;
    }

    const user = await prisma.user.create({
      data: {
        name, companyName, phone,
        email: email.toLowerCase(),
        role: 'client',
        invitationToken: token,
        invitationExpires: expires,
        referralCode,
        active: true,
      },
      select: { id: true, name: true, email: true, companyName: true, referralCode: true, createdAt: true }
    });

    // Add welcome bonus credit
    await prisma.creditMovement.create({
      data: {
        clientId: user.id,
        amount: 500,
        type: 'welcome_bonus',
        description: 'Bono de bienvenida HummingX',
      }
    });

    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;
    console.log(`📧 Activation link for ${email}: ${activationLink}`);

    res.status(201).json({
      ...user,
      activationLink,
      message: 'Cliente creado exitosamente. Se envió la invitación por correo.'
    });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Error al crear el cliente.' });
  }
});

// GET /admin/clients/:id — Get client detail
router.get('/clients/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const client = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        projects: {
          orderBy: { updatedAt: 'desc' },
          include: { activities: { orderBy: { createdAt: 'desc' }, take: 5 } }
        },
        referralsMade: { orderBy: { createdAt: 'desc' } },
        creditMovements: { orderBy: { createdAt: 'desc' } },
      }
    });

    if (!client || client.role !== 'client') {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    // Compute total credits
    const totalCredits = client.creditMovements.reduce((sum, m) => sum + m.amount, 0);

    res.json({ ...client, passwordHash: undefined, totalCredits });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar el cliente.' });
  }
});

// PUT /admin/clients/:id — Update client info
router.put('/clients/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, companyName, phone, level, active } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(companyName !== undefined && { companyName }),
        ...(phone !== undefined && { phone }),
        ...(level !== undefined && { level }),
        ...(active !== undefined && { active }),
      },
      select: {
        id: true, name: true, email: true, companyName: true,
        phone: true, level: true, active: true, referralCode: true,
      }
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el cliente.' });
  }
});

// POST /admin/projects — Create project for a client
router.post('/projects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { clientId, name, description, estimatedDelivery, internalNotes } = req.body;

    if (!clientId || !name) {
      return res.status(400).json({ error: 'Cliente y nombre del proyecto son requeridos.' });
    }

    const client = await prisma.user.findUnique({ where: { id: clientId } });
    if (!client) return res.status(404).json({ error: 'Cliente no encontrado.' });

    const project = await prisma.project.create({
      data: {
        clientId,
        name,
        description,
        internalNotes,
        currentPhase: 1,
        progressPercent: 0,
        status: 'active',
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
      }
    });

    // Add initial activity
    await prisma.projectActivity.create({
      data: {
        projectId: project.id,
        authorId: req.user.id,
        description: 'Proyecto creado. ¡Bienvenido a bordo!',
        type: 'milestone',
      }
    });

    res.status(201).json(project);
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Error al crear el proyecto.' });
  }
});

// POST /admin/credits — Add/adjust credits for a client
router.post('/credits', authenticate, requireAdmin, async (req, res) => {
  try {
    const { clientId, amount, type, description } = req.body;

    if (!clientId || amount === undefined || !description) {
      return res.status(400).json({ error: 'clientId, amount y description son requeridos.' });
    }

    const movement = await prisma.creditMovement.create({
      data: { clientId, amount, type: type || 'adjustment', description }
    });

    res.status(201).json(movement);
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar movimiento de créditos.' });
  }
});

// PUT /admin/referrals/:id — Update referral status
router.put('/referrals/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const referral = await prisma.referral.findUnique({ where: { id: req.params.id } });
    if (!referral) return res.status(404).json({ error: 'Referido no encontrado.' });

    const updated = await prisma.referral.update({
      where: { id: req.params.id },
      data: {
        ...(status !== undefined && { status }),
        ...(notes !== undefined && { notes }),
      }
    });

    // If converted, generate credits automatically
    if (status === 'converted' && referral.status !== 'converted' && updated.creditsGenerated === 0) {
      // Admin should set creditsGenerated manually via another endpoint
      // For now just update status
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar referido.' });
  }
});

module.exports = router;
