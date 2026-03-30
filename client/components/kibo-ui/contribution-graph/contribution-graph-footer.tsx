'use client';

import React from 'react';

interface ContributionGraphFooterProps {
  children: React.ReactNode;
}

export function ContributionGraphFooter({ children }: ContributionGraphFooterProps) {
  return (
    <div className="contribution-graph-footer flex items-center justify-between mt-4 text-sm">
      {children}
    </div>
  );
}
