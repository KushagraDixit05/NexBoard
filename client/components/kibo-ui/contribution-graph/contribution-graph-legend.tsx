'use client';

import React from 'react';

export function ContributionGraphLegend() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Less</span>
      <div className="flex gap-1">
        <div className="w-[10px] h-[10px] rounded-sm bg-muted" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-200 dark:bg-emerald-900/40" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-400 dark:bg-emerald-700/60" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-600 dark:bg-emerald-600/80" />
        <div className="w-[10px] h-[10px] rounded-sm bg-emerald-800 dark:bg-emerald-500" />
      </div>
      <span>More</span>
    </div>
  );
}
