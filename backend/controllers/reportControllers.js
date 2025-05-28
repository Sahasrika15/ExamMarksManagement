const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const ExcelJS = require('exceljs');

// Get reports with optional filtering
const getReports = async (req, res) => {
  try {
    const {
      batch,
      branch,
      year,
      semester,
      studentId,
      subjectId,
      examType,
    } = req.query;

    // Build query for marks
    const markQuery = {};
    if (studentId) markQuery.studentId = studentId;
    if (subjectId) markQuery.subjectId = subjectId;
    if (examType) markQuery.examType = examType;

    // Build query for students
    const studentQuery = {};
    if (batch) studentQuery.batch = batch;
    if (branch) studentQuery.branch = branch;
    if (year) studentQuery.year = Number(year);
    if (semester) studentQuery.semester = Number(semester);

    // Fetch marks with populated student and subject data
    const marks = await Mark.find(markQuery)
      .populate({
        path: 'studentId',
        match: studentQuery,
        select: 'name rollNumber batch branch year semester',
      })
      .populate('subjectId', 'name code')
      .lean();

    // Filter out marks where studentId is null (due to studentQuery mismatch)
    const filteredMarks = marks.filter((mark) => mark.studentId);

    // Fetch all relevant students and subjects for dropdowns
    const students = await Student.find(studentQuery).select('name rollNumber batch branch year semester').lean();
    const subjects = await Subject.find().select('name code').lean();

    res.status(200).json({
      success: true,
      marks: filteredMarks,
      students,
      subjects,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reports', error: error.message });
  }
};

// Export reports to Excel
const exportReports = async (req, res) => {
  try {
    const {
      batch,
      branch,
      year,
      semester,
      studentId,
      subjectId,
      examType,
    } = req.query;

    // Build query for marks
    const markQuery = {};
    if (studentId) markQuery.studentId = studentId;
    if (subjectId) markQuery.subjectId = subjectId;
    if (examType) markQuery.examType = examType;

    // Build query for students
    const studentQuery = {};
    if (batch) studentQuery.batch = batch;
    if (branch) studentQuery.branch = branch;
    if (year) studentQuery.year = Number(year);
    if (semester) studentQuery.semester = Number(semester);

    // Fetch marks with populated student and subject data
    const marks = await Mark.find(markQuery)
      .populate({
        path: 'studentId',
        match: studentQuery,
        select: 'name rollNumber batch branch year semester',
      })
      .populate('subjectId', 'name code')
      .lean();

    // Filter out marks where studentId is null
    const filteredMarks = marks.filter((mark) => mark.studentId);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');

    // Define columns
    worksheet.columns = [
      { header: 'Student Name', key: 'studentName', width: 25 },
      { header: 'Roll Number', key: 'rollNumber', width: 15 },
      { header: 'Batch', key: 'batch', width: 15 },
      { header: 'Branch', key: 'branch', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Semester', key: 'semester', width: 10 },
      { header: 'Subject Code', key: 'subjectCode', width: 15 },
      { header: 'Subject Name', key: 'subjectName', width: 30 },
      { header: 'Exam Type', key: 'examType', width: 15 },
      { header: 'Scored Marks', key: 'scoredMarks', width: 12 },
      { header: 'Max Marks', key: 'maxMarks', width: 12 },
      { header: 'Percentage', key: 'percentage', width: 12 },
      { header: 'Grade', key: 'grade', width: 10 },
    ];

    // Add data
    filteredMarks.forEach((mark) => {
      const percentage = (mark.scoredMarks / mark.maxMarks) * 100;
      const grade = percentage >= 90 ? 'A+' :
                    percentage >= 80 ? 'A' :
                    percentage >= 70 ? 'B+' :
                    percentage >= 60 ? 'B' :
                    percentage >= 50 ? 'C' : 'F';

      worksheet.addRow({
        studentName: mark.studentId.name,
        rollNumber: mark.studentId.rollNumber,
        batch: mark.studentId.batch,
        branch: mark.studentId.branch,
        year: mark.studentId.year,
        semester: mark.studentId.semester,
        subjectCode: mark.subjectId.code,
        subjectName: mark.subjectId.name,
        examType: mark.examType,
        scoredMarks: mark.scoredMarks,
        maxMarks: mark.maxMarks,
        percentage: percentage.toFixed(1),
        grade,
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
    res.setHeader('Content-Disposition', `attachment; filename=reports_${Date.now()}.xlsx`);
    res.status(200).send(buffer);
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({ success: false, message: 'Failed to export reports', error: error.message });
  }
};

module.exports = { getReports, exportReports };