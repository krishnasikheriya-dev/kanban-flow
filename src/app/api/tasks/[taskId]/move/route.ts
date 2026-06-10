import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Column } from "@/models/Column";
import { Task } from "@/models/Task";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    await connectToDatabase();
    const { taskId } = await params;

    const body = await request.json();
    const { sourceColumnId, destinationColumnId, sourceTaskOrder, destinationTaskOrder } = body;

    if (!sourceColumnId || !destinationColumnId || !sourceTaskOrder || !destinationTaskOrder) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await Task.findByIdAndUpdate(taskId, { columnId: destinationColumnId });
    await Column.findByIdAndUpdate(sourceColumnId, { taskOrder: sourceTaskOrder });
    await Column.findByIdAndUpdate(destinationColumnId, { taskOrder: destinationTaskOrder });

    return NextResponse.json({ message: "Task moved successfully" });
  } catch (error) {
    console.error("Error moving task:", error);
    return NextResponse.json(
      { error: "Failed to move task" },
      { status: 500 },
    );
  }
}
