'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import ProjectCard from '@/components/project/ProjectCard';
import { Plus, FolderKanban, CheckCircle2, Clock } from 'lucide-react';
import type { Project } from '@/types';

interface DashboardStats {
  openTasks: number;
  completedThisWeek: number;
}

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading]   = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    api.get('/projects').then(({ data }) => {
      setProjects(data);
    }).finally(() => setLoading(false));

    api.get('/dashboard/stats').then(({ data }) => {
      setStats(data);
    }).catch(() => {
      // If stats fail, just keep showing loading state or zeros
      setStats({ openTasks: 0, completedThisWeek: 0 });
    }).finally(() => setStatsLoading(false));
  }, []);

  const activeProjects = projects.filter(p => !p.isArchived);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your overview of all active projects</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-lg shrink-0">
            <FolderKanban className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{activeProjects.length}</p>
            <p className="text-sm text-muted-foreground">Active Projects</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-warning/10 rounded-lg shrink-0">
            <Clock className="w-6 h-6 text-warning" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {statsLoading ? '—' : stats?.openTasks ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">Open Tasks</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="p-3 bg-success/10 rounded-lg shrink-0">
            <CheckCircle2 className="w-6 h-6 text-success" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">
              {statsLoading ? '—' : stats?.completedThisWeek ?? 0}
            </p>
            <p className="text-sm text-muted-foreground">Completed This Week</p>
          </div>
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your Projects</h2>
          <Link href="/dashboard/projects/new" className="btn-primary">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card p-5 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-3" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="card p-12 text-center">
            <FolderKanban className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <h3 className="text-foreground font-semibold mb-1">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-6">Create your first project to get started</p>
            <Link href="/dashboard/projects/new" className="btn-primary">
              <Plus className="w-4 h-4" /> Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeProjects.map(project => (
              <ProjectCard key={project._id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
