'use client';

import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface VoteButtonProps {
  initialCount: number;
  label?: string;
  size?: 'sm' | 'md';
  itemId?: string;
  onVoteToggle?: (newHasVoted: boolean) => void;
}

export const VoteButton: React.FC<VoteButtonProps> = ({
  initialCount,
  label = 'Soutenir',
  size = 'md',
  itemId,
  onVoteToggle,
}) => {
  const [count, setCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (itemId && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(`parlons_vote_${itemId}`);
        if (stored === 'true') {
          setHasVoted(true);
          setCount((prev) => (prev === initialCount ? initialCount + 1 : prev));
        }
      } catch {
        // Ignore
      }
    }
  }, [itemId, initialCount]);

  const handleToggleVote = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !hasVoted;
    setHasVoted(nextState);

    if (nextState) {
      setCount((prev) => prev + 1);
    } else {
      setCount((prev) => Math.max(0, prev - 1));
    }

    if (itemId && typeof window !== 'undefined') {
      try {
        if (nextState) {
          localStorage.setItem(`parlons_vote_${itemId}`, 'true');
        } else {
          localStorage.removeItem(`parlons_vote_${itemId}`);
        }
      } catch {
        // Ignore
      }
    }

    if (onVoteToggle) {
      onVoteToggle(nextState);
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggleVote}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full transition-all duration-200 cursor-pointer min-h-[38px] px-3 font-medium select-none',
        hasVoted
          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold scale-[1.02]'
          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-transparent',
        size === 'sm' ? 'text-xs py-1 px-2.5 min-h-[32px]' : 'text-xs sm:text-sm py-1.5'
      )}
      title={hasVoted ? 'Retirer mon soutien' : 'Apporter mon soutien'}
    >
      <Heart
        className={cn(
          'w-4 h-4 transition-transform duration-200',
          hasVoted ? 'fill-rose-500 text-rose-500 scale-110' : 'text-slate-400'
        )}
      />
      <span>{count}</span>
      {label && <span className="hidden sm:inline opacity-80">{label}</span>}
    </button>
  );
};
