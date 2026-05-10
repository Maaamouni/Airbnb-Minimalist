const mongoose = require('mongoose');

/**
 * Listing schema — represents a property (logement).
 * owner references the User who created it (must be a host).
 * Matches README spec: title, description, price, city, images[], owner
 */
const listingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price per night is required'],
      min: [1, 'Price must be at least 1'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      lowercase: true, // Normalize for case-insensitive search & Redis key
    },
    images: {
      type: [String],
      default: [],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Owner is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast city-based search (used heavily in GET /listings?city=)
listingSchema.index({ city: 1 });
listingSchema.index({ price: 1 });

module.exports = mongoose.model('Listing', listingSchema);
