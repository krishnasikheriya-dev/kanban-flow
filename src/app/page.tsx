import { KanbanBoard } from "@/components/KanbanBoard";
import { connectToDatabase } from "@/lib/mongodb";
import { Board } from "@/models/Board";
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button";

export default async function Home() {
  await connectToDatabase();
  // Fetch the most recently created board
  const board = await Board.findOne().sort({ createdAt: -1 });

  async function createBoard() {
    "use server";
    await connectToDatabase();
    const newBoard = new Board({
      title: "New Workspace",
      columnOrder: [],
    });
    await newBoard.save();
    revalidatePath("/");
  }

  if (!board) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-8 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold mb-4">No Workspace Found</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">Create a new workspace to get started.</p>
        <form action={createBoard}>
          <Button type="submit" size="lg">
            Create Workspace
          </Button>
        </form>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <KanbanBoard boardId={board._id.toString()} />
    </main>
  );
}
