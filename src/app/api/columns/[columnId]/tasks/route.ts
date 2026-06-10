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

    // TODO: 1. Parse request body for task title and content.
    const body = await request.json();
    const { title, content } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Task title is required" },
        { status: 400 },
      );
    }

    // Verify parent column exists before creating the sub-resource
    const parentColumn = await Column.findById(columnId);
    if (!parentColumn) {
      return NextResponse.json(
        { error: "Parent column not found" },
        { status: 404 },
      );
    }
    // TODO: 2. Create the new Task with the given columnId.
    const newTask = new Task({
      title: title.trim(),
      content: content ? content.trim() : "",
      columnId: columnId,
    });

    await newTask.save();
    // TODO: 3. CRITICAL: Update the parent Column's `taskOrder` array to include this new task's ObjectId.
    // Hint: Use Column.findByIdAndUpdate with $push.
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
