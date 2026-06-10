'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function TaskCard({ task }: { task: any }) { // Replace 'any' with your ITask type
  // TODO: Setup `useSortable` for the task.
  // Hint: You need to extract `setNodeRef`, `attributes`, `listeners`, and `transform` styles 
  // from useSortable and apply them to the Card.
  
  return (
    <Card className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium">{task.title}</CardTitle>
      </CardHeader>
      {task.content && (
        <CardContent className="p-3 pt-0 text-xs text-muted-foreground">
          {task.content}
        </CardContent>
      )}
    </Card>
  );
}
