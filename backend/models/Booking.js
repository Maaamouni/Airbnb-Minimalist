const mongoose = require('mongoose');

/**
 * Booking schema — represents a reservation.
 * Business rules (from README):
 *   - status defaults to 'pending'
 *   - host must confirm (status → confirmed/cancelled)
 *   - totalPrice = numberOfDays * listing.price
 *   - dates cannot overlap with existing confirmed bookings
 */
const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Listing',
      required: [true, 'Listing is required'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    totalPrice: {
      type: Number,
      required: [true, 'Total price is required'],
      min: [0, 'Total price cannot be negative'],
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'confirmed', 'cancelled'],
        message: 'Status must be pending, confirmed, or cancelled',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast overlap detection on the same listing
bookingSchema.index({ listing: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
