const express = require('express');
const router = express.Router();
const {
  getReports,
  exportReports,
} = require('../controllers/reportControllers');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Get reports with filtering (requires authentication)
router.get('/', auth, restrictTo('faculty', 'hod', 'admin'), getReports);

// Export reports to Excel (requires authentication)
router.get('/export', auth, restrictTo('faculty', 'hod', 'admin'), exportReports);

module.exports = router;