const errorHandler = (err, _req, res, _next) => {
  if ((process.env.NODE_ENV || 'development') === 'development') {
    // eslint-disable-next-line no-console
    console.error('[ERROR]', err);
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate data. Please use another value.' });
  }
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ message: 'Database authentication failed. Contact administrator.' });
  }
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ message: 'Database is unavailable. Please try again later.' });
  }
  if (err.code === 'ER_NO_SUCH_TABLE') {
    return res.status(500).json({
      message: `${err.message}. Database schema is missing tables. Run the latest SQL in backend/sql/schema.sql.`
    });
  }

  const status = err.status || 500;
  const payload = { message: err.message || 'Internal server error' };
  if ((process.env.NODE_ENV || 'development') === 'development') {
    if (err.code) payload.code = err.code;
    if (err.sqlMessage && typeof err.sqlMessage === 'string') payload.sqlMessage = err.sqlMessage;
  }
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
};

module.exports = { errorHandler };
