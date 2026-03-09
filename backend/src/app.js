const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const env = require('./config/env');
const { errorHandler } = require('./middlewares/errorHandler');

const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const profileRoutes = require('./routes/profileRoutes');
const qrRoutes = require('./routes/qrRoutes');

const app = express();

app.use(helmet());
const allowedOrigins = [
  env.frontendUrl,
  env.appPublicUrl,
  process.env.CORS_ORIGINS
]
  .filter(Boolean)
  .flatMap((value) => String(value).split(','))
  .map((s) => s.trim())
  .filter(Boolean);
const allowedOriginSet = new Set(allowedOrigins);

// CORS should never break static assets (CSS/JS). Also, when the frontend is served from
// the same host (e.g. via ngrok pointing to the backend), we allow that origin implicitly.
// If an origin isn't allowed, we simply disable CORS for that request (no thrown error),
// letting same-origin navigation/assets still work.
const corsOptionsDelegate = (req, cb) => {
  const origin = req.header('Origin');
  const host = req.get('host');

  if (!origin) {
    return cb(null, { origin: false, credentials: true, optionsSuccessStatus: 204 });
  }

  let isSameHost = false;
  try {
    isSameHost = new URL(origin).host === host;
  } catch (_) {
    isSameHost = false;
  }

  const isAllowed =
    isSameHost ||
    allowedOriginSet.has(origin) ||
    (env.nodeEnv === 'development' && /^https?:\/\/localhost:517\d$/.test(origin));

  return cb(null, { origin: isAllowed, credentials: true, optionsSuccessStatus: 204 });
};
app.use(cors(corsOptionsDelegate));
// Ensure preflight OPTIONS always gets CORS headers when allowed.
app.options('*', cors(corsOptionsDelegate));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(env.uploadDir));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/qr', qrRoutes);

const frontendDist = path.join(env.backendRoot, '..', 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    return res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

app.use(errorHandler);

module.exports = app;
