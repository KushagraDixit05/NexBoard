import Link from 'next/link';
import type { Board } from '@/types';
import { ArrowLeft } from 'lucide-react';

interface BoardHeaderProps {
  board:     Board;
  projectId: string;
}

export default function BoardHeader({ board, projectId }: BoardHeaderProps) {
  return (
    <div className="flex items-center gap-3 pb-3 mb-1 border-b border-gray-200">
      <Link href={`/dashboard/projects/${projectId}`} className="btn-ghost p-1.5 shrink-0">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div>
        <h1 className="font-semibold text-gray-900">{board.name}</h1>
        {board.description && <p className="text-xs text-gray-500">{board.description}</p>}
      </div>
    </div>
  );
}
