const { pool } = require('../config/db');
const { asyncHandler } = require('../utils/errors');

const ensureFacilityInfoRow = async () => {
  await pool.query(
    `INSERT INTO facility_info (id, rules_terms, booking_terms, operational_notes, equipment_check_schedule)
     VALUES (1, '', '', '', '')
     ON DUPLICATE KEY UPDATE id = id`
  );
};

const getFacilityInfo = asyncHandler(async (_req, res) => {
  await ensureFacilityInfoRow();
  const [[infoRows], [roomRows]] = await Promise.all([
    pool.query(
      `SELECT id, rules_terms, booking_terms, operational_notes, equipment_check_schedule, updated_at
       FROM facility_info WHERE id = 1 LIMIT 1`
    ),
    pool.query(
      `SELECT room_name, is_enabled, capacity, open_time, close_time, updated_at
       FROM room_settings WHERE id = 1 LIMIT 1`
    )
  ]);

  res.json({
    facility: infoRows[0],
    room: roomRows[0] || null
  });
});

const listBeautyTools = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, name, description, benefits, usage_instructions, photo_url, updated_at
     FROM beauty_tools
     WHERE is_active = 1
     ORDER BY name ASC, id DESC`
  );
  res.json(rows);
});

module.exports = { getFacilityInfo, listBeautyTools };

