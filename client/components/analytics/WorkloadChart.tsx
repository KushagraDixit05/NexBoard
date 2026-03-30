'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WorkloadData {
  userId: string;
  displayName: string;
  username: string;
  avatar?: string;
  taskCount: number;
}

interface WorkloadChartProps {
  data: WorkloadData[];
}

export default function WorkloadChart({ data }: WorkloadChartProps) {
  // Show message if no data
  if (!data || data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-5">
        <h3 className="text-lg font-semibold text-card-foreground mb-4">Team Workload</h3>
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          <p>No active tasks assigned yet.</p>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.displayName || item.username || 'Unassigned',
    tasks: item.taskCount,
  }));

  return (
    <div className="bg-card border border-border rounded-lg p-5">
      <h3 className="text-lg font-semibold text-card-foreground mb-4">Team Workload (Active Tasks)</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="name" 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'currentColor' }}
          />
          <YAxis 
            className="text-xs text-muted-foreground"
            tick={{ fill: 'currentColor' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '6px'
            }}
          />
          <Legend />
          <Bar dataKey="tasks" fill="#8b5cf6" name="Active Tasks" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
