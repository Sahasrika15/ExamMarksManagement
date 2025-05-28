const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { Parser } = require('json2csv');

// Fetch reports based on filters
exports.getReports = async (req, res) => {
  try {
    const {
      batch,
      branch,
      year,
      semester,
      studentId,
      subjectId,
      examType
    } = req.query;

    // Build the query for marks
    const markQuery = {};
    if (studentId) markQuery.studentId = studentId;
    if (subjectId) markQuery.subjectId = subjectId;
    if (examType && examType !== 'all') markQuery.examType = examType;

    // Build the query for students
    const studentQuery = {};
    if (batch && batch !== 'all') studentQuery.batch = batch;
    if (branch && branch !== 'all') studentQuery.branch = branch;
    if (year && year !== 'all') studentQuery.year = parseInt(year);
    if (semester && semester !== 'all') studentQuery.semester = parseInt(semester);

    // Fetch students based on filters
    const students = await Student.find(studentQuery);

    // Fetch subjects (no filtering applied to subjects for now)
    const subjects = await Subject.find();

    // If students are filtered, only fetch marks for those students
    if (students.length > 0) {
      markQuery.studentId = { $in: students.map(student => student._id) };
    }

    // Fetch marks with populated student and subject details
    const marks = await Mark.find(markQuery)
      .populate('studentId', 'name rollNumber batch branch year semester')
      .populate('subjectId', 'name code');

    // Transform the populated fields to match frontend expectations
    const transformedMarks = marks.map(mark => ({
      _id: mark._id,
      studentId: mark.studentId._id,
      subjectId: mark.subjectId._id,
      examType: mark.examType,
      maxMarks: mark.maxMarks,
      scoredMarks: mark.scoredMarks,
      student: {
        _id: mark.studentId._id,
        name: mark.studentId.name,
        rollNumber: mark.studentId.rollNumber,
        batch: mark.studentId.batch,
        branch: mark.studentId.branch,
        year: mark.studentId.year,
        semester: mark.studentId.semester
      },
      subject: {
        _id: mark.subjectId._id,
        name: mark.subjectId.name,
        code: mark.subjectId.code
      }
    }));

    // Transform students and subjects to match frontend expectations
    const transformedStudents = students.map(student => ({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      batch: student.batch,
      branch: student.branch,
      year: student.year,
      semester: student.semester
    }));

    const transformedSubjects = subjects.map(subject => ({
      _id: subject._id,
      name: subject.name,
      code: subject.code
    }));

    res.status(200).json({
      marks: transformedMarks,
      students: transformedStudents,
      subjects: transformedSubjects
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error while fetching reports' });
  }
};

// Export reports as CSV
exports.exportReports = async (req, res) => {
  try {
    const {
      batch,
      branch,
      year,
      semester,
      studentId,
      subjectId,
      examType
    } = req.query;

    // Build the query for marks
    const markQuery = {};
    if (studentId) markQuery.studentId = studentId;
    if (subjectId) markQuery.subjectId = subjectId;
    if (examType && examType !== 'all') markQuery.examType = examType;

    // Build the query for students
    const studentQuery = {};
    if (batch && batch !== 'all') studentQuery.batch = batch;
    if (branch && branch !== 'all') studentQuery.branch = branch;
    if (year && year !== 'all') studentQuery.year = parseInt(year);
    if (semester && semester !== 'all') studentQuery.semester = parseInt(semester);

    // Fetch students based on filters
    const students = await Student.find(studentQuery);

    // If students are filtered, only fetch marks for those students
    if (students.length > 0) {
      markQuery.studentId = { $in: students.map(student => student._id) };
    }

    // Fetch marks with populated student and subject details
    const marks = await Mark.find(markQuery)
      .populate('studentId', 'name rollNumber batch branch year semester')
      .populate('subjectId', 'name code');

    // Prepare data for CSV
    const csvData = marks.map(mark => ({
      studentName: mark.studentId.name,
      rollNumber: mark.studentId.rollNumber,
      subject: `${mark.subjectId.code} - ${mark.subjectId.name}`,
      examType: mark.examType,
      scoredMarks: mark.scoredMarks,
      maxMarks: mark.maxMarks,
      percentage: ((mark.scoredMarks / mark.maxMarks) * 100).toFixed(2)
    }));

    const fields = [
      'studentName',
      'rollNumber',
      'subject',
      'examType',
      'scoredMarks',
      'maxMarks',
      'percentage'
    ];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment('reports.csv');
    res.send(csv);
  } catch (error) {
    console.error('Error exporting reports:', error);
    res.status(500).json({ message: 'Server error while exporting reports' });
  }
};