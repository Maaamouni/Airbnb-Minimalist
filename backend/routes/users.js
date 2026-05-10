const express = require('express');
const { getAllUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// All user routes require authentication
router.use(protect);

// GET /users — Admin only (list all users)
router.get('/', authorize('admin'), getAllUsers);

// GET /users/:id — Admin or self
router.get('/:id', getUserById);

// PUT /users/:id — Admin or self
router.put('/:id', updateUser);

// DELETE /users/:id — Admin only
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;
