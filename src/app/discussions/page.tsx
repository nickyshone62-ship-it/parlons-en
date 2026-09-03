'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { NewPostModal } from '@/components/modals/NewPostModal';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  MessageSquare,
  ShieldCheck,
  Crown,
  Eye,
  MessageCircle,
  Clock,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Filter,
} from 'lucide-react';

export interface OfficialDiscussion {
  id: string;
  title: string;
  categoryName: string;
  categorySlug: string;
  description: string;
  authorName: string;
  status: 'featured' | 'open' | 'closed';
  startDate: string;
  endDate: string;
  viewsCount: number;
  opinionsCount: number;
}

const OFFICIAL_DISCUSSIONS: OfficialDiscussion[] = [
  {
    id: 'disc-1',
    title: 'Sujet du jour : Les réseaux sociaux rapprochent-ils vraiment les gens ou accentuent-ils l’isolement ?',
    categoryName: 'Relations & Société',
    categorySlug: 'relations',
    description: 'Dans notre monde ultra-connecté, nous avons des centaines d’amis virtuels, mais beaucoup ressentent une solitude croissante. Selon vous, les réseaux sociaux favorisent-ils de vrais liens ou créent-ils une illusion de proximité ?',
    authorName: '👑 Administration PARLONS-EN',
    status: 'featured',
    startDate: 'Aujourd’hui',
    endDate: 'Dans 3 jours',
    viewsCount: 142,
    opinionsCount: 28,
  },
  {
    id: 'disc-2',
    title: 'Travail & Équilibre de vie : Peut-on réellement réussir sans sacrifier sa santé mentale ?',
    categoryName: 'Travail & Carrière',
    categorySlug: 'travail',
    description: 'La culture de la surperformance et du travail sans relâche est de plus en plus remise en question. Comment fixez-vous vos limites avec votre employeur ou dans vos projets pour préserver votre bien-être ?',
    authorName: '👑 Administration PARLONS-EN',
    status: 'open',
    startDate: 'Hier',
    endDate: 'Dans 5 jours',
    viewsCount: 98,
    opinionsCount: 19,
  },
  {
    id: 'disc-3',
    title: 'Études & Stress : L’orientation scolaire met-elle trop de pression trop tôt sur les jeunes ?',
    categoryName: 'Études & Jeunesse',
    categorySlug: 'etudes',
    description: 'Dès le lycée, la pression du choix de carrière parfait pèse sur les épaules des étudiants. Quel est votre regard sur le système d’orientation actuel et l’angoisse de l’avenir ?',
    authorName: '👑 Administration PARLONS-EN',
    status: 'open',
    startDate: 'Il y a 3 jours',
    endDate: 'Dans 1 semaine',
    viewsCount: 215,
    opinionsCount: 41,
  },
  {
    id: 'disc-4',
    title: 'Entrepreneuriat : L’échec est-il une étape d’apprentissage nécessaire ou un tabou ?',
    categoryName: 'Entrepreneuriat',
    categorySlug: 'entrepreneuriat',
    description: 'La peur de l’échec freine encore de nombreux créateurs de projets. Comment percevez-vous l’échec dans votre parcours et quelles leçons en avez-vous tirées ?',
    authorName: '👑 Administration PARLONS-EN',
    status: 'closed',
    startDate: 'Il y a 2 semaines',
    endDate: 'Terminé',
    viewsCount: 340,
    opinionsCount: 56,
  },
];

export default function DiscussionsListPage() {
  const router = useRouter();
  const [discussions] = useState<OfficialDiscussion[]>(OFFICIAL_DISCUSSIONS);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  const filteredDiscussions = activeFilter === 'all'
    ? discussions
    : activeFilter === 'featured'
    ? discussions.filter((d) => d.status === 'featured')
    : activeFilter === 'open'
    ? discussions.filter((d) => d.status === 'open')
    : discussions.filter((d) => d.status === 'closed');

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-24 md:pb-12 space-y-6">
        
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-blue-600/20 space-y-4 border border-blue-400/30">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-md border border-white/30">
            <Crown className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Sujets Officiels Administration</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Discussions & Débats de Fond
          </h1>

          <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed max-w-2xl">
            L'administration publie régulièrement des sujets officiels sur les grandes questions de société, de travail, d'études et de vie quotidienne. **Donnez votre avis et partagez votre point de vue !**
          </p>

          <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-xs font-bold text-amber-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
            <span>
              Seule l'administration publie les sujets principaux. Les membres participent librement et de façon 100% anonyme (`Utilisateur #XXXX`).
            </span>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1 shrink-0 ml-1">
            <Filter className="w-3.5 h-3.5" /> Statut :
          </span>
          {[
            { slug: 'all', name: 'Toutes les discussions' },
            { slug: 'featured', name: '🔥 Sujet du jour' },
            { slug: 'open', name: '🟢 En cours' },
            { slug: 'closed', name: '🏁 Terminées' },
          ].map((tab) => {
            const isActive = activeFilter === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveFilter(tab.slug)}
                className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Official Discussions Cards List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
              {filteredDiscussions.length} {filteredDiscussions.length === 1 ? 'discussion officielle' : 'discussions officielles'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredDiscussions.map((disc) => (
              <Card
                key={disc.id}
                hoverable
                className="p-6 space-y-4 rounded-[32px] border-2 border-blue-100 dark:border-slate-800 shadow-lg hover:shadow-2xl transition duration-200"
              >
                {/* Header Badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-100 dark:border-slate-800/80 pb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="blue" size="sm">
                      {disc.categoryName}
                    </Badge>

                    {disc.status === 'featured' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black shadow-md shadow-amber-400/20">
                        <Flame className="w-3.5 h-3.5 fill-slate-950" />
                        🔥 Sujet du Jour
                      </span>
                    )}

                    {disc.status === 'open' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-500/30">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        🟢 En cours
                      </span>
                    )}

                    {disc.status === 'closed' && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        🏁 Débat Terminé
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-xs font-black">
                    <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>{disc.authorName}</span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 leading-snug">
                    {disc.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium line-clamp-3">
                    {disc.description}
                  </p>
                </div>

                {/* Footer Bar: Stats & CTA */}
                <div className="pt-3 border-t border-blue-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                      <span>{disc.opinionsCount} avis exprimés</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>{disc.viewsCount} vues</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{disc.startDate} • {disc.endDate}</span>
                    </span>
                  </div>

                  <Link href={`/discussions/${disc.id}`}>
                    <Button
                      variant="primary"
                      size="sm"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 font-black px-5"
                    >
                      Participer & Donner mon avis
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>

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
