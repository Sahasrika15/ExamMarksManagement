const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }

    // Attach user info to request
    req.user = decoded; // decoded contains { userId, role, email, name }
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

module.exports = auth;