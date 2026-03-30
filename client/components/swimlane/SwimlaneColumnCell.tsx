'use client';

import { useState } from 'react';
import { Droppable } from '@hello-pangea/dnd';
import TaskCard from '../board/TaskCard';
import TaskForm from '../task/TaskForm';
import { Plus } from 'lucide-react';
import type { Task, Column, Swimlane } from '@/types';

interface SwimlaneColumnCellProps {
  column: Column;
  swimlane: Swimlane | null;
  tasks: Task[];
  boardId: string;
  projectId: string;
  onTaskClick: (task: Task) => void;
}

export default function SwimlaneColumnCell({
  column,
  swimlane,
  tasks,
  boardId,
  projectId,
  onTaskClick,
}: SwimlaneColumnCellProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const droppableId = swimlane 
    ? `${column._id}-${swimlane._id}` 
    : column._id;

  const isOverLimit = column.taskLimit > 0 && tasks.length >= column.taskLimit;

  return (
    <div className="flex flex-col h-full">
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[100px] flex-1 p-2 space-y-2 transition-colors
              ${snapshot.isDraggingOver ? 'bg-accent/50' : ''}`}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task._id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-2 border-t border-border">
        {showAddTask ? (
          <TaskForm
            columnId={column._id}
            boardId={boardId}
            projectId={projectId}
            swimlaneId={swimlane?._id}
            onClose={() => setShowAddTask(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            disabled={isOverLimit}
            className="w-full py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-card
                       rounded-md transition-colors flex items-center gap-1.5 px-2
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add task
          </button>
        )}
      </div>
    </div>
  );
}
