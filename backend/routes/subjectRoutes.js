const express = require('express');
const router = express.Router();
const {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} = require('../controllers/subjectControllers');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Get all subjects
router.get('/', getSubjects);

// Create a new subject (restricted to admin or hod)
router.post('/', auth, restrictTo('admin', 'edit'), createSubject);

// Update a subject by ID (restricted to admin only)
router.put('/admin/:id', auth, restrictTo('admin'), updateSubject);

// Delete a subject by ID (restricted to admin only)
router.delete('/:id', auth, restrictTo('admin'), deleteSubject);

module.exports = router;