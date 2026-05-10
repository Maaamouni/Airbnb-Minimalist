const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Listing = require('../models/Listing');

/**
 * Check if a date range overlaps with any confirmed/pending bookings
 * for a given listing. Prevents double-booking.
 *
 * Overlap condition: startA < endB && endA > startB
 */
const hasDateConflict = async (listingId, startDate, endDate, excludeBookingId = null) => {
  const query = {
    listing: listingId,
    status: { $in: ['pending', 'confirmed'] },
    startDate: { $lt: new Date(endDate) },
    endDate: { $gt: new Date(startDate) },
  };

  // Exclude current booking when updating
  if (excludeBookingId) query._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(query);
  return !!conflict;
};

/**
 * @route   POST /bookings
 * @access  Private (guest, admin)
 * @desc    Create a booking. Validates date availability and calculates price.
 *          Business rules:
 *            - endDate must be after startDate
 *            - startDate must be in the future
 *            - no date overlap with existing bookings
 *            - totalPrice = numberOfDays * listing.price
 *            - status = pending by default
 */
const createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { listingId, startDate, endDate } = req.body;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate date logic
    if (start < today) {
      return res.status(400).json({ success: false, message: 'Start date cannot be in the past.' });
    }
    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End date must be after start date.' });
    }

    // Check listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Prevent host from booking their own listing
    if (listing.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot book your own listing.' });
    }

    // Check date conflicts
    const conflict = await hasDateConflict(listingId, startDate, endDate);
    if (conflict) {
      return res.status(409).json({ success: false, message: 'These dates are not available for this listing.' });
    }

    // Calculate total price: number of days × price per night
    const msPerDay = 1000 * 60 * 60 * 24;
    const numberOfDays = Math.ceil((end - start) / msPerDay);
    const totalPrice = numberOfDays * listing.price;

    const booking = await Booking.create({
      user: req.user._id,
      listing: listingId,
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'pending',
    });

    await booking.populate([
      { path: 'user', select: 'name email' },
      { path: 'listing', select: 'title city price' },
    ]);

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Awaiting host confirmation.',
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /bookings/user
 * @access  Private (authenticated user)
 * @desc    Get all bookings made by the authenticated guest
 */
const getUserBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('listing', 'title city price images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /bookings/host
 * @access  Private (host, admin)
 * @desc    Get all bookings for listings owned by the authenticated host
 */
const getHostBookings = async (req, res, next) => {
  try {
    // Find all listings owned by this host
    const hostListings = await Listing.find({ owner: req.user._id }).select('_id');
    const listingIds = hostListings.map((l) => l._id);

    const bookings = await Booking.find({ listing: { $in: listingIds } })
      .populate('user', 'name email')
      .populate('listing', 'title city price')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /bookings/:id
 * @access  Private (host of the listing, or admin)
 * @desc    Host accepts or refuses a booking (confirmed | cancelled)
 */
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    // Only these transitions are allowed via this endpoint
    if (!['confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "confirmed" or "cancelled".',
      });
    }

    const booking = await Booking.findById(req.params.id).populate('listing');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    // Only the listing's owner (host) or admin can change status
    if (
      booking.listing.owner.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking.' });
    }

    // Cannot change a booking that is already finalized
    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot update a booking with status "${booking.status}".`,
      });
    }

    booking.status = status;
    await booking.save();

    res.status(200).json({
      success: true,
      message: `Booking ${status}.`,
      data: booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getUserBookings, getHostBookings, updateBookingStatus };
