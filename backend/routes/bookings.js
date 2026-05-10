const express = require('express');
const { body } = require('express-validator');
const {
  createBooking,
  getUserBookings,
  getHostBookings,
  updateBookingStatus,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All booking routes require authentication
router.use(protect);

// Validation rules for creating a booking
const bookingValidation = [
  body('listingId').notEmpty().withMessage('Listing ID is required').isMongoId().withMessage('Invalid listing ID'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Start date must be a valid date'),
  body('endDate').notEmpty().withMessage('End date is required').isISO8601().withMessage('End date must be a valid date'),
];

// POST /bookings — Any authenticated user (guest, host)
router.post('/', bookingValidation, createBooking);

// GET /bookings/user — Guest: see own bookings
router.get('/user', getUserBookings);

// GET /bookings/host — Host: see bookings for own listings
router.get('/host', authorize('host', 'admin'), getHostBookings);

// PUT /bookings/:id — Host accepts or refuses a booking
router.put('/:id', authorize('host', 'admin'), updateBookingStatus);

module.exports = router;
