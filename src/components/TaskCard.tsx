"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  // Replace 'any' with your ITask type
  // TODO: Setup `useSortable` for the task.
  // Hint: You need to extract `setNodeRef`, `attributes`, `listeners`, and `transform` styles
  // from useSortable and apply them to the Card.

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
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 select-none outline-none"
    >
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium text-slate-800 dark:text-slate-200">
          {task.title}
        </CardTitle>
      </CardHeader>
      {task.content && (
        <CardContent className="p-3 pt-0 text-xs text-muted-foreground wrap-break-word line-clamp-3">
          {task.content}
        </CardContent>
      )}
    </Card>
  );
}
