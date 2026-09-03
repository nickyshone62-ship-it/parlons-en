'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Category, Post } from '@/types';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { PostCard } from '@/components/posts/PostCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewPostModal } from '@/components/modals/NewPostModal';
import { LoginModal } from '@/components/modals/LoginModal';
import { getCurrentUserSession } from '@/lib/auth/actions';
import { getRealPosts } from '@/lib/supabase/posts';
import { CHARACTER_AVATARS } from '@/data/avatars';
import {
  ShieldCheck,
  Sparkles,
  Users,
  MessageCircleHeart,
  Clock,
  ArrowRight,
  HelpCircle,
  Heart,
  MessageSquare,
  Lock,
  Zap,
  CheckCircle2,
} from 'lucide-react';

export interface HomePageClientProps {
  categories: Category[];
  initialRealPosts?: Post[];
}

export const HomePageClient: React.FC<HomePageClientProps> = ({
  categories,
  initialRealPosts = [],
}) => {
  const [realPosts, setRealPosts] = useState<Post[]>(initialRealPosts);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'resolved' | 'in_progress' | 'open'>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const router = useRouter();
  const sampleAvatars = CHARACTER_AVATARS.slice(0, 6);

  const fetchLivePosts = async () => {
    try {
      const fetched = await getRealPosts();
      setRealPosts(fetched || []);
    } catch {
      setRealPosts([]);
    } finally {
      setHasLoaded(true);
    }
  };

  useEffect(() => {
    async function init() {
      const session = await getCurrentUserSession();
      const userIsLoggedIn = Boolean(session?.user);
      setIsAuthenticated(userIsLoggedIn);

      if (typeof window !== 'undefined' && !userIsLoggedIn) {
        const hasSeenOnboarding = localStorage.getItem('parlons_en_has_seen_onboarding');
        if (!hasSeenOnboarding) {
          router.push('/bienvenue');
          return;
        }
      }
      await fetchLivePosts();
    }
    init();
  }, [router]);

  const resolvedCount = realPosts.filter((p) => p.status === 'resolved').length;
  const testingCount = realPosts.filter((p) => p.status === 'testing' || p.status === 'in_progress').length;
  const openCount = realPosts.filter((p) => p.status === 'open').length;

  const filteredPosts = realPosts.filter((p) => {
    const matchesCategory = activeCategoryFilter
      ? p.category_id === activeCategoryFilter || p.category_name.toLowerCase().includes(activeCategoryFilter.toLowerCase())
      : true;

    const matchesStatus =
      activeStatusFilter === 'all'
        ? true
        : activeStatusFilter === 'resolved'
        ? p.status === 'resolved'
        : activeStatusFilter === 'in_progress'
        ? p.status === 'testing' || p.status === 'in_progress'
        : p.status === 'open';

    return matchesCategory && matchesStatus;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F8FC] dark:bg-[#070C18] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased selection:bg-yellow-300 selection:text-slate-950">
      {/* Header Desktop */}
      <Header onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <main className="flex-1 space-y-16 sm:space-y-24 pb-16">
        
        {/* HERO SECTION REDESIGN */}
        <section className="relative overflow-hidden pt-8 sm:pt-16 pb-16 sm:pb-24 border-b border-blue-200/50 dark:border-slate-800/80 bg-gradient-to-b from-blue-600/10 via-indigo-500/5 to-transparent">
          {/* Glowing Ambient Backdrop Balls */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 via-indigo-500/15 to-yellow-400/20 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
          <div className="absolute top-10 right-10 w-72 h-72 bg-amber-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8">
            
            {/* Top Snapchat & Security Tagline Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs font-black border-2 border-yellow-400 shadow-lg shadow-yellow-400/10 animate-fade-in">
              <span className="w-5 h-5 rounded-full bg-[#FFFC00] text-slate-950 flex items-center justify-center text-xs font-black shadow-xs">
                👻
              </span>
              <span>Plateforme 100% Anonyme avec 100 Bitmojis Snapchat</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-5xl mx-auto">
              Une difficulté ? Un souci ?{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-500 bg-clip-text text-transparent">
                Parle-en anonymement.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-semibold">
              Libère-toi de ce qui te pèse sans aucune peur du jugement. Une communauté bienveillante est là pour t’écouter, t’épauler et t’aider à trouver des pistes concrètes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => setIsNewPostModalOpen(true)}
                variant="primary"
                size="lg"
                leftIcon={<Sparkles className="w-5 h-5" />}
                className="w-full sm:w-auto bg-gradient-to-r from-[#FFFC00] via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-base sm:text-lg py-4 px-8 rounded-full shadow-xl shadow-amber-400/30 hover:scale-[1.03] transition border-2 border-yellow-300 tracking-wide"
              >
                Partager mon problème 🚀
              </Button>

              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<MessageCircleHeart className="w-5 h-5 text-emerald-500" />}
                  className="w-full sm:w-auto font-black text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 rounded-full border-2 border-blue-300 dark:border-slate-700 py-4 px-8 shadow-md hover:bg-blue-50 dark:hover:bg-slate-800"
                >
                  Rejoindre le Chat en Direct 💬
                </Button>
              </Link>
            </div>

            {/* Bitmoji Showcase Line */}
            <div className="pt-6 flex flex-col items-center space-y-3">
              <div className="flex items-center justify-center -space-x-3 overflow-hidden p-1">
                {sampleAvatars.map((av) => (
                  <div
                    key={av.id}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${av.gradient} p-0.5 border-2 border-white dark:border-slate-900 shadow-md hover:scale-125 hover:z-20 transition-all duration-200`}
                  >
                    <img src={av.url} alt="Bitmoji" className="w-full h-full object-cover rounded-full" />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-[#FFFC00] text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-md z-10">
                  +94
                </div>
              </div>
              <p className="text-xs font-black text-slate-500 dark:text-slate-400">
                Choisis ton Bitmoji unique parmi <strong className="text-blue-600 dark:text-blue-400">100 avatars Snapchat</strong> pour protéger ton identité.
              </p>
            </div>

            {/* Micro Assurance Cards */}
            <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 max-w-3xl mx-auto border-t border-blue-200/60 dark:border-slate-800 text-center gap-3 sm:gap-6 text-xs sm:text-sm">
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex items-center justify-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Lock className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>100% Anonyme & Confidentiel</span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex items-center justify-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Modération Active & Bienveillante</span>
              </div>
              <div className="p-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-blue-100 dark:border-slate-800 shadow-xs flex items-center justify-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Zap className="w-4 h-4 text-blue-500 shrink-0" />
                <span>Accès Unique 500 FCFA</span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION : COMMENT CA MARCHE */}
        <section id="comment-ca-marche" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider">
              Principe Simple
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Comment fonctionne <span className="text-blue-600 dark:text-blue-400">PARLONS-EN</span> ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-semibold">
              Trois étapes clés pour briser le silence et avancer en toute sérénité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="p-7 bg-white dark:bg-slate-900/90 border-2 border-blue-200/80 dark:border-slate-800 rounded-3xl space-y-4 shadow-lg relative group hover:border-amber-400 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-[#FFFC00] text-slate-950 font-black text-xl flex items-center justify-center shadow-md border border-yellow-400">
                1
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600" />
                Partage ton problème
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Exprime tes ressentis ou tes questions en toute liberté. Ton prénom reste masqué et ton Bitmoji te protège.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-7 bg-white dark:bg-slate-900/90 border-2 border-blue-200/80 dark:border-slate-800 rounded-3xl space-y-4 shadow-lg relative group hover:border-indigo-500 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-md">
                2
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                La communauté écoute
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Des membres empathiques lisent ton histoire. Tu reçois du réconfort et des retours d'expérience précieux.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-7 bg-white dark:bg-slate-900/90 border-2 border-blue-200/80 dark:border-slate-800 rounded-3xl space-y-4 shadow-lg relative group hover:border-emerald-500 transition duration-300">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                3
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircleHeart className="w-5 h-5 text-emerald-500" />
                Trouve des solutions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Sélectionne la piste qui t'aide le plus et valide la réponse pour faire avancer le sujet vers "Confirmé".
              </p>
            </div>
          </div>
        </section>

        {/* SECTION : CATEGORIES */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2">
                Thématiques de la Vie
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Toutes les Catégories
              </h2>
            </div>

            {activeCategoryFilter && (
              <button
                onClick={() => setActiveCategoryFilter(null)}
                className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-blue-200"
              >
                Retour aux catégories ({categories.find((c) => c.id === activeCategoryFilter)?.name || activeCategoryFilter})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() =>
                  setActiveCategoryFilter(
                    activeCategoryFilter === category.id ? null : category.id
                  )
                }
              />
            ))}
          </div>
        </section>

        {/* SECTION : DISCUSSIONS REELLES */}
        <section id="discussions" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Toutes les Discussions</span>
                  <span className="text-sm font-bold text-slate-500">({filteredPosts.length})</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  Espace de parole en direct pour la communauté
                </p>
              </div>
            </div>
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState
              title="Toutes les catégories sont actuellement vierges (0 sujet)"
              description="Soyez la toute première personne à vous exprimer en toute sécurité et confidentialité !"
              icon={<Sparkles className="w-8 h-8 text-amber-500" />}
              actionLabel="Partager mon problème maintenant"
              onAction={() => setIsNewPostModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {filteredPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>

        {/* CTA BOTTOM BANNER */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-950 rounded-[36px] p-8 sm:p-14 text-white text-center space-y-6 shadow-2xl border-2 border-yellow-400/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400 text-slate-950 text-xs font-black shadow-md">
              <Sparkles className="w-4 h-4" />
              <span>Communauté Solidaire</span>
            </div>

            <h2 className="text-2xl sm:text-5xl font-black tracking-tight max-w-3xl mx-auto">
              Prêt à partager ce qui te pèse ?
            </h2>
            <p className="text-xs sm:text-base text-blue-100 max-w-xl mx-auto leading-relaxed font-semibold">
              Ne reste pas seul avec tes inquiétudes. Exprime-toi en toute sécurité et trouve le réconfort d'une communauté bienveillante.
            </p>
            <div>
              <Button
                onClick={() => setIsNewPostModalOpen(true)}
                variant="secondary"
                size="lg"
                className="bg-gradient-to-r from-[#FFFC00] to-yellow-400 hover:from-yellow-300 hover:to-amber-400 text-slate-950 border-none shadow-xl font-black rounded-full text-base sm:text-lg py-4 px-8"
                leftIcon={<Heart className="w-5 h-5 text-rose-600 fill-rose-600" />}
              >
                Partager mon problème maintenant
              </Button>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Mobile Navigation */}
      <MobileNav onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      {/* Interactive Modals */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => {
          setIsNewPostModalOpen(false);
          fetchLivePosts();
        }}
        categories={categories}
        isAuthenticated={isAuthenticated}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};

