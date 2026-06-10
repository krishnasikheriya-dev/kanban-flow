'use client';

import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TaskCard } from './TaskCard';
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

  const deleteColumnMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/columns/${column._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete column");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });

  function handleCreateTask() {
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate(newTaskTitle);
  }

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
        <CardTitle className="text-sm font-semibold flex items-center justify-between text-slate-700 dark:text-slate-300 w-full">
          <div className="flex items-center gap-2">
            <span>{column.name}</span>
            <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
              {tasks.length}
            </span>
          </div>
          <AlertDialog>
            <AlertDialogTrigger 
              render={
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-slate-200 dark:hover:bg-slate-700 z-10"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.stopPropagation(); 
                  }}
                  title="Delete Column"
                />
              }
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            </AlertDialogTrigger>
            <AlertDialogContent 
              onPointerDown={(e) => e.stopPropagation()} 
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <AlertDialogHeader>
                <AlertDialogTitle className="text-slate-900 dark:text-slate-100">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="text-slate-500 dark:text-slate-400">
                  This action cannot be undone. This will permanently delete the column
                  and all tasks inside it.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-transparent border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800">Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteColumnMutation.mutate();
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white border-none"
                >
                  {deleteColumnMutation.isPending ? "Deleting..." : "Delete Column"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 min-h-37.5">
        <SortableContext items={tasks.map((task) => task._id)} strategy={verticalListSortingStrategy}>
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