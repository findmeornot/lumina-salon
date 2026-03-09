const mysql = require('mysql2/promise');
const env = require('./env');

const pool = mysql.createPool(env.db);

const verifyDbConnection = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.query('SELECT 1');

    if (env.debugDb) {
      const [metaRows] = await conn.query(
        'SELECT DATABASE() AS current_database, USER() AS user, @@hostname AS server_host, @@port AS server_port'
      );
      console.log('[DB] connected', metaRows?.[0] || {});

      const [bookingsRows] = await conn.query("SHOW TABLES LIKE 'bookings'");
      console.log('[DB] bookings table present:', bookingsRows.length > 0);

      const [tablesRows] = await conn.query('SHOW TABLES');
      const tableNames = tablesRows
        .map((row) => row[Object.keys(row)[0]])
        .filter(Boolean);
      const preview = tableNames.slice(0, 60).join(', ');
      console.log(`[DB] tables(${tableNames.length}): ${preview}${tableNames.length > 60 ? ' ...' : ''}`);
    }
  } finally {
    conn.release();
  }
};

module.exports = { pool, verifyDbConnection };
