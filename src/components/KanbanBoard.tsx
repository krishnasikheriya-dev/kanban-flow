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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useEffect, useState } from "react";
import { KanbanColumn } from "./KanbanColumn";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
      // Fetch actual board details
      const boardRes = await fetch(`/api/boards/${boardId}`);
      if (!boardRes.ok) throw new Error("Failed to fetch board data");
      const boardData = await boardRes.json();

      // Fetch columns
      const res = await fetch(`/api/boards/${boardId}/columns`);
      if (!res.ok) throw new Error("Network response was not ok");
      const columnOrder = await res.json();

      return {
        _id: boardId,
        title: boardData.title || "Project Workspace",
        columnOrder,
      };
    },
  });

  const updateColumnOrderMutation = useMutation({
    mutationFn: async ({
      columnId,
      taskOrder,
    }: {
      columnId: string;
      taskOrder: string[];
    }) => {
      const res = await fetch(`/api/columns/${columnId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskOrder }),
      });
      if (!res.ok) throw new Error("Failed to update task sequence on backend");
      return res.json();
    },
    onError: (error) => {
      console.error("Persistence sync breakdown:", error);
      // Optional: Add a toast notification notification here for visual feedback
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: async (data: {
      taskId: string;
      sourceColumnId: string;
      destinationColumnId: string;
      sourceTaskOrder: string[];
      destinationTaskOrder: string[];
    }) => {
      const res = await fetch(`/api/tasks/${data.taskId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to sync cross-column move");
      return res.json();
    },
    onError: (error) => {
      console.error("Cross-column sync breakdown:", error);
    },
  });

  const queryClient = useQueryClient();
  const updateBoardMutation = useMutation({
    mutationFn: async (newTitle: string) => {
      const res = await fetch(`/api/boards/${boardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (!res.ok) throw new Error("Failed to update board title");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setIsEditingTitle(false);
    },
  });

  //Local state to handle fluid UI updates during dragging before Phase 4 mutation;
  const [columns, setColumns] = useState<ColumnData[]>([]);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const createColumnMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch(`/api/boards/${boardId}/columns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create column");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["board", boardId] });
      setNewColumnName("");
      setIsAddingColumn(false);
    },
  });

  useEffect(() => {
    if (board?.title) setEditTitle(board.title);
  }, [board?.title]);

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
      <div className="p-8 text-center text-muted-foreground">
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
    if (event.active.data.current?.type === "Task") {
      setActiveTask(event.active.data.current.task);
    }
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

    // Scenario D & E: Sorting tasks within columns and saving cross-column drops
    if (active.data.current?.type === "Task") {
      setColumns((prev) => {
        const currentColumn = prev.find((col) => col.taskOrder.some((t) => t._id === activeId));
        if (!currentColumn) return prev;

        if (activeTask && currentColumn._id === activeTask.columnId) {
          if (activeId !== overId) {
            const oldIndex = currentColumn.taskOrder.findIndex((t) => t._id === activeId);
            const newIndex = currentColumn.taskOrder.findIndex((t) => t._id === overId);
            const updatedTasks = arrayMove([...currentColumn.taskOrder], oldIndex, newIndex);
            
            updateColumnOrderMutation.mutate({
              columnId: currentColumn._id,
              taskOrder: updatedTasks.map(t => t._id),
            });

            const newColumns = [...prev];
            const colIdx = prev.findIndex(c => c._id === currentColumn._id);
            newColumns[colIdx] = { ...currentColumn, taskOrder: updatedTasks };
            return newColumns;
          }
        } else if (activeTask && currentColumn._id !== activeTask.columnId) {
          const oldIndex = currentColumn.taskOrder.findIndex((t) => t._id === activeId);
          let newIndex = currentColumn.taskOrder.length - 1;
          if (over.data.current?.type === "Task") {
             newIndex = currentColumn.taskOrder.findIndex((t) => t._id === overId);
          } else if (over.data.current?.type === "Column") {
             newIndex = currentColumn.taskOrder.length;
          }
          
          let updatedCurrentTasks = [...currentColumn.taskOrder];
          if (oldIndex !== newIndex && newIndex !== -1 && oldIndex !== -1) {
              updatedCurrentTasks = arrayMove(updatedCurrentTasks, oldIndex, newIndex);
          }

          updatedCurrentTasks = updatedCurrentTasks.map(t => 
             t._id === activeId ? { ...t, columnId: currentColumn._id } : t
          );

          const sourceColumn = prev.find(c => c._id === activeTask.columnId);
          if (sourceColumn) {
             moveTaskMutation.mutate({
               taskId: activeId,
               sourceColumnId: sourceColumn._id,
               destinationColumnId: currentColumn._id,
               sourceTaskOrder: sourceColumn.taskOrder.map(t => t._id),
               destinationTaskOrder: updatedCurrentTasks.map(t => t._id),
             });
          }

          const newColumns = [...prev];
          const colIdx = prev.findIndex(c => c._id === currentColumn._id);
          newColumns[colIdx] = { ...currentColumn, taskOrder: updatedCurrentTasks };
          return newColumns;
        }
        return prev;
      });
      setActiveTask(null);
    }
  }

  return (
    <div className="p-4 h-screen flex flex-col bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="mb-8 flex justify-center items-center gap-4">
        <Image src="/kanban.png" alt="Kanban Logo" width={40} height={40} className="rounded-md shadow-sm" />
        {isEditingTitle ? (
          <Input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={() => {
              if (editTitle.trim() && editTitle !== board.title) {
                updateBoardMutation.mutate(editTitle);
              } else {
                setIsEditingTitle(false);
                setEditTitle(board.title);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (editTitle.trim() && editTitle !== board.title) {
                  updateBoardMutation.mutate(editTitle);
                } else {
                  setIsEditingTitle(false);
                  setEditTitle(board.title);
                }
              }
              if (e.key === "Escape") {
                setIsEditingTitle(false);
                setEditTitle(board.title);
              }
            }}
            className="text-2xl font-bold text-center bg-transparent border-slate-300 dark:border-slate-700 w-[300px] shadow-sm"
          />
        ) : (
          <h1 
            onClick={() => setIsEditingTitle(true)}
            className="text-2xl font-bold cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 px-4 py-1 rounded-md transition-colors inline-block"
            title="Click to edit"
          >
            {board.title}
          </h1>
        )}
      </div>

      {/* TODO: Wrap the columns in a DndContext and SortableContext */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start px-4">
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

            {/* Add Column UI */}
            <div className="w-[350px] shrink-0">
              {isAddingColumn ? (
                <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
                  <Input
                    autoFocus
                    placeholder="Column name..."
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newColumnName.trim()) {
                        createColumnMutation.mutate(newColumnName);
                      }
                      if (e.key === "Escape") setIsAddingColumn(false);
                    }}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        if (newColumnName.trim()) createColumnMutation.mutate(newColumnName);
                      }}
                      disabled={createColumnMutation.isPending}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsAddingColumn(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAddingColumn(true)}
                  className="w-full py-3 bg-slate-200/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span>+ Add Column</span>
                </button>
              )}
            </div>
          </SortableContext>
        </div>
      </DndContext>
    </div>
  );
}
