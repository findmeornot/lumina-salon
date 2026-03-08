const crypto = require('crypto');
const { pool } = require('../config/db');

const CODE_ALPHABET = '0123456789';

const randomCode = (len = 6) => {
  const bytes = crypto.randomBytes(len);
  let out = '';
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
};

const ttlMinutes = () => {
  const raw = Number(process.env.ROOM_CODE_TTL_MINUTES || 10);
  return Number.isFinite(raw) && raw >= 2 ? raw : 10;
};

const getOrRotateRoomCode = async () => {
  const [rows] = await pool.query(
    `SELECT checkin_code, checkin_code_expires_at
     FROM room_settings
     WHERE id = 1
     LIMIT 1`
  );

  const now = new Date();
  const current = rows[0] || null;
  const expiresAt = current?.checkin_code_expires_at ? new Date(current.checkin_code_expires_at) : null;

  if (current?.checkin_code && expiresAt && expiresAt.getTime() > now.getTime()) {
    return { code: current.checkin_code, expiresAt: current.checkin_code_expires_at };
  }

  const code = randomCode(6);
  const exp = new Date(now.getTime() + ttlMinutes() * 60 * 1000);
  const expSql = exp.toISOString().slice(0, 19).replace('T', ' ');

  await pool.query(
    `UPDATE room_settings
     SET checkin_code = ?, checkin_code_expires_at = ?, checkin_code_updated_at = NOW()
     WHERE id = 1`,
    [code, expSql]
  );

  return { code, expiresAt: expSql };
};

const verifyRoomCode = async (code) => {
  const c = String(code || '').trim();
  if (!/^\d{6}$/.test(c)) return false;

  const [rows] = await pool.query(
    `SELECT checkin_code, checkin_code_expires_at
     FROM room_settings
     WHERE id = 1
     LIMIT 1`
  );
  if (!rows.length) return false;
  if (!rows[0].checkin_code || !rows[0].checkin_code_expires_at) return false;
  if (String(rows[0].checkin_code) !== c) return false;

  const exp = new Date(rows[0].checkin_code_expires_at);
  return exp.getTime() > Date.now();
};

module.exports = { getOrRotateRoomCode, verifyRoomCode };
