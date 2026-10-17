// api/_src/lib/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

function maskEmail(email) {
  if (!email || typeof email !== 'string') return '***';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const name = parts[0];
  const domain = parts[1];
  const visible = name.slice(0, 2);
  return `${visible}***@${domain}`;
}

async function sendMailSafe(options, context = {}) {
  const kind = context.kind || 'general';
  const recipient = options.to;
  const masked = maskEmail(recipient);

  if (process.env.EMAIL_DRY_RUN === '1') {
    console.log(`[MAILER DRY RUN] tipo: ${kind} | para: ${masked} | asunto: "${options.subject || ''}"`);
    return { dryRun: true, messageId: `dry-run-${Date.now()}` };
  }

  return await transporter.sendMail(options);
}

function isAutoNotificationEnabled() {
  return process.env.EMAIL_AUTO_NOTIFICATIONS === '1';
}

module.exports = {
  transporter,
  sendMailSafe,
  isAutoNotificationEnabled,
  maskEmail
};
