'use client';

import React, { HTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-3xl p-6 bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-800 shadow-xl shadow-blue-500/10 text-slate-900 dark:text-slate-100 transition-all duration-300',
        hoverable &&
          'hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/50 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
