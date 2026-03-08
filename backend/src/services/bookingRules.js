const { pool } = require('../config/db');
const { AppError } = require('../utils/errors');

const OPEN_MINUTE = 17 * 60;
const CLOSE_MINUTE = 21 * 60 + 30;
const SLOT_MINUTES = 30;
const MAX_DURATION_MINUTES = 60;

const toMinutes = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const formatDateTime = (date, hhmm) => `${date} ${hhmm}:00`;

const createSlotKeys = (bookingDate, startTime, endTime) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const slots = [];
  for (let m = start; m < end; m += SLOT_MINUTES) {
    const h = String(Math.floor(m / 60)).padStart(2, '0');
    const mm = String(m % 60).padStart(2, '0');
    slots.push(`${bookingDate}_${h}:${mm}`);
  }
  return slots;
};

const validateTimeWindow = (startTime, endTime) => {
  const start = toMinutes(startTime);
  const end = toMinutes(endTime);
  const duration = end - start;

  if (start < OPEN_MINUTE || end > CLOSE_MINUTE || start >= end) {
    throw new AppError(400, 'Booking must be inside 17:00-21:30 operating hours');
  }
  if (duration < SLOT_MINUTES || duration > MAX_DURATION_MINUTES) {
    throw new AppError(400, 'Booking duration must be 30-60 minutes');
  }
  if (duration % SLOT_MINUTES !== 0) {
    throw new AppError(400, 'Booking duration must use 30-minute increments');
  }
};

const validateAdvanceWindow = (bookingDate) => {
  const target = new Date(`${bookingDate}T00:00:00`);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffDays = Math.floor((target - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0 || diffDays > 7) {
    throw new AppError(400, 'Booking is only allowed up to 7 days in advance');
  }
};

const ensureUserDailyWeeklyLimits = async (userId, bookingDate, ignoreBookingId = null) => {
  const ignoreClause = ignoreBookingId ? ' AND id <> ? ' : '';
  const paramsDaily = [userId, bookingDate];
  if (ignoreBookingId) paramsDaily.push(ignoreBookingId);
  const [dailyRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM bookings
     WHERE user_id = ? AND booking_date = ?
       AND status IN ('Pending','Approved','Checked-In','Completed') ${ignoreClause}`,
    paramsDaily
  );
  if (dailyRows[0].total >= 1) {
    throw new AppError(400, 'Maximum one booking per day');
  }

  const [weekRows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM bookings
     WHERE user_id = ?
       AND YEARWEEK(booking_date, 1) = YEARWEEK(?, 1)
       AND status IN ('Pending','Approved','Checked-In','Completed') ${ignoreClause}`,
    paramsDaily
  );

  if (weekRows[0].total >= 2) {
    throw new AppError(400, 'Maximum two bookings per week');
  }
};

const ensureRoomEnabled = async () => {
  const [rows] = await pool.query('SELECT is_enabled, capacity FROM room_settings WHERE id = 1 LIMIT 1');
  if (!rows.length || !rows[0].is_enabled) {
    throw new AppError(400, 'Skincare room is temporarily disabled');
  }
  return rows[0];
};

const ensureCapacity = async (bookingDate, slotKeys, capacity, ignoreBookingId = null) => {
  if (!slotKeys.length) return;
  const placeholders = slotKeys.map(() => '?').join(',');
  const params = [...slotKeys];
  let ignoreSql = '';
  if (ignoreBookingId) {
    ignoreSql = ' AND b.id <> ?';
    params.push(ignoreBookingId);
  }

  const [rows] = await pool.query(
    `SELECT bs.slot_key, COUNT(*) AS slot_count
     FROM booking_slots bs
     JOIN bookings b ON b.id = bs.booking_id
     WHERE bs.slot_key IN (${placeholders})
       AND b.status IN ('Approved','Checked-In')
       ${ignoreSql}
     GROUP BY bs.slot_key`,
    params
  );

  const overloaded = rows.find((r) => r.slot_count >= capacity);
  if (overloaded) {
    throw new AppError(400, `Slot ${overloaded.slot_key} is already full`);
  }
};

const persistSlots = async (conn, bookingId, bookingDate, startTime, endTime) => {
  const keys = createSlotKeys(bookingDate, startTime, endTime);
  for (const key of keys) {
    const timePart = key.split('_')[1];
    const start = formatDateTime(bookingDate, timePart);
    const dt = new Date(start);
    const endDt = new Date(dt.getTime() + SLOT_MINUTES * 60000);
    const endH = String(endDt.getHours()).padStart(2, '0');
    const endM = String(endDt.getMinutes()).padStart(2, '0');

    await conn.query(
      `INSERT INTO booking_slots (booking_id, slot_start, slot_end, slot_key)
       VALUES (?, ?, ?, ?)`,
      [bookingId, start, `${bookingDate} ${endH}:${endM}:00`, key]
    );
  }
  return keys;
};

module.exports = {
  validateTimeWindow,
  validateAdvanceWindow,
  ensureUserDailyWeeklyLimits,
  ensureRoomEnabled,
  ensureCapacity,
  createSlotKeys,
  persistSlots
};
