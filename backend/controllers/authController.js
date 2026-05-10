const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

/**
 * Generate a signed JWT for a given user ID.
 * Expiry is controlled by JWT_EXPIRES_IN env variable (default: 7d).
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * @route   POST /auth/register
 * @access  Public
 * @desc    Register a new user (guest by default, can specify host)
 */
const register = async (req, res, next) => {
  try {
    // Check express-validator results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    // Prevent self-assignment of admin role
    const safeRole = role === 'admin' ? 'guest' : role;

    const user = await User.create({ name, email, password, role: safeRole });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error); // Forward to global error handler
  }
};

/**
 * @route   POST /auth/login
 * @access  Public
 * @desc    Authenticate user and return JWT
 */
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Explicitly select password since it's excluded by default (select: false)
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /auth/me
 * @access  Private
 * @desc    Return the currently authenticated user's profile
 */
const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user, // Set by protect middleware
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe };
