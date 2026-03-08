const { body, param } = require('express-validator');
const { pool } = require('../config/db');
const { asyncHandler, AppError } = require('../utils/errors');
const {
  validateTimeWindow,
  validateAdvanceWindow,
  ensureUserDailyWeeklyLimits,
  ensureRoomEnabled,
  ensureCapacity,
  createSlotKeys,
  persistSlots
} = require('../services/bookingRules');
const { sendBookingNotification } = require('../services/notificationService');

const bookingValidators = [
  body('booking_date').isDate({ format: 'YYYY-MM-DD' }),
  body('start_time').matches(/^([01]\d|2[0-3]):(00|30)$/),
  body('end_time').matches(/^([01]\d|2[0-3]):(00|30)$/)
];

const bookingIdValidator = [param('id').isInt({ min: 1 })];

const listOwnBookings = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, booking_date, start_time, end_time, status, rejection_reason, created_at
     FROM bookings WHERE user_id = ? ORDER BY booking_date DESC, start_time DESC`,
    [req.user.id]
  );
  res.json(rows);
});

const calendarBookings = asyncHandler(async (req, res) => {
  const { start, end } = req.query;
  const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
  const startDate = isDate(start) ? start : null;
  const endDate = isDate(end) ? end : null;

  const [rows] = await pool.query(
    `SELECT b.id, b.booking_date, b.start_time, b.end_time, b.status, u.full_name
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     WHERE b.booking_date BETWEEN
       COALESCE(?, CURDATE() - INTERVAL 7 DAY) AND COALESCE(?, CURDATE() + INTERVAL 14 DAY)
     ORDER BY b.booking_date, b.start_time`,
    [startDate, endDate]
  );
  res.json(rows);
});

const createBooking = asyncHandler(async (req, res) => {
  const { booking_date, start_time, end_time } = req.body;

  validateAdvanceWindow(booking_date);
  validateTimeWindow(start_time, end_time);
  const room = await ensureRoomEnabled();
  await ensureUserDailyWeeklyLimits(req.user.id, booking_date);

  const slots = createSlotKeys(booking_date, start_time, end_time);
  await ensureCapacity(booking_date, slots, room.capacity);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO bookings (user_id, booking_date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, 'Pending')`,
      [req.user.id, booking_date, start_time, end_time]
    );

    await persistSlots(conn, result.insertId, booking_date, start_time, end_time);

    await conn.commit();

    sendBookingNotification({ userId: req.user.id, bookingId: result.insertId, type: 'created' }).catch(() => {});

    res.status(201).json({ id: result.insertId, message: 'Booking submitted and waiting approval' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

const editBooking = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);
  const { booking_date, start_time, end_time } = req.body;

  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ? AND user_id = ? LIMIT 1', [bookingId, req.user.id]);
  if (!rows.length) throw new AppError(404, 'Booking not found');

  const booking = rows[0];
  if (!['Pending', 'Approved'].includes(booking.status)) {
    throw new AppError(400, 'Only pending/approved booking can be edited');
  }

  validateAdvanceWindow(booking_date);
  validateTimeWindow(start_time, end_time);
  const room = await ensureRoomEnabled();
  await ensureUserDailyWeeklyLimits(req.user.id, booking_date, bookingId);

  const slots = createSlotKeys(booking_date, start_time, end_time);
  await ensureCapacity(booking_date, slots, room.capacity, bookingId);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM booking_slots WHERE booking_id = ?', [bookingId]);
    await conn.query(
      `UPDATE bookings
       SET booking_date = ?, start_time = ?, end_time = ?, status = 'Pending', rejection_reason = NULL
       WHERE id = ?`,
      [booking_date, start_time, end_time, bookingId]
    );
    await persistSlots(conn, bookingId, booking_date, start_time, end_time);
    await conn.commit();
    res.json({ message: 'Booking updated and returned to Pending' });
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
});

const cancelBooking = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);
  const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ? AND user_id = ? LIMIT 1', [bookingId, req.user.id]);
  if (!rows.length) throw new AppError(404, 'Booking not found');

  const booking = rows[0];
  if (!['Pending', 'Approved'].includes(booking.status)) {
    throw new AppError(400, 'Booking cannot be cancelled');
  }

  const start = new Date(`${booking.booking_date}T${booking.start_time}`);
  const now = new Date();
  const diffMs = start.getTime() - now.getTime();
  if (diffMs < 60 * 60 * 1000) {
    throw new AppError(400, 'Cancellation is only allowed at least 1 hour before start');
  }

  await pool.query(
    `UPDATE bookings
     SET status = 'Cancelled', cancelled_at = NOW()
     WHERE id = ?`,
    [bookingId]
  );

  sendBookingNotification({ userId: req.user.id, bookingId, type: 'cancelled' }).catch(() => {});

  res.json({ message: 'Booking cancelled' });
});

module.exports = {
  bookingValidators,
  bookingIdValidator,
  listOwnBookings,
  calendarBookings,
  createBooking,
  editBooking,
  cancelBooking
};
