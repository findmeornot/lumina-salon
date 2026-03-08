CREATE DATABASE IF NOT EXISTS lumina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE lumina;

CREATE TABLE users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  tahun_angkatan VARCHAR(20) NOT NULL,
  age TINYINT UNSIGNED NOT NULL,
  phone_number VARCHAR(25) NOT NULL,
  nim VARCHAR(50) NULL,
  profile_photo_url VARCHAR(255) NULL,
  role ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role_active (role, is_active)
);

CREATE TABLE admins (
  user_id BIGINT UNSIGNED PRIMARY KEY,
  created_by BIGINT UNSIGNED NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_admin_created_by FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE password_reset_tokens (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  token_hash CHAR(64) NOT NULL,
  expires_at DATETIME NOT NULL,
  used_at DATETIME NULL,
  request_ip VARCHAR(45) NULL,
  user_agent VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_prt_token_hash (token_hash),
  INDEX idx_prt_user_expires (user_id, expires_at),
  INDEX idx_prt_used_at (used_at)
);

CREATE TABLE room_settings (
  id TINYINT UNSIGNED PRIMARY KEY,
  room_name VARCHAR(120) NOT NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  capacity TINYINT UNSIGNED NOT NULL DEFAULT 5,
  open_time TIME NOT NULL DEFAULT '17:00:00',
  close_time TIME NOT NULL DEFAULT '21:30:00',
  checkin_code VARCHAR(6) NULL,
  checkin_code_expires_at DATETIME NULL,
  checkin_code_updated_at DATETIME NULL,
  updated_by BIGINT UNSIGNED NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_room_updated_by FOREIGN KEY (updated_by) REFERENCES users(id)
);

INSERT INTO room_settings (id, room_name, is_enabled, capacity, open_time, close_time)
VALUES (1, 'Lumina Skincare Room', 1, 5, '17:00:00', '21:30:00')
AS new
ON DUPLICATE KEY UPDATE
  room_name = new.room_name,
  is_enabled = new.is_enabled,
  capacity = new.capacity,
  open_time = new.open_time,
  close_time = new.close_time;

CREATE TABLE bookings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  status ENUM('Pending','Approved','Rejected','Cancelled','Completed','Checked-In') NOT NULL DEFAULT 'Pending',
  rejection_reason VARCHAR(255) NULL,
  cancelled_at DATETIME NULL,
  checked_in_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_bookings_user_date (user_id, booking_date),
  INDEX idx_bookings_status_date (status, booking_date),
  INDEX idx_bookings_date_time (booking_date, start_time, end_time)
);

CREATE TABLE booking_slots (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNSIGNED NOT NULL,
  slot_start DATETIME NOT NULL,
  slot_end DATETIME NOT NULL,
  slot_key VARCHAR(30) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_slots_booking FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_booking_slot (booking_id, slot_key),
  INDEX idx_slot_key (slot_key),
  INDEX idx_slot_start_end (slot_start, slot_end)
);

CREATE TABLE checkins (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  booking_id BIGINT UNSIGNED NOT NULL,
  user_id BIGINT UNSIGNED NOT NULL,
  checkin_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source ENUM('qr') NOT NULL DEFAULT 'qr',
  CONSTRAINT fk_checkins_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  CONSTRAINT fk_checkins_user FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE KEY uniq_booking_checkin (booking_id),
  INDEX idx_checkin_user_time (user_id, checkin_time)
);

CREATE TABLE notifications (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  booking_id BIGINT UNSIGNED NULL,
  type ENUM('created','approved','rejected','reminder','cancelled','system') NOT NULL,
  channel ENUM('whatsapp','in_app') NOT NULL DEFAULT 'whatsapp',
  message TEXT NOT NULL,
  status ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  provider_response TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME NULL,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_notifications_booking FOREIGN KEY (booking_id) REFERENCES bookings(id),
  INDEX idx_notifications_user_created (user_id, created_at),
  INDEX idx_notifications_status (status)
);

CREATE OR REPLACE VIEW weekly_booking_stats AS
SELECT
  YEARWEEK(booking_date, 1) AS year_week,
  COUNT(*) AS total_bookings
FROM bookings
WHERE status IN ('Approved', 'Completed', 'Checked-In')
GROUP BY YEARWEEK(booking_date, 1);

