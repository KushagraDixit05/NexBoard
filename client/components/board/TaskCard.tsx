'use client';

import { Draggable } from '@hello-pangea/dnd';
import { Calendar, Clock, CheckCircle2, Check, Circle, Archive } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Avatar from '../ui/Avatar';
import type { Task } from '@/types';
import { format, isPast, isToday } from 'date-fns';
import api from '@/lib/api';
import { useBoardStore } from '@/store/boardStore';

interface TaskCardProps {
  task:    Task;
  index:   number;
  onClick: () => void;
}

const priorityColors: Record<string, string> = {
  low:    'bg-muted text-muted-foreground',
  medium: 'bg-info/10 text-info',
  high:   'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
};

const statusConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  open:        { icon: Circle,        color: 'text-muted-foreground', label: 'Open' },
  in_progress: { icon: CheckCircle2,  color: 'text-success',          label: 'In Progress' },
  completed:   { icon: Check,         color: 'text-success',          label: 'Completed' },
  archived:    { icon: Archive,       color: 'text-muted-foreground', label: 'Archived' },
};

export default function TaskCard({ task, index, onClick }: TaskCardProps) {
  const { updateTask } = useBoardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const isOverdue  = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmedTitle = editedTitle.trim();
    if (trimmedTitle && trimmedTitle !== task.title) {
      try {
        await api.put(`/tasks/${task._id}`, { title: trimmedTitle });
        updateTask(task._id, { title: trimmedTitle });
      } catch (error) {
        console.error('Failed to update task title:', error);
        setEditedTitle(task.title);
      }
    } else {
      setEditedTitle(task.title);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditedTitle(task.title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditing) {
      onClick();
    }
  };

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={handleClick}
          className={`bg-card rounded-md p-3 shadow-sm border border-border cursor-pointer
            hover:shadow-md transition-all group select-none
            ${snapshot.isDragging ? 'shadow-lg rotate-1 scale-105 border-primary' : ''}
            ${task.color && task.color !== '#ffffff' ? 'border-l-4' : ''}
            ${isEditing ? 'ring-2 ring-ring' : ''}`}
          style={{
            ...provided.draggableProps.style,
            borderLeftColor: task.color && task.color !== '#ffffff' ? task.color : undefined,
          }}
        >
          {/* Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-1.5">
              {task.labels.slice(0, 3).map((label, i) => (
                <span key={i} className="px-2 py-0.5 text-[10px] rounded-md bg-primary/10 text-primary">
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          {isEditing ? (
            <input
              ref={inputRef}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-foreground mb-2 w-full px-2 py-1 border border-primary rounded focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
          ) : (
            <p 
              onDoubleClick={handleDoubleClick}
              className="text-sm font-medium text-foreground mb-2 line-clamp-2 leading-snug"
              title="Double-click to edit"
            >
              {task.title}
            </p>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Status indicator */}
            {(() => {
              const status = statusConfig[task.status] || statusConfig.open;
              const StatusIcon = status.icon;
              return (
                <span className={`flex items-center gap-0.5 text-xs ${status.color}`} title={status.label}>
                  <StatusIcon className="w-3 h-3" />
                </span>
              );
            })()}

            <span className={`px-1.5 py-0.5 text-[10px] rounded font-medium capitalize ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>

            {task.dueDate && (
              <span className={`flex items-center gap-0.5 text-xs font-medium
                ${isOverdue ? 'text-destructive' : isDueToday ? 'text-warning' : 'text-muted-foreground'}`}>
                <Calendar className="w-3 h-3" />
                {format(new Date(task.dueDate), 'MMM d')}
              </span>
            )}

            {task.timeSpent > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
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
