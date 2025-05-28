const Subject = require('../models/Subject');

// Get all subjects
const getSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects', error: error.message });
  }
};

// Create a new subject
const createSubject = async (req, res) => {
  try {
    const { name, code, branch, year, semester, credits, type } = req.body;

    const newSubject = new Subject({
      name,
      code,
      branch,
      year,
      semester,
      credits,
      type,
    });

    const savedSubject = await newSubject.save();
    res.status(201).json(savedSubject);
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to create subject', error: error.message });
  }
};

// Update a subject by ID
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, branch, year, semester, credits, type } = req.body;

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      {
        name,
        code,
        branch,
        year,
        semester,
        credits,
        type,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to update subject', error: error.message });
  }
};

// Delete a subject by ID
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    res.status(200).json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subject', error: error.message });
  }
};

module.exports = { getSubjects, createSubject, updateSubject, deleteSubject };