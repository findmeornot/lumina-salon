const errorHandler = (err, _req, res, _next) => {
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Duplicate data. Please use another value.' });
  }
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(503).json({ message: 'Database authentication failed. Contact administrator.' });
  }
  if (err.code === 'ECONNREFUSED') {
    return res.status(503).json({ message: 'Database is unavailable. Please try again later.' });
  }

  const status = err.status || 500;
  const payload = { message: err.message || 'Internal server error' };
  if (err.details) payload.details = err.details;
  res.status(status).json(payload);
};

module.exports = { errorHandler };
