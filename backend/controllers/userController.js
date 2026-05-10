const User = require('../models/User');

/**
 * @route   GET /users
 * @access  Private (admin only)
 * @desc    Get all users (admin moderation panel)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /users/:id
 * @access  Private (admin, or user viewing their own profile)
 * @desc    Get a user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    // Allow user to view own profile, or admin to view any
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /users/:id
 * @access  Private (user updates own profile, admin updates any)
 * @desc    Update name, email, or role (admin only for role)
 */
const updateUser = async (req, res, next) => {
  try {
    if (req.params.id !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    const allowedUpdates = ['name', 'email'];
    if (req.user.role === 'admin') allowedUpdates.push('role'); // Only admin can change roles

    const updates = {};
    allowedUpdates.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'User updated.', data: user });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /users/:id
 * @access  Private (admin only)
 * @desc    Delete a user account (admin moderation)
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await user.deleteOne();
    res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
