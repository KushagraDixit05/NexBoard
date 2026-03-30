'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { eachDayOfInterval, startOfYear, endOfYear, startOfWeek, endOfWeek, format } from 'date-fns';
import type { ContributionData, ContributionGraphContextType } from './types';

const ContributionGraphContext = createContext<ContributionGraphContextType | null>(null);

export function useContributionGraph() {
  const context = useContext(ContributionGraphContext);
  if (!context) {
    throw new Error('useContributionGraph must be used within ContributionGraph');
  }
  return context;
}

interface ContributionGraphProps {
  data: ContributionData[];
  children: React.ReactNode;
}

export function ContributionGraph({ data, children }: ContributionGraphProps) {
  const value = useMemo(() => {
    // Calculate total count
    const totalCount = data.reduce((sum, item) => sum + item.count, 0);
    
    // Find max level
    const maxLevel = Math.max(...data.map(item => item.level), 4);
    
    // Organize data into weeks (Sunday to Saturday)
    const now = new Date();
    const yearStart = startOfYear(now);
    const yearEnd = endOfYear(now);
    
    // Create a map for quick lookup
    const dataMap = new Map<string, ContributionData>();
    data.forEach(item => {
      dataMap.set(item.date, item);
    });
    
    // Use all days provided by the backend (full year)
    const allDays = data.length > 0 ? data : eachDayOfInterval({ start: yearStart, end: yearEnd });
    
    // Group into weeks (start from the first Sunday before or on Jan 1)
    const weeks: ContributionData[][] = [];
    let currentWeek: ContributionData[] = [];
    
    // Start from the Sunday of the first week
    const firstSunday = startOfWeek(yearStart, { weekStartsOn: 0 });
    
    // Get the last date from data or year end
    const lastDate = data.length > 0 ? new Date(data[data.length - 1].date) : yearEnd;
    const daysToShow = eachDayOfInterval({ start: firstSunday, end: lastDate });
    
    daysToShow.forEach((day, index) => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const dayData = dataMap.get(dateStr) || { date: dateStr, count: 0, level: 0 };
      
      currentWeek.push(dayData);
      
      // Sunday is 0, Saturday is 6
      if (day.getDay() === 6 || index === daysToShow.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }
    });
    
    return { data, weeks, totalCount, maxLevel };
  }, [data]);

  return (
    <ContributionGraphContext.Provider value={value}>
      <div className="contribution-graph">
        {children}
      </div>
    </ContributionGraphContext.Provider>
  );
}
