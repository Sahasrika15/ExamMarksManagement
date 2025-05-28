const Mark = require('../models/Mark');
const ExcelJS = require('exceljs');

// Get marks with optional filtering by subjectId and examType
const getMarks = async (req, res) => {
  try {
    const { subjectId, examType } = req.query;

    const query = {};
    if (subjectId) query.subjectId = subjectId;
    if (examType) query.examType = examType;

    const marks = await Mark.find(query)
      .populate('studentId', 'name rollNumber')
      .populate('subjectId', 'name code')
      .lean();

    res.status(200).json(marks);
  } catch (error) {
    console.error('Error fetching marks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch marks', error: error.message });
  }
};

// Save or update multiple marks
const saveMarks = async (req, res) => {
  try {
    const { marks } = req.body;

    if (!marks || !Array.isArray(marks)) {
      return res.status(400).json({ success: false, message: 'Marks array is required' });
    }

    const validExamTypes = ['CT', 'Mid 1', 'Mid 2', 'Semester Exam', 'Internal Lab', 'External Lab'];
    // Validate mark entries
    for (const mark of marks) {
      if (
        !mark.studentId ||
        !mark.subjectId ||
        !mark.examType ||
        mark.maxMarks == null ||
        mark.scoredMarks == null ||
        mark.scoredMarks < 0 ||
        mark.scoredMarks > mark.maxMarks ||
        !validExamTypes.includes(mark.examType)
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid mark data: ${
            !validExamTypes.includes(mark.examType) ? `Invalid examType: ${mark.examType}` : 'Check required fields or mark values'
          }`,
        });
      }
    }

    // Perform bulk upsert
    const operations = marks.map((mark) => ({
      updateOne: {
        filter: {
          studentId: mark.studentId,
          subjectId: mark.subjectId,
          examType: mark.examType,
        },
        update: {
          $set: {
            maxMarks: mark.maxMarks,
            scoredMarks: mark.scoredMarks,
            comments: mark.comments || '',
          },
        },
        upsert: true,
      },
    }));

    await Mark.bulkWrite(operations);
    res.status(200).json({ success: true, message: 'Marks saved successfully' });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ success: false, message: 'Failed to save marks', error: error.message });
  }
};

// Update a mark by ID
const updateMark = async (req, res) => {
  try {
    const { id } = req.params;
    const { scoredMarks, maxMarks, comments } = req.body;

    if (maxMarks == null || scoredMarks == null || scoredMarks < 0 || scoredMarks > maxMarks) {
      return res.status(400).json({ success: false, message: 'Invalid scoredMarks or maxMarks' });
    }

    const updatedMark = await Mark.findByIdAndUpdate(
      id,
      {
        scoredMarks,
        maxMarks,
        comments: comments || '',
      },
      { new: true }
    )
      .populate('studentId', 'name rollNumber')
      .populate('subjectId', 'name code')
      .lean();

    if (!updatedMark) {
      return res.status(404).json({ success: false, message: 'Mark not found' });
    }

    res.status(200).json(updatedMark);
  } catch (error) {
    console.error('Error updating mark:', error);
    res.status(500).json({ success: false, message: 'Failed to update mark', error: error.message });
  }
};

// Delete a mark by ID
const deleteMark = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedMark = await Mark.findByIdAndDelete(id);

    if (!deletedMark) {
      return res.status(404).json({ success: false, message: 'Mark not found' });
    }

    res.status(200).json({ success: true, message: 'Mark deleted successfully' });
  } catch (error) {
    console.error('Error deleting mark:', error);
    res.status(500).json({ success: false, message: 'Failed to delete mark', error: error.message });
  }
};

// Export marks to Excel
const exportMarks = async (req, res) => {
  try {
    const { subjectId, examType } = req.query;

    if (!subjectId || !examType) {
      return res.status(400).json({ success: false, message: 'subjectId and examType are required' });
    }

    const marks = await Mark.find({ subjectId, examType })
      .populate('studentId', 'name rollNumber')
      .populate('subjectId', 'name code maxMarks')
      .sort({ 'studentId.rollNumber': 1 })
      .lean();

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Marks');

    // Define columns
    worksheet.columns = [
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Student Name', key: 'name', width: 25 },
      { header: 'Subject Code', key: 'subjectCode', width: 15 },
      { header: 'Subject Name', key: 'subjectName', width: 30 },
      { header: 'Exam Type', key: 'examType', width: 15 },
      { header: 'Max Marks', key: 'maxMarks', width: 10 },
      { header: 'Scored Marks', key: 'scoredMarks', width: 10 },
      { header: 'Percentage', key: 'percentage', width: 10 },
      { header: 'Comments', key: 'comments', width: 30 },
    ];

    // Add data
    marks.forEach((mark) => {
      worksheet.addRow({
        rollNumber: mark.studentId.rollNumber,
        name: mark.studentId.name,
        subjectCode: mark.subjectId.code,
        subjectName: mark.subjectId.name,
        examType: mark.examType,
        maxMarks: mark.maxMarks,
        scoredMarks: mark.scoredMarks,
        percentage: ((mark.scoredMarks / mark.maxMarks) * 100).toFixed(1),
        comments: mark.comments || '',
      });
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFDDDDDD' },
    };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=marks_${subjectId}_${examType}.xlsx`);
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error exporting marks:', error);
    res.status(500).json({ success: false, message: 'Failed to export marks', error: error.message });
  }
};

module.exports = { getMarks, saveMarks, updateMark, deleteMark, exportMarks };