export interface ContributionData {
  date: string; // ISO date string "YYYY-MM-DD"
  count: number;
  level: number; // 0-4
}

export interface ContributionGraphContextType {
  data: ContributionData[];
  weeks: ContributionData[][];
  totalCount: number;
  maxLevel: number;
}
