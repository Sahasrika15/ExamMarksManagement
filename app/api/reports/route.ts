import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { Mark } from "@/models/Marks";
import Student from "@/models/Student";
import Subject from "@/models/Subject";

export async function GET(request: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const batch = searchParams.get("batch");
    const branch = searchParams.get("branch");
    const year = searchParams.get("year");
    const semester = searchParams.get("semester");
    const studentId = searchParams.get("studentId");
    const subjectId = searchParams.get("subjectId");
    const examType = searchParams.get("examType");

    // Build marks query
    const marksMatch: any = {};
    if (studentId) marksMatch.studentId = studentId;
    if (subjectId) marksMatch.subjectId = subjectId;
    if (examType) marksMatch.examType = examType;

    // Build student filters for marks aggregation
    const studentFilters: any = {};
    if (batch) studentFilters["student.batch"] = batch;
    if (branch) studentFilters["student.branch"] = branch;
    if (year) studentFilters["student.year"] = Number(year);
    if (semester) studentFilters["student.semester"] = Number(semester);

    // Aggregate marks
    const marksPipeline = [
      { $match: marksMatch },
      {
        $lookup: {
          from: "students",
          localField: "studentId",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $lookup: {
          from: "subjects",
          localField: "subjectId",
          foreignField: "_id",
          as: "subject",
        },
      },
      { $unwind: "$subject" },
      { $match: studentFilters },
      {
        $project: {
          _id: 1,
          studentId: 1,
          subjectId: 1,
          examType: 1,
          maxMarks: 1,
          scoredMarks: 1,
          student: {
            _id: "$student._id",
            name: "$student.name",
            rollNumber: "$student.rollNumber",
            batch: "$student.batch",
            branch: "$student.branch",
            year: "$student.year",
            semester: "$student.semester",
          },
          subject: {
            _id: "$subject._id",
            name: "$subject.name",
            code: "$subject.code",
          },
        },
      },
    ];

    const marks = await Mark.aggregate(marksPipeline);

    // Fetch filtered students
    const studentQuery: any = {};
    if (batch) studentQuery.batch = batch;
    if (branch) studentQuery.branch = branch;
    if (year) studentQuery.year = Number(year);
    if (semester) studentQuery.semester = Number(semester);

    const students = await Student.find(studentQuery).lean();

    // Fetch filtered subjects
    const subjectQuery: any = {};
    if (branch) subjectQuery.branch = branch;
    if (year) subjectQuery.year = Number(year);
    if (semester) subjectQuery.semester = Number(semester);

    const subjects = await Subject.find(subjectQuery).lean();

    return NextResponse.json(
      { marks, students, subjects },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reports data:", error);
    return NextResponse.json({ error: "Failed to fetch reports data" }, { status: 500 });
  }
}