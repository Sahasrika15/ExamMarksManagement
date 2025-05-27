import { NextResponse } from "next/server";
import {connectToDB} from "@/lib/db";
import Subject from "@/models/Subject";

// PUT: Update a subject by ID
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectToDB();

    const updatedSubject = await Subject.findByIdAndUpdate(
      id,
      {
        name: body.name,
        code: body.code,
        branch: body.branch,
        year: body.year,
        semester: body.semester,
        credits: body.credits,
        type: body.type,
      },
      { new: true }
    );

    if (!updatedSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json(updatedSubject, { status: 200 });
  } catch (error) {
    console.error("Error updating subject:", error);
    return NextResponse.json({ error: "Failed to update subject" }, { status: 500 });
  }
}

// DELETE: Delete a subject by ID
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDB();

    const deletedSubject = await Subject.findByIdAndDelete(id);

    if (!deletedSubject) {
      return NextResponse.json({ error: "Subject not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Subject deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting subject:", error);
    return NextResponse.json({ error: "Failed to delete subject" }, { status: 500 });
  }
}