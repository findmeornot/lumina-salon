const { body } = require('express-validator');
const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/errors');

const facilityInfoValidators = [
  body('rules_terms').isString().isLength({ max: 20000 }),
  body('booking_terms').isString().isLength({ max: 20000 }),
  body('operational_notes').isString().isLength({ max: 20000 }),
  body('equipment_check_schedule').isString().isLength({ max: 20000 })
];

const ensureFacilityInfoRow = async () => {
  await pool.query(
    `INSERT INTO facility_info (id, rules_terms, booking_terms, operational_notes, equipment_check_schedule)
     VALUES (1, '', '', '', '')
     ON DUPLICATE KEY UPDATE id = id`
  );
};

const getFacilityInfoAdmin = asyncHandler(async (_req, res) => {
  await ensureFacilityInfoRow();
  const [rows] = await pool.query(
    `SELECT id, rules_terms, booking_terms, operational_notes, equipment_check_schedule, updated_at
     FROM facility_info WHERE id = 1 LIMIT 1`
  );
  res.json(rows[0]);
});

const updateFacilityInfoAdmin = asyncHandler(async (req, res) => {
  await ensureFacilityInfoRow();
  const { rules_terms, booking_terms, operational_notes, equipment_check_schedule } = req.body;
  await pool.query(
    `UPDATE facility_info
     SET rules_terms = ?, booking_terms = ?, operational_notes = ?, equipment_check_schedule = ?, updated_by = ?
     WHERE id = 1`,
    [rules_terms, booking_terms, operational_notes, equipment_check_schedule, req.user.id]
  );
  res.json({ message: 'Facility info updated' });
});

module.exports = {
  facilityInfoValidators,
  getFacilityInfoAdmin,
  updateFacilityInfoAdmin
};

