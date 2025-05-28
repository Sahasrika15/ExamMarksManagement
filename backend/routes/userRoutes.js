const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password, loginType, facultyId, department } = req.body;

  try {
    // Validate required fields
    if (!email || !password || !loginType) {
      return res.status(400).json({ success: false, message: 'Email, password, and login type are required' });
    }

    if (loginType === 'faculty' && (!facultyId || !department)) {
      return res.status(400).json({ success: false, message: 'Faculty ID and department are required for faculty login' });
    }

    if (loginType === 'hod' && !department) {
      return res.status(400).json({ success: false, message: 'Department is required for HOD login' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    // Validate login type and role
    if (user.role !== loginType) {
      return res.status(400).json({ success: false, message: `User is not a ${loginType}` });
    }

    // Validate facultyId and department for faculty
    if (loginType === 'faculty') {
      if (user.facultyId !== facultyId) {
        return res.status(400).json({ success: false, message: 'Invalid faculty ID' });
      }
      if (user.department !== department) {
        return res.status(400).json({ success: false, message: 'Invalid department' });
      }
    }

    // Validate department for HOD
    if (loginType === 'hod' && user.department !== department) {
      return res.status(400).json({ success: false, message: 'Invalid department' });
    }

    // Generate JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role,
      },
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Return success response
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;