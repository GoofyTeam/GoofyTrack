// components/talks/StatusBadge.tsx
import { ReactNode } from 'react';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, X } from 'lucide-react';
import { TalkStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: TalkStatus;
}

interface StatusConfig {
  variant: 'outline';
  className: string;
  icon: ReactNode;
  label: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<TalkStatus, StatusConfig> = {
    pending: {
      variant: 'outline',
      className: 'bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-100',
      icon: <Clock className="mr-1 h-3 w-3" />,
      label: 'En attente',
    },
    accepted: {
      variant: 'outline',
      className: 'bg-blue-100 dark:bg-blue-900 dark:text-blue-100',
      icon: <Check className="mr-1 h-3 w-3" />,
      label: 'Accepté',
    },
    rejected: {
      variant: 'outline',
      className: 'bg-red-100 dark:bg-red-900 dark:text-red-100',
      icon: <X className="mr-1 h-3 w-3" />,
      label: 'Refusé',
    },
    scheduled: {
      variant: 'outline',
      className: 'bg-green-100 dark:bg-green-900 dark:text-green-100',
      icon: <Check className="mr-1 h-3 w-3" />,
      label: 'Programmé',
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge className={config.className} variant={config.variant}>
      {config.icon} {config.label}
    </Badge>
  );
}
