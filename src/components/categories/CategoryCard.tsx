'use client';

import React from 'react';
import Link from 'next/link';
import { Category } from '@/types';
import { Card } from '@/components/ui/Card';
import {
  HeartHandshake,
  Briefcase,
  Brain,
  Coins,
  UserX,
  Compass,
  FolderHeart,
  Sparkles,
  HelpCircle,
  Stethoscope,
  Smile,
  LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  HeartHandshake,
  Briefcase,
  Brain,
  Coins,
  UserX,
  Compass,
  FolderHeart,
  Sparkles,
  Stethoscope,
  Smile,
};

export interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
}) => {
  const IconComponent =
    (category.icon && ICON_MAP[category.icon]) || HelpCircle;

  const cardContent = (
    <Card
      hoverable
      onClick={onClick}
      className="group cursor-pointer p-5 flex items-start gap-4 transition-all duration-200"
    >
      <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition duration-200">
        <IconComponent className="w-6 h-6" />
      </div>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition truncate">
            {category.name}
          </h4>
          {typeof category.posts_count === 'number' && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono font-medium shrink-0">
              {category.posts_count} sujet{category.posts_count > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {category.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {category.description}
          </p>
        )}
      </div>
    </Card>
  );

  if (onClick) return cardContent;

  return (
    <Link href={`/categories/${category.slug || category.id}`}>
      {cardContent}
    </Link>
  );
};
