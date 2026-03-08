const express = require('express');
const { authRequired } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');
const {
  bookingValidators,
  bookingIdValidator,
  listOwnBookings,
  calendarBookings,
  createBooking,
  editBooking,
  cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

router.get('/calendar', authRequired, calendarBookings);
router.get('/mine', authRequired, listOwnBookings);
router.post('/', authRequired, bookingValidators, validateRequest, createBooking);
router.put('/:id', authRequired, bookingIdValidator, bookingValidators, validateRequest, editBooking);
router.patch('/:id/cancel', authRequired, bookingIdValidator, validateRequest, cancelBooking);

module.exports = router;
