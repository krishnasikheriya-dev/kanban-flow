import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Column } from "@/models/Column";
import { Board } from "@/models/Board";
import { Task } from "@/models/Task";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ columnId: string }> },
) {
  try {
    await connectToDatabase();
    const { columnId } = await params;

    const column = await Column.findById(columnId);
    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    await Board.findByIdAndUpdate(column.boardId, {
      $pull: { columnOrder: columnId },
    });

    await Task.deleteMany({ columnId: columnId });

    await Column.findByIdAndDelete(columnId);

    return NextResponse.json({ message: "Column and associated tasks deleted successfully" });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 },
    );
  }
}
