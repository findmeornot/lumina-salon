const cron = require('node-cron');
const { pool } = require('../config/db');
const { sendBookingNotification } = require('../services/notificationService');
const { getOrRotateRoomCode } = require('../services/roomCodeService');

const autoCancelNoShow = async () => {
  const [rows] = await pool.query(
    `SELECT id, user_id
     FROM bookings
     WHERE status = 'Approved'
       AND NOW() > DATE_ADD(CONCAT(booking_date, ' ', start_time), INTERVAL 1 HOUR)
       AND checked_in_at IS NULL`
  );

  for (const booking of rows) {
    await pool.query(
      `UPDATE bookings
       SET status = 'Cancelled', cancelled_at = NOW()
       WHERE id = ?`,
      [booking.id]
    );
    sendBookingNotification({ userId: booking.user_id, bookingId: booking.id, type: 'cancelled' }).catch(() => {});
  }
};

const sendReminders = async () => {
  const [rows] = await pool.query(
    `SELECT id, user_id
     FROM bookings
     WHERE status = 'Approved'
       AND TIMESTAMPDIFF(MINUTE, NOW(), CONCAT(booking_date, ' ', start_time)) BETWEEN 55 AND 60`
  );

  for (const booking of rows) {
    sendBookingNotification({ userId: booking.user_id, bookingId: booking.id, type: 'reminder' }).catch(() => {});
  }
};

const markCompleted = async () => {
  await pool.query(
    `UPDATE bookings
     SET status = 'Completed'
     WHERE status IN ('Approved','Checked-In')
       AND NOW() > CONCAT(booking_date, ' ', end_time)`
  );
};

const registerCronJobs = () => {
  cron.schedule('*/5 * * * *', autoCancelNoShow);
  cron.schedule('*/5 * * * *', sendReminders);
  cron.schedule('*/5 * * * *', markCompleted);
  cron.schedule('*/5 * * * *', () => getOrRotateRoomCode().catch(() => {}));
};

module.exports = { registerCronJobs };
