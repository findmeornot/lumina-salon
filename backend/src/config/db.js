const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool(env.db);

const verifyDbConnection = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');
  } finally {
    conn.release();
  }
};

module.exports = { pool, verifyDbConnection };
