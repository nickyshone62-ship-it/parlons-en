'use client';

import React from 'react';
import { PostStatus } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { HelpCircle, MessageCircle, CheckCircle2, TestTube } from 'lucide-react';

export interface StatusBadgeProps {
  status: PostStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    open: {
      label: 'En recherche d\'écoute',
      variant: 'amber' as const,
      icon: <HelpCircle className="w-3 h-3 text-amber-500" />,
    },
    in_progress: {
      label: 'Pistes en cours',
      variant: 'teal' as const,
      icon: <MessageCircle className="w-3 h-3 text-teal-500" />,
    },
    testing: {
      label: 'Piste en cours d\'essai',
      variant: 'emerald' as const,
      icon: <TestTube className="w-3 h-3 text-emerald-500 animate-pulse" />,
    },
    resolved: {
      label: '✅ Solution Trouvée !',
      variant: 'emerald' as const,
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 stroke-[2.5]" />,
    },
  };

  const current = config[status] || config.open;

  return (
    <Badge variant={current.variant} icon={current.icon} size="sm">
      {current.label}
    </Badge>
  );
};
