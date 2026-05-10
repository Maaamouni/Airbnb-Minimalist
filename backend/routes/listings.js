const express = require('express');
const { body } = require('express-validator');
const {
  getListings,
  getListingById,
  createListing,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Validation rules for creating a listing
const listingValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').notEmpty().withMessage('Description is required').isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('price').isFloat({ min: 1 }).withMessage('Price must be a positive number'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('images').optional().isArray().withMessage('Images must be an array of URLs'),
];

// GET /listings?city=&minPrice=&maxPrice=  — Public
router.get('/', getListings);

// GET /listings/:id — Public
router.get('/:id', getListingById);

// POST /listings — Host or Admin only
router.post('/', protect, authorize('host', 'admin'), listingValidation, createListing);

// PUT /listings/:id — Host (owner) or Admin only
router.put('/:id', protect, authorize('host', 'admin'), updateListing);

// DELETE /listings/:id — Host (owner) or Admin only
router.delete('/:id', protect, authorize('host', 'admin'), deleteListing);

module.exports = router;
