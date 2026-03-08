-- Run this on an existing database to add the 6-char manual check-in code support.
ALTER TABLE room_settings
  ADD COLUMN checkin_code VARCHAR(6) NULL,
  ADD COLUMN checkin_code_expires_at DATETIME NULL,
  ADD COLUMN checkin_code_updated_at DATETIME NULL;

