// api/_src/services/invitationService.js
const crypto = require('crypto');
const prisma = require('../lib/prisma');
const { sendMailSafe } = require('../lib/mailer');

async function sendInvitationEmail(user, options = {}) {
  const isReminder = !!options.isReminder;
  let token = options.token;

  if (!token) {
    token = crypto.randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 48);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        activationToken: token,
        activationExpires: expires
      }
    });
  }

  const frontendUrl = process.env.FRONTEND_URL || 'https://portal.hummingxbi.com';
  const activationLink = `${frontendUrl}/activate/${token}`;

  const subject = isReminder
    ? '¡Recordatorio: Activa tu cuenta en HummingX BI!'
    : '¡Bienvenido a HummingX BI! Activa tu cuenta';

  const introText = isReminder
    ? 'Te recordamos que se ha creado tu cuenta en nuestro <strong>Portal de Clientes Exclusivo</strong>. Aquí podrás revisar el progreso de tus proyectos en tiempo real.'
    : 'Nos emociona anunciarte que se ha creado tu cuenta en nuestro <strong>Portal de Clientes Exclusivo</strong>. Aquí podrás revisar el progreso de tus proyectos en tiempo real, ver la bitácora de desarrollo y acceder a tus entregables.';

  const actionText = isReminder
    ? 'Tu invitación anterior ha expirado o está pendiente de ser aceptada. Haz clic en el siguiente botón para establecer tu contraseña y activar tu cuenta:'
    : 'Haz clic en el siguiente botón para establecer tu contraseña y activar tu cuenta:';

  const html = `
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
          <p style="font-size: 16px; color: #374151; margin-top: 0;">Hola <strong>${user.name}</strong>,</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">${introText}</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">${actionText}</p>
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
  `;

  let emailSent = true;
  try {
    await sendMailSafe({
      from: `"HummingX BI" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject,
      html
    }, { kind: isReminder ? 'resend_invitation' : 'client_invitation' });
  } catch (err) {
    console.error('Error al enviar invitación:', err.message);
    emailSent = false;
  }

  return {
    emailSent,
    activationLink,
    token
  };
}

module.exports = {
  sendInvitationEmail
};
