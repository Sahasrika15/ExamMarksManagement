import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { Mark } from "@/models/Marks";
import ExcelJS from "exceljs";

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

    // Build student filters
    const studentFilters: any = {};
    if (batch) studentFilters["student.batch"] = batch;
    if (branch) studentFilters["student.branch"] = branch;
    if (year) studentFilters["student.year"] = Number(year);
    if (semester) studentFilters["student.semester"] = Number(semester);

    const pipeline = [
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
          studentName: "$student.name",
          rollNumber: "$student.rollNumber",
          subjectCode: "$subject.code",
          subjectName: "$subject.name",
          examType: 1,
          maxMarks: 1,
          scoredMarks: 1,
          percentage: { $multiply: [{ $divide: ["$scoredMarks", "$maxMarks"] }, 100] },
          grade: {
            $switch: {
              branches: [
                { case: { $gte: [{ $multiply: [{ $divide: ["$scoredMarks", "$maxMarks"] }, 100] }, 90] }, then: "A+" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$scoredMarks", "$maxMarks"] }, 100] }, 80] }, then: "A" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$scoredMarks", "$maxMarks"] }, 100] }, 70] }, then: "B+" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$scoredMarks", "$maxMarks"] }, 100] }, 60] }, then: "B" },
                { case: { $gte: [{ $multiply: [{ $divide: ["$scoredMarks", "$maxMarks"] }, 100] }, 50] }, then: "C" },
              ],
              default: "F",
            },
          },
        },
      },
    ];

    const marks = await Mark.aggregate(pipeline);

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Report");

    // Define columns
    worksheet.columns = [
      { header: "Student Name", key: "studentName", width: 25 },
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Subject Code", key: "subjectCode", width: 15 },
      { header: "Subject Name", key: "subjectName", width: 30 },
      { header: "Exam Type", key: "examType", width: 15 },
      { header: "Scored Marks", key: "scoredMarks", width: 10 },
      { header: "Max Marks", key: "maxMarks", width: 10 },
      { header: "Percentage", key: "percentage", width: 10 },
      { header: "Grade", key: "grade", width: 10 },
    ];

    // Add data
    marks.forEach((mark) => {
      worksheet.addRow({
        studentName: mark.studentName,
        rollNumber: mark.rollNumber,
        subjectCode: mark.subjectCode,
        subjectName: mark.subjectName,
        examType: mark.examType,
        scoredMarks: mark.scoredMarks,
        maxMarks: mark.maxMarks,
        percentage: mark.percentage.toFixed(1),
        grade: mark.grade,
      });
    });

    // Style the header
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" },
    };

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=report_${Date.now()}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error exporting report:", error);
    return NextResponse.json({ error: "Failed to export report" }, { status: 500 });
  }
}