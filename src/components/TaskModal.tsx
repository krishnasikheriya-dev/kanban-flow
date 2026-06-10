import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TaskData {
  _id: string;
  title: string;
  content?: string;
  columnId: string;
}

interface TaskModalProps {
  task: TaskData;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [content, setContent] = useState(task.content || "");
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (!res.ok) throw new Error("Failed to update task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      onClose();
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 p-6 shadow-xl rounded-xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Edit Task</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-2">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl font-bold bg-transparent border-none focus-visible:ring-0 px-0 w-full text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-none"
            placeholder="Task title..."
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[200px] w-full resize-none bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md p-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-200"
            placeholder="Add a more detailed description..."
          />
        </div>
        <DialogFooter>
          <Button
            onClick={() => updateTaskMutation.mutate()}
            disabled={updateTaskMutation.isPending}
          >
            {updateTaskMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
