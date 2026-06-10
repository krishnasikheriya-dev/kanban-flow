import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Column } from '@/models/Column';
import { Board } from '@/models/Board';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    await connectToDatabase();
    const { boardId } = await params;
    
    // TODO: Fetch all columns that belong to this boardId.
    // Hint: You might need to populate the tasks within the columns here, 
    // or fetch them separately.
    
    return NextResponse.json([]); 
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ boardId: string }> }
) {
  try {
    await connectToDatabase();
    const { boardId } = await params;
    
    // TODO: 1. Parse request body for column name.
    // TODO: 2. Create the new Column with the given boardId.
    // TODO: 3. IMPORTANT: Update the parent Board's `columnOrder` array to include this new column's ObjectId.
    // Hint: Use Board.findByIdAndUpdate with $push.
    
    return NextResponse.json({}, { status: 201 }); 
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create column' }, { status: 500 });
  }
}
