'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import type { Project, Board, ActivityLog } from '@/types';
import { LayoutGrid, Plus, Users, Settings, Activity } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { format } from 'date-fns';

export default function ProjectDetailsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject]   = useState<Project | null>(null);
  const [boards, setBoards]     = useState<Board[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/boards/project/${projectId}`),
      api.get(`/projects/${projectId}/activity?limit=10`),
    ]).then(([pRes, bRes, aRes]) => {
      setProject(pRes.data);
      setBoards(bRes.data);
      setActivity(aRes.data.activities ?? []);
    }).finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 bg-muted rounded w-48" /><div className="h-32 bg-muted rounded" /></div>;
  }
  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg shrink-0" style={{ background: project.color }} />
          <div>
            <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
            {project.description && <p className="text-sm text-muted-foreground mt-0.5">{project.description}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${projectId}/members`} className="btn-secondary">
            <Users className="w-4 h-4" /> Members
          </Link>
          <Link href={`/dashboard/projects/${projectId}/settings`} className="btn-ghost">
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Boards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-foreground">Boards</h2>
          <button
            onClick={() => api.post('/boards', { name: 'Main Board', project: projectId }).then(() =>
              api.get(`/boards/project/${projectId}`).then(r => setBoards(r.data))
            )}
            className="btn-ghost text-sm"
          >
            <Plus className="w-4 h-4" /> Add Board
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boards.map(board => (
            <Link key={board._id}
                  href={`/dashboard/projects/${projectId}/board/${board._id}`}
                  className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
              <div className="p-2 bg-primary/10 rounded-md">
                <LayoutGrid className="w-5 h-5 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">{board.name}</p>
                <p className="text-xs text-muted-foreground">Click to open board</p>
              </div>
            </Link>
          ))}
          {boards.length === 0 && (
            <div className="card p-8 text-center col-span-full">
              <p className="text-muted-foreground text-sm">No boards yet. Click &quot;Add Board&quot; to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* Members + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <div className="card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-4 h-4" /> Members ({project.members.length})
          </h3>
          <div className="space-y-3">
            {project.members.slice(0, 5).map(m => (
              <div key={m.user._id} className="flex items-center gap-3">
                <Avatar name={m.user.displayName || m.user.username} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{m.user.displayName || m.user.username}</p>
                </div>
                <Badge variant={m.role === 'manager' ? 'primary' : 'default'}>{m.role}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" /> Recent Activity
          </h3>
          {activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {activity.slice(0, 8).map(log => (
                <div key={log._id} className="flex items-start gap-3 text-sm">
                  <Avatar name={log.user?.displayName || log.user?.username || '?'} size="xs" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-foreground">{log.user?.displayName}</span>
                    {' '}<span className="text-muted-foreground">{log.action.replace('.', ' ')}</span>
                    {log.task && <span className="text-foreground"> &ldquo;{log.task.title}&rdquo;</span>}
                    <p className="text-xs text-muted-foreground">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
