const multer = require('multer');
const path = require('path');
const env = require('../config/env');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const fileFilter = (_req, file, cb) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
    cb(new Error('Only jpeg, png, and webp files are allowed'));
    return;
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter
});

module.exports = { upload };
