const { body, param } = require('express-validator');
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const { asyncHandler, AppError } = require('../utils/errors');
const { sendBookingNotification } = require('../services/notificationService');

const bookingActionValidator = [
  param('id').isInt({ min: 1 }),
  body('reason').optional().isLength({ max: 255 })
];

const settingValidator = [body('is_enabled').isBoolean()];

const createAdminValidator = [
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  body('full_name').isLength({ min: 2 }),
  body('tahun_angkatan').notEmpty(),
  body('age').isInt({ min: 16, max: 100 }),
  body('phone_number').isLength({ min: 8 })
];

const dashboard = asyncHandler(async (_req, res) => {
  const [[totals], [pending], [users], [room]] = await Promise.all([
    pool.query(`SELECT COUNT(*) total_bookings FROM bookings`),
    pool.query(`SELECT COUNT(*) pending_bookings FROM bookings WHERE status = 'Pending'`),
    pool.query(`SELECT COUNT(*) total_users FROM users WHERE role = 'user' AND is_active = 1`),
    pool.query(`SELECT is_enabled FROM room_settings WHERE id = 1`)
  ]);

  res.json({ ...totals[0], ...pending[0], ...users[0], room_enabled: !!room[0].is_enabled });
});

const listBookings = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status, b.rejection_reason,
            u.id user_id, u.full_name, u.email, u.phone_number
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     ORDER BY b.booking_date DESC, b.start_time DESC`
  );
  res.json(rows);
});

const approveBooking = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);
  const [rows] = await pool.query('SELECT id, user_id, status FROM bookings WHERE id = ? LIMIT 1', [bookingId]);
  if (!rows.length) throw new AppError(404, 'Booking not found');
  if (rows[0].status !== 'Pending') throw new AppError(400, 'Only pending booking can be approved');

  const [capRows] = await pool.query('SELECT capacity FROM room_settings WHERE id = 1 LIMIT 1');
  const capacity = capRows[0]?.capacity || 5;
  const [slotRows] = await pool.query('SELECT slot_key FROM booking_slots WHERE booking_id = ?', [bookingId]);
  if (slotRows.length) {
    const slotKeys = slotRows.map((s) => s.slot_key);
    const placeholders = slotKeys.map(() => '?').join(',');
    const [counts] = await pool.query(
      `SELECT bs.slot_key, COUNT(*) AS slot_count
       FROM booking_slots bs
       JOIN bookings b ON b.id = bs.booking_id
       WHERE bs.slot_key IN (${placeholders})
         AND b.status IN ('Approved','Checked-In')
         AND b.id <> ?
       GROUP BY bs.slot_key`,
      [...slotKeys, bookingId]
    );
    if (counts.some((r) => r.slot_count >= capacity)) {
      throw new AppError(400, 'Cannot approve. One or more slots are already full.');
    }
  }

  await pool.query("UPDATE bookings SET status = 'Approved', rejection_reason = NULL WHERE id = ?", [bookingId]);
  sendBookingNotification({ userId: rows[0].user_id, bookingId, type: 'approved' }).catch(() => {});
  res.json({ message: 'Booking approved' });
});

const rejectBooking = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);
  const reason = req.body.reason || 'Not specified';
  const [rows] = await pool.query('SELECT id, user_id, status FROM bookings WHERE id = ? LIMIT 1', [bookingId]);
  if (!rows.length) throw new AppError(404, 'Booking not found');
  if (rows[0].status !== 'Pending') throw new AppError(400, 'Only pending booking can be rejected');

  await pool.query("UPDATE bookings SET status = 'Rejected', rejection_reason = ? WHERE id = ?", [reason, bookingId]);
  sendBookingNotification({ userId: rows[0].user_id, bookingId, type: 'rejected' }).catch(() => {});
  res.json({ message: 'Booking rejected' });
});

const updateRoomSetting = asyncHandler(async (req, res) => {
  const { is_enabled } = req.body;
  await pool.query('UPDATE room_settings SET is_enabled = ?, updated_by = ? WHERE id = 1', [is_enabled ? 1 : 0, req.user.id]);
  res.json({ message: 'Room setting updated' });
});

const listUsers = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT id, email, full_name, tahun_angkatan, age, phone_number, role, is_active, created_at
     FROM users ORDER BY created_at DESC`
  );
  res.json(rows);
});

const toggleUserStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const [rows] = await pool.query('SELECT id, is_active FROM users WHERE id = ? LIMIT 1', [id]);
  if (!rows.length) throw new AppError(404, 'User not found');

  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [rows[0].is_active ? 0 : 1, id]);
  res.json({ message: 'User status updated' });
});

const createAdmin = asyncHandler(async (req, res) => {
  const { email, password, full_name, tahun_angkatan, age, phone_number, nim } = req.body;

  const [exists] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
  if (exists.length) throw new AppError(409, 'Email already exists');

  const password_hash = await bcrypt.hash(password, 10);
  const conn = await pool.getConnection();
  let result;
  try {
    await conn.beginTransaction();
    [result] = await conn.query(
      `INSERT INTO users (email, password_hash, full_name, tahun_angkatan, age, phone_number, nim, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'admin')`,
      [email, password_hash, full_name, tahun_angkatan, age, phone_number, nim || null]
    );
    await conn.query(
      `INSERT INTO admins (user_id, created_by) VALUES (?, ?)`,
      [result.insertId, req.user.id]
    );
    await conn.commit();
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }

  res.status(201).json({ id: result.insertId, message: 'Admin created' });
});

const analytics = asyncHandler(async (_req, res) => {
  const [[totalBookings], [perWeek], [popularSlots], [activeUsers], [utilization]] = await Promise.all([
    pool.query("SELECT COUNT(*) total FROM bookings WHERE status IN ('Approved','Completed','Checked-In')"),
    pool.query(
      `SELECT YEARWEEK(booking_date, 1) AS year_week, COUNT(*) AS total
       FROM bookings
       WHERE status IN ('Approved','Completed','Checked-In')
       GROUP BY YEARWEEK(booking_date, 1)
       ORDER BY year_week DESC LIMIT 8`
    ),
    pool.query(
      `SELECT TIME_FORMAT(start_time, '%H:%i') AS slot, COUNT(*) AS total
       FROM bookings
       WHERE status IN ('Approved','Completed','Checked-In')
       GROUP BY slot
       ORDER BY total DESC LIMIT 5`
    ),
    pool.query(
      `SELECT u.full_name, COUNT(*) AS total
       FROM bookings b
       JOIN users u ON u.id = b.user_id
       WHERE b.status IN ('Approved','Completed','Checked-In')
       GROUP BY b.user_id
       ORDER BY total DESC LIMIT 5`
    ),
    pool.query(
      `SELECT
         ROUND(
           (COUNT(*) * 2.0) /
           (TIMESTAMPDIFF(MINUTE, '17:00:00', '21:30:00') / 30 * 5) * 100,
           2
         ) AS utilization_rate
       FROM bookings
       WHERE booking_date >= CURDATE() - INTERVAL 30 DAY
         AND status IN ('Approved','Completed','Checked-In')`
    )
  ]);

  res.json({
    total_bookings: totalBookings[0].total,
    bookings_per_week: perWeek,
    popular_slots: popularSlots,
    active_users: activeUsers,
    utilization_rate: utilization[0].utilization_rate || 0
  });
});

const checkinLogs = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT
       c.id,
       u.full_name,
       u.tahun_angkatan,
       b.booking_date,
       b.start_time,
       b.end_time,
       c.checkin_time AS checkin_time
     FROM checkins c
     JOIN users u ON u.id = c.user_id
     JOIN bookings b ON b.id = c.booking_id
     ORDER BY c.checkin_time DESC
     LIMIT 500`
  );
  res.json(rows);
});

module.exports = {
  bookingActionValidator,
  settingValidator,
  createAdminValidator,
  dashboard,
  listBookings,
  approveBooking,
  rejectBooking,
  updateRoomSetting,
  listUsers,
  toggleUserStatus,
  createAdmin,
  analytics,
  checkinLogs
};
