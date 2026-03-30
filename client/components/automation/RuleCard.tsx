'use client';

import { useState } from 'react';
import { Play, Pause, Edit2, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';

export interface AutomationRule {
  _id: string;
  name: string;
  description?: string;
  trigger: Record<string, any>;
  actions: Record<string, any>[];
  isActive: boolean;
  project: string;
  createdAt: string;
  updatedAt: string;
}

interface RuleCardProps {
  rule: AutomationRule;
  onToggle: (ruleId: string) => Promise<void>;
  onEdit?: (rule: AutomationRule) => void;
  onDelete: (ruleId: string) => Promise<void>;
}

export default function RuleCard({ rule, onToggle, onEdit, onDelete }: RuleCardProps) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(rule._id);
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete automation rule "${rule.name}"?`)) return;
    await onDelete(rule._id);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground">{rule.name}</h3>
            <Badge variant={rule.isActive ? 'default' : 'secondary'}>
              {rule.isActive ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          {rule.description && (
            <p className="text-sm text-muted-foreground">{rule.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleToggle}
            disabled={isToggling}
            className={`p-2 rounded-md transition-colors ${
              rule.isActive
                ? 'text-green-500 hover:bg-green-500/10'
                : 'text-muted-foreground hover:bg-accent'
            }`}
            title={rule.isActive ? 'Pause' : 'Activate'}
          >
            {rule.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(rule)}
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-2 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm">
          <span className="text-muted-foreground">Trigger: </span>
          <span className="text-foreground font-medium">
            {rule.trigger.event || 'Unknown'}
          </span>
        </div>
        <div className="text-sm">
          <span className="text-muted-foreground">Actions: </span>
          <span className="text-foreground">
            {rule.actions.length} action(s)
          </span>
        </div>
      </div>
    </div>
  );
}
