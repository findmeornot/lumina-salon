const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const env = require('../config/env');
const { pool } = require('../config/db');
const { asyncHandler, AppError } = require('../utils/errors');

const adminLoginValidators = [
  body('username').notEmpty(),
  body('password').notEmpty()
];

const signToken = (user) => jwt.sign({
  id: user.id,
  email: user.email,
  role: user.role,
  full_name: user.full_name
}, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

const ensureAdminUser = async () => {
  const email = env.adminDash.email;
  const [rows] = await pool.query(
    `SELECT id, email, full_name, role
     FROM users
     WHERE email = ? AND is_active = 1
     LIMIT 1`,
    [email]
  );
  if (rows.length) {
    const u = rows[0];
    if (u.role !== 'admin') {
      await pool.query(`UPDATE users SET role = 'admin' WHERE id = ?`, [u.id]);
      u.role = 'admin';
    }
    await pool.query(
      `INSERT INTO admins (user_id, created_by) VALUES (?, NULL)
       ON DUPLICATE KEY UPDATE user_id = user_id`,
      [u.id]
    );
    return u;
  }

  const [result] = await pool.query(
    `INSERT INTO users
      (email, password_hash, full_name, tahun_angkatan, age, phone_number, role, is_active)
     VALUES
      (?, 'DISABLED', 'Admin Dashboard', 'staff', 25, '000', 'admin', 1)`,
    [email]
  );
  await pool.query(
    `INSERT INTO admins (user_id, created_by) VALUES (?, NULL)`,
    [result.insertId]
  );
  return { id: result.insertId, email, full_name: 'Admin Dashboard', role: 'admin' };
};

const adminLogin = asyncHandler(async (req, res) => {
  if (!env.adminDash.enabled) throw new AppError(404, 'Admin dashboard login is disabled');
  const { username, password } = req.body;

  if (!env.adminDash.username || !env.adminDash.password) {
    throw new AppError(500, 'Admin dashboard credentials are not configured');
  }

  if (username !== env.adminDash.username || password !== env.adminDash.password) {
    throw new AppError(401, 'Invalid credentials');
  }

  const adminUser = await ensureAdminUser();
  const token = signToken(adminUser);
  res.json({
    token,
    user: {
      id: adminUser.id,
      email: adminUser.email,
      full_name: adminUser.full_name,
      role: 'admin'
    }
  });
});

module.exports = { adminLoginValidators, adminLogin };

