'use client';

import { Task } from '@/types';
import { AlertCircle, Calendar } from 'lucide-react';
import { format, isValid } from 'date-fns';
import Badge from '../ui/Badge';

interface OverdueListProps {
  tasks: Task[];
}

export default function OverdueList({ tasks }: OverdueListProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <h3 className="text-lg font-semibold text-card-foreground">Overdue Tasks</h3>
        <Badge variant="destructive">{tasks.length}</Badge>
      </div>

      {tasks.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">No overdue tasks! 🎉</p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {tasks.map((task) => {
            const dueDate = task.dueDate ? new Date(task.dueDate) : null;
            const isValidDate = dueDate && isValid(dueDate);

            return (
              <div
                key={task._id}
                className="flex items-start gap-3 p-3 rounded-md border border-border hover:bg-accent transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm text-foreground truncate">{task.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-destructive">
                      Due: {isValidDate ? format(dueDate, 'MMM d, yyyy') : 'Invalid date'}
                    </span>
                  </div>
                </div>
                <Badge variant={task.priority === 'urgent' ? 'destructive' : 'default'}>
                  {task.priority}
                </Badge>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
