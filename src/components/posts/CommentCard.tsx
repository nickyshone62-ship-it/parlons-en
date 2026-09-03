'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { toggleCommentVote } from '@/lib/supabase/posts';
import { getPostViews, incrementPostViews, getCommentLikes, updateCommentLikesCount } from '@/lib/viewsManager';
import { ShieldCheck, ThumbsUp, Eye, Flag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface CommentCardProps {
  id: string;
  content: string;
  authorPseudonym: string;
  createdAt: string;
  upvotesCount: number;
  viewsCount?: number;
  hasVoted?: boolean;
  isAuthenticated?: boolean;
  onRequireAuth?: () => void;
  onReport?: (commentId: string) => void;
}

export const CommentCard: React.FC<CommentCardProps> = ({
  id,
  content,
  authorPseudonym,
  createdAt,
  upvotesCount: initialCount,
  viewsCount: initialViewsCount = 1,
  hasVoted: initialHasVoted = false,
  isAuthenticated = false,
  onRequireAuth,
  onReport,
}) => {
  const router = useRouter();

  // Likes state
  const [votesCount, setVotesCount] = useState(initialCount);
  const [hasVoted, setHasVoted] = useState(initialHasVoted);

  // Views state
  const [answerViews, setAnswerViews] = useState(initialViewsCount);

  useEffect(() => {
    if (id && typeof window !== 'undefined') {
      setAnswerViews(incrementPostViews(`comment_${id}`, initialViewsCount));
      const accumulatedLikes = getCommentLikes(id, initialCount);
      setVotesCount(accumulatedLikes);

      try {
        const storedLike = localStorage.getItem(`parlons_like_user_${id}`);
        if (storedLike === 'true') {
          setHasVoted(true);
        }
      } catch {
        // Ignore
      }
    }
  }, [id, initialCount, initialViewsCount]);

  const handleVoteLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Visitor requirement check
    if (!isAuthenticated) {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        router.push('/connexion');
      }
      return;
    }

    const nextState = !hasVoted;
    setHasVoted(nextState);

    const delta = nextState ? 1 : -1;
    const newCount = updateCommentLikesCount(id, delta, initialCount);
    setVotesCount(newCount);

    if (typeof window !== 'undefined') {
      try {
        if (nextState) {
          localStorage.setItem(`parlons_like_user_${id}`, 'true');
        } else {
          localStorage.removeItem(`parlons_like_user_${id}`);
        }
      } catch {
        // Ignore
      }
    }

    // Persist to Supabase background
    toggleCommentVote(id).catch(() => {});
  };

  const avatarSeed = authorPseudonym || 'Utilisateur';

  return (
    <Card className="p-5 space-y-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition duration-200">
      {/* Header: Avatar + Anonymous Pseudonym + Date + Report */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xs overflow-hidden shrink-0">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(avatarSeed)}`}
              alt="Avatar Anonyme"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-xs sm:text-sm text-slate-900 dark:text-slate-100">
              <span>{authorPseudonym}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {createdAt}
            </span>
          </div>
        </div>

        {onReport && (
          <button
            type="button"
            onClick={() => onReport(id)}
            className="p-1 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer"
            title="Signaler cette réponse"
          >
            <Flag className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Content Text */}
      <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium whitespace-pre-line">
        {content}
      </p>

      {/* Footer: Likes + Views */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 text-xs">
        {/* Like Button */}
        <button
          type="button"
          onClick={handleVoteLike}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold transition duration-200 cursor-pointer border select-none ${
            hasVoted
              ? 'bg-blue-600 text-white border-blue-600 shadow-sm scale-[1.02]'
              : 'bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
          }`}
          title={isAuthenticated ? (hasVoted ? 'Retirer mon like' : 'J’aime cette réponse') : 'Connectez-vous pour liker'}
        >
          <ThumbsUp className={`w-3.5 h-3.5 ${hasVoted ? 'fill-white text-white' : 'text-slate-500'}`} />
          <span>{votesCount} {votesCount > 1 ? 'likes' : 'like'}</span>
        </button>

        {/* Views Count */}
        <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-bold" title={`${answerViews} vue(s)`}>
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <span>{answerViews} {answerViews > 1 ? 'vues' : 'vue'}</span>
        </span>
      </div>
    </Card>
  );
};

