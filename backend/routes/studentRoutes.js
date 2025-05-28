const express = require('express');
const router = express.Router();
const {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentControllers');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/role');

// Get all students (no auth required, adjust as needed)
router.get('/', getStudents);

// Create a new student (requires authentication and admin/hod role)
router.post('/', auth, restrictTo('admin', 'hod'), createStudent);

// Update a student by ID (requires authentication and admin/hod role)
router.put('/:id', auth, restrictTo('admin', 'hod'), updateStudent);

// Delete a student by ID (requires authentication and admin/hod role)
router.delete('/:id', auth, restrictTo('admin', 'hod'), deleteStudent);

module.exports = router;