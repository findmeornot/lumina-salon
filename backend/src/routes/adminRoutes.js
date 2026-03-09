const express = require('express');
const { authRequired, roleRequired } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');
const { adminLoginValidators, adminLogin } = require('../controllers/adminAuthController');
const { upload } = require('../middlewares/upload');
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
const {
  facilityInfoValidators,
  getFacilityInfoAdmin,
  updateFacilityInfoAdmin
} = require('../controllers/adminFacilityController');
const {
  toolIdValidator,
  upsertToolValidators,
  listToolsAdmin,
  createToolAdmin,
  updateToolAdmin,
  deactivateToolAdmin
} = require('../controllers/adminBeautyToolsController');

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

// Facility info & directory management
router.get('/facility', getFacilityInfoAdmin);
router.put('/facility', facilityInfoValidators, validateRequest, updateFacilityInfoAdmin);
router.get('/tools', listToolsAdmin);
router.post('/tools', upload.single('photo'), upsertToolValidators, validateRequest, createToolAdmin);
router.put('/tools/:id', upload.single('photo'), toolIdValidator, upsertToolValidators, validateRequest, updateToolAdmin);
router.delete('/tools/:id', toolIdValidator, validateRequest, deactivateToolAdmin);

module.exports = router;
