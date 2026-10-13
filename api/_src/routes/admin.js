const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
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
        invitationAccepted: true, createdAt: true, activatedAt: true,
        loginCount: true, lastLoginAt: true,
        projects: {
          select: { id: true, clientId: true, name: true, currentPhase: true, progressPercent: true, status: true, estimatedDelivery: true, updatedAt: true, createdAt: true, designStatus: true },
          orderBy: { updatedAt: 'desc' },
        },
        _count: { select: { referralsMade: true } },
        creditMovements: { select: { amount: true } },
        totalTimeSpent: true,
        loginEvents: { select: { createdAt: true } },
        pageViews: { select: { path: true, createdAt: true } }
      }
    });
    res.json(clients);
  } catch (err) {
    console.error('Error in /admin/clients:', err);
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
        invitationAccepted: true, createdAt: true, activatedAt: true, role: true,
        loginCount: true, lastLoginAt: true, totalTimeSpent: true,
        pageViews: { orderBy: { createdAt: 'desc' }, take: 50 },
        loginEvents: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        projects: {
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true, name: true, currentPhase: true, progressPercent: true,
            status: true, estimatedDelivery: true, createdAt: true, designStatus: true,
            quoteLink: true, contractLink: true, previewUrl: true,
            activities: { orderBy: { createdAt: 'desc' }, take: 50 },
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
        referralsMade: { 
          orderBy: { createdAt: 'desc' }, 
          select: { 
            id: true, 
            companyName: true, 
            contactName: true, 
            contactEmail: true, 
            contactPhone: true, 
            status: true, 
            creditsGenerated: true, 
            notes: true, 
            createdAt: true 
          } 
        },
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

// PUT /admin/clients/:id/suspend — Suspend or reactivate client access
router.put('/clients/:id/suspend', authenticate, requireAdmin, async (req, res) => {
  try {
    const { active } = req.body;
    const updatedUser = await prisma.user.update({
      where: { id: req.params.id },
      data: { active }
    });
    res.json({ success: true, active: updatedUser.active });
  } catch (err) {
    console.error('Error toggling suspension:', err);
    res.status(500).json({ error: 'Error al cambiar estado' });
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

// POST /admin/clients/:id/resend-invitation — Resend invitation
router.post('/clients/:id/resend-invitation', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const client = await prisma.user.findUnique({ where: { id } });
    
    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }
    
    if (client.invitationAccepted) {
      return res.status(400).json({ error: 'El cliente ya activó su cuenta.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 72 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id },
      data: {
        invitationToken: token,
        invitationExpires: expires,
      }
    });

    const activationLink = `${process.env.FRONTEND_URL}/activate/${token}`;
    
    // Send Email
    let emailSent = true;
    try {
      await transporter.sendMail({
        from: `"HummingX BI" <${process.env.EMAIL_USER}>`,
        to: client.email,
        subject: '¡Recordatorio: Activa tu cuenta en HummingX BI!',
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
                <p style="font-size: 16px; color: #374151; margin-top: 0;">Hola <strong>${client.name}</strong>,</p>
                <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">Te recordamos que se ha creado tu cuenta en nuestro <strong>Portal de Clientes Exclusivo</strong>. Aquí podrás revisar el progreso de tus proyectos en tiempo real.</p>
                <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">Tu invitación anterior ha expirado o está pendiente de ser aceptada. Haz clic en el siguiente botón para establecer tu contraseña y activar tu cuenta:</p>
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
      console.log(`📧 Resend email sent successfully to ${client.email}`);
    } catch (emailErr) {
      console.error('Error sending resend email:', emailErr);
      emailSent = false;
    }

    res.json({
      message: emailSent ? 'Invitación reenviada exitosamente.' : 'El enlace fue generado, pero hubo un error enviando el correo.'
    });
  } catch (err) {
    console.error('Resend invitation error:', err);
    res.status(500).json({ error: 'Error al reenviar la invitación.' });
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
      const creditAmount = req.body.creditAmount ? parseInt(req.body.creditAmount) : 1500; // Fixed or custom amount
      
      await prisma.$transaction([
        // Register the credit movement
        prisma.creditMovement.create({
          data: {
            clientId: referral.referrerId,
            amount: creditAmount,
            type: 'referral_converted',
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
    console.error('[ADMIN] Error al actualizar referido:', err);
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

// POST /admin/impersonate/:clientId — Impersonate a client user (admin only)
router.post('/impersonate/:clientId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { clientId } = req.params;
    const client = await prisma.user.findUnique({
      where: { id: clientId }
    });

    if (!client) {
      return res.status(404).json({ error: 'Cliente no encontrado.' });
    }

    if (client.role !== 'client') {
      return res.status(400).json({ error: 'Solo se puede visualizar el portal de usuarios con rol cliente.' });
    }

    const token = jwt.sign(
      { id: client.id, email: client.email, role: client.role, impersonatedBy: req.user.id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        id: client.id,
        name: client.name,
        email: client.email,
        role: client.role,
        companyName: client.companyName,
        logoUrl: client.logoUrl,
        level: client.level,
        referralCode: client.referralCode,
      }
    });
  } catch (err) {
    console.error('Error al impersonar cliente:', err);
    res.status(500).json({ error: 'Error al iniciar sesión como cliente.' });
  }
});

// --- ANALYTICS ENDPOINTS ---

router.get('/analytics/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    const range = parseInt(req.query.range || '30', 10);
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - range);

    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: {
        id: true, invitationAccepted: true, activatedAt: true, lastLoginAt: true, totalTimeSpent: true, loginCount: true, createdAt: true,
        loginEvents: {
          where: { createdAt: { gte: dateLimit } },
          select: { createdAt: true }
        },
        projects: {
          select: { status: true, currentPhase: true, estimatedDelivery: true, designStatus: true }
        }
      }
    });

    const activeProjects = clients.flatMap(c => c.projects).filter(p => p.status === 'active' && p.currentPhase < 6);
    const totalClients = clients.length;
    const activatedClients = clients.filter(c => c.invitationAccepted).length;
    const pendingClients = totalClients - activatedClients;
    const active7d = clients.filter(c => c.lastLoginAt && (new Date() - new Date(c.lastLoginAt)) / (1000 * 60 * 60 * 24) <= 7).length;
    const avgTime = activatedClients > 0 ? Math.round((clients.reduce((acc, c) => acc + c.totalTimeSpent, 0) / activatedClients) / 60) : 0;
    
    const overdueProjects = activeProjects.filter(p => p.estimatedDelivery && new Date(p.estimatedDelivery) < new Date()).length;

    // Login events per day
    const loginsPerDayMap = {};
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      loginsPerDayMap[d.toISOString().split('T')[0]] = 0;
    }

    clients.forEach(c => {
      c.loginEvents.forEach(evt => {
        const dateStr = new Date(evt.createdAt).toISOString().split('T')[0];
        if (loginsPerDayMap[dateStr] !== undefined) {
          loginsPerDayMap[dateStr]++;
        }
      });
    });

    const loginsChartData = Object.entries(loginsPerDayMap).map(([date, count]) => {
      const d = new Date(date);
      // add timezone offset to avoid previous day bug
      d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
      return {
        date: d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        accesos: count
      };
    });

    res.json({
      kpis: { totalClients, activatedClients, pendingClients, active7d, avgTime, overdueProjects },
      funnel: { invited: totalClients, activated: activatedClients, returned: clients.filter(c => c.loginCount > 1).length, active7d },
      loginsChartData,
      alerts: {
        unactivated3d: clients.filter(c => !c.invitationAccepted && (new Date() - new Date(c.createdAt)) / (1000 * 60 * 60 * 24) > 3).length,
        inactive14d: clients.filter(c => c.invitationAccepted && c.lastLoginAt && (new Date() - new Date(c.lastLoginAt)) / (1000 * 60 * 60 * 24) > 14).length,
        stuckProjects: activeProjects.filter(p => p.currentPhase === 3).length
      }
    });
  } catch (err) {
    console.error('Analytics overview error:', err);
    res.status(500).json({ error: 'Error loading overview' });
  }
});

router.get('/analytics/projects', authenticate, requireAdmin, async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'client' },
      select: {
        id: true, companyName: true, name: true,
        projects: {
          where: { status: 'active', currentPhase: { lt: 6 } },
          select: { id: true, name: true, currentPhase: true, progressPercent: true, estimatedDelivery: true, createdAt: true, updatedAt: true, designStatus: true }
        }
      }
    });
    const activeProjects = clients.flatMap(c => c.projects.map(p => ({ ...p, clientId: c.id, clientName: c.companyName || c.name })));
    res.json(activeProjects);
  } catch (err) {
    res.status(500).json({ error: 'Error loading projects analytics' });
  }
});

router.get('/analytics/behavior', authenticate, requireAdmin, async (req, res) => {
  try {
    const range = parseInt(req.query.range || '30', 10);
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - range);

    const users = await prisma.user.findMany({
      where: { role: 'client', invitationAccepted: true },
      select: {
        id: true, name: true, companyName: true, totalTimeSpent: true, loginCount: true, activatedAt: true,
        pageViews: { where: { createdAt: { gte: dateLimit } }, select: { path: true } },
        loginEvents: { where: { createdAt: { gte: dateLimit } }, select: { deviceType: true, createdAt: true } }
      }
    });

    const sectionCounts = { 'Inicio': 0, 'Mi Proyecto': 0, 'Plan de Pagos': 0, 'Mis Referidos': 0, 'Soporte': 0 };
    const deviceCounts = { desktop: 0, mobile: 0, unknown: 0 };
    const heatmap = Array(7).fill().map(() => Array(24).fill(0));
    let retained = 0;
    
    users.forEach(u => {
      u.pageViews.forEach(pv => {
        let section = 'Otro';
        if (pv.path === '/dashboard' || pv.path === '/') section = 'Inicio';
        else if (pv.path.includes('/project')) section = 'Mi Proyecto';
        else if (pv.path.includes('/pagos')) section = 'Plan de Pagos';
        else if (pv.path.includes('/referrals')) section = 'Mis Referidos';
        else if (pv.path.includes('/support')) section = 'Soporte';
        
        if (section !== 'Otro') {
          sectionCounts[section] = (sectionCounts[section] || 0) + 1;
        }
      });

      u.loginEvents.forEach(evt => {
        const type = evt.deviceType ? evt.deviceType.toLowerCase() : 'unknown';
        if (type.includes('mobile')) deviceCounts.mobile++;
        else if (type.includes('desktop') || type.includes('mac') || type.includes('windows')) deviceCounts.desktop++;
        else deviceCounts.desktop++; // fallback to desktop for unknown if mostly web

        const d = new Date(evt.createdAt);
        heatmap[d.getDay()][d.getHours()]++;
      });

      if (u.activatedAt && u.loginEvents.length > 0) {
        const act = new Date(u.activatedAt);
        const hasLoginAfter7d = u.loginEvents.some(evt => (new Date(evt.createdAt) - act) / (1000 * 60 * 60 * 24) >= 7);
        if (hasLoginAfter7d) retained++;
      }
    });

    const sections = Object.entries(sectionCounts).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
    const ranking = users.map(u => ({
      id: u.id, name: u.companyName || u.name, time: u.totalTimeSpent, logins: u.loginCount
    })).sort((a,b) => b.time - a.time);

    res.json({
      sections,
      devices: [
        { name: 'Escritorio', count: deviceCounts.desktop },
        { name: 'Móvil', count: deviceCounts.mobile }
      ].filter(d => d.count > 0),
      heatmap,
      retention: users.length ? Math.round((retained / users.length) * 100) : 0,
      ranking: ranking.slice(0, 10)
    });
  } catch (err) {
    res.status(500).json({ error: 'Error loading behavior analytics' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ─── HUMMINGX CORE: PROSPECTOS & DOCUMENTOS VERSIONADOS ───────────
// ═══════════════════════════════════════════════════════════════════

// GET /admin/prospects — List all prospects with documents and appointments
router.get('/prospects', authenticate, requireAdmin, async (req, res) => {
  try {
    const prospects = await prisma.prospect.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { dateTime: 'desc' } },
      },
    });
    res.json(prospects);
  } catch (err) {
    console.error('[ADMIN] Error in GET /admin/prospects:', err);
    res.status(500).json({ error: 'Error al cargar prospectos.' });
  }
});

// POST /admin/prospects — Create new prospect
router.post('/prospects', authenticate, requireAdmin, async (req, res) => {
  try {
    const { companyName, contactName, email, phone, industry, estimatedValue, status, source, notes } = req.body;
    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ error: 'El nombre de la empresa es requerido.' });
    }

    const prospect = await prisma.prospect.create({
      data: {
        companyName: companyName.trim(),
        contactName: contactName?.trim() || null,
        email: email?.trim().toLowerCase() || null,
        phone: phone?.trim() || null,
        industry: industry?.trim() || null,
        estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null,
        status: status || 'lead',
        source: source?.trim() || 'Prospección directa',
        notes: notes?.trim() || null,
      },
      include: {
        documents: true,
        appointments: true,
      }
    });
    res.status(201).json(prospect);
  } catch (err) {
    console.error('[ADMIN] Error in POST /admin/prospects:', err);
    res.status(500).json({ error: 'Error al crear prospecto.' });
  }
});

// PUT /admin/prospects/:id — Update prospect
router.put('/prospects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { companyName, contactName, email, phone, industry, estimatedValue, status, source, notes } = req.body;

    const prospect = await prisma.prospect.update({
      where: { id: req.params.id },
      data: {
        ...(companyName !== undefined && { companyName: companyName.trim() }),
        ...(contactName !== undefined && { contactName: contactName ? contactName.trim() : null }),
        ...(email !== undefined && { email: email ? email.trim().toLowerCase() : null }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
        ...(industry !== undefined && { industry: industry ? industry.trim() : null }),
        ...(estimatedValue !== undefined && { estimatedValue: estimatedValue ? parseFloat(estimatedValue) : null }),
        ...(status !== undefined && { status }),
        ...(source !== undefined && { source: source ? source.trim() : null }),
        ...(notes !== undefined && { notes: notes ? notes.trim() : null }),
      },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        appointments: { orderBy: { dateTime: 'desc' } },
      }
    });
    res.json(prospect);
  } catch (err) {
    console.error('[ADMIN] Error in PUT /admin/prospects/:id:', err);
    res.status(500).json({ error: 'Error al actualizar prospecto.' });
  }
});

// DELETE /admin/prospects/:id — Delete prospect
router.delete('/prospects/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.prospect.delete({ where: { id: req.params.id } });
    res.json({ message: 'Prospecto eliminado exitosamente.' });
  } catch (err) {
    console.error('[ADMIN] Error in DELETE /admin/prospects/:id:', err);
    res.status(500).json({ error: 'Error al eliminar prospecto.' });
  }
});

// POST /admin/prospects/:id/documents — Add document with version
router.post('/prospects/:id/documents', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, type, version, url, notes } = req.body;
    if (!title || !url) {
      return res.status(400).json({ error: 'El título y enlace del documento son requeridos.' });
    }

    const doc = await prisma.prospectDocument.create({
      data: {
        prospectId: req.params.id,
        title: title.trim(),
        type: type || 'quote',
        version: version?.trim() || 'v1.0',
        url: url.trim(),
        notes: notes?.trim() || null,
      }
    });
    res.status(201).json(doc);
  } catch (err) {
    console.error('[ADMIN] Error in POST /admin/prospects/:id/documents:', err);
    res.status(500).json({ error: 'Error al registrar documento.' });
  }
});

// DELETE /admin/prospects/:id/documents/:docId — Delete document
router.delete('/prospects/:id/documents/:docId', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.prospectDocument.delete({ where: { id: req.params.docId } });
    res.json({ message: 'Documento eliminado.' });
  } catch (err) {
    console.error('[ADMIN] Error in DELETE document:', err);
    res.status(500).json({ error: 'Error al eliminar documento.' });
  }
});

// POST /admin/prospects/:id/convert — 1-Click Convert prospect to active client
router.post('/prospects/:id/convert', authenticate, requireAdmin, async (req, res) => {
  try {
    const prospect = await prisma.prospect.findUnique({ where: { id: req.params.id } });
    if (!prospect) return res.status(404).json({ error: 'Prospecto no encontrado.' });

    const cleanBase = prospect.companyName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'cliente';
    const email = (prospect.email || `${cleanBase}@cliente.com`).toLowerCase();
    const name = prospect.contactName || prospect.companyName;
    const companyName = prospect.companyName;

    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 72 * 60 * 60 * 1000);
      const baseCode = cleanBase;
      let referralCode = baseCode;
      let suffix = 1;
      while (await prisma.user.findUnique({ where: { referralCode } })) {
        referralCode = `${baseCode}-${suffix++}`;
      }

      user = await prisma.user.create({
        data: {
          name,
          email,
          companyName,
          phone: prospect.phone,
          role: 'client',
          invitationToken: token,
          invitationExpires: expires,
          referralCode,
          active: true,
        }
      });
    }

    // Create initial project
    let project = await prisma.project.findFirst({ where: { clientId: user.id } });
    if (!project) {
      project = await prisma.project.create({
        data: {
          clientId: user.id,
          name: `Proyecto ${companyName}`,
          description: `Solución de ingeniería para ${companyName}. Formalizado desde pipeline comercial.`,
          currentPhase: 1,
          progressPercent: 10,
          status: 'active',
        }
      });
    }

    // Update prospect
    const updatedProspect = await prisma.prospect.update({
      where: { id: prospect.id },
      data: {
        status: 'won',
        convertedToClientId: user.id,
      },
      include: {
        documents: true,
        appointments: true,
      }
    });

    res.json({
      prospect: updatedProspect,
      client: user,
      project,
    });
  } catch (err) {
    console.error('[ADMIN] Error in convert prospect:', err);
    res.status(500).json({ error: 'Error al convertir prospecto a cliente.' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ─── HUMMINGX CORE: CITAS Y VISITAS PRESENCIALES ──────────────────
// ═══════════════════════════════════════════════════════════════════

// GET /admin/appointments — List all appointments
router.get('/appointments', authenticate, requireAdmin, async (req, res) => {
  try {
    const { assignedTo, status } = req.query;
    const where = {};
    if (assignedTo && assignedTo !== 'all') where.assignedTo = assignedTo;
    if (status && status !== 'all') where.status = status;

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { dateTime: 'asc' },
      include: {
        prospect: { select: { id: true, companyName: true, contactName: true, phone: true } },
      }
    });
    res.json(appointments);
  } catch (err) {
    console.error('[ADMIN] Error in GET /admin/appointments:', err);
    res.status(500).json({ error: 'Error al cargar citas.' });
  }
});

// POST /admin/appointments — Create appointment
router.post('/appointments', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, companyName, contactName, contactPhone, dateTime, location, mapsUrl, assignedTo, summary, prospectId } = req.body;

    if (!title || !companyName || !dateTime || !location) {
      return res.status(400).json({ error: 'Título, empresa, fecha/hora y ubicación son requeridos.' });
    }

    // Auto-generate Google Maps URL if not provided
    const cleanMapsUrl = mapsUrl?.trim() || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;

    const appointment = await prisma.appointment.create({
      data: {
        title: title.trim(),
        companyName: companyName.trim(),
        contactName: contactName?.trim() || null,
        contactPhone: contactPhone?.trim() || null,
        dateTime: new Date(dateTime),
        location: location.trim(),
        mapsUrl: cleanMapsUrl,
        assignedTo: assignedTo || 'emmanuel',
        status: 'scheduled',
        summary: summary?.trim() || null,
        prospectId: prospectId || null,
      },
      include: {
        prospect: true,
      }
    });
    res.status(201).json(appointment);
  } catch (err) {
    console.error('[ADMIN] Error in POST /admin/appointments:', err);
    res.status(500).json({ error: 'Error al registrar cita.' });
  }
});

// PUT /admin/appointments/:id — Update appointment
router.put('/admin/appointments/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, companyName, contactName, contactPhone, dateTime, location, mapsUrl, assignedTo, status, summary, prospectId } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(companyName !== undefined && { companyName: companyName.trim() }),
        ...(contactName !== undefined && { contactName: contactName ? contactName.trim() : null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone ? contactPhone.trim() : null }),
        ...(dateTime !== undefined && { dateTime: new Date(dateTime) }),
        ...(location !== undefined && { location: location.trim() }),
        ...(mapsUrl !== undefined && { mapsUrl: mapsUrl.trim() }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(status !== undefined && { status }),
        ...(summary !== undefined && { summary: summary ? summary.trim() : null }),
        ...(prospectId !== undefined && { prospectId: prospectId || null }),
      },
      include: {
        prospect: true,
      }
    });
    res.json(appointment);
  } catch (err) {
    console.error('[ADMIN] Error in PUT /admin/appointments/:id:', err);
    res.status(500).json({ error: 'Error al actualizar cita.' });
  }
});

// Also support router.put('/appointments/:id')
router.put('/appointments/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, companyName, contactName, contactPhone, dateTime, location, mapsUrl, assignedTo, status, summary, prospectId } = req.body;

    const appointment = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(companyName !== undefined && { companyName: companyName.trim() }),
        ...(contactName !== undefined && { contactName: contactName ? contactName.trim() : null }),
        ...(contactPhone !== undefined && { contactPhone: contactPhone ? contactPhone.trim() : null }),
        ...(dateTime !== undefined && { dateTime: new Date(dateTime) }),
        ...(location !== undefined && { location: location.trim() }),
        ...(mapsUrl !== undefined && { mapsUrl: mapsUrl.trim() }),
        ...(assignedTo !== undefined && { assignedTo }),
        ...(status !== undefined && { status }),
        ...(summary !== undefined && { summary: summary ? summary.trim() : null }),
        ...(prospectId !== undefined && { prospectId: prospectId || null }),
      },
      include: {
        prospect: true,
      }
    });
    res.json(appointment);
  } catch (err) {
    console.error('[ADMIN] Error in PUT /appointments/:id:', err);
    res.status(500).json({ error: 'Error al actualizar cita.' });
  }
});

// DELETE /admin/appointments/:id — Delete appointment
router.delete('/appointments/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.appointment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Cita eliminada.' });
  } catch (err) {
    console.error('[ADMIN] Error in DELETE /admin/appointments/:id:', err);
    res.status(500).json({ error: 'Error al eliminar cita.' });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ─── HUMMINGX CORE: TAREAS PENDIENTES DEL EQUIPO ──────────────────
// ═══════════════════════════════════════════════════════════════════

// GET /admin/tasks — List all tasks
router.get('/tasks', authenticate, requireAdmin, async (req, res) => {
  try {
    const tasks = await prisma.teamTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    console.error('[ADMIN] Error in GET /admin/tasks:', err);
    res.status(500).json({ error: 'Error al cargar tareas.' });
  }
});

// POST /admin/tasks — Create task
router.post('/tasks', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, category, dueDate, checklist } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'El título de la tarea es requerido.' });
    }

    const task = await prisma.teamTask.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        assignedTo: assignedTo || 'all',
        priority: priority || 'medium',
        status: status || 'todo',
        category: category?.trim() || 'General',
        dueDate: dueDate ? new Date(dueDate) : null,
        checklist: checklist || null,
      }
    });
    res.status(201).json(task);
  } catch (err) {
    console.error('[ADMIN] Error in POST /admin/tasks:', err);
    res.status(500).json({ error: 'Error al crear tarea.' });
  }
});

// PUT /admin/tasks/:id — Update task (status, assignedTo, priority, checklist)
router.put('/tasks/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, assignedTo, priority, status, category, dueDate, checklist } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description ? description.trim() : null;
    if (assignedTo !== undefined) data.assignedTo = assignedTo;
    if (priority !== undefined) data.priority = priority;
    if (category !== undefined) data.category = category ? category.trim() : null;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;
    if (checklist !== undefined) data.checklist = checklist;

    if (status !== undefined) {
      data.status = status;
      if (status === 'done') {
        data.completedAt = new Date();
      } else {
        data.completedAt = null;
      }
    }

    const task = await prisma.teamTask.update({
      where: { id: req.params.id },
      data,
    });
    res.json(task);
  } catch (err) {
    console.error('[ADMIN] Error in PUT /admin/tasks/:id:', err);
    res.status(500).json({ error: 'Error al actualizar tarea.' });
  }
});

// DELETE /admin/tasks/:id — Delete task
router.delete('/tasks/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.teamTask.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tarea eliminada.' });
  } catch (err) {
    console.error('[ADMIN] Error in DELETE /admin/tasks/:id:', err);
    res.status(500).json({ error: 'Error al eliminar tarea.' });
  }
});

// ─── HUMMINGX CORE: ANÁLISIS FINANCIERO & PROYECTOS HISTÓRICOS ──

// GET /admin/finances/overview — Retorna total histórico, próximo pago y lista de proyectos
router.get('/finances/overview', authenticate, requireAdmin, async (req, res) => {
  try {
    // 1. Pagos del sistema
    const completedPayments = await prisma.payment.findMany({
      where: { status: 'completed' },
      include: {
        project: {
          include: {
            client: { select: { id: true, name: true, companyName: true, logoUrl: true } }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    const upcomingPayments = await prisma.payment.findMany({
      where: { status: { in: ['pending', 'upcoming'] } },
      include: {
        project: {
          include: {
            client: { select: { id: true, name: true, companyName: true, logoUrl: true } }
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // 2. Proyectos históricos cerrados
    const historicalDeals = await prisma.historicalDeal.findMany({
      orderBy: { closedAt: 'desc' }
    });

    // Cálculos
    const revenueFromPayments = completedPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueFromHistorical = historicalDeals.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalHistoricalRevenue = revenueFromPayments + revenueFromHistorical;

    const totalUpcomingRevenue = upcomingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const totalDealsCount = historicalDeals.length + completedPayments.length;
    const averageTicket = totalDealsCount > 0 ? Math.round(totalHistoricalRevenue / totalDealsCount) : 0;

    const nextPayment = upcomingPayments.length > 0 ? upcomingPayments[0] : null;

    res.json({
      totalHistoricalRevenue,
      revenueFromPayments,
      revenueFromHistorical,
      totalUpcomingRevenue,
      totalDealsCount,
      averageTicket,
      nextPayment,
      upcomingPayments,
      completedPayments,
      historicalDeals,
    });
  } catch (err) {
    console.error('[ADMIN] Error in GET /admin/finances/overview:', err);
    res.status(500).json({ error: 'Error al cargar análisis financiero.' });
  }
});

// POST /admin/finances/deals — Agregar proyecto histórico cerrado
router.post('/finances/deals', authenticate, requireAdmin, async (req, res) => {
  try {
    const { clientName, projectName, amount, closedAt, category, notes } = req.body;
    if (!clientName || !projectName || amount === undefined) {
      return res.status(400).json({ error: 'Cliente, proyecto y monto son obligatorios.' });
    }

    const deal = await prisma.historicalDeal.create({
      data: {
        clientName: clientName.trim(),
        projectName: projectName.trim(),
        amount: parseFloat(amount),
        closedAt: closedAt ? new Date(closedAt) : new Date(),
        category: category?.trim() || 'General',
        notes: notes?.trim() || null,
      }
    });

    res.status(201).json(deal);
  } catch (err) {
    console.error('[ADMIN] Error in POST /admin/finances/deals:', err);
    res.status(500).json({ error: 'Error al registrar proyecto histórico.' });
  }
});

// PUT /admin/finances/deals/:id — Editar proyecto histórico
router.put('/finances/deals/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { clientName, projectName, amount, closedAt, category, notes } = req.body;
    const data = {};
    if (clientName !== undefined) data.clientName = clientName.trim();
    if (projectName !== undefined) data.projectName = projectName.trim();
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (closedAt !== undefined) data.closedAt = new Date(closedAt);
    if (category !== undefined) data.category = category?.trim() || 'General';
    if (notes !== undefined) data.notes = notes ? notes.trim() : null;

    const deal = await prisma.historicalDeal.update({
      where: { id: req.params.id },
      data,
    });
    res.json(deal);
  } catch (err) {
    console.error('[ADMIN] Error in PUT /admin/finances/deals/:id:', err);
    res.status(500).json({ error: 'Error al actualizar proyecto histórico.' });
  }
});

// DELETE /admin/finances/deals/:id — Eliminar proyecto histórico
router.delete('/finances/deals/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.historicalDeal.delete({ where: { id: req.params.id } });
    res.json({ message: 'Proyecto histórico eliminado.' });
  } catch (err) {
    console.error('[ADMIN] Error in DELETE /admin/finances/deals/:id:', err);
    res.status(500).json({ error: 'Error al eliminar proyecto histórico.' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ─── TARJETAS QR & NFC (/admin/nfc-cards) ────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// GET /admin/nfc-cards — Listar todas las tarjetas y estadísticas
router.get('/nfc-cards', authenticate, requireAdmin, async (req, res) => {
  try {
    const cards = await prisma.nfcCard.findMany({
      orderBy: { code: 'asc' },
    });

    const totalCards = cards.length;
    const activeCards = cards.filter(c => c.active).length;
    const totalScans = cards.reduce((sum, c) => sum + (c.scanCount || 0), 0);

    // Calcular siguiente código sugerido (ej. si el max es 003 -> sugerir 004)
    let maxNum = 0;
    for (const c of cards) {
      const n = parseInt(c.code, 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    }
    const nextSuggestedCode = String(maxNum + 1).padStart(3, '0');

    res.json({
      cards,
      metrics: {
        totalCards,
        activeCards,
        inactiveCards: totalCards - activeCards,
        totalScans,
        nextSuggestedCode,
      }
    });
  } catch (err) {
    console.error('[ADMIN] Error in GET /admin/nfc-cards:', err);
    res.status(500).json({ error: 'Error al obtener tarjetas NFC/QR.' });
  }
});

// POST /admin/nfc-cards — Crear o configurar nueva tarjeta
router.post('/nfc-cards', authenticate, requireAdmin, async (req, res) => {
  try {
    let { code, clientName, type, targetUrl, active, notes } = req.body;

    if (!code || !clientName || !targetUrl) {
      return res.status(400).json({ error: 'Código, nombre del cliente y enlace de destino son obligatorios.' });
    }

    code = String(code).trim().padStart(3, '0');
    clientName = String(clientName).trim();
    targetUrl = String(targetUrl).trim();

    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    // Verificar si el código ya existe
    const existing = await prisma.nfcCard.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ error: `La tarjeta #${code} ya existe. Elige otro número o edita la existente.` });
    }

    const card = await prisma.nfcCard.create({
      data: {
        code,
        clientName,
        type: type || 'google_reviews',
        targetUrl,
        active: active !== undefined ? Boolean(active) : true,
        notes: notes ? String(notes).trim() : null,
      }
    });

    res.status(201).json(card);
  } catch (err) {
    console.error('[ADMIN] Error in POST /admin/nfc-cards:', err);
    res.status(500).json({ error: 'Error al registrar tarjeta NFC/QR.' });
  }
});

// PUT /admin/nfc-cards/:id — Actualizar tarjeta
router.put('/nfc-cards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    let { code, clientName, type, targetUrl, active, notes } = req.body;
    const data = {};

    if (code !== undefined) {
      const formattedCode = String(code).trim().padStart(3, '0');
      const conflict = await prisma.nfcCard.findFirst({
        where: { code: formattedCode, NOT: { id: req.params.id } }
      });
      if (conflict) {
        return res.status(400).json({ error: `El código #${formattedCode} ya pertenece a otra tarjeta.` });
      }
      data.code = formattedCode;
    }

    if (clientName !== undefined) data.clientName = String(clientName).trim();
    if (type !== undefined) data.type = type;
    if (targetUrl !== undefined) {
      let cleanUrl = String(targetUrl).trim();
      if (!/^https?:\/\//i.test(cleanUrl)) cleanUrl = 'https://' + cleanUrl;
      data.targetUrl = cleanUrl;
    }
    if (active !== undefined) data.active = Boolean(active);
    if (notes !== undefined) data.notes = notes ? String(notes).trim() : null;

    const card = await prisma.nfcCard.update({
      where: { id: req.params.id },
      data,
    });

    res.json(card);
  } catch (err) {
    console.error('[ADMIN] Error in PUT /admin/nfc-cards/:id:', err);
    res.status(500).json({ error: 'Error al actualizar tarjeta NFC/QR.' });
  }
});

// DELETE /admin/nfc-cards/:id — Eliminar tarjeta
router.delete('/nfc-cards/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    await prisma.nfcCard.delete({ where: { id: req.params.id } });
    res.json({ message: 'Tarjeta eliminada exitosamente.' });
  } catch (err) {
    console.error('[ADMIN] Error in DELETE /admin/nfc-cards/:id:', err);
    res.status(500).json({ error: 'Error al eliminar tarjeta.' });
  }
});

// GET /admin/nfc-cards/:id/qr — Generar imagen QR en alta resolución
router.get('/nfc-cards/:id/qr', authenticate, requireAdmin, async (req, res) => {
  try {
    const card = await prisma.nfcCard.findUnique({ where: { id: req.params.id } });
    if (!card) return res.status(404).json({ error: 'Tarjeta no encontrada.' });

    const QRCode = require('qrcode');
    const redirectUrl = `https://hummingxbi.com/t/${card.code}`;
    const qrDataUrl = await QRCode.toDataURL(redirectUrl, {
      width: 512,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
      errorCorrectionLevel: 'Q',
    });

    res.json({
      code: card.code,
      redirectUrl,
      qrDataUrl,
    });
  } catch (err) {
    console.error('[ADMIN] Error in GET /admin/nfc-cards/:id/qr:', err);
    res.status(500).json({ error: 'Error al generar código QR.' });
  }
});

module.exports = router;

