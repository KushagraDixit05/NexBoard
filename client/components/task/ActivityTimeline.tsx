'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { ActivityLog } from '@/types';
import Avatar from '../ui/Avatar';
import { format } from 'date-fns';

interface ActivityTimelineProps {
  taskId:    string;
  projectId: string;
}

export default function ActivityTimeline({ taskId, projectId }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get(`/projects/${projectId}/activity?taskId=${taskId}&limit=20`)
       .then(({ data }) => setActivities(data.activities ?? []))
       .finally(() => setLoading(false));
  }, [taskId, projectId]);

  if (loading) return <div className="animate-pulse space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 bg-muted rounded" />)}</div>;
  if (activities.length === 0) return <p className="text-sm text-muted-foreground py-4 text-center">No activity recorded yet.</p>;

  return (
    <div className="relative space-y-4">
      <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
      {activities.map(log => (
        <div key={log._id} className="flex gap-3 relative">
          <div className="shrink-0 z-10">
            <Avatar name={log.user?.displayName || log.user?.username || '?'} size="xs" />
          </div>
          <div className="flex-1 min-w-0 pb-1">
            <p className="text-sm text-foreground">
              <span className="font-medium">{log.user?.displayName || log.user?.username}</span>
              {' '}<span className="text-muted-foreground">{log.action.replace(/\./g,' ')}</span>
            </p>
            <p className="text-xs text-muted-foreground">{format(new Date(log.createdAt), 'MMM d, h:mm a')}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
