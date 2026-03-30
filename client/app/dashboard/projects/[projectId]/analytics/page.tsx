'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import StatsCard from '@/components/analytics/StatsCard';
import TrendChart from '@/components/analytics/TrendChart';
import WorkloadChart from '@/components/analytics/WorkloadChart';
import OverdueList from '@/components/analytics/OverdueList';
import Spinner from '@/components/ui/Spinner';
import { ArrowLeft, TrendingUp, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import type { Task } from '@/types';

interface AnalyticsStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  openTasks: number;
  overdueTaskCount: number;
  completionRate: number;
}

interface TrendData {
  date: string;
  completed: number;
  created: number;
}

interface WorkloadData {
  userId: string;
  displayName: string;
  username: string;
  avatar?: string;
  taskCount: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [trend, setTrend] = useState<TrendData[]>([]);
  const [workload, setWorkload] = useState<WorkloadData[]>([]);
  const [overdue, setOverdue] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const [statsRes, trendRes, workloadRes, overdueRes] = await Promise.all([
          api.get(`/analytics/${projectId}/stats`),
          api.get(`/analytics/${projectId}/trend?days=30`),
          api.get(`/analytics/${projectId}/workload`),
          api.get(`/analytics/${projectId}/overdue`),
        ]);

        // Transform stats response
        const rawStats = statsRes.data;
        const tasksByStatus = rawStats.tasksByStatus || {};
        const totalTasks = rawStats.totalTasks || 0;
        const completedTasks = tasksByStatus.completed || 0;
        const inProgressTasks = tasksByStatus.in_progress || 0;
        const openTasks = tasksByStatus.open || 0;
        
        const transformedStats = {
          totalTasks,
          completedTasks,
          inProgressTasks,
          openTasks,
          overdueTaskCount: overdueRes.data.length,
          completionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
        };

        // Transform trend response - create array with completed data
        const trendData = trendRes.data.map((item: any) => ({
          date: item.date,
          completed: item.count,
          created: 0, // Backend doesn't track created separately
        }));

        setStats(transformedStats);
        setTrend(trendData);
        setWorkload(workloadRes.data);
        setOverdue(overdueRes.data);
      } catch (err: any) {
        console.error('Failed to fetch analytics:', err);
        setError(err.response?.data?.message || 'Failed to load analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

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
          <h1 className="text-2xl font-bold">Analytics</h1>
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
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/projects/${projectId}`}
          className="btn-ghost p-1.5 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Project Analytics</h1>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Tasks"
            value={stats.totalTasks}
            icon={TrendingUp}
            color="text-blue-500"
          />
          <StatsCard
            title="Completed"
            value={stats.completedTasks}
            subtitle={`${Math.round(stats.completionRate)}% completion rate`}
            icon={CheckCircle}
            color="text-green-500"
          />
          <StatsCard
            title="In Progress"
            value={stats.inProgressTasks}
            icon={Clock}
            color="text-yellow-500"
          />
          <StatsCard
            title="Overdue"
            value={stats.overdueTaskCount}
            icon={AlertTriangle}
            color="text-red-500"
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrendChart data={trend} />
        <WorkloadChart data={workload} />
      </div>

      {/* Overdue Tasks */}
      <OverdueList tasks={overdue} />
    </div>
  );
}
