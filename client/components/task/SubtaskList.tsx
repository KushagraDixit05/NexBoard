'use client';

import { useState } from 'react';
import { Plus, Check, Circle, Trash2 } from 'lucide-react';
import api from '@/lib/api';
import type { Subtask } from '@/types';

interface SubtaskListProps {
  taskId:   string;
  subtasks: Subtask[];
  onChange: (subtasks: Subtask[]) => void;
}

export default function SubtaskList({ taskId, subtasks, onChange }: SubtaskListProps) {
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding]     = useState(false);

  const completed = subtasks.filter(s => s.status === 'done').length;
  const progress  = subtasks.length > 0 ? (completed / subtasks.length) * 100 : 0;

  const addSubtask = async () => {
    if (!newTitle.trim()) return;
    const { data } = await api.post('/subtasks', { task: taskId, title: newTitle.trim() });
    onChange([...subtasks, data]);
    setNewTitle('');
  };

  const toggle = async (subtask: Subtask) => {
    const newStatus = subtask.status === 'done' ? 'todo' : 'done';
    await api.patch(`/subtasks/${subtask._id}/status`, { status: newStatus });
    onChange(subtasks.map(s => s._id === subtask._id ? { ...s, status: newStatus } : s));
  };

  const remove = async (id: string) => {
    await api.delete(`/subtasks/${id}`);
    onChange(subtasks.filter(s => s._id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-foreground">
          Subtasks {subtasks.length > 0 && <span className="text-muted-foreground">({completed}/{subtasks.length})</span>}
        </label>
      </div>

      {subtasks.length > 0 && (
        <div className="h-1.5 bg-muted rounded-full mb-3 overflow-hidden">
          <div className="h-full bg-success rounded-full transition-all duration-300"
               style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="space-y-0.5 mb-2">
        {subtasks.map(subtask => (
          <div key={subtask._id} className="flex items-center gap-2 group py-1.5 px-1 rounded-md hover:bg-muted">
            <button onClick={() => toggle(subtask)} className="shrink-0 text-muted-foreground hover:text-success">
              {subtask.status === 'done'
                ? <Check className="w-4 h-4 text-success" />
                : <Circle className="w-4 h-4" />}
            </button>
            <span className={`flex-1 text-sm ${subtask.status === 'done' ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
              {subtask.title}
            </span>
            <button onClick={() => remove(subtask._id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive rounded">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-2">
          <input autoFocus type="text" value={newTitle}
                 onChange={e => setNewTitle(e.target.value)}
                 onKeyDown={e => { if (e.key === 'Enter') addSubtask(); if (e.key === 'Escape') setAdding(false); }}
                 className="input-field flex-1 text-sm" placeholder="Subtask title..." />
          <button onClick={addSubtask} className="btn-primary text-xs py-1.5 px-3">Add</button>
          <button onClick={() => setAdding(false)} className="btn-secondary text-xs py-1.5 px-3">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground px-1">
          <Plus className="w-4 h-4" /> Add subtask
        </button>
      )}
    </div>
  );
}
