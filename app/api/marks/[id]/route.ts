import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import { Mark } from "@/models/Marks";

// PUT: Update a mark by ID
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    await connectToDB();

    const { scoredMarks, maxMarks, comments } = body;

    if (maxMarks == null || scoredMarks == null || scoredMarks < 0 || scoredMarks > maxMarks) {
      return NextResponse.json({ error: "Invalid scoredMarks or maxMarks" }, { status: 400 });
    }

    const updatedMark = await Mark.findByIdAndUpdate(
      id,
      {
        scoredMarks,
        maxMarks,
        comments: comments || "",
      },
      { new: true }
    )
      .populate("studentId", "name rollNumber")
      .populate("subjectId", "name code")
      .lean();

    if (!updatedMark) {
      return NextResponse.json({ error: "Mark not found" }, { status: 404 });
    }

    return NextResponse.json(updatedMark, { status: 200 });
  } catch (error) {
    console.error("Error updating mark:", error);
    return NextResponse.json({ error: "Failed to update mark" }, { status: 500 });
  }
}

// DELETE: Delete a mark by ID
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await connectToDB();

    const deletedMark = await Mark.findByIdAndDelete(id);

    if (!deletedMark) {
      return NextResponse.json({ error: "Mark not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Mark deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting mark:", error);
    return NextResponse.json({ error: "Failed to delete mark" }, { status: 500 });
  }
}