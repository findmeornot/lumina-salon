const express = require('express');
const { authRequired } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { validateRequest } = require('../middlewares/validate');
const { profileValidators, me, updateProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/me', authRequired, me);
router.patch('/me', authRequired, upload.single('profile_photo'), profileValidators, validateRequest, updateProfile);

module.exports = router;
