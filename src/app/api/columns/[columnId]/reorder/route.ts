import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Column } from "@/models/Column";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ columnId: string }> },
) {
  try {
    await connectToDatabase();
    const { columnId } = await params;

    // TODO: 1. Parse request body to get the `taskOrder` array of ObjectIds.
    const body = await request.json();
    const { taskOrder } = body;

    if (!taskOrder || !Array.isArray(taskOrder)) {
      return NextResponse.json(
        { error: "A valid taskOrder array is required" },
        { status: 400 },
      );
    }

    // TODO: 2. Use Column.findByIdAndUpdate to overwrite the existing taskOrder with the new array.
    const updatedColumn = await Column.findByIdAndUpdate(
      columnId,
      { $set: { taskOrder: taskOrder } },
      { new: true }, // Returns the document after modifications are applied
    );

    if (!updatedColumn) {
      return NextResponse.json(
        { error: "Target column not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Column order updated successfully",
      column: updatedColumn,
    });
  } catch (error) {
    console.error("Error reordering column items:", error);
    return NextResponse.json(
      { error: "Failed to reorder column" },
      { status: 500 },
    );
  }
}
