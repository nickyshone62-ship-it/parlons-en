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
import { NewReviewModal } from '@/components/modals/NewReviewModal';
import { LoginModal } from '@/components/modals/LoginModal';
import { getRealUserReviews, UserReview, INITIAL_REVIEWS } from '@/lib/supabase/reviews';
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
  Star,
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
  const [reviews, setReviews] = useState<UserReview[]>(INITIAL_REVIEWS);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isNewReviewModalOpen, setIsNewReviewModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);
  const [activeStatusFilter, setActiveStatusFilter] = useState<'all' | 'resolved' | 'in_progress' | 'open'>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentPseudonym, setCurrentPseudonym] = useState('Utilisateur Anonyme');
  const [currentAvatar, setCurrentAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Guest');

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

  const fetchLiveReviews = async () => {
    try {
      const fetchedReviews = await getRealUserReviews();
      setReviews(fetchedReviews || INITIAL_REVIEWS);
    } catch {
      setReviews(INITIAL_REVIEWS);
    }
  };

  useEffect(() => {
    async function init() {
      const session = await getCurrentUserSession();
      const userIsLoggedIn = Boolean(session?.user);
      setIsAuthenticated(userIsLoggedIn);

      if (session) {
        const pseudo = session.anonymousIdentity?.anonymous_name || 'Utilisateur #4821';
        const av = session.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pseudo)}`;
        setCurrentPseudonym(pseudo);
        setCurrentAvatar(av);
      }

      if (typeof window !== 'undefined' && !userIsLoggedIn) {
        const hasSeenOnboarding = localStorage.getItem('parlons_en_has_seen_onboarding');
        if (!hasSeenOnboarding) {
          router.push('/bienvenue');
          return;
        }
      }
      await Promise.all([fetchLivePosts(), fetchLiveReviews()]);
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
        <section className="relative overflow-hidden pt-10 sm:pt-20 pb-20 sm:pb-28 border-b border-blue-200/50 dark:border-slate-800/80 bg-gradient-to-b from-blue-600/15 via-indigo-500/10 to-transparent">
          {/* Glowing Ambient Backdrop Orbs */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/25 via-indigo-600/20 to-amber-400/25 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse" />
          <div className="absolute top-10 right-10 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8 relative z-10">
            
            {/* Top Snapchat & Security Tagline Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-xs font-black border-2 border-amber-400 shadow-xl shadow-amber-400/15 transform hover:scale-105 transition duration-300">
              <span className="w-6 h-6 rounded-full bg-[#FFFC00] text-slate-950 flex items-center justify-center text-xs font-black shadow-xs">
                👻
              </span>
              <span>Plateforme 100% Anonyme avec 100 Bitmojis Snapchat</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                En ligne
              </span>
            </div>

            {/* Main Title */}
            <h1 className="text-3xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.12] max-w-5xl mx-auto">
              Une difficulté ? Un souci ?{' '}
              <span className="bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-500 bg-clip-text text-transparent underline decoration-amber-400/60 decoration-wavy underline-offset-8">
                Parle-en anonymement.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed font-bold">
              Libère-toi de ce qui te pèse sans aucune peur du jugement. Une communauté bienveillante est là pour t’écouter, t’épauler et t’aider à trouver des pistes concrètes.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button
                onClick={() => setIsNewPostModalOpen(true)}
                variant="primary"
                size="lg"
                leftIcon={<Sparkles className="w-5 h-5 text-slate-950" />}
                className="w-full sm:w-auto bg-gradient-to-r from-[#FFFC00] via-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black text-base sm:text-lg py-4.5 px-9 rounded-full shadow-2xl shadow-amber-400/40 hover:scale-[1.04] active:scale-[0.98] transition border-2 border-yellow-300 tracking-wide"
              >
                Partager mon problème 🚀
              </Button>

              <Link href="/chat" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  leftIcon={<MessageCircleHeart className="w-5 h-5 text-emerald-500" />}
                  className="w-full sm:w-auto font-black text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-full border-2 border-blue-300 dark:border-slate-700 py-4.5 px-9 shadow-lg hover:bg-blue-50 dark:hover:bg-slate-800 hover:scale-[1.02] transition"
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
                    className={`w-11 h-11 rounded-full bg-gradient-to-br ${av.gradient} p-0.5 border-2 border-white dark:border-slate-900 shadow-md hover:scale-125 hover:z-20 transition-all duration-200`}
                  >
                    <img src={av.url} alt="Bitmoji" className="w-full h-full object-cover rounded-full" />
                  </div>
                ))}
                <div className="w-11 h-11 rounded-full bg-[#FFFC00] text-slate-950 font-black text-xs flex items-center justify-center border-2 border-white shadow-md z-10">
                  +94
                </div>
              </div>
              <p className="text-xs font-black text-slate-600 dark:text-slate-300">
                Choisis ton Bitmoji unique parmi <strong className="text-blue-600 dark:text-blue-400">100 avatars Snapchat</strong> pour protéger ton identité.
              </p>
            </div>

            {/* LIVE PLATFORM METRICS BAR */}
            <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
              <div className="p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-blue-200/60 dark:border-slate-800 shadow-lg text-center space-y-1 transform hover:-translate-y-1 transition duration-300">
                <div className="w-9 h-9 rounded-2xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  +{realPosts.length || 24}
                </div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Problèmes partagés</div>
              </div>

              <div className="p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-amber-400/40 dark:border-slate-800 shadow-lg text-center space-y-1 transform hover:-translate-y-1 transition duration-300">
                <div className="w-9 h-9 rounded-2xl bg-amber-400/20 text-amber-500 flex items-center justify-center mx-auto mb-2">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  100%
                </div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Anonyme & Sécurisé</div>
              </div>

              <div className="p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-emerald-400/40 dark:border-slate-800 shadow-lg text-center space-y-1 transform hover:-translate-y-1 transition duration-300">
                <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {resolvedCount}
                </div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Solutions confirmées</div>
              </div>

              <div className="p-5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border-2 border-indigo-400/40 dark:border-slate-800 shadow-lg text-center space-y-1 transform hover:-translate-y-1 transition duration-300">
                <div className="w-9 h-9 rounded-2xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  500 F
                </div>
                <div className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Frais d'accès unique</div>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION : COMMENT CA MARCHE */}
        <section id="comment-ca-marche" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-wider border border-blue-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              Principe Simple & Sécurisé
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Comment fonctionne <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">PARLONS-EN</span> ?
            </h2>
            <p className="text-xs sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto font-bold">
              Trois étapes clés pour briser le silence et avancer en toute sérénité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="p-8 bg-white dark:bg-slate-900/90 border-2 border-blue-200/80 dark:border-slate-800 rounded-[32px] space-y-4 shadow-xl relative group hover:border-amber-400 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-[#FFFC00] text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-yellow-400">
                1
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-blue-600" />
                Partage ton problème
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Exprime tes ressentis ou tes questions en toute liberté. Ton vrai nom reste masqué et ton Bitmoji Snapchat protège ton identité.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 bg-white dark:bg-slate-900/90 border-2 border-blue-200/80 dark:border-slate-800 rounded-[32px] space-y-4 shadow-xl relative group hover:border-indigo-500 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                2
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-indigo-600" />
                La communauté écoute
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Des membres empathiques lisent ton histoire. Tu reçois du réconfort et des retours d'expérience précieux.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 bg-white dark:bg-slate-900/90 border-2 border-blue-200/80 dark:border-slate-800 rounded-[32px] space-y-4 shadow-xl relative group hover:border-emerald-500 hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                3
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MessageCircleHeart className="w-6 h-6 text-emerald-500" />
                Trouve des solutions
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                Sélectionne la réponse qui t'aide le plus et marque le sujet comme "Résolu" pour apporter de l'espoir à la communauté.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION : CATEGORIES */}
        <section id="categories" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-800 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2 border border-amber-400/30">
                Thématiques de la Vie
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Toutes les Catégories de Discussion
              </h2>
            </div>

            {activeCategoryFilter && (
              <button
                onClick={() => setActiveCategoryFilter(null)}
                className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline cursor-pointer bg-blue-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-blue-200"
              >
                Réinitialiser les filtres ({categories.find((c) => c.id === activeCategoryFilter)?.name || activeCategoryFilter})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Dernières Publications & Sujets</span>
                  <span className="text-sm font-bold text-slate-500">({filteredPosts.length})</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold">
                  Partage d'expériences et entraide en temps réel
                </p>
              </div>
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none w-full sm:w-auto">
              {[
                { key: 'all', label: `Tous (${realPosts.length})` },
                { key: 'open', label: `Ouverts (${openCount})` },
                { key: 'in_progress', label: `En cours (${testingCount})` },
                { key: 'resolved', label: `Résolus (${resolvedCount})` },
              ].map((tab) => {
                const isActive = activeStatusFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveStatusFilter(tab.key as any)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition cursor-pointer shrink-0 ${
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
          </div>

          {filteredPosts.length === 0 ? (
            <EmptyState
              title="Aucune publication trouvée dans cette sélection"
              description="Soyez la toute première personne à vous exprimer en toute sécurité !"
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

        {/* SECTION : TEMOIGNAGES ET AVIS REELS DE LA COMMUNAUTE */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 rounded-[36px] p-8 sm:p-12 text-white space-y-8 border-2 border-blue-500/20 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Avis & Témoignages des Membres
                </div>
                <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Ce que disent nos utilisateurs ({reviews.length})
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-xl">
                  Découvrez les avis authentiques laissés par la communauté Parlons-En.
                </p>
              </div>

              <Button
                onClick={() => setIsNewReviewModalOpen(true)}
                variant="primary"
                size="md"
                leftIcon={<Star className="w-4 h-4 text-slate-950 fill-slate-950" />}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-xl border-none px-6 py-3 shrink-0 text-xs sm:text-sm cursor-pointer"
              >
                ⭐ Donner mon avis sur la plateforme
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="p-6 bg-slate-900/90 rounded-3xl border border-slate-800 space-y-4 hover:border-amber-400/50 transition duration-200 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < rev.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold">{rev.createdAt}</span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed italic">
                    « {rev.content} »
                  </p>

                  <div className="flex items-center gap-3 pt-2 border-t border-slate-800/80">
                    <div className="w-8 h-8 rounded-full border border-amber-400 overflow-hidden shrink-0">
                      <img src={rev.authorAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="text-xs font-black text-amber-400 truncate">
                      {rev.authorPseudonym}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
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
                className="bg-gradient-to-r from-[#FFFC00] to-yellow-400 hover:from-yellow-300 hover:to-amber-400 text-slate-950 border-none shadow-xl font-black rounded-full text-base sm:text-lg py-4.5 px-9 transform hover:scale-105 transition"
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

      <NewReviewModal
        isOpen={isNewReviewModalOpen}
        onClose={() => setIsNewReviewModalOpen(false)}
        onSuccess={() => {
          setIsNewReviewModalOpen(false);
          fetchLiveReviews();
        }}
        currentPseudonym={currentPseudonym}
        currentAvatar={currentAvatar}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
};
