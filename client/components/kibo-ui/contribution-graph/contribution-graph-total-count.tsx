'use client';

import React from 'react';
import { useContributionGraph } from './contribution-graph';

export function ContributionGraphTotalCount() {
  const { totalCount } = useContributionGraph();
  
  return (
    <div className="text-muted-foreground">
      <span className="font-semibold text-foreground">{totalCount}</span> {totalCount === 1 ? 'task' : 'tasks'} completed this year
    </div>
  );
}
