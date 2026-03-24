'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Clock } from 'lucide-react';
import Avatar from '../ui/Avatar';
import type { Task } from '@/types';
import { format, isPast, isToday } from 'date-fns';

interface TaskCardProps {
  task:    Task;
  index:   number;
  onClick: () => void;
}

const priorityColors: Record<string, string> = {
  low:    'bg-gray-100 text-gray-600',
  medium: 'bg-blue-100 text-blue-700',
  high:   'bg-orange-100 text-orange-700',
  urgent: 'bg-red-100 text-red-700',
};

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const isOverdue  = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`bg-white rounded-lg p-3 shadow-card border border-gray-100 cursor-pointer
            hover:shadow-card-hover transition-all group select-none
            ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105 border-primary-200' : ''}
            ${task.color && task.color !== '#ffffff' ? 'border-l-4' : ''}`}
          style={{
            ...provided.draggableProps.style,
            borderLeftColor: task.color && task.color !== '#ffffff' ? task.color : undefined,
          }}
        >
          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {task.labels.slice(0, 3).map((label, i) => (
                <span key={i} className="px-2 py-0.5 text-[10px] rounded-full bg-primary-50 text-primary-700">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <p className="text-sm font-medium text-gray-900 mb-2 line-clamp-2 leading-snug">
            {task.title}
          </p>

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium capitalize ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>

            {task.dueDate && (
              <span className={`flex items-center gap-0.5 text-xs font-medium
                ${isOverdue ? 'text-red-600' : isDueToday ? 'text-orange-600' : 'text-gray-400'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {task.timeSpent > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400">
                <Clock className="w-3 h-3" />
                {Math.round(task.timeSpent / 60)}h
              </span>
            )}

            {task.assignee && (
              <div className="ml-auto">
                <Avatar
                  name={task.assignee.displayName || task.assignee.username}
                  size="xs"
                  src={task.assignee.avatar}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
