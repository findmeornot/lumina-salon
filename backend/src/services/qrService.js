const QRCode = require('qrcode');
const env = require('../config/env');

const buildRoomQrPayload = () => JSON.stringify({
  room: 'Lumina',
  code: env.roomQrSecret
});

const generateRoomQrDataUrl = async () => QRCode.toDataURL(buildRoomQrPayload());

const isRoomQrValid = (payload) => {
  try {
    const parsed = typeof payload === 'string' ? JSON.parse(payload) : payload;
    return parsed.room === 'Lumina' && parsed.code === env.roomQrSecret;
  } catch {
    return false;
  }
};

module.exports = { buildRoomQrPayload, generateRoomQrDataUrl, isRoomQrValid };

