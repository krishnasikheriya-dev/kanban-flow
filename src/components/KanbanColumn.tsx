'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TaskData {
  _id: string;
  title: string;
  content?: string;
  columnId: string;
}

interface ColumnData {
  _id: string;
  name: string;
  boardId: string;
}

interface KanbanColumnProps {
  column: ColumnData;
  tasks: TaskData[];
}

export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const res = await fetch(`/api/columns/${column._id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("Failed to create task");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
      setIsAddingTask(false);
      setNewTaskTitle("");
    },
  });

  function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate(newTaskTitle);
  }

  // TODO: Setup `useSortable` for the column itself so columns can be reordered (optional but recommended)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column._id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Lower the opacity of the entire column element while dragging it
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className="w-80 h-[calc(100vh-120px)] shrink-0 flex flex-col bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 outline-none"
    >
      {/* Attaching listeners and attributes to the CardHeader turns the header 
        into the drag handle for the entire column container.
      */}
      <CardHeader 
        {...attributes} 
        {...listeners} 
        className="cursor-grab active:cursor-grabbing p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-xl select-none"
      >
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-700 dark:text-slate-300">
          <span>{column.name}</span>
          <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
            {tasks.length}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-37.5">
        {/* TODO: Also set up a `SortableContext` inside this component for the tasks it contains. */}
        <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
          {/* TODO: Render TaskCard components here inside a SortableContext */}
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} />
          ))}
        </SortableContext>
      </CardContent>

      <div className="p-2 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl">
        {isAddingTask ? (
          <div className="flex flex-col gap-2">
            <Input
              autoFocus
              placeholder="Task title..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateTask();
                if (e.key === "Escape") {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={handleCreateTask}
                disabled={createTaskMutation.isPending}
              >
                {createTaskMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setIsAddingTask(false);
                  setNewTaskTitle("");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setIsAddingTask(true)}
            className="w-full text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add Card
          </Button>
        )}
      </div>
    </Card>
  );
}