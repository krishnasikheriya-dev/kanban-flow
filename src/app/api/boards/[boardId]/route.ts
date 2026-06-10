import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Board } from "@/models/Board";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    await connectToDatabase();
    const { boardId } = await params;

    const board = await Board.findById(boardId);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error fetching board:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  try {
    await connectToDatabase();
    const { boardId } = await params;

    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Board title is required" },
        { status: 400 },
      );
    }

    const updatedBoard = await Board.findByIdAndUpdate(
      boardId,
      { $set: { title: title.trim() } },
      { new: true }
    );

    if (!updatedBoard) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBoard);
  } catch (error) {
    console.error("Error updating board:", error);
    return NextResponse.json(
      { error: "Failed to update board" },
      { status: 500 },
    );
  }
}
