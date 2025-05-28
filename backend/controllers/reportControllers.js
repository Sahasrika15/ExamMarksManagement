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
      if (i === retries - 1) {
        throw new Error(`Query failed after ${retries} attempts: ${error.message}`);
      }
      console.warn(`Query failed, retrying (${i + 1}/${retries})... Error:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Fetch reports based on filters
const fetchReportsData = async (queryParams) => {
  const {
    batch,
    branch,
    year,
    semester,
    studentId,
    subjectId,
    examType
  } = queryParams;

  // Build the query for marks
  const markQuery = {};
  if (studentId && studentId !== 'all') markQuery.studentId = studentId;
  if (subjectId && subjectId !== 'all') markQuery.subjectId = subjectId;
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

  // Fetch data with retry logic
  const [students, subjects, marks] = await Promise.all([
    retryQuery(() =>
      Student.find(studentQuery)
        .select('name rollNumber batch branch year semester email phone')
        .lean()
        .exec()
    ),
    retryQuery(() =>
      Subject.find(subjectQuery)
        .select('name code branch year semester credits type')
        .lean()
        .exec()
    ),
    retryQuery(() =>
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
    )
  ]);

  // Filter marks to include only those matching the filtered students and subjects
  const studentIds = new Set(students.map(student => student._id.toString()));
  const subjectIds = new Set(subjects.map(subject => subject._id.toString()));
  const filteredMarks = marks.filter(mark =>
    (!studentIds.size || studentIds.has(mark.studentId._id.toString())) &&
    (!subjectIds.size || subjectIds.has(mark.subjectId._id.toString()))
  );

  return {
    marks: filteredMarks.map(mark => ({
      _id: mark._id,
      studentId: mark.studentId._id,
      subjectId: mark.subjectId._id,
      examType: mark.examType,
      maxMarks: mark.maxMarks,
      scoredMarks: mark.scoredMarks,
      comments: mark.comments,
      enteredBy: mark.enteredBy,
      enteredAt: mark.enteredAt,
      student: mark.studentId,
      subject: mark.subjectId,
    })),
    students,
    subjects,
  };
};

exports.getReports = async (req, res) => {
  try {
    const data = await fetchReportsData(req.query);
    res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Server error while fetching reports', error: error.message });
  }
};

exports.exportReports = async (req, res) => {
  try {
    const { marks } = await fetchReportsData(req.query);

    const csvData = marks.map(mark => ({
      studentName: mark.student.name,
      rollNumber: mark.student.rollNumber,
      studentEmail: mark.student.email,
      studentPhone: mark.student.phone,
      subject: `${mark.subject.code} - ${mark.subject.name}`,
      subjectType: mark.subject.type,
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
    res.status(500).json({ message: 'Server error while exporting reports', error: error.message });
  }
};