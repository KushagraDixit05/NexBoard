import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?:        LucideIcon | React.ReactNode;
  title:        string;
  description?: string;
  action?:      React.ReactNode;
}

export default function EmptyState({ icon: IconOrNode, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {IconOrNode && (
        <div className="mb-4 text-muted-foreground">
          {typeof IconOrNode === 'function' ? <IconOrNode className="w-12 h-12" /> : IconOrNode}
        </div>
      )}
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>
      )}
      {action}
    </div>
  );
}
