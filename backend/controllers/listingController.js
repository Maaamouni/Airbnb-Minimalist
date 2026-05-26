const { validationResult } = require('express-validator');
const Listing = require('../models/Listing');
const { getRedisClient, deleteByPattern } = require('../config/redis');

const CACHE_TTL = Number(process.env.LISTINGS_CACHE_TTL || 600); // seconds

/**
 * Build a Redis cache key from the query parameters.
 * Normalized to lowercase to avoid cache misses from case differences.
 */
const buildCacheKey = (city, minPrice, maxPrice) => {
  return `listings:${city || 'all'}:min${minPrice || '0'}:max${maxPrice || 'any'}`;
};

/**
 * @route   GET /listings?city=&minPrice=&maxPrice=
 * @access  Public
 * @desc    Search listings by city and optional price range.
 *          Results are cached in Redis for 10 minutes.
 */
const getListings = async (req, res, next) => {
  try {
    const { city, minPrice, maxPrice } = req.query;

    // --- Redis cache check ---
    const redis = getRedisClient();
    const cacheKey = buildCacheKey(city?.toLowerCase(), minPrice, maxPrice);

    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          success: true,
          source: 'cache',
          data: JSON.parse(cached),
        });
      }
    }

    // --- Build MongoDB query ---
    const query = {};
    if (city) query.city = city.toLowerCase().trim();
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const listings = await Listing.find(query)
      .populate('owner', 'name email') // Include host info
      .sort({ createdAt: -1 });

    // --- Store result in Redis ---
    if (redis) {
      await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(listings));
    }

    res.status(200).json({
      success: true,
      source: 'database',
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /listings/:id
 * @access  Public
 * @desc    Get a single listing by ID with owner info
 */
const getListingById = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name email');

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    res.status(200).json({ success: true, data: listing });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /listings
 * @access  Private (host, admin)
 * @desc    Create a new listing. Owner is set from the authenticated user.
 */
const createListing = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { title, description, price, city, images } = req.body;

    const listing = await Listing.create({
      title,
      description,
      price,
      city: city.toLowerCase().trim(),
      images: images || [],
      owner: req.user._id,
    });

    // Invalidate city cache so updated listings are returned
    await deleteByPattern('listings:*');

    res.status(201).json({ success: true, message: 'Listing created.', data: listing });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /listings/:id
 * @access  Private (owner host, or admin)
 * @desc    Update a listing. Only the owner or admin can update.
 */
const updateListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    // Authorization: only owner or admin can edit
    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing.' });
    }

    const allowedUpdates = ['title', 'description', 'price', 'city', 'images'];
    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (updates.city) updates.city = updates.city.toLowerCase().trim();

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, {
      new: true,       // Return the updated document
      runValidators: true, // Run schema validators on update
    });

    // Invalidate cache for affected city
    await deleteByPattern('listings:*');

    res.status(200).json({ success: true, message: 'Listing updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /listings/:id
 * @access  Private (owner host, or admin)
 * @desc    Delete a listing. Only the owner or admin can delete.
 */
const deleteListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    if (listing.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    await listing.deleteOne();

    // Invalidate cache
    await deleteByPattern('listings:*');

    res.status(200).json({ success: true, message: 'Listing deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getListings, getListingById, createListing, updateListing, deleteListing };
