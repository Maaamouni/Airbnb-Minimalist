const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * protect — Verifies JWT and attaches the authenticated user to req.user.
 * Usage: apply to any route that requires authentication.
 */
const protect = async (req, res, next) => {
  let token;

  // JWT is expected in the Authorization header as "Bearer <token>"
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }

  try {
    // Verify token signature and expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user (exclude password) — ensures user still exists
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
};

/**
 * authorize(...roles) — Restricts route access to specific roles.
 * Must be used AFTER protect middleware.
 * Example: router.post('/listings', protect, authorize('host', 'admin'), createListing)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role(s): ${roles.join(', ')}. Your role: ${req.user.role}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
