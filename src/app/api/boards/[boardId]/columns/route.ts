import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Column } from "@/models/Column";
import { Board } from "@/models/Board";
import { Task } from "@/models/Task";

const _Task = Task;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    await connectToDatabase();
    const { boardId } = await params;

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
    const newColumn = new Column({
      name: name.trim(),
      boardId: boardId,
      taskOrder: [],
    });

    await newColumn.save();
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
