'use client';

import { Droppable } from '@hello-pangea/dnd';
import TaskCard from './TaskCard';
import ColumnHeader from './ColumnHeader';
import TaskForm from '../task/TaskForm';
import type { ColumnWithTasks, Task } from '@/types';
import { useState } from 'react';
import { Plus } from 'lucide-react';

interface KanbanColumnProps {
  column:      ColumnWithTasks;
  boardId:     string;
  projectId:   string;
  onTaskClick: (task: Task) => void;
}

export default function KanbanColumn({ column, boardId, projectId, onTaskClick }: KanbanColumnProps) {
  const [showAddTask, setShowAddTask] = useState(false);
  const isOverLimit = column.taskLimit > 0 && column.tasks.length >= column.taskLimit;

  return (
    <div className="flex-shrink-0 w-72 flex flex-col bg-gray-100 rounded-xl max-h-full">
      <ColumnHeader column={column} taskCount={column.tasks.length} isOverLimit={isOverLimit} />

      <Droppable droppableId={column._id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 min-h-[120px] max-h-[calc(100vh-16rem)] overflow-y-auto
              p-2 space-y-2 transition-colors rounded-lg
              ${snapshot.isDraggingOver ? 'bg-primary-50' : ''}`}
          >
            {column.tasks.map((task, index) => (
              <TaskCard key={task._id} task={task} index={index} onClick={() => onTaskClick(task)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="p-2 border-t border-gray-200">
        {showAddTask ? (
          <TaskForm
            columnId={column._id}
            boardId={boardId}
            projectId={projectId}
            onClose={() => setShowAddTask(false)}
          />
        ) : (
          <button
            onClick={() => setShowAddTask(true)}
            disabled={isOverLimit}
            className="w-full py-1.5 text-sm text-gray-500 hover:text-gray-700 hover:bg-white
                       rounded-lg transition-colors flex items-center gap-1.5 px-2
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> Add task
          </button>
        )}
      </div>
    </div>
  );
}
