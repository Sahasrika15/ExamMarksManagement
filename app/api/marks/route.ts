import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { Mark } from "@/models/Marks";

// GET: Fetch marks with optional filtering by subjectId and examType
export async function GET(request: Request) {
  try {
    await connectToDB();
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");
    const examType = searchParams.get("examType");

    const query: any = {};
    if (subjectId) query.subjectId = subjectId;
    if (examType) query.examType = examType;

    const marks = await Mark.find(query)
      .populate("studentId", "name rollNumber")
      .populate("subjectId", "name code")
      .lean();
    return NextResponse.json(marks, { status: 200 });
  } catch (error) {
    console.error("Error fetching marks:", error);
    return NextResponse.json({ error: "Failed to fetch marks" }, { status: 500 });
  }
}

// POST: Save or update multiple marks
export async function POST(request: Request) {
  try {
    const { marks } = await request.json();
    await connectToDB();

    if (!marks || !Array.isArray(marks)) {
      return NextResponse.json({ error: "Marks array is required" }, { status: 400 });
    }

    const validExamTypes = ["CT", "Mid 1", "Mid 2", "Semester Exam", "Internal Lab", "External Lab"];
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
        return NextResponse.json(
          { error: `Invalid mark data: ${!validExamTypes.includes(mark.examType) ? `Invalid examType: ${mark.examType}` : "Check required fields or mark values"}` },
          { status: 400 }
        );
      }
    }

    // Perform bulk upsert
    const operations = marks.map((mark: any) => ({
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
            comments: mark.comments || "",
          },
        },
        upsert: true,
      },
    }));

    await Mark.bulkWrite(operations);
    return NextResponse.json({ message: "Marks saved successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error saving marks:", error);
    return NextResponse.json({ error: "Failed to save marks" }, { status: 500 });
  }
}