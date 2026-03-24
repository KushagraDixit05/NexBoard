'use client';

import { useParams } from 'next/navigation';
import KanbanBoard from '@/components/board/KanbanBoard';

export default function BoardPage() {
  const params    = useParams<{ projectId: string; boardId: string }>();
  const projectId = params.projectId;
  const boardId   = params.boardId;

  return (
    <div className="h-[calc(100vh-8rem)] -mx-6 -my-6 px-6 py-4">
      <KanbanBoard boardId={boardId} projectId={projectId} />
    </div>
  );
}
