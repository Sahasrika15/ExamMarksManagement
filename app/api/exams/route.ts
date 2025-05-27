import { NextResponse } from "next/server";
import {connectToDB} from "@/lib/db";
import { Exam } from "@/models/Exam";

export async function GET() {
  try {
    await connectToDB();
    const exams = await Exam.find({}).lean();
    return NextResponse.json(exams, { status: 200 });
  } catch (error) {
    console.error("Error fetching exams:", error);
    return NextResponse.json({ error: "Failed to fetch exams" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectToDB();
    const body = await request.json();
    const { type, maxMarks, subjectId } = body;

    if (!type || !maxMarks || !subjectId) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const exam = new Exam({ type, maxMarks, subjectId });
    await exam.save();
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    console.error("Error creating exam:", error);
    return NextResponse.json({ error: "Failed to create exam" }, { status: 500 });
  }
}