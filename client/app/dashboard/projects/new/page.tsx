'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProjectForm from '@/components/project/ProjectForm';
import { ArrowLeft } from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();
  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard/projects" className="btn-ghost p-2">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Project</h1>
          <p className="text-sm text-gray-500">Set up a new project workspace</p>
        </div>
      </div>
      <div className="card p-6">
        <ProjectForm
          onSuccess={(project) => router.push(`/dashboard/projects/${project._id}`)}
          onCancel={() => router.push('/dashboard/projects')}
        />
      </div>
    </div>
  );
}
