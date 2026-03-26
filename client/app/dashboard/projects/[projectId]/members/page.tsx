'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import type { Project, User } from '@/types';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import AddMemberDialog from '@/components/project/AddMemberDialog';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { UserPlus, Trash2 } from 'lucide-react';

export default function ProjectMembersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject]       = useState<Project | null>(null);
  const [showAdd, setShowAdd]       = useState(false);
  const [removing, setRemoving]     = useState<string | null>(null);

  const fetchProject = () =>
    api.get(`/projects/${projectId}`).then(({ data }) => setProject(data));

  useEffect(() => { fetchProject(); }, [projectId]);

  const handleRemoveMember = async (userId: string) => {
    await api.delete(`/projects/${projectId}/members/${userId}`);
    fetchProject();
    setRemoving(null);
  };

  if (!project) return <div className="animate-pulse h-40 bg-muted rounded-lg" />;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">{project.members.length} member{project.members.length !== 1 ? 's' : ''} in {project.name}</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <UserPlus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <div className="card divide-y divide-border">
        {project.members.map(m => (
          <div key={m.user._id} className="flex items-center gap-4 p-4">
            <Avatar name={m.user.displayName || m.user.username} size="md" src={m.user.avatar} />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">{m.user.displayName || m.user.username}</p>
              <p className="text-sm text-muted-foreground">{m.user.email}</p>
            </div>
            <Badge variant={m.role === 'manager' ? 'primary' : 'default'}>{m.role}</Badge>
            <button
              onClick={() => setRemoving(m.user._id)}
              className="p-2 text-muted-foreground hover:text-destructive rounded-md transition-colors"
              title="Remove member"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add Member">
        <AddMemberDialog
          projectId={projectId}
          onSuccess={() => { setShowAdd(false); fetchProject(); }}
          onCancel={() => setShowAdd(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => removing && handleRemoveMember(removing)}
        title="Remove Member"
        description="Are you sure you want to remove this member from the project?"
        confirmLabel="Remove"
      />
    </div>
  );
}
