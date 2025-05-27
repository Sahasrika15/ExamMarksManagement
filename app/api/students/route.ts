import { NextResponse } from "next/server";
import {connectToDB} from "@/lib/db";
import Student from "@/models/Student";

// GET: Fetch all students
export async function GET() {
  try {
    await connectToDB();
    const students = await Student.find();
    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("Error fetching students:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}

// POST: Create a new student
export async function POST(request: Request) {
  try {
    const body = await request.json();
    await connectToDB();

    const newStudent = new Student({
      name: body.name,
      rollNumber: body.rollNumber,
      batch: body.batch,
      branch: body.branch,
      year: body.year,
      semester: body.semester,
      email: body.email,
      phone: body.phone,
    });

    const savedStudent = await newStudent.save();
    return NextResponse.json(savedStudent, { status: 201 });
  } catch (error) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}