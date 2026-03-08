const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body } = require('express-validator');
const { pool } = require('../config/db');
const env = require('../config/env');
const { asyncHandler, AppError } = require('../utils/errors');
const { sendMail } = require('../services/emailService');

const registerValidators = [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('confirm_password').custom((v, { req }) => v === req.body.password).withMessage('Passwords do not match'),
  body('full_name').isLength({ min: 2 }),
  body('tahun_angkatan').notEmpty(),
  body('age').isInt({ min: 16, max: 100 }),
  body('phone_number').isLength({ min: 8 })
];

const loginValidators = [
  body('email').isEmail(),
  body('password').notEmpty()
];

const forgotPasswordValidators = [
  body('email').isEmail()
];

const resetPasswordValidators = [
  body('token').isLength({ min: 20 }),
  body('password').isLength({ min: 8 }),
  body('confirm_password').custom((v, { req }) => v === req.body.password).withMessage('Passwords do not match')
];

const signToken = (user) => jwt.sign({
  id: user.id,
  email: user.email,
  role: user.role,
  full_name: user.full_name
}, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const register = asyncHandler(async (req, res) => {
  const {
    email,
    password,
    full_name,
    tahun_angkatan,
    age,
    phone_number,
    nim
  } = req.body;

  const [existsRows] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (existsRows.length) throw new AppError(409, 'Email already exists');

  const password_hash = await bcrypt.hash(password, 10);
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : null;

  let result;
  try {
    [result] = await pool.query(
      `INSERT INTO users
        (email, password_hash, full_name, tahun_angkatan, age, phone_number, nim, profile_photo_url, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'user')`,
      [email, password_hash, full_name, tahun_angkatan, age, phone_number, nim || null, profilePhoto]
    );
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new AppError(409, 'Email already exists');
    }
    throw err;
  }

  const [rows] = await pool.query(
    `SELECT id, email, full_name, tahun_angkatan, age, phone_number, nim, profile_photo_url, role
     FROM users WHERE id = ?`,
    [result.insertId]
  );

  const token = signToken(rows[0]);
  res.status(201).json({ token, user: rows[0] });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1', [email]);
  if (!rows.length) throw new AppError(401, 'Invalid credentials');

  const user = rows[0];
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) throw new AppError(401, 'Invalid credentials');

  const token = signToken(user);
  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      tahun_angkatan: user.tahun_angkatan,
      age: user.age,
      phone_number: user.phone_number,
      nim: user.nim,
      profile_photo_url: user.profile_photo_url,
      role: user.role
    }
  });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // Always return success to prevent email enumeration.
  const okResponse = { message: 'If the email exists, a reset link has been sent.' };

  const [rows] = await pool.query(
    'SELECT id, email, full_name FROM users WHERE email = ? AND is_active = 1 LIMIT 1',
    [email]
  );
  if (!rows.length) return res.json(okResponse);

  const user = rows[0];
  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const ttl = Number.isFinite(env.passwordResetTtlMinutes) ? env.passwordResetTtlMinutes : 30;

  await pool.query(
    `INSERT INTO password_reset_tokens
      (user_id, token_hash, expires_at, request_ip, user_agent)
     VALUES (?, ?, DATE_ADD(UTC_TIMESTAMP(), INTERVAL ? MINUTE), ?, ?)`,
    [
      user.id,
      tokenHash,
      ttl,
      req.ip || null,
      String(req.headers['user-agent'] || '').slice(0, 255) || null
    ]
  );

  const base = String(env.appPublicUrl || env.frontendUrl || '').replace(/\/+$/, '');
  const resetUrl = `${base}/reset-password?token=${rawToken}`;

  await sendMail({
    to: user.email,
    subject: 'Lumina - Reset Password',
    text: `Hi ${user.full_name || 'there'},\n\nClick this link to reset your password (valid for ${ttl} minutes):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<p>Hi ${user.full_name || 'there'},</p>
<p>Click this link to reset your password (valid for <b>${ttl} minutes</b>):</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you did not request this, you can ignore this email.</p>`
  });

  return res.json(okResponse);
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  // Token comes from querystring -> React -> JSON body. Some email clients can wrap long URLs with newlines.
  // Remove any whitespace defensively.
  const rawToken = String(token || '').replace(/\s+/g, '').trim();
  // Our tokens are hex (crypto.randomBytes().toString('hex')). Some email clients may add whitespace/newlines.
  // Normalize to lower-case and validate shape to avoid hashing accidental extra characters.
  if (!/^[0-9a-f]{40,}$/i.test(rawToken)) {
    throw new AppError(400, 'Invalid or expired reset token');
  }
  const tokenHash = crypto.createHash('sha256').update(rawToken.toLowerCase()).digest('hex');

  const [rows] = await pool.query(
    `SELECT id, user_id
     FROM password_reset_tokens
     WHERE token_hash = ?
       AND used_at IS NULL
       AND expires_at > UTC_TIMESTAMP()
     ORDER BY id DESC
     LIMIT 1`,
    [tokenHash]
  );

  if (!rows.length) {
    // Provide a more helpful message when possible (used vs expired vs invalid).
    const [anyRows] = await pool.query(
      `SELECT used_at, expires_at
       FROM password_reset_tokens
       WHERE token_hash = ?
       ORDER BY id DESC
       LIMIT 1`,
      [tokenHash]
    );
    if (!anyRows.length) throw new AppError(400, 'Invalid or expired reset token');
    if (anyRows[0].used_at) throw new AppError(400, 'Reset token already used');
    throw new AppError(400, 'Reset token expired');
  }

  const rec = rows[0];

  const password_hash = await bcrypt.hash(password, 10);

  await pool.query('UPDATE users SET password_hash = ? WHERE id = ? AND is_active = 1', [password_hash, rec.user_id]);
  await pool.query('UPDATE password_reset_tokens SET used_at = UTC_TIMESTAMP() WHERE id = ?', [rec.id]);

  res.json({ message: 'Password updated' });
});

module.exports = {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  register,
  login,
  forgotPassword,
  resetPassword
};
