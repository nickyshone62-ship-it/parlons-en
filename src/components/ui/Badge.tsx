'use client';

import React, { HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'blue'
    | 'emerald'
    | 'indigo'
    | 'amber'
    | 'teal'
    | 'purple'
    | 'demo'
    | 'slate'
    | 'rose';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  icon,
  children,
  ...props
}) => {
  const variants = {
    default:
      'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    blue:
      'bg-blue-600/10 text-blue-700 dark:text-blue-300 border-blue-500/20 font-bold',
    emerald:
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
    indigo:
      'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20',
    amber:
      'bg-amber-500/10 text-amber-800 dark:text-amber-400 border-amber-500/20',
    teal:
      'bg-teal-500/10 text-teal-700 dark:text-teal-400 border-teal-500/20',
    purple:
      'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20',
    slate:
      'bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20',
    rose:
      'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
    demo:
      'bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/40 font-bold uppercase tracking-wider',
  };

  const sizes = {
    sm: 'px-2.5 py-0.5 text-[11px] rounded-full gap-1',
    md: 'px-3 py-1 text-xs rounded-full gap-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-bold rounded-full border shrink-0 select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
