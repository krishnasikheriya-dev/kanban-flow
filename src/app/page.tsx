import { KanbanBoard } from "@/components/KanbanBoard";

export default function Home() {
  // Passing a dummy MongoDB ObjectId. Our API will handle the 404 gracefully 
  // and the UI will show the "Failed to initialize workspace layout." error state.
  // We will build a Board selector UI later.
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <KanbanBoard boardId="6a2936995c4866f6a7d3ec27" />
    </main>
  );
}
