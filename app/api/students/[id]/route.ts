import { NextResponse } from "next/server";
import {connectToDB} from "@/lib/db";
import Student from "@/models/Student";

// PUT: Update a student by ID
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Await params
    const body = await request.json();
    await connectToDB();

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name: body.name,
        rollNumber: body.rollNumber,
        batch: body.batch,
        branch: body.branch,
        year: body.year,
        semester: body.semester,
        email: body.email,
        phone: body.phone,
      },
      { new: true }
    );

    if (!updatedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error("Error updating student:", error);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

// DELETE: Delete a student by ID
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params; // Await params
    await connectToDB();

    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Student deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting student:", error);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}