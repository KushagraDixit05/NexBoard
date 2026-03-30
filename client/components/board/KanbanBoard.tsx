'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '@/store/boardStore';
import KanbanColumn from './KanbanColumn';
import AddColumnForm from './AddColumnForm';
import BoardHeader from './BoardHeader';
import TaskDetailModal from '../task/TaskDetailModal';
import SwimlaneRow from '../swimlane/SwimlaneRow';
import AddSwimlaneForm from '../swimlane/AddSwimlaneForm';
import Spinner from '../ui/Spinner';
import type { Task } from '@/types';

interface KanbanBoardProps {
  boardId:   string;
  projectId: string;
}

export default function KanbanBoard({ boardId, projectId }: KanbanBoardProps) {
  const { boardData, isLoading, error, fetchBoard, optimisticMoveTask, moveTask } = useBoardStore();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  useEffect(() => {
    fetchBoard(boardId);
  }, [boardId, fetchBoard]);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const parseDroppableId = (id: string) => {
      const parts = id.split('-');
      if (parts.length === 2) {
        return { columnId: parts[0], swimlaneId: parts[1] };
      }
      return { columnId: id, swimlaneId: undefined };
    };

    const src = parseDroppableId(source.droppableId);
    const dest = parseDroppableId(destination.droppableId);

    optimisticMoveTask(
      draggableId,
      src.columnId,
      dest.columnId,
      destination.index,
      src.swimlaneId,
      dest.swimlaneId
    );

    await moveTask(draggableId, dest.columnId, destination.index, dest.swimlaneId);
  };

  if (isLoading || !boardData) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  const hasSwimlanes = boardData.swimlanes && boardData.swimlanes.length > 0;

  return (
    <div className="h-full flex flex-col">
      <BoardHeader board={boardData.board} projectId={projectId} />

      <DragDropContext onDragEnd={handleDragEnd}>
        {hasSwimlanes ? (
          <div className="flex-1 flex flex-col overflow-auto">
            {/* Column Headers */}
            <div className="flex sticky top-0 z-20 bg-background border-b border-border">
              <div className="min-w-[180px] border-r border-border" />
              <div className="flex flex-1 gap-4 px-4 py-2">
                {boardData.columns.map((column) => (
                  <div key={column._id} className="flex-shrink-0 w-72">
                    <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                  </div>
                ))}
                <div className="w-72 flex-shrink-0">
                  <AddColumnForm boardId={boardId} />
                </div>
              </div>
            </div>

            {/* Swimlane Rows */}
            <div className="flex-1 overflow-auto">
              {boardData.swimlanes.map((swimlane) => (
                <SwimlaneRow
                  key={swimlane._id}
                  swimlane={swimlane}
                  columns={boardData.columns}
                  boardId={boardId}
                  projectId={projectId}
                  onTaskClick={(task: Task) => setSelectedTaskId(task._id)}
                />
              ))}

              {/* Tasks without swimlane */}
              <SwimlaneRow
                swimlane={null}
                columns={boardData.columns}
                boardId={boardId}
                projectId={projectId}
                onTaskClick={(task: Task) => setSelectedTaskId(task._id)}
              />
            </div>

            {/* Add Swimlane */}
            <div className="p-4 border-t border-border">
              <AddSwimlaneForm boardId={boardId} />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4 pt-2 px-0.5 items-start">
            {boardData.columns.map((column) => (
              <KanbanColumn
                key={column._id}
                column={column}
                boardId={boardId}
                projectId={projectId}
                onTaskClick={(task: Task) => setSelectedTaskId(task._id)}
              />
            ))}
            <AddColumnForm boardId={boardId} />
          </div>
        )}
      </DragDropContext>

      {selectedTaskId && (
        <TaskDetailModal
          taskId={selectedTaskId}
          onClose={() => { setSelectedTaskId(null); fetchBoard(boardId); }}
        />
      )}
    </div>
  );
}
