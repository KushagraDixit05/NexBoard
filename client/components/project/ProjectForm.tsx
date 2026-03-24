'use client';

import { useState } from 'react';
import api from '@/lib/api';
import type { Project } from '@/types';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'];

interface ProjectFormProps {
  initialData?: Partial<Project>;
  onSuccess:    (project: Project) => void;
  onCancel:     () => void;
}

export default function ProjectForm({ initialData, onSuccess, onCancel }: ProjectFormProps) {
  const [form, setForm] = useState({
    name:        initialData?.name        ?? '',
    description: initialData?.description ?? '',
    color:       initialData?.color       ?? '#3b82f6',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = initialData?._id
        ? await api.put(`/projects/${initialData._id}`, form)
        : await api.post('/projects', form);
      onSuccess(data);
    } catch (err: unknown) {
      setError((err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-danger-50 border border-danger-200 text-danger-600 text-sm rounded-lg">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
        <input className="input-field" required value={form.name}
               onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
               placeholder="My Awesome Project" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea className="input-field min-h-[80px]" value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="What is this project about?" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex gap-2 flex-wrap">
          {COLORS.map(c => (
            <button key={c} type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full border-2 transition-all
                      ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent hover:scale-105'}`}
                    style={{ background: c }} />
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Saving...' : initialData?._id ? 'Save Changes' : 'Create Project'}
        </button>
      </div>
    </form>
  );
}
