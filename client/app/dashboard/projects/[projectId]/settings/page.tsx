'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import type { Project } from '@/types';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { Archive, Trash2 } from 'lucide-react';

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16'];

export default function ProjectSettingsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [form, setForm]       = useState({ name: '', description: '', color: '#3b82f6' });
  const [saving, setSaving]   = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    api.get(`/projects/${projectId}`).then(({ data }) => {
      setProject(data);
      setForm({ name: data.name, description: data.description ?? '', color: data.color });
    });
  }, [projectId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await api.put(`/projects/${projectId}`, form);
    setSaving(false);
  };

  const handleArchive = async () => {
    await api.patch(`/projects/${projectId}/archive`);
    router.push('/dashboard/projects');
  };

  const handleDelete = async () => {
    await api.delete(`/projects/${projectId}`);
    router.push('/dashboard/projects');
  };

  if (!project) return <div className="animate-pulse h-96 bg-gray-100 rounded-xl" />;

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Project Settings</h1>

      <div className="card p-6">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <input className="input-field" value={form.name}
                   onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea className="input-field min-h-[80px]" value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Optional project description" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button"
                        onClick={() => setForm(f => ({ ...f, color: c }))}
                        className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`}
                        style={{ background: c }} />
              ))}
            </div>
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="card p-6 border-danger-200">
        <h2 className="font-semibold text-gray-900 mb-4">Danger Zone</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Archive Project</p>
              <p className="text-xs text-gray-500">Hide from dashboard but keep data</p>
            </div>
            <button onClick={handleArchive} className="btn-secondary text-sm">
              <Archive className="w-4 h-4" /> Archive
            </button>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-sm font-medium text-danger-600">Delete Project</p>
              <p className="text-xs text-gray-500">Permanently delete all data</p>
            </div>
            <button onClick={() => setShowDelete(true)} className="btn-danger text-sm">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showDelete} onClose={() => setShowDelete(false)} onConfirm={handleDelete}
        title="Delete Project?" description="This will permanently delete all boards, tasks, and data. This cannot be undone."
        confirmLabel="Delete Project"
      />
    </div>
  );
}
