'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

export interface LoadingStateProps {
  type?: 'card' | 'list' | 'spinner';
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'card',
  count = 3,
}) => {
  if (type === 'spinner') {
    return (
      <div className="flex items-center justify-center p-8 text-emerald-600 dark:text-emerald-400">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="p-6 bg-slate-100 dark:bg-slate-900/60 rounded-2xl animate-pulse space-y-4 border border-slate-200/50 dark:border-slate-800"
        >
          <div className="flex items-center justify-between">
            <div className="w-24 h-5 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
          <div className="w-3/4 h-6 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="space-y-2">
            <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-4/5 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="w-16 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};
