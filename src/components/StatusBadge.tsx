import { ServerStatus } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ServerStatus;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusClasses = (status: ServerStatus) => {
    switch (status) {
      case 'Production':
        return 'bg-success text-success-foreground';
      case 'Test':
        return 'bg-info text-info-foreground';
      case 'Down':
        return 'bg-error text-error-foreground';
      case 'Timed out':
        return 'bg-warning text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      getStatusClasses(status),
      className
    )}>
      {status}
    </span>
  );
};