'use client';

import React from 'react';
import { useContributionGraph } from './contribution-graph';
import type { ContributionData } from './types';

interface ContributionGraphCalendarProps {
  children: (props: {
    activity: ContributionData;
    dayIndex: number;
    weekIndex: number;
  }) => React.ReactNode;
}

export function ContributionGraphCalendar({ children }: ContributionGraphCalendarProps) {
  const { weeks } = useContributionGraph();

  // Month labels
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return (
    <div className="contribution-graph-calendar">
      {/* Month labels */}
      <div className="flex gap-[3px] mb-2 ml-8">
        {monthLabels.map((month, i) => (
          <div
            key={month}
            className="text-xs text-muted-foreground"
            style={{ width: `${100 / 12}%` }}
          >
            {month}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex gap-[3px]">
        {/* Day labels */}
        <div className="flex flex-col gap-[3px] text-xs text-muted-foreground pr-2">
          <div className="h-[10px]">Mon</div>
          <div className="h-[10px]"></div>
          <div className="h-[10px]">Wed</div>
          <div className="h-[10px]"></div>
          <div className="h-[10px]">Fri</div>
          <div className="h-[10px]"></div>
          <div className="h-[10px]">Sun</div>
        </div>
        
        {/* Weeks */}
        <div className="flex gap-[3px] flex-1 overflow-x-auto">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-[3px]">
              {week.map((activity, dayIndex) => (
                <div key={activity.date}>
                  {children({ activity, dayIndex, weekIndex })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
