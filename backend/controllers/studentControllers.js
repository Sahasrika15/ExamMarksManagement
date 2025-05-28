const Student = require('../models/Student');

// Get all students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch students', error: error.message });
  }
};

// Create a new student
const createStudent = async (req, res) => {
  try {
    const { name, rollNumber, batch, branch, year, semester, email, phone } = req.body;
    const newStudent = new Student({
      name,
      rollNumber,
      batch,
      branch,
      year,
      semester,
      email,
      phone,
    });
    const savedStudent = await newStudent.save();
    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create student', error: error.message });
  }
};

// Update a student by ID
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rollNumber, batch, branch, year, semester, email, phone } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, rollNumber, batch, branch, year, semester, email, phone },
      { new: true, runValidators: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json(updatedStudent);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update student', error: error.message });
  }
};

// Delete a student by ID
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);
    if (!deletedStudent) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete student', error: error.message });
  }
};

module.exports = { getStudents, createStudent, updateStudent, deleteStudent };