import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Task } from '@/models/Task';
import { Column } from '@/models/Column';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ columnId: string }> }
) {
  try {
    await connectToDatabase();
    const { columnId } = await params;
    
    // TODO: 1. Parse request body for task title and content.
    // TODO: 2. Create the new Task with the given columnId.
    // TODO: 3. CRITICAL: Update the parent Column's `taskOrder` array to include this new task's ObjectId.
    // Hint: Use Column.findByIdAndUpdate with $push.
    
    return NextResponse.json({}, { status: 201 }); 
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
