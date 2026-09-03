'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { PostCard } from '@/components/posts/PostCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { NewPostModal } from '@/components/modals/NewPostModal';
import { getRealPosts } from '@/lib/supabase/posts';
import { Post } from '@/types';
import { PlusCircle, RefreshCw, MessageSquare, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function ProblemesPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'resolved' | 'in_progress' | 'open'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await getRealPosts();
      setPosts(data);
    } catch (err: any) {
      setErrorMessage(err?.message || "Impossible de charger les problèmes. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const resolvedCount = posts.filter((p) => p.status === 'resolved').length;
  const testingCount = posts.filter((p) => p.status === 'testing' || p.status === 'in_progress').length;
  const openCount = posts.filter((p) => p.status === 'open').length;

  const filteredPosts = posts.filter((p) => {
    if (activeStatusFilter === 'resolved') return p.status === 'resolved';
    if (activeStatusFilter === 'in_progress') return p.status === 'testing' || p.status === 'in_progress';
    if (activeStatusFilter === 'open') return p.status === 'open';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-24 md:pb-12 space-y-6">
        
        {/* Top Banner & Action */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-blue-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-blue-400/30">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-md border border-white/30">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Espace Communautaire Anonyme</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Tous les Problèmes Partagés
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Exprimez vos difficultés en toute confidentialité et découvrez des pistes proposées par la communauté.
            </p>
          </div>

          <Button
            onClick={() => setIsNewPostModalOpen(true)}
            variant="primary"
            size="lg"
            leftIcon={<PlusCircle className="w-5 h-5" />}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-xl shadow-amber-400/40 py-3.5 px-6 text-sm sm:text-base border-none shrink-0"
          >
            Publier un problème
          </Button>
        </div>

        {/* Status Filter Tabs */}
        {!isLoading && !errorMessage && posts.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-black uppercase text-slate-500 shrink-0 ml-1">Statut :</span>
            {[
              { key: 'all', label: `Tous (${posts.length})` },
              { key: 'open', label: `Ouverts (${openCount})` },
              { key: 'in_progress', label: `En cours (${testingCount})` },
              { key: 'resolved', label: `Résolus (${resolvedCount})` },
            ].map((tab) => {
              const isActive = activeStatusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveStatusFilter(tab.key as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-black transition cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Posts Content List */}
        {isLoading ? (
          <div className="py-12">
            <LoadingState type="spinner" />
          </div>
        ) : errorMessage ? (
          <div className="p-6 bg-rose-500/10 border border-rose-300 rounded-3xl text-rose-700 dark:text-rose-300 text-center space-y-4 max-w-md mx-auto my-8">
            <p className="font-bold text-sm">{errorMessage}</p>
            <Button
              onClick={fetchPosts}
              variant="outline"
              size="sm"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="rounded-full mx-auto"
            >
              Réessayer
            </Button>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="py-10">
            <EmptyState
              title="Aucune publication trouvée avec ce filtre."
              description="Essayez de modifier votre filtre ou de publier un nouveau problème !"
              actionLabel="Publier un problème"
              onAction={() => setIsNewPostModalOpen(true)}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                {filteredPosts.length} {filteredPosts.length === 1 ? 'publication affichée' : 'publications affichées'}
              </span>
              <button
                onClick={fetchPosts}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Actualiser
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
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
          fetchPosts();
        }}
      />
    </div>
  );
}
