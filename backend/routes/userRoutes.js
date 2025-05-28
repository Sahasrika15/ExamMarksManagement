const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/userControllers');
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/users/login
router.post('/login', loginUser);

// Example protected route
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        facultyId: user.facultyId || null,
      },
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;