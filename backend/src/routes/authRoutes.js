const express = require('express');
const { validateRequest } = require('../middlewares/validate');
const { upload } = require('../middlewares/upload');
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
  register,
  login,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', upload.single('profile_photo'), registerValidators, validateRequest, register);
router.post('/login', loginValidators, validateRequest, login);
router.post('/forgot-password', forgotPasswordValidators, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidators, validateRequest, resetPassword);

module.exports = router;
