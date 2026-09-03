'use client';

import React from 'react';
import { MessageSquareOff } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Aucune discussion pour le moment',
  description = 'Soyez la première personne à partager votre préoccupation ou posez une question à la communauté.',
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
        {icon || <MessageSquareOff className="w-8 h-8" />}
      </div>
      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>
      {actionLabel && onAction && (
        <div className="pt-2">
          <Button onClick={onAction} variant="primary" size="sm">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};
