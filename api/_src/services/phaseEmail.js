// api/_src/services/phaseEmail.js
const { sendMailSafe } = require('../lib/mailer');

const PHASE_TEMPLATES = {
  2: {
    title: '¡Tu proyecto está cobrando vida visual!',
    body: '¡Qué emoción! Acabamos de encender los motores y hemos entrado de lleno a la fase de <strong>Diseño UX/UI</strong>. En este momento, nuestros artistas digitales están moldeando la identidad visual y estructurando prototipos interactivos para que tu proyecto no solo funcione perfecto, sino que enamore a primera vista. Sumérgete en tu portal para seguir de cerca los primeros bocetos.'
  },
  3: {
    title: '¡Queremos escuchar tu voz: Tiempo de Revisión!',
    body: 'Tu proyecto acaba de aterrizar en la fase de <strong>Revisión</strong>. Hemos preparado tus prototipos interactivos y ahora el escenario es tuyo. Tu retroalimentación es la pieza clave para asegurar que el resultado final sea exactamente como lo soñaste antes de pasar a la programación. ¡Entra al portal, explora los diseños y cuéntanos todo!'
  },
  4: {
    title: '¡Magia en progreso: Arranca el Desarrollo!',
    body: '¡Prepárate para la acción! Tu proyecto ha pasado a la fase de <strong>Desarrollo</strong>. Nuestro equipo de ingenieros está escribiendo las líneas de código que convertirán tus diseños en una plataforma ágil, robusta y escalable. Podrás ver la evolución y el progreso técnico directamente desde tu portal de clientes.'
  },
  5: {
    title: '¡Ajusta tu cinturón: Fase de Lanzamiento!',
    body: '¡Se respira pura emoción! Hemos llegado a la fase de <strong>Lanzamiento</strong>. Estamos afinando cada último detalle, ejecutando pruebas rigurosas de seguridad y preparando los servidores de producción para garantizar que tu gran despliegue sea absolutamente espectacular. ¡Ya casi lo logramos!'
  },
  6: {
    title: '¡Misión cumplida: Tu proyecto está 100% Activo!',
    body: '¡Boom! Hemos cruzado la línea de meta. Tu proyecto ha finalizado al 100% y ahora se encuentra totalmente <strong>Activo</strong>. Ha sido un viaje increíble y estamos muy orgullosos del resultado. Ya puedes acceder a tu plataforma final y exprimir al máximo todas sus capacidades. ¡Gracias infinitas por confiar en la ingeniería de HummingX BI para hacer esto realidad!'
  }
};

function buildPhaseEmail(phaseNumber, clientName) {
  const tpl = PHASE_TEMPLATES[phaseNumber];
  if (!tpl) return null;

  const html = `
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
          <p style="font-size: 16px; color: #374151; margin-top: 0;">Hola <strong>${clientName || 'Cliente'}</strong>,</p>
          <p style="font-size: 16px; color: #4B5563; line-height: 1.6;">${tpl.body}</p>
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
  `;

  return {
    subject: tpl.title,
    html
  };
}

async function sendPhaseNotification(recipientEmail, clientName, phaseNumber) {
  const emailContent = buildPhaseEmail(phaseNumber, clientName);
  if (!emailContent) {
    throw new Error(`No hay plantilla de correo para la fase ${phaseNumber}`);
  }

  return await sendMailSafe({
    from: `"HummingX BI" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: emailContent.subject,
    html: emailContent.html
  }, { kind: `phase_change_${phaseNumber}` });
}

module.exports = {
  PHASE_TEMPLATES,
  buildPhaseEmail,
  sendPhaseNotification
};
