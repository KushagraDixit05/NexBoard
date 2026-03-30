'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import RuleList from '@/components/automation/RuleList';
import CreateRuleModal from '@/components/automation/CreateRuleModal';
import { AutomationRule } from '@/components/automation/RuleCard';
import Spinner from '@/components/ui/Spinner';
import Button from '@/components/ui/Button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AutomationPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [rules, setRules] = useState<AutomationRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/automation/project/${projectId}`);
      setRules(data);
    } catch (err: any) {
      console.error('Failed to fetch automation rules:', err);
      setError(err.response?.data?.message || 'Failed to load automation rules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [projectId]);

  const handleToggle = async (ruleId: string) => {
    try {
      await api.patch(`/automation/${ruleId}/toggle`);
      await fetchRules();
    } catch (error) {
      console.error('Failed to toggle rule:', error);
    }
  };

  const handleCreate = async (data: {
    name: string;
    description?: string;
    trigger: Record<string, any>;
    actions: Record<string, any>[];
  }) => {
    await api.post('/automation', { ...data, project: projectId });
    await fetchRules();
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await api.delete(`/automation/${ruleId}`);
      await fetchRules();
    } catch (error) {
      console.error('Failed to delete rule:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="btn-ghost p-1.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-2xl font-bold">Automation</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/projects/${projectId}`}
            className="btn-ghost p-1.5 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Automation Rules</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Automate repetitive tasks and streamline your workflow
            </p>
          </div>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)} icon={<Plus className="w-4 h-4 mr-1" />}>
          Create Rule
        </Button>
      </div>

      {/* Rules List */}
      <RuleList
        rules={rules}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />

      {/* Create Rule Modal */}
      <CreateRuleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreate}
        projectId={projectId}
      />
    </div>
  );
}
