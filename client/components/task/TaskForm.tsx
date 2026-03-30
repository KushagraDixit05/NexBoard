'use client';

import { useState } from 'react';
import { useBoardStore } from '@/store/boardStore';
import { X } from 'lucide-react';

interface TaskFormProps {
  columnId:   string;
  boardId:    string;
  projectId:  string;
  swimlaneId?: string;
  onClose:    () => void;
}

export default function TaskForm({ columnId, boardId, projectId, swimlaneId, onClose }: TaskFormProps) {
  const { addTask } = useBoardStore();
  const [title, setTitle]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    await addTask({ 
      title: title.trim(), 
      column: columnId, 
      board: boardId, 
      project: projectId,
      ...(swimlaneId && { swimlane: swimlaneId })
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <textarea
        autoFocus
        value={title}
        onChange={e => setTitle(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); } if (e.key === 'Escape') onClose(); }}
        className="input-field text-sm min-h-[70px] resize-none"
        placeholder="Task title... (Enter to add)"
      />
      <div className="flex gap-2">
        <button type="submit" disabled={loading || !title.trim()} className="btn-primary text-xs py-1.5 px-3 flex-1 justify-center">
          {loading ? 'Adding...' : 'Add task'}
        </button>
        <button type="button" onClick={onClose} className="btn-ghost p-1.5">
          <X className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
