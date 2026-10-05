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
          select: { id: true, clientId: true, name: true, currentPhase: true, progressPercent: true, status: true, estimatedDelivery: true, updatedAt: true, createdAt: true, designStatus: true },
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

    // Welcome bonus removed per user request

    if (projectName) {
      const project = await prisma.project.create({
        data: {
          clientId: user.id,
          name: projectName,
          currentPhase: 1,
          progressPercent: 10,
          status: 'active'
        }
      });
      await prisma.projectActivity.create({
        data: {
          projectId: project.id,
          authorId: req.user.id,
          description: '¡Bienvenido a bordo! Fase 1: Análisis iniciada. Recopilando requerimientos y objetivos del proyecto.',
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
            status: true, estimatedDelivery: true, createdAt: true, designStatus: true,
            quoteLink: true, contractLink: true, previewUrl: true,
            activities: { orderBy: { createdAt: 'desc' }, take: 10 },
            payments: {
              orderBy: { dueDate: 'asc' },
              select: {
                id: true,
                projectId: true,
                title: true,
                description: true,
                amount: true,
                status: true,
                dueDate: true,
                invoiceLink: true,
                receiptLink: true,
                createdAt: true
              }
            }
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
        progressPercent: 10,
        status: 'active',
        ...(estimatedDelivery && { estimatedDelivery: new Date(estimatedDelivery) }),
      }
    });

    // Add initial activity
    await prisma.projectActivity.create({
      data: {
        projectId: project.id,
        authorId: req.user.id,
        description: '¡Bienvenido a bordo! Fase 1: Análisis iniciada. Definiendo alcance y objetivos.',
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
    const { name, description, estimatedDelivery, currentPhase, progressPercent, quoteLink, contractLink, designLink, previewUrl, designStatus } = req.body;
    const existing = await prisma.project.findUnique({ 
      where: { id: req.params.id },
      include: { client: true }
    });
    
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
        ...(designStatus !== undefined && { designStatus }),
        ...(estimatedDelivery !== undefined && { estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : null }),
      }
    });

    if (designStatus === 'modifications_resolved' && existing && existing.designStatus === 'modifications_requested') {
      let emailSuccess = false;
      
      if (existing.client && existing.client.email) {
        const emailBody = `¡Hola <strong>${existing.client.name}</strong>!<br><br>Nuestro equipo ha actualizado los cambios que pediste. Ingresa a tu portal de HummingX BI para revisar la nueva versión de tu proyecto.`;
        try {
          await transporter.sendMail({
            from: `"HummingX BI" <${process.env.EMAIL_USER}>`,
            to: existing.client.email,
            subject: 'Actualización de tu proyecto (Cambios listos)',
            html: `
              <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
                <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
                  <div style="background: linear-gradient(135deg, #0b0b0e 0%, #1a1a24 100%); padding: 40px 20px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
                      HummingX <span style="color: #00C4CC;">BI</span>
                    </h1>
                  </div>
                  <div style="padding: 40px 32px;">
                    <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">${emailBody}</p>
                    <div style="text-align: center; margin: 40px 0;">
                      <a href="https://portal.hummingxbi.com" style="background: linear-gradient(135deg, #00C4CC 0%, #0E7490 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">
                        Ver mi Portal
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            `
          });
          console.log(`📧 Modifications resolved email sent to ${existing.client.email}`);
          emailSuccess = true;
        } catch (err) {
          console.error('Error sending modifications email:', err);
        }
      }

      await prisma.projectActivity.create({
        data: {
          projectId: req.params.id,
          authorId: req.user.id,
          description: 'El equipo resolvió las modificaciones solicitadas. La nueva versión del diseño está lista para su revisión.',
          type: 'update',
        }
      });
    }

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

      // Automated emails for phase changes (excluding phase 1)
      if (currentPhase > 1 && existing.client && existing.client.email) {
        let emailTitle = '';
        let emailBody = '';

        if (currentPhase === 2) {
          emailTitle = '¡Tu proyecto está cobrando vida visual!';
          emailBody = '¡Qué emoción! Acabamos de encender los motores y hemos entrado de lleno a la fase de <strong>Diseño UX/UI</strong>. En este momento, nuestros artistas digitales están moldeando la identidad visual y estructurando prototipos interactivos para que tu proyecto no solo funcione perfecto, sino que enamore a primera vista. Sumérgete en tu portal para seguir de cerca los primeros bocetos.';
        } else if (currentPhase === 3) {
          emailTitle = '¡Queremos escuchar tu voz: Tiempo de Revisión!';
          emailBody = 'Tu proyecto acaba de aterrizar en la fase de <strong>Revisión</strong>. Hemos preparado tus prototipos interactivos y ahora el escenario es tuyo. Tu retroalimentación es la pieza clave para asegurar que el resultado final sea exactamente como lo soñaste antes de pasar a la programación. ¡Entra al portal, explora los diseños y cuéntanos todo!';
        } else if (currentPhase === 4) {
          emailTitle = '¡Magia en progreso: Arranca el Desarrollo!';
          emailBody = '¡Prepárate para la acción! Tu proyecto ha pasado a la fase de <strong>Desarrollo</strong>. Nuestro equipo de ingenieros está escribiendo las líneas de código que convertirán tus diseños en una plataforma ágil, robusta y escalable. Podrás ver la evolución y el progreso técnico directamente desde tu portal de clientes.';
        } else if (currentPhase === 5) {
          emailTitle = '¡Ajusta tu cinturón: Fase de Lanzamiento!';
          emailBody = '¡Se respira pura emoción! Hemos llegado a la fase de <strong>Lanzamiento</strong>. Estamos afinando cada último detalle, ejecutando pruebas rigurosas de seguridad y preparando los servidores de producción para garantizar que tu gran despliegue sea absolutamente espectacular. ¡Ya casi lo logramos!';
        } else if (currentPhase === 6) {
          emailTitle = '¡Misión cumplida: Tu proyecto está 100% Activo!';
          emailBody = '¡Boom! Hemos cruzado la línea de meta. Tu proyecto ha finalizado al 100% y ahora se encuentra totalmente <strong>Activo</strong>. Ha sido un viaje increíble y estamos muy orgullosos del resultado. Ya puedes acceder a tu plataforma final y exprimir al máximo todas sus capacidades. ¡Gracias infinitas por confiar en la ingeniería de HummingX BI para hacer esto realidad!';
        }

        if (emailTitle && emailBody) {
          try {
            await transporter.sendMail({
              from: `"HummingX BI" <${process.env.EMAIL_USER}>`,
              to: existing.client.email,
              subject: emailTitle,
              html: `
                <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 40px 20px;">
                  <div style="background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
                    
                    <div style="background: linear-gradient(135deg, #0b0b0e 0%, #1a1a24 100%); padding: 40px 20px; text-align: center;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.02em;">
                        HummingX <span style="color: #00C4CC;">BI</span>
                      </h1>
                      <p style="color: rgba(255,255,255,0.6); font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; margin: 8px 0 0 0;">
                        Actualización de Proyecto
                      </p>
                    </div>
                    
                    <div style="padding: 40px 32px;">
                      <p style="font-size: 16px; color: #374151; margin-top: 0;">Hola <strong>${existing.client.name}</strong>,</p>
                      <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">${emailBody}</p>
                      
                      <div style="text-align: center; margin: 40px 0;">
                        <a href="https://portal.hummingxbi.com" style="background: linear-gradient(135deg, #00C4CC 0%, #0E7490 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 196, 204, 0.3);">
                          Ver mi Portal
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
            console.log(`📧 Phase update email sent successfully to ${existing.client.email}`);
          } catch (emailErr) {
            console.error('Error sending phase update email:', emailErr);
          }
        }
      }
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

// DELETE /admin/clients/:id — Delete a client and all associated resources
router.delete('/clients/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const client = await prisma.user.findUnique({ where: { id } });
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }
    if (client.role === 'admin') {
      return res.status(400).json({ error: 'No es posible eliminar a un usuario administrador.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Projects of this client
      const projects = await tx.project.findMany({ where: { clientId: id }, select: { id: true } });
      const projectIds = projects.map(p => p.id);

      // 2. Delete all activities authored by this client OR attached to client's projects
      await tx.projectActivity.deleteMany({
        where: {
          OR: [
            { authorId: id },
            ...(projectIds.length > 0 ? [{ projectId: { in: projectIds } }] : [])
          ]
        }
      });

      // 3. Delete payments and projects
      if (projectIds.length > 0) {
        await tx.payment.deleteMany({ where: { projectId: { in: projectIds } } });
        await tx.project.deleteMany({ where: { id: { in: projectIds } } });
      }

      // 4. Delete credit movements
      await tx.creditMovement.deleteMany({ where: { clientId: id } });

      // 5. Delete referrals
      await tx.referral.deleteMany({ where: { referrerId: id } });

      // 6. Delete user
      await tx.user.delete({ where: { id } });
    });

    res.json({ message: 'Cliente y datos asociados eliminados exitosamente.' });
  } catch (err) {
    console.error('Error al eliminar cliente:', err);
    res.status(500).json({ error: 'Error al eliminar cliente.', details: err.message });
  }
});

// POST /admin/purge-clients — Delete all clients (or test clients) leaving panel clean
router.post('/purge-clients', authenticate, requireAdmin, async (req, res) => {
  try {
    const { keepClientEmail } = req.body || {};

    const whereClause = {
      role: 'client',
      ...(keepClientEmail && { email: { not: keepClientEmail } })
    };

    const clients = await prisma.user.findMany({
      where: whereClause,
      select: { id: true }
    });

    const clientIds = clients.map(c => c.id);

    if (clientIds.length > 0) {
      await prisma.$transaction(async (tx) => {
        const projects = await tx.project.findMany({
          where: { clientId: { in: clientIds } },
          select: { id: true }
        });
        const projectIds = projects.map(p => p.id);

        await tx.projectActivity.deleteMany({
          where: {
            OR: [
              { authorId: { in: clientIds } },
              ...(projectIds.length > 0 ? [{ projectId: { in: projectIds } }] : [])
            ]
          }
        });

        if (projectIds.length > 0) {
          await tx.payment.deleteMany({ where: { projectId: { in: projectIds } } });
          await tx.project.deleteMany({ where: { id: { in: projectIds } } });
        }

        await tx.creditMovement.deleteMany({ where: { clientId: { in: clientIds } } });
        await tx.referral.deleteMany({ where: { referrerId: { in: clientIds } } });
        await tx.user.deleteMany({ where: { id: { in: clientIds } } });
      });
    }

    res.json({
      message: `Se han eliminado ${clientIds.length} clientes y sus datos asociados. Panel limpio.`,
      purgedCount: clientIds.length
    });
  } catch (err) {
    console.error('Error al purgar clientes:', err);
    res.status(500).json({ error: 'Error al purgar datos de clientes.', details: err.message });
  }
});

module.exports = router;
