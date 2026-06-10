import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Board } from '@/models/Board';
import { Column } from '@/models/Column';
import { Task } from '@/models/Task';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Clear existing data
    await Board.deleteMany({});
    await Column.deleteMany({});
    await Task.deleteMany({});

    // Create Board
    const board = await Board.create({ title: "My First Kanban Board", columnOrder: [] });
    
    // Create Columns
    const col1 = await Column.create({ name: "To Do", boardId: board._id, taskOrder: [] });
    const col2 = await Column.create({ name: "In Progress", boardId: board._id, taskOrder: [] });
    const col3 = await Column.create({ name: "Done", boardId: board._id, taskOrder: [] });

    // Create Tasks
    const task1 = await Task.create({ title: "Setup Next.js", content: "Init app router", columnId: col3._id });
    const task2 = await Task.create({ title: "Design DB", content: "Create Mongoose schemas", columnId: col3._id });
    const task3 = await Task.create({ title: "Build UI", content: "Use shadcn and dnd-kit", columnId: col2._id });
    const task4 = await Task.create({ title: "Implement Mutations", content: "Optimistic updates!", columnId: col1._id });

    // Update Columns
    col3.taskOrder.push(task1._id, task2._id);
    col2.taskOrder.push(task3._id);
    col1.taskOrder.push(task4._id);
    await col1.save();
    await col2.save();
    await col3.save();

    // Update Board
    board.columnOrder.push(col1._id, col2._id, col3._id);
    await board.save();

    return NextResponse.json({ 
      message: "Database seeded successfully!",
      boardId: board._id 
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
