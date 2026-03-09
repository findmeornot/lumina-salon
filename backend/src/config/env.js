const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const backendRoot = path.resolve(__dirname, '..', '..');
// Always load `backend/.env` regardless of where the process is started from.
dotenv.config({ path: path.join(backendRoot, '.env') });
// Allow environment variables to override .env if present.
dotenv.config();

const uploadDir = path.join(backendRoot, process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const truthy = (value) => ['1', 'true', 'yes', 'y', 'on'].includes(String(value || '').trim().toLowerCase());

const parseMysqlUrl = (urlValue) => {
  if (!urlValue) return null;
  try {
    const u = new URL(urlValue);
    const protocol = String(u.protocol || '').toLowerCase();
    if (protocol !== 'mysql:' && protocol !== 'mariadb:') return null;

    const databaseFromPath = String(u.pathname || '').replace(/^\/+/, '');
    return {
      host: u.hostname,
      port: Number(u.port || 3306),
      user: decodeURIComponent(u.username || ''),
      password: decodeURIComponent(u.password || ''),
      database: databaseFromPath
    };
  } catch {
    return null;
  }
};

const urlDb =
  parseMysqlUrl(process.env.DATABASE_URL) ||
  parseMysqlUrl(process.env.MYSQL_URL) ||
  parseMysqlUrl(process.env.MYSQL_PUBLIC_URL);

const dbHost = urlDb?.host || process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const dbPort = urlDb?.port || Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306);
const dbUser = urlDb?.user || process.env.MYSQLUSER || process.env.DB_USER || 'root';
const dbPassword = urlDb?.password || process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
const dbName = urlDb?.database || process.env.MYSQLDATABASE || process.env.DB_NAME || 'lumina';

module.exports = {
  backendRoot,
  nodeEnv: process.env.NODE_ENV || 'development',
  host: process.env.HOST || ((process.env.NODE_ENV || 'development') === 'development' ? '127.0.0.1' : '0.0.0.0'),
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  appPublicUrl: process.env.APP_PUBLIC_URL || process.env.FRONTEND_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'unsafe_secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  passwordResetTtlMinutes: Number(process.env.PASSWORD_RESET_TTL_MINUTES || 30),
  adminDash: {
    enabled: String(process.env.ADMIN_DASH_LOGIN_ENABLED || 'false').toLowerCase() === 'true',
    username: process.env.ADMIN_DASH_USERNAME || '',
    password: process.env.ADMIN_DASH_PASSWORD || '',
    // This user will be used for admin JWT identity (must exist or will be auto-created).
    email: process.env.ADMIN_DASH_EMAIL || 'admin@lumina.local'
  },
  db: {
    host: dbHost,
    port: dbPort,
    user: dbUser,
    password: dbPassword,
    database: dbName,
    waitForConnections: true,
    connectionLimit: Number(process.env.DB_POOL_LIMIT || 25),
    queueLimit: 0,
    timezone: 'Z',
    enableKeepAlive: true,
    // Prevent DATE/DATETIME columns from becoming JS Date objects (which JSON-stringify to ISO with "T...Z").
    dateStrings: true
  },
  debugDb: truthy(process.env.DEBUG_DB || process.env.DB_DEBUG),
  uploadDir,
  roomQrSecret: process.env.ROOM_QR_SECRET || 'LUMINA_ROOM_FIXED_QR',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Lumina <no-reply@lumina.local>'
  },
  whatsappProviderUrl: process.env.WHATSAPP_PROVIDER_URL || '',
  whatsappProviderToken: process.env.WHATSAPP_PROVIDER_TOKEN || '',
  whatsappSender: process.env.WHATSAPP_SENDER || 'Lumina'
};

