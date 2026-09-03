'use client';

import React from 'react';
import { Answer } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { VoteButton } from './VoteButton';
import { CheckCircle, ShieldCheck } from 'lucide-react';

export interface AnswerCardProps {
  answer: Answer;
}

export const AnswerCard: React.FC<AnswerCardProps> = ({ answer }) => {
  return (
    <Card className="space-y-3 bg-slate-50/80 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            {answer.author_pseudonym}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 dark:text-slate-400">{answer.created_at}</span>
        </div>

        <div className="flex items-center gap-2">
          {answer.is_accepted && (
            <Badge variant="emerald" size="sm" icon={<CheckCircle className="w-3 h-3" />}>
              Piste retenue
            </Badge>
          )}
          {answer.is_demo && (
            <Badge variant="demo" size="sm">
              DÉMO
            </Badge>
          )}
        </div>
      </div>

      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
        {answer.content}
      </p>

      <div className="pt-2 flex items-center justify-end">
        <VoteButton initialCount={answer.upvotes_count} label="Utile" size="sm" />
      </div>
    </Card>
  );
};
