const Mark = require('../models/Mark');
const Student = require('../models/Student');
const Subject = require('../models/Subject');
const { Parser } = require('json2csv');

// Utility function to retry failed queries
const retryQuery = async (fn, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === retries - 1) throw error; // Last retry failed
      console.warn(`Query failed, retrying (${i + 1}/${retries})... Error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

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

    // Build the query for subjects
    const subjectQuery = {};
    if (branch && branch !== 'all') subjectQuery.branch = branch;
    if (year && year !== 'all') subjectQuery.year = parseInt(year);
    if (semester && semester !== 'all') subjectQuery.semester = parseInt(semester);

    // Fetch students with retry logic and limited fields
    const students = await retryQuery(() =>
      Student.find(studentQuery)
        .select('name rollNumber batch branch year semester email phone')
        .lean()
        .exec()
    );

    // Fetch subjects with retry logic and limited fields
    const subjects = await retryQuery(() =>
      Subject.find(subjectQuery)
        .select('name code branch year semester credits type')
        .lean()
        .exec()
    );

    // If students are filtered, only fetch marks for those students
    if (students.length > 0) {
      markQuery.studentId = { $in: students.map(student => student._id) };
    }

    // If subjects are filtered, only fetch marks for those subjects
    if (subjects.length > 0) {
      markQuery.subjectId = { $in: subjects.map(subject => subject._id) };
    }

    // Fetch marks with limited population and retry logic
    const marks = await retryQuery(() =>
      Mark.find(markQuery)
        .populate({
          path: 'studentId',
          select: 'name rollNumber batch branch year semester email phone',
        })
        .populate({
          path: 'subjectId',
          select: 'name code branch year semester credits type',
        })
        .lean()
        .exec()
    );

    // Transform the populated fields to match frontend expectations
    const transformedMarks = marks.map(mark => ({
      _id: mark._id,
      studentId: mark.studentId._id,
      subjectId: mark.subjectId._id,
      examType: mark.examType,
      maxMarks: mark.maxMarks,
      scoredMarks: mark.scoredMarks,
      comments: mark.comments,
      enteredBy: mark.enteredBy,
      enteredAt: mark.enteredAt,
      student: {
        _id: mark.studentId._id,
        name: mark.studentId.name,
        rollNumber: mark.studentId.rollNumber,
        batch: mark.studentId.batch,
        branch: mark.studentId.branch,
        year: mark.studentId.year,
        semester: mark.studentId.semester,
        email: mark.studentId.email,
        phone: mark.studentId.phone,
      },
      subject: {
        _id: mark.subjectId._id,
        name: mark.subjectId.name,
        code: mark.subjectId.code,
        branch: mark.subjectId.branch,
        year: mark.subjectId.year,
        semester: mark.subjectId.semester,
        credits: mark.subjectId.credits,
        type: mark.subjectId.type,
      },
    }));

    const transformedStudents = students.map(student => ({
      _id: student._id,
      name: student.name,
      rollNumber: student.rollNumber,
      batch: student.batch,
      branch: student.branch,
      year: student.year,
      semester: student.semester,
      email: student.email,
      phone: student.phone,
    }));

    const transformedSubjects = subjects.map(subject => ({
      _id: subject._id,
      name: subject.name,
      code: subject.code,
      branch: subject.branch,
      year: subject.year,
      semester: subject.semester,
      credits: subject.credits,
      type: subject.type,
    }));

    res.status(200).json({
      marks: transformedMarks,
      students: transformedStudents,
      subjects: transformedSubjects,
    });
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error while fetching reports', error: error.message });
  }
};

// Export reports as CSV (unchanged)
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

    const markQuery = {};
    if (studentId) markQuery.studentId = studentId;
    if (subjectId) markQuery.subjectId = subjectId;
    if (examType && examType !== 'all') markQuery.examType = examType;

    const studentQuery = {};
    if (batch && batch !== 'all') studentQuery.batch = batch;
    if (branch && branch !== 'all') studentQuery.branch = branch;
    if (year && year !== 'all') studentQuery.year = parseInt(year);
    if (semester && semester !== 'all') studentQuery.semester = parseInt(semester);

    const subjectQuery = {};
    if (branch && branch !== 'all') subjectQuery.branch = branch;
    if (year && year !== 'all') subjectQuery.year = parseInt(year);
    if (semester && semester !== 'all') subjectQuery.semester = parseInt(semester);

    const students = await Student.find(studentQuery);
    const subjects = await Subject.find(subjectQuery);

    if (students.length > 0) {
      markQuery.studentId = { $in: students.map(student => student._id) };
    }

    if (subjects.length > 0) {
      markQuery.subjectId = { $in: subjects.map(subject => subject._id) };
    }

    const marks = await Mark.find(markQuery)
      .populate('studentId', 'name rollNumber batch branch year semester email phone')
      .populate('subjectId', 'name code branch year semester credits type');

    const csvData = marks.map(mark => ({
      studentName: mark.studentId.name,
      rollNumber: mark.studentId.rollNumber,
      studentEmail: mark.studentId.email,
      studentPhone: mark.studentId.phone,
      subject: `${mark.subjectId.code} - ${mark.subjectId.name}`,
      subjectType: mark.subjectId.type,
      examType: mark.examType,
      scoredMarks: mark.scoredMarks,
      maxMarks: mark.maxMarks,
      percentage: ((mark.scoredMarks / mark.maxMarks) * 100).toFixed(2),
      comments: mark.comments || "N/A",
      enteredBy: mark.enteredBy || "N/A",
      enteredAt: mark.enteredAt ? new Date(mark.enteredAt).toISOString() : "N/A",
    }));

    const fields = [
      'studentName',
      'rollNumber',
      'studentEmail',
      'studentPhone',
      'subject',
      'subjectType',
      'examType',
      'scoredMarks',
      'maxMarks',
      'percentage',
      'comments',
      'enteredBy',
      'enteredAt',
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