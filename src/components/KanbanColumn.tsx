'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function KanbanColumn({ column }: { column: any }) { // Replace 'any' with your IColumn type
  // TODO: Setup `useSortable` for the column itself so columns can be reordered (optional but recommended)
  // TODO: Also set up a `SortableContext` inside this component for the tasks it contains.
  
  return (
    <Card className="w-80 flex-shrink-0 flex flex-col bg-slate-50">
      <CardHeader>
        <CardTitle>{column.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto flex flex-col gap-2">
        {/* TODO: Render TaskCard components here inside a SortableContext */}
      </CardContent>
    </Card>
  );
}
