import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Task } from "@/models/Task";
import { Column } from "@/models/Column";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ columnId: string }> },
) {
  try {
    await connectToDatabase();
    const { columnId } = await params;

    const body = await request.json();
    const { title, content } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 },
      );
    }

    const parentColumn = await Column.findById(columnId);
    if (!parentColumn) {
      return NextResponse.json(
        { error: "Parent column not found" },
        { status: 404 },
      );
    }
    const newTask = new Task({
      title: title.trim(),
      content: content ? content.trim() : "",
      columnId: columnId,
    });

    await newTask.save();
    await Column.findByIdAndUpdate(columnId, {
      $push: { taskOrder: newTask._id },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 },
    );
  }
}
