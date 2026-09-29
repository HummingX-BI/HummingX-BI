const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const prisma = require('../lib/prisma');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { adminLimiter, isValidEmail } = require('../middleware/security');

// Configuración de Nodemailer (Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const router = express.Router();

// GET /admin/clients — List all clients
router.get('/clients', authenticate, requireAdmin, adminLimiter, async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, companyName: true, logoUrl: true,
        phone: true, level: true, active: true, referralCode: true,
        invitationAccepted: true, createdAt: true,
        projects: {
          select: { id: true, clientId: true, name: true, currentPhase: true, progressPercent: true, status: true, estimatedDelivery: true, updatedAt: true, createdAt: true },
          orderBy: { updatedAt: 'desc' },
        },
        _count: { select: { referralsMade: true } },
        creditMovements: { select: { amount: true } }
      }
    });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar clientes.' });
  }
});

// POST /admin/clients — Create client (sends invitation)
router.post('/clients', authenticate, requireAdmin, adminLimiter, async (req, res) => {
  try {
    const { name, email, companyName, logoUrl, phone, projectName } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Nombre y email son requeridos.' });
    }

    // SECURITY: Validate email format before hitting DB or sending email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido.' });
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
        name, companyName, logoUrl, phone,
        email: email.toLowerCase(),
        role: 'client',
        invitationToken: token,
        invitationExpires: expires,
        referralCode,
        active: true,
      },
      select: { id: true, name: true, email: true, companyName: true, logoUrl: true, referralCode: true, createdAt: true }
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

    if (projectName) {
      const project = await prisma.project.create({
        data: {
          clientId: user.id,
          name: projectName,
          currentPhase: 1,
          progressPercent: 0,
          status: 'active'
        }
      });
      await prisma.projectActivity.create({
        data: {
          projectId: project.id,
          authorId: req.user.id,
          description: 'Proyecto creado. ¡Bienvenido a bordo!',
          type: 'milestone'
        }
      });
    }

    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;
    
    // Send Email
    let emailSent = true;
    try {
      await transporter.sendMail({
        from: `"HummingX BI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: '¡Bienvenido a HummingX BI! Activa tu cuenta',
        html: `
          <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
            <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
              
              <div style="background: linear-gradient(135deg, #0b0b0e 0%, #1a1a24 100%); padding: 40px 20px; text-align: center;">
                <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
                  HummingX <span style="color: #00C4CC;">BI</span>
                </h1>
                <p style="color: rgba(255,255,255,0.6); font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin: 8px 0 0 0;">
                  Portal de Clientes
                </p>
              </div>
              
              <div style="padding: 40px 32px;">
                <p style="font-size: 16px; color: #374151; margin-top: 0;">Hola <strong>${name}</strong>,</p>
                <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">Nos emociona anunciarte que se ha creado tu cuenta en nuestro <strong>Portal de Clientes Exclusivo</strong>. Aquí podrás revisar el progreso de tus proyectos en tiempo real, ver la bitácora de desarrollo y acceder a tus entregables.</p>
                <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">Haz clic en el siguiente botón para establecer tu contraseña y activar tu cuenta:</p>
                
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${activationLink}" style="background: linear-gradient(135deg, #00C4CC 0%, #0E7490 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 196, 204, 0.3);">
                    Activar mi Portal
                  </a>
                </div>
                
                <p style="font-size: 14px; color: #9CA3AF; margin-top: 32px; text-align: center;">
                  El equipo de HummingX BI.
                </p>
              </div>
            </div>
          </div>
        `
      });
      console.log(`📧 Email sent successfully to ${email}`);
    } catch (emailErr) {
      console.error('Error sending email:', emailErr);
      emailSent = false;
    }

    res.status(201).json({
      ...user,
      // SECURITY FIX: Never expose activation link in API response (it's sent by email only)
      // In dev/staging, include it for testing convenience
      ...(process.env.NODE_ENV !== 'production' && { activationLink }),
      message: emailSent ? 'Cliente creado exitosamente. Se envió la invitación por correo.' : 'Cliente creado, pero hubo un error enviando el correo.'
    });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ error: 'Error al crear el cliente.' });
  }
});

// GET /admin/clients/:id — Get client detail
router.get('/clients/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    // SECURITY: Explicitly select fields to return — never include passwordHash
    const client = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true, name: true, email: true, companyName: true, logoUrl: true,
        phone: true, level: true, active: true, referralCode: true,
        invitationAccepted: true, createdAt: true, role: true,
        projects: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true, name: true, currentPhase: true, progressPercent: true,
            status: true, estimatedDelivery: true, createdAt: true,
            activities: { orderBy: { createdAt: 'desc' }, take: 5 }
          }
        },
        referralsMade: { orderBy: { createdAt: 'desc' }, select: { id: true, companyName: true, status: true, createdAt: true } },
        creditMovements: { orderBy: { createdAt: 'desc' }, select: { id: true, amount: true, type: true, description: true, createdAt: true } },
      }
    });

    if (!client || client.role !== 'client') {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    // Compute total credits
    const totalCredits = client.creditMovements.reduce((sum, m) => sum + m.amount, 0);
    // SECURITY: No need to strip passwordHash — using select: {} above never fetches it
    res.json({ ...client, totalCredits });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar el cliente.' });
  }
});

// PUT /admin/clients/:id — Update client info
router.put('/clients/:id', authenticate, requireAdmin, adminLimiter, async (req, res) => {
  try {
    // SECURITY: Explicit allow-list — only these fields can be updated.
    // This prevents mass-assignment if new fields are added to the User model later.
    const { name, companyName, logoUrl, phone, level, active } = req.body;

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(companyName !== undefined && { companyName }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(phone !== undefined && { phone }),
        ...(level !== undefined && { level }),
        ...(active !== undefined && { active }),
      },
      select: {
        id: true, name: true, email: true, companyName: true, logoUrl: true,
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

// PUT /admin/projects/:id — Update project
router.put('/projects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description, estimatedDelivery, currentPhase, progressPercent, quoteLink, contractLink, designLink, previewUrl } = req.body;
    const existing = await prisma.project.findUnique({ where: { id: req.params.id } });
    
    const updated = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(currentPhase !== undefined && { currentPhase }),
        ...(progressPercent !== undefined && { progressPercent }),
        ...(quoteLink !== undefined && { quoteLink }),
        ...(contractLink !== undefined && { contractLink }),
        ...(designLink !== undefined && { designLink }),
        ...(previewUrl !== undefined && { previewUrl }),
        ...(estimatedDelivery !== undefined && { estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null }),
      }
    });

    if (currentPhase !== undefined && existing && existing.currentPhase !== currentPhase) {
      const phaseNames = { 1: 'Análisis', 2: 'Diseño', 3: 'Revisión', 4: 'Desarrollo', 5: 'Lanzamiento', 6: 'Activo' };
      const phaseName = phaseNames[currentPhase] || currentPhase;
      await prisma.projectActivity.create({
        data: {
          projectId: req.params.id,
          authorId: req.user.id,
          description: `La fase del proyecto cambió a ${phaseName}`,
          type: 'milestone',
        }
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar proyecto.' });
  }
});

// POST /admin/projects/:id/activities — Add activity
router.post('/projects/:id/activities', authenticate, requireAdmin, async (req, res) => {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: 'Descripción es requerida' });

    const activity = await prisma.projectActivity.create({
      data: {
        projectId: req.params.id,
        authorId: req.user.id,
        description,
        type: 'update'
      }
    });

    res.status(201).json(activity);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear actividad' });
  }
});

// DELETE /admin/projects/:projectId/activities/:id — Delete activity
router.delete('/projects/:projectId/activities/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.projectActivity.delete({
      where: { id: req.params.id }
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar actividad' });
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
      const creditAmount = 1500; // Fixed amount for referrals
      
      await prisma.$transaction([
        // Add credits to the user's total
        prisma.user.update({
          where: { id: referral.referrerId },
          data: { totalCredits: { increment: creditAmount } }
        }),
        // Register the movement
        prisma.creditMovement.create({
          data: {
            clientId: referral.referrerId,
            amount: creditAmount,
            type: 'earned',
            description: `Bono por recomendación exitosa: ${referral.companyName}`
          }
        }),
        // Mark referral as credits generated
        prisma.referral.update({
          where: { id: referral.id },
          data: { creditsGenerated: creditAmount }
        })
      ]);
      
      updated.creditsGenerated = creditAmount;
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar referido.' });
  }
});

module.exports = router;
