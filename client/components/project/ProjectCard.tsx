import Link from 'next/link';
import type { Project } from '@/types';
import { LayoutGrid, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/dashboard/projects/${project._id}`}
      className="card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center"
             style={{ background: project.color + '20' }}>
          <div className="w-4 h-4 rounded-full" style={{ background: project.color }} />
        </div>
        <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
          {project.name}
        </h3>
      </div>

      {project.description && (
        <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
      )}

      <div className="flex items-center gap-4 mt-auto text-xs text-gray-400 pt-2 border-t border-gray-50">
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" /> {project.members.length}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          Updated {formatDistanceToNow(new Date(project.updatedAt), { addSuffix: true })}
        </span>
      </div>
    </Link>
  );
}
