'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { Plus, X } from 'lucide-react';

interface AddColumnFormProps {
  boardId: string;
}

export default function AddColumnForm({ boardId }: AddColumnFormProps) {
  const { addColumn } = useBoardStore();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleAdd = async () => {
    if (!title.trim()) return;
    setLoading(true);
    await addColumn({ board: boardId, title: title.trim() });
    setTitle('');
    setIsAdding(false);
    setLoading(false);
  };

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="flex-shrink-0 w-72 h-12 flex items-center gap-2 px-4 rounded-lg
                   text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Plus className="w-4 h-4" /> Add column
      </button>
    );
  }

  return (
    <div className="flex-shrink-0 w-72 bg-muted rounded-lg p-3 space-y-2">
      <input
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setIsAdding(false); }}
        className="input-field"
        placeholder="Column title..."
      />
      <div className="flex gap-2">
        <button onClick={handleAdd} disabled={loading || !title.trim()} className="btn-primary flex-1 justify-center text-xs py-1.5">
          {loading ? 'Adding...' : 'Add column'}
        </button>
        <button onClick={() => { setIsAdding(false); setTitle(''); }} className="btn-ghost p-1.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
