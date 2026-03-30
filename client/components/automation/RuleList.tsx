'use client';

import RuleCard, { AutomationRule } from './RuleCard';
import EmptyState from '../ui/EmptyState';
import { Zap } from 'lucide-react';

interface RuleListProps {
  rules: AutomationRule[];
  onToggle: (ruleId: string) => Promise<void>;
  onEdit?: (rule: AutomationRule) => void;
  onDelete: (ruleId: string) => Promise<void>;
}

export default function RuleList({ rules, onToggle, onEdit, onDelete }: RuleListProps) {
  if (rules.length === 0) {
    return (
      <EmptyState
        icon={Zap}
        title="No automation rules"
        description="Create your first automation rule to streamline your workflow"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {rules.map((rule) => (
        <RuleCard
          key={rule._id}
          rule={rule}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
