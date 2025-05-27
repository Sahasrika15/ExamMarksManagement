import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { Mark } from "@/models/Marks";
import ExcelJS from "exceljs";

// GET: Export marks to Excel
export async function GET(request: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const examType = searchParams.get("examType");

    if (!subjectId || !examType) {
      return NextResponse.json({ error: "subjectId and examType are required" }, { status: 400 });
    }

    const marks = await Mark.find({ subjectId, examType })
      .populate("studentId", "name rollNumber")
      .populate("subjectId", "name code")
      .lean();

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Marks");

    // Define columns
    worksheet.columns = [
      { header: "Roll Number", key: "rollNumber", width: 15 },
      { header: "Student Name", key: "name", width: 25 },
      { header: "Subject Code", key: "subjectCode", width: 15 },
      { header: "Subject Name", key: "subjectName", width: 30 },
      { header: "Exam Type", key: "examType", width: 15 },
      { header: "Max Marks", key: "maxMarks", width: 10 },
      { header: "Scored Marks", key: "scoredMarks", width: 10 },
      { header: "Percentage", key: "percentage", width: 10 },
      { header: "Comments", key: "comments", width: 30 },
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
        comments: mark.comments || "",
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
        "Content-Disposition": `attachment; filename=marks_${subjectId}_${examType}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Error exporting marks:", error);
    return NextResponse.json({ error: "Failed to export marks" }, { status: 500 });
  }
}