'use client';

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white ml-3"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-4 pointer-events-none text-blue-600 dark:text-blue-400 shrink-0">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={cn(
              'w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-full px-5 py-2.5 text-base sm:text-sm font-black text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-400 shadow-sm transition duration-200',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 dark:focus:border-blue-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              leftIcon && 'pl-11',
              rightIcon && 'pr-11',
              error && 'border-rose-500 focus:ring-rose-500/50 focus:border-rose-500',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-4 text-blue-600 dark:text-blue-400 shrink-0">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-500 ml-3 font-bold">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-600 dark:text-slate-300 ml-3 font-bold">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
