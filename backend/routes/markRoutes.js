const express = require('express');
const router = express.Router();
const {
  getMarks,
  saveMarks,
  updateMark,
  deleteMark,
  exportMarks,
} = require('../controllers/markControllers');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Get marks with optional filtering (requires authentication)
router.get('/', auth, restrictTo('faculty', 'hod', 'admin'), getMarks);

// Save or update multiple marks (requires authentication)
router.post('/', auth, restrictTo('faculty', 'hod', 'admin'), saveMarks);

// Update a mark by ID (requires authentication)
router.put('/:id', auth, restrictTo('faculty', 'hod', 'admin'), updateMark);

// Delete a mark by ID (requires authentication)
router.delete('/:id', auth, restrictTo('faculty', 'hod', 'admin'), deleteMark);

// Export marks to Excel (requires authentication)
router.get('/export', auth, restrictTo('faculty', 'hod', 'admin'), exportMarks);

module.exports = router;