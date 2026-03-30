import Link from 'next/link';
import type { Board } from '@/types';
import { ArrowLeft, BarChart3, Zap } from 'lucide-react';

interface BoardHeaderProps {
  board:     Board;
  projectId: string;
}

export default function BoardHeader({ board, projectId }: BoardHeaderProps) {
  return (
    <div className="flex items-center gap-3 pb-3 mb-1 border-b border-border">
      <Link href={`/dashboard/projects/${projectId}`} className="btn-ghost p-1.5 shrink-0">
        <ArrowLeft className="w-4 h-4" />
      </Link>
      <div className="flex-1">
        <h1 className="font-semibold text-foreground">{board.name}</h1>
        {board.description && <p className="text-xs text-muted-foreground">{board.description}</p>}
      </div>
      <div className="flex items-center gap-2">
        <Link
          href={`/dashboard/projects/${projectId}/analytics`}
          className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1.5"
          title="Analytics"
        >
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Analytics</span>
        </Link>
        <Link
          href={`/dashboard/projects/${projectId}/automation`}
          className="btn-ghost px-3 py-1.5 text-sm flex items-center gap-1.5"
          title="Automation"
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Automation</span>
        </Link>
      </div>
    </div>
  );
}
