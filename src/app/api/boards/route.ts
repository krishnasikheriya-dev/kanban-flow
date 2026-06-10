import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { Board } from "@/models/Board";

export async function GET() {
  try {
    await connectToDatabase();

    const boards = await Board.find({}).sort({ createdAt: -1 });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectToDatabase();
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { error: "Board title is required" },
        { status: 400 },
      );
    }
    const newBoard = new Board({
      title: title.trim(),
      columnOrder: [],
    });

    await newBoard.save();

    return NextResponse.json(newBoard, { status: 201 });

  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 },
    );
  }
}
