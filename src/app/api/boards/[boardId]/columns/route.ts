import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Column } from "@/models/Column";
import { Board } from "@/models/Board";
import { Task } from "@/models/Task";

// Prevent Next.js from tree-shaking the Task import since we only use it in a Mongoose populate string
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _Task = Task;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    await connectToDatabase();
    const { boardId } = await params;

    // TODO: Fetch all columns that belong to this boardId.
    // Hint: You might need to populate the tasks within the columns here,
    // or fetch them separately.
   const boardWithData = await Board.findById(boardId).populate({
      path: 'columnOrder',
      model: 'Column',
      populate: {
        path: 'taskOrder',
        model: 'Task',
      },
    });

    if (!boardWithData) {
      return NextResponse.json(
        { error: 'Board not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(boardWithData.columnOrder);
  } catch (error) {
    console.error("Error fetching columns:", error);
    return NextResponse.json(
      { error: "Failed to fetch columns" },
      { status: 500 },
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    await connectToDatabase();
    const { boardId } = await params;

    // TODO: 1. Parse request body for column name.
    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Column name is required" },
        { status: 400 },
      );
    }

    const parentBoard = await Board.findById(boardId);
    if (!parentBoard) {
      return NextResponse.json(
        { error: "Parent board not found" },
        { status: 404 },
      );
    }
    // TODO: 2. Create the new Column with the given boardId.
    const newColumn = new Column({
      name: name.trim(),
      boardId: boardId,
      taskOrder: [],
    });

    await newColumn.save();
    // TODO: 3. IMPORTANT: Update the parent Board's `columnOrder` array to include this new column's ObjectId.
    // Hint: Use Board.findByIdAndUpdate with $push.
    await Board.findByIdAndUpdate(boardId, {
      $push: { columnOrder: newColumn._id },
    });

    return NextResponse.json(newColumn, { status: 201 });
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Failed to create column" },
      { status: 500 },
    );
  }
}
