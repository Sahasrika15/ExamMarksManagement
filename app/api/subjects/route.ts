import { NextResponse } from "next/server";
import {connectToDB} from "@/lib/db";
import Subject from "@/models/Subject";

// GET: Fetch all subjects
export async function GET() {
  try {
    await connectToDB();
    const subjects = await Subject.find();
    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

// POST: Create a new subject
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDB();

    const newSubject = new Subject({
      name: body.name,
      code: body.code,
      branch: body.branch,
      year: body.year,
      semester: body.semester,
      credits: body.credits,
      type: body.type,
    });

    const savedSubject = await newSubject.save();
    return NextResponse.json(savedSubject, { status: 201 });
  } catch (error) {
    console.error("Error creating subject:", error);
    return NextResponse.json({ error: "Failed to create subject" }, { status: 500 });
  }
}