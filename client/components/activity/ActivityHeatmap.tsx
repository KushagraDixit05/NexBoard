'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from '@/components/kibo-ui/contribution-graph';
import type { ContributionData } from '@/components/kibo-ui/contribution-graph/types';

interface HeatmapResponse {
  data: ContributionData[];
  totalCount: number;
  currentStreak: number;
}

export function ActivityHeatmap() {
  const [data, setData] = useState<ContributionData[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHeatmapData();
  }, []);

  const fetchHeatmapData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get<HeatmapResponse>('/users/activity/heatmap');
      
      setData(response.data.data);
      setTotalCount(response.data.totalCount);
      setCurrentStreak(response.data.currentStreak);
    } catch (err: unknown) {
      console.error('Failed to fetch activity heatmap:', err);
      setError('Failed to load activity data');
      // Set empty data on error
      setData([]);
      setTotalCount(0);
      setCurrentStreak(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/30">
        {error}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="p-6 text-center text-muted-foreground border rounded-lg bg-muted/20">
        <p className="text-sm">No activity data available yet.</p>
        <p className="text-xs mt-1">Complete tasks to see your contribution graph!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <ContributionGraph data={data}>
        <ContributionGraphCalendar>
          {({ activity, dayIndex, weekIndex }) => (
            <ContributionGraphBlock
              activity={activity}
              dayIndex={dayIndex}
              weekIndex={weekIndex}
            />
          )}
        </ContributionGraphCalendar>
        
        <ContributionGraphFooter>
          <ContributionGraphTotalCount />
          <ContributionGraphLegend />
        </ContributionGraphFooter>
      </ContributionGraph>
      
      {currentStreak > 0 && (
        <div className="text-sm text-muted-foreground">
          🔥 Current streak: <span className="font-semibold text-foreground">{currentStreak}</span> {currentStreak === 1 ? 'day' : 'days'}
        </div>
      )}
    </div>
  );
}
