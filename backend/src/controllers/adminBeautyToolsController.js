const { body, param } = require('express-validator');
const { pool } = require('../config/db');
const { asyncHandler, AppError } = require('../utils/errors');

const toolIdValidator = [param('id').isInt({ min: 1 })];

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value !== 'string') return undefined;
  const v = value.trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(v)) return false;
  return undefined;
};

const upsertToolValidators = [
  body('name').isString().trim().isLength({ min: 2, max: 160 }),
  body('description').optional({ nullable: true }).isString().isLength({ max: 20000 }),
  body('benefits').optional({ nullable: true }).isString().isLength({ max: 20000 }),
  body('usage_instructions').optional({ nullable: true }).isString().isLength({ max: 20000 }),
  body('is_active').optional().isBoolean()
];

const listToolsAdmin = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, description, benefits, usage_instructions, photo_url, is_active, created_at, updated_at
     FROM beauty_tools
     ORDER BY created_at DESC`
  );
  res.json(rows);
});

const createToolAdmin = asyncHandler(async (req, res) => {
  const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;
  const { name, description, benefits, usage_instructions } = req.body;
  const [result] = await pool.query(
    `INSERT INTO beauty_tools (name, description, benefits, usage_instructions, photo_url, created_by, updated_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name.trim(),
      description ?? null,
      benefits ?? null,
      usage_instructions ?? null,
      photoUrl,
      req.user.id,
      req.user.id
    ]
  );
  res.status(201).json({ id: result.insertId, message: 'Tool created' });
});

const updateToolAdmin = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.query('SELECT id, photo_url, is_active FROM beauty_tools WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) throw new AppError(404, 'Tool not found');

  const nextPhotoUrl = req.file ? `/uploads/${req.file.filename}` : rows[0].photo_url;
  const { name, description, benefits, usage_instructions, is_active } = req.body;
  const parsedActive = parseBoolean(is_active);

  await pool.query(
    `UPDATE beauty_tools
     SET name = ?, description = ?, benefits = ?, usage_instructions = ?, photo_url = ?, is_active = ?, updated_by = ?
     WHERE id = ?`,
    [
      name.trim(),
      description ?? null,
      benefits ?? null,
      usage_instructions ?? null,
      nextPhotoUrl,
      typeof parsedActive === 'boolean' ? (parsedActive ? 1 : 0) : rows[0].is_active,
      req.user.id,
      id
    ]
  );

  res.json({ message: 'Tool updated' });
});

const deactivateToolAdmin = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.query('SELECT id FROM beauty_tools WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) throw new AppError(404, 'Tool not found');

  await pool.query('UPDATE beauty_tools SET is_active = 0, updated_by = ? WHERE id = ?', [req.user.id, id]);
  res.json({ message: 'Tool deactivated' });
});

module.exports = {
  toolIdValidator,
  upsertToolValidators,
  listToolsAdmin,
  createToolAdmin,
  updateToolAdmin,
  deactivateToolAdmin
};
