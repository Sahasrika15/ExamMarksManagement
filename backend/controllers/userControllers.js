const { z } = require('zod');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Zod schema for input validation
const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  loginType: z.enum(['faculty', 'admin', 'hod'], { message: 'Invalid login type' }),
  facultyId: z.string().optional(),
  department: z.string().optional(),
});

// Login user
const loginUser = async (req, res) => {
  try {
    // Validate request body
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message || 'Invalid input';
      return res.status(400).json({ success: false, message });
    }

    const { email, password, loginType, facultyId, department } = parsed.data;

    // Find user by email and role
    const user = await User.findOne({ email: email.toLowerCase(), role: loginType });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or role' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Additional validation for faculty and HOD
    if (loginType === 'faculty' && (user.facultyId !== facultyId || user.department !== department)) {
      return res.status(401).json({ success: false, message: 'Invalid faculty ID or department' });
    }

    if (loginType === 'hod' && user.department !== department) {
      return res.status(401).json({ success: false, message: 'Invalid department for HOD' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role,
        email: user.email,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department || null,
        facultyId: user.facultyId || null,
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { loginUser };