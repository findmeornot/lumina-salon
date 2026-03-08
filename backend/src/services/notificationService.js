const { pool } = require('../config/db');
const { sendWhatsApp } = require('./whatsappService');

const formatBookingMessage = (type, booking) => {
  const prefix = {
    created: 'Booking created (Pending)',
    approved: 'Booking approved',
    rejected: 'Booking rejected',
    reminder: 'Booking reminder',
    cancelled: 'Booking cancelled',
    system: 'System notification'
  }[type] || 'Notification';

  return `${prefix}\nTanggal: ${booking.booking_date}\nWaktu: ${booking.start_time} - ${booking.end_time}\nRuang: Lumina Skincare Room`;
};

const sendBookingNotification = async ({ userId, bookingId, type }) => {
  const [rows] = await pool.query(
    `SELECT b.id, b.booking_date, b.start_time, b.end_time, u.phone_number
     FROM bookings b
     JOIN users u ON u.id = b.user_id
     WHERE b.id = ? AND u.id = ?`,
    [bookingId, userId]
  );
  if (!rows.length) return;

  const booking = rows[0];
  const message = formatBookingMessage(type, booking);
  const [result] = await pool.query(
    `INSERT INTO notifications (user_id, booking_id, type, channel, message, status)
     VALUES (?, ?, ?, 'whatsapp', ?, 'pending')`,
    [userId, bookingId, type, message]
  );

  const sent = await sendWhatsApp({
    phoneNumber: booking.phone_number,
    message
  });

  await pool.query(
    `UPDATE notifications
     SET status = ?, provider_response = ?, sent_at = NOW()
     WHERE id = ?`,
    [sent.ok ? 'sent' : sent.skipped ? 'pending' : 'failed', sent.providerResponse || sent.reason || null, result.insertId]
  );
};

module.exports = { sendBookingNotification };

