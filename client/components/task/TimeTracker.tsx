'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';

interface TimeTrackerProps {
  estimated: number;  // minutes
  spent:     number;  // minutes
  onLogTime: (minutes: number) => void;
}

const formatTime = (min: number) => {
  if (min === 0) return '—';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
};

export default function TimeTracker({ estimated, spent, onLogTime }: TimeTrackerProps) {
  const [logValue, setLogValue] = useState('');
  const progress = estimated > 0 ? Math.min((spent / estimated) * 100, 100) : 0;

  const handleLog = () => {
    const mins = parseInt(logValue, 10);
    if (!isNaN(mins) && mins > 0) {
      onLogTime(mins);
      setLogValue('');
    }
  };

  return (
    <div>
      <label className="label mb-2 flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5" /> Time Tracking
      </label>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Spent: <strong className="text-foreground">{formatTime(spent)}</strong></span>
          <span>Est: <strong className="text-foreground">{formatTime(estimated)}</strong></span>
        </div>

        {estimated > 0 && (
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${progress >= 100 ? 'bg-destructive' : 'bg-primary'}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="number" min="1" value={logValue}
            onChange={e => setLogValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLog()}
            className="input-field text-sm flex-1"
            placeholder="Log minutes..."
          />
          <button onClick={handleLog} disabled={!logValue} className="btn-secondary text-xs py-1.5 px-3">
            Log
          </button>
        </div>
      </div>
    </div>
  );
}
