import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Column } from '@/models/Column';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ columnId: string }> }
) {
  try {
    await connectToDatabase();
    const { columnId } = await params;
    
    // TODO: 1. Parse request body to get the `taskOrder` array of ObjectIds.
    // TODO: 2. Use Column.findByIdAndUpdate to overwrite the existing taskOrder with the new array.
    
    return NextResponse.json({ message: 'Column order updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reorder column' }, { status: 500 });
  }
}
