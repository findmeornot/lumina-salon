const { body } = require('express-validator');
const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/errors');

const profileValidators = [
  body('full_name').optional().isLength({ min: 2 }),
  body('phone_number').optional().isLength({ min: 8 }),
  body('age').optional().isInt({ min: 16, max: 100 })
];

const me = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, email, full_name, tahun_angkatan, age, phone_number, nim, profile_photo_url, role
     FROM users WHERE id = ? LIMIT 1`,
    [req.user.id]
  );
  res.json(rows[0]);
});

const updateProfile = asyncHandler(async (req, res) => {
  const profilePhoto = req.file ? `/uploads/${req.file.filename}` : undefined;

  const allowed = ['full_name', 'phone_number', 'age'];
  const sets = [];
  const params = [];

  for (const key of allowed) {
    if (req.body[key] !== undefined) {
      sets.push(`${key} = ?`);
      params.push(req.body[key]);
    }
  }
  if (profilePhoto) {
    sets.push('profile_photo_url = ?');
    params.push(profilePhoto);
  }
  if (!sets.length) {
    return res.json({ message: 'No changes submitted' });
  }

  params.push(req.user.id);
  await pool.query(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, params);

  res.json({ message: 'Profile updated' });
});

module.exports = { profileValidators, me, updateProfile };
