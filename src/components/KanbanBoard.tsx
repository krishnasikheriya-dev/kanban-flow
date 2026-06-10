"use client";

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
} from "@dnd-kit/sortable";
import { useQuery } from "@tanstack/react-query";
import { set } from "mongoose";
import { useEffect, useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
// TODO: Import necessary shadcn UI components (Card, ScrollArea, etc.)

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
  taskOrder: TaskData[];
}

interface BoardData {
  _id: string;
  title: string;
  columnOrder: ColumnData[];
}
export function KanbanBoard({ boardId }: { boardId: string }) {
  // TODO: Use TanStack Query's `useQuery` to fetch the Board and its Columns.
  const {
    data: board,
    isLoading,
    error,
  } = useQuery<BoardData>({
    queryKey: ["board", boardId],
    queryFn: async () => {
      // Endpoint pulls structual hierarchy via Option 1 Deep Population
      const res = await fetch(`/api/boards/${boardId}/columns`);
      if (!res.ok) throw new Error("Network response was not ok");
      // Because our GET route returns boardWithData.columnOrder array,
      // we can construct or receive a structured response wrapper.
      // Assuming your route structure, let's process the deep columns array:

      const columnOrder = await res.json();

      //Fake/Backfill parent structure from sub-endpoint for local consumption
      return {
        _id: boardId,
        title: "Project Workspace",
        columnOrder,
      };
    },
  });

  //Local state to handle fluid UI updates during dragging before Phase 4 mutation;
  const [columns, setColumns] = useState<ColumnData[]>([]);

  useEffect(() => {
    if (board?.columnOrder) {
      setColumns(board.columnOrder);
    }
  }, [board]);

  // Configure sensors for drag-and-drop mechanics
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Avoids breaking normal click actions on buttons/cards
      },
    }),
  );

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-forrground">
        Loading structural grid...
      </div>
    );

  if (error || !board)
    return (
      <div className="p-8 text-center text-destructive">
        Failed to initialize workspace layout.
      </div>
    );

  // TODO: Setup DndContext and its event handlers (onDragStart, onDragOver, onDragEnd)
  function handleDragStart(event: DragStartEvent) {
    // Phase 3 structural tracking if active item overlays are desired later
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === "Task";
    const isOverTask = over.data.current?.type === "Task";
    const isOverColumn = over.data.current?.type === "Column";

    //Scenario A: Dragging a Task over another Task across or within columns
    if (isActiveTask && isOverTask) {
      setColumns((prev) => {
        const activeColumn = prev.find((col) =>
          col.taskOrder.some((t) => t._id === activeId),
        );
        const overColumn = prev.find((col) =>
          col.taskOrder.some((t) => t._id === overId),
        );

        if (!activeColumn || !overColumn) return prev;

        if (activeColumn._id !== overColumn._id) {
          const activePredicateIdx = activeColumn.taskOrder.findIndex(
            (t) => t._id === activeId,
          );
          const overPredicateIdx = overColumn.taskOrder.findIndex(
            (t) => t._id === overId,
          );

          const movedTask = {
            ...activeColumn.taskOrder[activePredicateIdx],
            columnId: overColumn._id,
          };

          return prev.map((col) => {
            if (col._id === activeColumn._id) {
              return {
                ...col,
                taskOrder: col.taskOrder.filter((t) => t._id !== activeId),
              };
            }
            if (col._id === overColumn._id) {
              const newOrder = [...col.taskOrder];
              newOrder.splice(overPredicateIdx, 0, movedTask);
              return { ...col, taskOrder: newOrder };
            }
            return col;
          });
        }
        return prev;
      });
    }

    // Scenario B: Dragging a Task over an empty Column container directly
    if (isActiveTask && isOverColumn) {
      setColumns((prev) => {
        const activeColumn = prev.find((col) =>
          col.taskOrder.some((t) => t._id === activeId),
        );
        const overColumn = prev.find((col) => col._id === overId);

        if (!activeColumn || !overColumn) return prev;

        if (activeColumn._id !== overColumn._id) {
          const activePredicateIdx = activeColumn.taskOrder.findIndex(
            (t) => t._id === activeId,
          );
          const movedTask = {
            ...activeColumn.taskOrder[activePredicateIdx],
            columnId: overId,
          };

          return prev.map((col) => {
            if (col._id === activeColumn._id) {
              return {
                ...col,
                taskOrder: col.taskOrder.filter((t) => t._id !== activeId),
              };
            }

            if (col._id === overColumn._id) {
              return { ...col, taskOrder: [...col.taskOrder, movedTask] };
            }

            return col;
          });
        }
        return prev;
      });
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Scenario C: Reordering columns themselves along the horizontal line
    if (active.data.current?.type === "Column" && activeId !== overId) {
      setColumns((prev) => {
        const oldIndex = prev.findIndex((col) => col._id === activeId);
        const newIndex = prev.findIndex((col) => col._id === overId);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }

    // Scenario D: Sorting tasks locally within the exact same parent column container on dropped focus
    if (active.data.current?.type === "Task" && activeId !== overId) {
      setColumns((prev) => {
        const activeColumn = prev.find((col) =>
          col.taskOrder.some((t) => t._id === activeId),
        );
        const overColumn = prev.find((col) =>
          col.taskOrder.some((t) => t._id === overId),
        );

        if (activeColumn && overColumn && activeColumn._id === overColumn._id) {
          const colIdx = prev.findIndex((col) => col._id === activeColumn._id);
          const oldIndex = activeColumn.taskOrder.findIndex(
            (t) => t._id === activeId,
          );
          const newIndex = activeColumn.taskOrder.findIndex(
            (t) => t._id === overId,
          );

          const updatedTasks = arrayMove(
            [...activeColumn.taskOrder],
            oldIndex,
            newIndex,
          );
          const newColumns = [...prev];
          newColumns[colIdx] = { ...activeColumn, taskOrder: updatedTasks };
          return newColumns;
        }
        return prev;
      });
    }
  }

  return (
    <div className="p-4 h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <h1 className="text-2xl font-bold mb-4">{board.title}</h1>

      {/* TODO: Wrap the columns in a DndContext and SortableContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start">
          <SortableContext
            items={columns.map((col) => col._id)}
            strategy={horizontalListSortingStrategy}
          >
            {/* Render KanbanColumn components here */}
            {columns.map((column) => (
              <KanbanColumn
                key={column._id}
                column={column}
                tasks={column.taskOrder}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
