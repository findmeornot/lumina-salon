const express = require('express');
const { authRequired } = require('../middlewares/auth');
const { getFacilityInfo, listBeautyTools } = require('../controllers/infoController');

const router = express.Router();

router.use(authRequired);
router.get('/facility', getFacilityInfo);
router.get('/tools', listBeautyTools);

module.exports = router;

