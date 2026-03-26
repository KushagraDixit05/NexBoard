'use client';

import { useState } from 'react';
import { MoreHorizontal, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useBoardStore } from '@/store/boardStore';
import ConfirmDialog from '../ui/ConfirmDialog';
import type { Column } from '@/types';

interface ColumnHeaderProps {
  column:      Column;
  taskCount:   number;
  isOverLimit: boolean;
}

export default function ColumnHeader({ column, taskCount, isOverLimit }: ColumnHeaderProps) {
  const { updateColumn, deleteColumn } = useBoardStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle]   = useState(column.title);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const handleRename = async () => {
    if (title.trim() && title !== column.title) {
      await updateColumn(column._id, { title: title.trim() });
    }
    setIsEditingTitle(false);
  };

  return (
    <div className="flex items-center gap-2 p-3 pb-2">
      {/* Color dot */}
      {column.color && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: column.color }} />}

      {/* Title */}
      {isEditingTitle ? (
        <input
          autoFocus value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={handleRename}
          onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') { setTitle(column.title); setIsEditingTitle(false); }}}
          className="flex-1 text-sm font-semibold bg-card border border-primary rounded px-2 py-0.5 focus:outline-none"
        />
      ) : (
        <span className="flex-1 text-sm font-semibold text-foreground truncate">{column.title}</span>
      )}

      {/* Count badge */}
      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-md shrink-0
        ${isOverLimit ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>
        {taskCount}{column.taskLimit > 0 ? `/${column.taskLimit}` : ''}
      </span>

      {isOverLimit && <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0" />}

      {/* Menu */}
      <div className="relative">
        <button onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-accent-foreground">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-6 z-20 bg-popover rounded-md shadow-lg border border-border py-1 min-w-[130px]">
              <button
                onClick={() => { setIsEditingTitle(true); setMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-popover-foreground hover:bg-accent w-full"
              >
                <Pencil className="w-3.5 h-3.5" /> Rename
              </button>
              <button
                onClick={() => { setShowDelete(true); setMenuOpen(false); }}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10 w-full"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDelete} onClose={() => setShowDelete(false)}
        onConfirm={() => deleteColumn(column._id)}
        title="Delete Column?" description="All tasks in this column will be deleted. This cannot be undone."
      />
    </div>
  );
}
