'use client';

import React, { useState } from 'react';
import type { ContributionData } from './types';
import { format } from 'date-fns';

interface ContributionGraphBlockProps {
  activity: ContributionData;
  dayIndex: number;
  weekIndex: number;
}

export function ContributionGraphBlock({ activity, dayIndex }: ContributionGraphBlockProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  
  // Color based on level (0-4)
  const getColor = (level: number) => {
    if (level === 0) return 'bg-muted';
    if (level === 1) return 'bg-emerald-200 dark:bg-emerald-900/40';
    if (level === 2) return 'bg-emerald-400 dark:bg-emerald-700/60';
    if (level === 3) return 'bg-emerald-600 dark:bg-emerald-600/80';
    return 'bg-emerald-800 dark:bg-emerald-500';
  };
  
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  // Position tooltip below for top 3 rows, above for bottom rows
  const tooltipPosition = dayIndex <= 2 
    ? 'top-full mt-2' 
    : 'bottom-full mb-2';

  return (
    <div className="relative">
      <div
        className={`w-[10px] h-[10px] rounded-sm ${getColor(activity.level)} hover:ring-2 hover:ring-foreground/20 transition-all cursor-pointer`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        data-date={activity.date}
        data-count={activity.count}
      />
      
      {showTooltip && (
        <div className={`absolute ${tooltipPosition} left-1/2 transform -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border z-[100] whitespace-nowrap pointer-events-none`}>
          <div className="font-medium">{activity.count} {activity.count === 1 ? 'task' : 'tasks'}</div>
          <div className="text-muted-foreground">{formatDate(activity.date)}</div>
        </div>
      )}
    </div>
  );
}
