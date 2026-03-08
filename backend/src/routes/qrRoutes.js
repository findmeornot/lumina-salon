const express = require('express');
const { authRequired, roleRequired } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');
const { checkinValidator, getRoomQr, checkInByQr } = require('../controllers/qrController');

const router = express.Router();

router.get('/room', authRequired, roleRequired('admin'), getRoomQr);
router.post('/checkin', authRequired, checkinValidator, validateRequest, checkInByQr);

module.exports = router;
