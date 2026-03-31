'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProjectCard from '@/components/project/ProjectCard';
import ProjectForm from '@/components/project/ProjectForm';
import Modal from '@/components/ui/Modal';
import { Plus, FolderKanban } from 'lucide-react';
import type { Project } from '@/types';

export default function ProjectsListPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [view, setView] = useState<'active' | 'archived'>('active');

  useEffect(() => {
    const fetchProjects = () => {
      setLoading(true);
      const archiveParam = view === 'archived' ? '?archived=true' : '';
      api.get(`/projects${archiveParam}`).then(({ data }) => setProjects(data)).finally(() => setLoading(false));
    };
    fetchProjects();
  }, [view]);

  const refetchProjects = () => {
    const archiveParam = view === 'archived' ? '?archived=true' : '';
    api.get(`/projects${archiveParam}`).then(({ data }) => setProjects(data));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">{projects.length} {view} projects</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {/* Tab toggle for Active/Archived */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setView('active')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            view === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setView('archived')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            view === 'archived'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Archived
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <div key={i} className="card p-5 animate-pulse h-32" />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderKanban className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="font-semibold text-foreground mb-1">No projects</h3>
          <p className="text-sm text-muted-foreground mb-6">Get started by creating your first project.</p>
          <button onClick={() => setShowCreate(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Create Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => <ProjectCard key={p._id} project={p} />)}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Project">
        <ProjectForm
          onSuccess={() => { setShowCreate(false); refetchProjects(); }}
          onCancel={() => setShowCreate(false)}
        />
      </Modal>
    </div>
  );
}
