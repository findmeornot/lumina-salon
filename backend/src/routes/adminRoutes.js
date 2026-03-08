const express = require('express');
const { authRequired, roleRequired } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');
const { adminLoginValidators, adminLogin } = require('../controllers/adminAuthController');
const {
  bookingActionValidator,
  settingValidator,
  createAdminValidator,
  dashboard,
  listBookings,
  approveBooking,
  rejectBooking,
  updateRoomSetting,
  listUsers,
  toggleUserStatus,
  createAdmin,
  analytics,
  checkinLogs
} = require('../controllers/adminController');

const router = express.Router();

// Admin dashboard login via username/password (optional; controlled by env)
router.post('/login', adminLoginValidators, validateRequest, adminLogin);

router.use(authRequired, roleRequired('admin'));

router.get('/dashboard', dashboard);
router.get('/bookings', listBookings);
router.patch('/bookings/:id/approve', bookingActionValidator, validateRequest, approveBooking);
router.patch('/bookings/:id/reject', bookingActionValidator, validateRequest, rejectBooking);
router.patch('/room', settingValidator, validateRequest, updateRoomSetting);
router.get('/users', listUsers);
router.patch('/users/:id/toggle', toggleUserStatus);
router.post('/admins', createAdminValidator, validateRequest, createAdmin);
router.get('/analytics', analytics);
router.get('/logs/checkins', checkinLogs);

module.exports = router;
