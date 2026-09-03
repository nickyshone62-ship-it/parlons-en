'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StatusBadge } from '@/components/posts/StatusBadge';
import { CommentCard } from '@/components/posts/CommentCard';
import { CommentForm } from '@/components/posts/CommentForm';
import { LoadingState } from '@/components/ui/LoadingState';
import { Button } from '@/components/ui/Button';
import { NewPostModal } from '@/components/modals/NewPostModal';
import {
  getRealPostById,
  getRealComments,
} from '@/lib/supabase/posts';
import { incrementPostViews, getPostViews } from '@/lib/viewsManager';
import { getCurrentUserSession } from '@/lib/auth/actions';
import { Post, Answer } from '@/types';
import {
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Eye,
  MessageCircle,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function ProblemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const postId = resolvedParams.id;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<(Answer & { hasVoted: boolean })[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recent' | 'likes' | 'views'>('recent');

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const session = await getCurrentUserSession();
      setIsAuthenticated(Boolean(session.user));

      const updatedViews = incrementPostViews(postId);

      const { post: loadedPost } = await getRealPostById(postId);
      if (!loadedPost) {
        setErrorMessage("Le problème demandé est introuvable ou a été retiré.");
        setIsLoading(false);
        return;
      }

      loadedPost.views_count = updatedViews;
      setPost(loadedPost);

      const loadedComments = await getRealComments(postId);
      setComments(loadedComments);
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur lors du chargement du problème.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [postId]);

  const authorAvatar = post?.author_avatar_url || (post ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(post.author_pseudonym)}` : '');

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'likes') {
      return (b.upvotes_count || 0) - (a.upvotes_count || 0);
    }
    if (sortBy === 'views') {
      const viewsA = getPostViews(`comment_${a.id}`);
      const viewsB = getPostViews(`comment_${b.id}`);
      return viewsB - viewsA;
    }
    return 0; // default order from getRealComments
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-24 md:pb-12 space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            href="/problemes"
            className="inline-flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline py-1 px-3 rounded-full hover:bg-blue-50 dark:hover:bg-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux problèmes</span>
          </Link>
        </div>

        {/* Loading / Error States */}
        {isLoading ? (
          <div className="py-12">
            <LoadingState type="spinner" />
          </div>
        ) : errorMessage || !post ? (
          <div className="p-8 bg-rose-500/10 border border-rose-300 rounded-3xl text-rose-700 dark:text-rose-300 text-center space-y-4 max-w-md mx-auto my-8">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <p className="font-bold text-sm">{errorMessage || "Problème introuvable"}</p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                onClick={loadData}
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                className="rounded-full"
              >
                Réessayer
              </Button>
              <Link href="/problemes">
                <Button variant="primary" size="sm" className="rounded-full">
                  Voir tous les problèmes
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Main Post Detail Card */}
            <Card className="p-6 sm:p-8 space-y-6 shadow-2xl shadow-blue-500/10 rounded-[32px] border border-blue-100 dark:border-slate-800">
              
              {/* Post Header Info */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 dark:border-slate-800 pb-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="blue" size="md">
                    {post.category_name}
                  </Badge>
                  <StatusBadge status={post.status} />
                </div>

                <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5" title="Nombre de vues du problème">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>{post.views_count} {post.views_count > 1 ? 'vues' : 'vue'}</span>
                  </span>
                  <span className="flex items-center gap-1.5" title="Nombre de réponses">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span>{post.answers_count} {post.answers_count > 1 ? 'réponses' : 'réponse'}</span>
                  </span>
                </div>
              </div>

              {/* Title & Author Info */}
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                  {post.title}
                </h1>

                {/* Author Avatar & Anonymous Name Bar */}
                <div className="flex items-center gap-3 p-3 bg-blue-50/60 dark:bg-slate-900/60 rounded-2xl border border-blue-100/80 dark:border-slate-800">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-md flex items-center justify-center overflow-hidden shrink-0">
                    {authorAvatar ? (
                      <img
                        src={authorAvatar}
                        alt="Avatar Anonyme"
                        className="w-full h-full object-cover rounded-[14px]"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900 dark:text-slate-100">
                        {post.author_pseudonym}
                      </span>
                      <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Publié {post.created_at}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Content Text */}
              <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium whitespace-pre-wrap pt-2">
                {post.content}
              </div>
            </Card>

            {/* SECTION: Community Answers */}
            <div className="space-y-6 pt-2">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>💬 Réponses proposées ({comments.length})</span>
                </h2>

                {/* Simple Sorting Selector */}
                {comments.length > 1 && (
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <span>Trier par :</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1 text-slate-800 dark:text-slate-200 text-xs font-black shadow-xs outline-none cursor-pointer focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="recent">Plus récentes</option>
                      <option value="likes">Plus aimées 👍</option>
                      <option value="views">Plus vues 👁️</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Comments List */}
              {comments.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-blue-100 dark:border-slate-800 text-center space-y-3">
                  <p className="text-slate-600 dark:text-slate-400 font-bold text-sm">
                    Il n'y a pas encore de réponse sous ce problème.
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                    Soyez la première personne à proposer des conseils ou une piste d'aide !
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sortedComments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      id={comment.id}
                      content={comment.content}
                      authorPseudonym={comment.author_pseudonym}
                      createdAt={comment.created_at}
                      upvotesCount={comment.upvotes_count}
                      hasVoted={comment.hasVoted}
                      isAuthenticated={isAuthenticated}
                      onRequireAuth={() => router.push('/connexion')}
                    />
                  ))}
                </div>
              )}

              {/* Reply Submission Form Section */}
              <div className="pt-6">
                <CommentForm
                  postId={post.id}
                  isAuthenticated={isAuthenticated}
                  onCommentAdded={loadData}
                />
              </div>

            </div>
          </>
        )}

      </main>

      <Footer />
      <MobileNav onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        onSuccess={() => {
          setIsNewPostModalOpen(false);
          router.push('/problemes');
        }}
      />
    </div>
  );
}

