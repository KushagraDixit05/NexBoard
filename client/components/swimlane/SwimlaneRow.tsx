'use client';

import SwimlaneHeader from './SwimlaneHeader';
import SwimlaneColumnCell from './SwimlaneColumnCell';
import type { Swimlane, ColumnWithTasks, Task } from '@/types';

interface SwimlaneRowProps {
  swimlane: Swimlane | null;
  columns: ColumnWithTasks[];
  boardId: string;
  projectId: string;
  onTaskClick: (task: Task) => void;
}

export default function SwimlaneRow({ swimlane, columns, boardId, projectId, onTaskClick }: SwimlaneRowProps) {
  return (
    <div className="flex border-b border-border">
      {swimlane && <SwimlaneHeader swimlane={swimlane} />}
      <div className="flex flex-1 gap-4 overflow-x-auto">
        {columns.map((column) => {
          const tasksInCell = column.tasks.filter((task) =>
            swimlane 
              ? task.swimlane === swimlane._id 
              : !task.swimlane
          );

          return (
            <div key={column._id} className="flex-shrink-0 w-72">
              <SwimlaneColumnCell
                column={column}
                swimlane={swimlane}
                tasks={tasksInCell}
                boardId={boardId}
                projectId={projectId}
                onTaskClick={onTaskClick}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
