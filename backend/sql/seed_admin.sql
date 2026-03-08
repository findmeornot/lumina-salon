-- Replace password hash with bcrypt hash for your chosen password.
-- Example hash below corresponds to password: Admin123! (change in production).
INSERT INTO users (
  email, password_hash, full_name, tahun_angkatan, age, phone_number, role, is_active
) VALUES (
  'admin@lumina.local',
  '$2b$10$QKGo/I7YjN6Tn6Ahn5wM6OE7aV31IYbe4f56lIx9Z6EGG.s6xwI7C',
  'System Admin',
  '2024',
  25,
  '628111111111',
  'admin',
  1
);

INSERT INTO admins (user_id, created_by)
SELECT id, NULL FROM users WHERE email = 'admin@lumina.local'
ON DUPLICATE KEY UPDATE user_id = user_id;

