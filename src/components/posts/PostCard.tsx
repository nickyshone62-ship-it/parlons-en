'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Post } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from './StatusBadge';
import { getPostViews } from '@/lib/viewsManager';
import { MessageSquare, Eye, ShieldCheck } from 'lucide-react';

export interface PostCardProps {
  post: Post;
  onClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  const [viewsCount, setViewsCount] = useState(post.views_count || 1);

  useEffect(() => {
    if (post.id) {
      setViewsCount(getPostViews(post.id, post.views_count || 1));
    }
  }, [post.id, post.views_count]);

  const avatarUrl = post.author_avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author_pseudonym)}`;

  const isResolved = post.status === 'resolved';

  const contentNode = (
    <Card
      hoverable
      className={`group cursor-pointer flex flex-col justify-between h-full space-y-4 rounded-3xl transition duration-200 overflow-hidden ${
        isResolved
          ? 'bg-gradient-to-b from-emerald-500/10 via-white to-slate-50 dark:from-emerald-950/30 dark:to-slate-900 border-2 border-emerald-500/80 shadow-xl shadow-emerald-500/10'
          : 'border border-blue-100/80 dark:border-slate-800 shadow-md hover:shadow-xl'
      }`}
      onClick={onClick}
    >
      <div className="space-y-3">
        {/* Banner if resolved */}
        {isResolved && (
          <div className="-mx-6 -mt-6 mb-3 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs flex items-center justify-between shadow-xs">
            <span className="flex items-center gap-1.5">
              <span>💡</span>
              <span>SOLUTION CONFIRMÉE PAR L'AUTEUR</span>
            </span>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">Résolu ✅</span>
          </div>
        )}

        {/* Top bar: Category + Status + Demo Tag */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={isResolved ? 'emerald' : 'blue'} size="sm">
              {post.category_name}
            </Badge>
            <StatusBadge status={post.status} />
          </div>
          {post.is_demo && (
            <Badge variant="demo" size="sm">
              DÉMO
            </Badge>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition duration-150 line-clamp-2">
          {post.title}
        </h3>

        {/* Content Excerpt */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-medium">
          {post.content}
        </p>
      </div>

      {/* Card Footer: Metadata + Avatar + Views + Answers */}
      <div className="pt-3 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xs overflow-hidden shrink-0">
            <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-full" />
          </div>
          <span className="inline-flex items-center gap-1 font-extrabold text-slate-800 dark:text-slate-200">
            {post.author_pseudonym}
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </span>
          <span className="opacity-60">•</span>
          <span className="font-medium">{post.created_at}</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition" title={`${post.answers_count} réponse(s)`}>
            <MessageSquare className="w-4 h-4 text-blue-600" />
            <span className="font-black text-slate-800 dark:text-slate-200">
              {post.answers_count}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 opacity-80" title={`${viewsCount} vue(s)`}>
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-700 dark:text-slate-300">{viewsCount}</span>
          </span>
        </div>
      </div>
    </Card>
  );

  if (onClick) {
    return contentNode;
  }

  return <Link href={`/problemes/${post.id}`}>{contentNode}</Link>;
};
