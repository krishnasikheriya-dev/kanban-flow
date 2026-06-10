"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TaskModal } from "./TaskModal";

interface TaskData {
  _id: string;
  title: string;
  content?: string;
  columnId: string;
}

interface TaskCardProps {
  task: TaskData;
}

export function TaskCard({ task }: TaskCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id,
    data: {
      type: "Task",
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    // Add visual clarity by lowering opacity and applying a dashed border structure while item is actively floating
    opacity: isDragging ? 0.3 : 1,
    border: isDragging ? "1px dashed rgb(148, 163, 184)" : undefined,
  };

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => setIsModalOpen(true)}
        className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 select-none outline-none"
      >
        <CardHeader className="p-3">
          <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {task.title}
          </CardTitle>
        </CardHeader>
        {task.content && (
          <CardContent className="p-3 pt-0 text-xs text-muted-foreground break-words line-clamp-3">
            {task.content}
          </CardContent>
        )}
      </Card>
      
      {/* We render the modal conditionally so it doesn't pollute the DOM when closed */}
      {isModalOpen && (
        <TaskModal 
          task={task} 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </>
  );
}
