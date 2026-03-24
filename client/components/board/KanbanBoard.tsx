'use client';

import { useEffect, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useBoardStore } from '@/store/boardStore';
import KanbanColumn from './KanbanColumn';
import AddColumnForm from './AddColumnForm';
import BoardHeader from './BoardHeader';
import TaskDetailModal from '../task/TaskDetailModal';
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
    optimisticMoveTask(draggableId, source.droppableId, destination.droppableId, destination.index);
    await moveTask(draggableId, destination.droppableId, destination.index);
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
        <p className="text-danger-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <BoardHeader board={boardData.board} projectId={projectId} />

      <DragDropContext onDragEnd={handleDragEnd}>
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
