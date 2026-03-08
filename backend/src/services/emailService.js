const env = require('../config/env');

let transporter = null;
let nodemailer = null;

try {
  // Optional dependency in dev environments until installed.
  // If missing, we fall back to console logging.
  // eslint-disable-next-line global-require
  nodemailer = require('nodemailer');
} catch (_) {
  nodemailer = null;
}

const getTransporter = () => {
  if (transporter) return transporter;
  if (!nodemailer) return null;
  if (!env.smtp.host) return null;

  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.pass } : undefined
  });
  return transporter;
};

const sendMail = async ({ to, subject, text, html }) => {
  const tx = getTransporter();
  if (!tx) {
    // Dev/shared-hosting fallback when SMTP isn't configured.
    console.log('[MAIL][DISABLED]', { to, subject, text });
    return { disabled: true };
  }
  return tx.sendMail({
    from: env.smtp.from,
    to,
    subject,
    text,
    html
  });
};

module.exports = { sendMail };
