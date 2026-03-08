const { body } = require('express-validator');
const { pool } = require('../config/db');
const { asyncHandler, AppError } = require('../utils/errors');
const { generateRoomQrDataUrl, isRoomQrValid } = require('../services/qrService');
const { getOrRotateRoomCode, verifyRoomCode } = require('../services/roomCodeService');

const checkinValidator = [
  body('qr_payload').optional().isString(),
  body('room_code').optional().isString()
];

const getRoomQr = asyncHandler(async (_req, res) => {
  const dataUrl = await generateRoomQrDataUrl();
  const code = await getOrRotateRoomCode();
  res.json({ dataUrl, room_code: code.code, room_code_expires_at: code.expiresAt });
});

const checkInByQr = asyncHandler(async (req, res) => {
  const { qr_payload, room_code } = req.body;
  const hasQr = !!qr_payload;
  const hasCode = !!room_code;
  if (!hasQr && !hasCode) throw new AppError(400, 'Provide qr_payload or room_code');

  if (hasQr) {
    if (!isRoomQrValid(qr_payload)) throw new AppError(400, 'Invalid QR code');
  } else {
    const ok = await verifyRoomCode(room_code);
    if (!ok) throw new AppError(400, 'Invalid or expired room code');
  }

  const [rows] = await pool.query(
    `SELECT id
     FROM bookings
     WHERE user_id = ?
       AND status = 'Approved'
       AND NOW() BETWEEN CONCAT(booking_date, ' ', start_time)
                     AND CONCAT(booking_date, ' ', end_time)
     ORDER BY booking_date DESC, start_time DESC
     LIMIT 1`,
    [req.user.id]
  );

  if (!rows.length) {
    throw new AppError(400, 'No approved booking active at current time');
  }

  const bookingId = rows[0].id;

  await pool.query(`INSERT INTO checkins (booking_id, user_id, source) VALUES (?, ?, 'qr')`, [bookingId, req.user.id]);
  await pool.query(`UPDATE bookings SET status = 'Checked-In', checked_in_at = NOW() WHERE id = ?`, [bookingId]);

  res.json({ message: 'Check-in successful', booking_id: bookingId });
});

module.exports = { checkinValidator, getRoomQr, checkInByQr };
