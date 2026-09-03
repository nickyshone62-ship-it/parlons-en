'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { NewPostModal } from '@/components/modals/NewPostModal';
import { getCurrentUserSession } from '@/lib/auth/actions';
import { UserSession } from '@/types';
import {
  ArrowLeft,
  Crown,
  ShieldCheck,
  MessageSquare,
  Eye,
  MessageCircle,
  Clock,
  Send,
  Sparkles,
  Flame,
  ThumbsUp,
  Lightbulb,
  CheckCircle2,
  Calendar,
  AlertCircle,
  User,
  LogIn,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react';

export interface DiscussionOpinion {
  id: string;
  authorPseudonym: string;
  authorAvatar: string;
  createdAt: string;
  content: string;
  likesCount: number;
  hasLiked: boolean;
}

const OFFICIAL_DISCUSSIONS_DATA: Record<string, {
  id: string;
  title: string;
  categoryName: string;
  description: string;
  authorName: string;
  status: 'featured' | 'open' | 'closed';
  startDate: string;
  endDate: string;
  viewsCount: number;
  opinionsCount: number;
  initialOpinions: DiscussionOpinion[];
}> = {
  'disc-1': {
    id: 'disc-1',
    title: 'Sujet du jour : Les réseaux sociaux rapprochent-ils vraiment les gens ou accentuent-ils l’isolement ?',
    categoryName: 'Relations & Société',
    description: 'Dans notre monde ultra-connecté, nous avons des centaines d’amis virtuels, mais beaucoup ressentent une solitude croissante. Selon vous, les réseaux sociaux favorisent-ils de vrais liens ou créent-ils une illusion de proximité ? Partagez vos analyses et retours d’expériences.',
    authorName: '👑 Administration PARLONS-EN',
    status: 'featured',
    startDate: 'Aujourd’hui',
    endDate: 'Dans 3 jours',
    viewsCount: 143,
    opinionsCount: 2,
    initialOpinions: [
      {
        id: 'op-1',
        authorPseudonym: 'Utilisateur #4821',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Utilisateur%20%234821',
        createdAt: 'Il y a 30 min',
        content: 'Je pense que les réseaux sociaux sont d’excellents outils de maintien de lien à distance, mais ils remplacent de plus en plus les vrais moments d’échanges réels. On regarde les stories des autres au lieu de prendre des nouvelles par téléphone.',
        likesCount: 8,
        hasLiked: false,
      },
      {
        id: 'op-2',
        authorPseudonym: 'Utilisateur #8812',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Utilisateur%20%238812',
        createdAt: 'Il y a 10 min',
        content: 'Tout dépend de la manière dont on les utilise ! Pour moi qui habite loin de ma famille, cela me permet de garder un contact quotidien précieux.',
        likesCount: 4,
        hasLiked: false,
      },
    ],
  },
  'disc-2': {
    id: 'disc-2',
    title: 'Travail & Équilibre de vie : Peut-on réellement réussir sans sacrifier sa santé mentale ?',
    categoryName: 'Travail & Carrière',
    description: 'La culture de la surperformance et du travail sans relâche est de plus en plus remise en question. Comment fixez-vous vos limites avec votre employeur ou dans vos projets pour préserver votre bien-être ?',
    authorName: '👑 Administration PARLONS-EN',
    status: 'open',
    startDate: 'Hier',
    endDate: 'Dans 5 jours',
    viewsCount: 99,
    opinionsCount: 1,
    initialOpinions: [
      {
        id: 'op-3',
        authorPseudonym: 'Utilisateur #1938',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Utilisateur%20%231938',
        createdAt: 'Il y a 1h',
        content: 'Fixer des heures d’arrêt strictes et couper les notifications pro après 19h a changé ma vie ! La santé mentale passe avant tout.',
        likesCount: 12,
        hasLiked: false,
      },
    ],
  },
};

export default function OfficialDiscussionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const discussionId = resolvedParams.id;

  const [session, setSession] = useState<UserSession | null>(null);
  const [discussionData, setDiscussionData] = useState(OFFICIAL_DISCUSSIONS_DATA[discussionId] || OFFICIAL_DISCUSSIONS_DATA['disc-1']);
  const [opinions, setOpinions] = useState<DiscussionOpinion[]>(discussionData.initialOpinions);
  const [newOpinionText, setNewOpinionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  useEffect(() => {
    async function init() {
      const currentSession = await getCurrentUserSession();
      setSession(currentSession);
    }
    init();
  }, []);

  const currentPseudonym = session?.anonymousIdentity?.anonymous_name || 'Utilisateur #4821';
  const currentAvatar = session?.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentPseudonym)}`;

  const handleOpinionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newOpinionText.trim()) {
      setErrorMessage("Veuillez saisir votre avis avant de publier.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const newOp: DiscussionOpinion = {
      id: `op-${Date.now()}`,
      authorPseudonym: currentPseudonym,
      authorAvatar: currentAvatar,
      createdAt: "À l'instant",
      content: newOpinionText.trim(),
      likesCount: 0,
      hasLiked: false,
    };

    setOpinions((prev) => [newOp, ...prev]);
    setDiscussionData((prev) => ({ ...prev, opinionsCount: prev.opinionsCount + 1 }));
    setNewOpinionText('');
    setIsSubmitting(false);
  };

  const [editingOpinionId, setEditingOpinionId] = useState<string | null>(null);
  const [editingOpinionText, setEditingOpinionText] = useState('');

  const handleDeleteOpinion = (opId: string) => {
    setOpinions((prev) => prev.filter((op) => op.id !== opId));
    setDiscussionData((prev) => ({ ...prev, opinionsCount: Math.max(0, prev.opinionsCount - 1) }));
  };

  const handleStartEditOpinion = (opId: string, text: string) => {
    setEditingOpinionId(opId);
    setEditingOpinionText(text);
  };

  const handleSaveEditOpinion = (opId: string) => {
    if (!editingOpinionText.trim()) return;
    setOpinions((prev) =>
      prev.map((op) => (op.id === opId ? { ...op, content: editingOpinionText.trim() } : op))
    );
    setEditingOpinionId(null);
    setEditingOpinionText('');
  };

  const handleLikeOpinion = (opId: string) => {
    setOpinions((prev) =>
      prev.map((op) => {
        if (op.id === opId) {
          const nextState = !op.hasLiked;
          return {
            ...op,
            hasLiked: nextState,
            likesCount: nextState ? op.likesCount + 1 : op.likesCount - 1,
          };
        }
        return op;
      })
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full pb-24 md:pb-12 space-y-6">
        
        {/* Back Link */}
        <div>
          <Link
            href="/discussions"
            className="inline-flex items-center gap-2 text-xs font-black text-blue-600 dark:text-blue-400 hover:underline py-1 px-3 rounded-full hover:bg-blue-50 dark:hover:bg-slate-900 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour aux discussions officielles</span>
          </Link>
        </div>

        {/* Main Official Subject Card */}
        <Card className="p-6 sm:p-8 space-y-6 shadow-2xl shadow-blue-500/10 rounded-[32px] border-2 border-blue-100 dark:border-slate-800">
          
          {/* Official Admin Badge Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 dark:border-slate-800 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="blue" size="md">
                {discussionData.categoryName}
              </Badge>

              {discussionData.status === 'featured' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black shadow-md">
                  <Flame className="w-3.5 h-3.5 fill-slate-950" />
                  🔥 Sujet du Jour
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/15 text-amber-800 dark:text-amber-300 border border-amber-400/30 text-xs font-black">
              <Crown className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Publié par {discussionData.authorName}</span>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-4">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
              {discussionData.title}
            </h1>

            <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-base leading-relaxed font-medium whitespace-pre-wrap bg-blue-50/60 dark:bg-slate-900/60 p-5 rounded-2xl border border-blue-100 dark:border-slate-800">
              {discussionData.description}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 pt-2 border-t border-blue-100 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-blue-600" />
                <span>{discussionData.opinionsCount} avis exprimés</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>{discussionData.viewsCount} vues</span>
              </span>
            </div>

            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{discussionData.startDate} • {discussionData.endDate}</span>
            </span>
          </div>

        </Card>

        {/* SECTION: Community Opinions */}
        <div className="space-y-6 pt-4">
          
          <div className="flex items-center justify-between px-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>💬 Avis de la communauté ({opinions.length})</span>
            </h2>
          </div>

          {/* Form: Give Your Opinion */}
          <Card className="p-6 space-y-4 shadow-xl rounded-[32px] border border-blue-100 dark:border-slate-800">
            <form onSubmit={handleOpinionSubmit} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Votre avis sur ce sujet
                </label>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-slate-900 px-3 py-1 rounded-full border border-blue-200 dark:border-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Avis 100% Anonyme ({currentPseudonym})
                </span>
              </div>

              <Textarea
                placeholder="Partagez votre point de vue, votre expérience ou votre analyse en toute bienveillance..."
                value={newOpinionText}
                onChange={(e) => setNewOpinionText(e.target.value)}
                rows={4}
                required
              />

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-300 rounded-2xl text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmitting}
                  rightIcon={<Send className="w-4 h-4" />}
                  className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-lg border-none px-6 py-2.5"
                >
                  Publier mon avis 💬
                </Button>
              </div>
            </form>
          </Card>

          {/* Opinions List */}
          {opinions.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-blue-100 dark:border-slate-800 text-center space-y-3">
              <p className="text-slate-600 dark:text-slate-400 font-bold text-sm">
                Aucun membre n'a encore donné son avis sur ce sujet.
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 font-medium">
                Soyez le premier à exprimer votre point de vue !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {opinions.map((op) => (
                <Card
                  key={op.id}
                  className="p-5 space-y-3 rounded-3xl border border-blue-100/80 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 text-xs">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xs overflow-hidden shrink-0">
                        <img src={op.authorAvatar} alt="Avatar" className="w-full h-full object-cover rounded-full" />
                      </div>
                      <span className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        {op.authorPseudonym}
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-500 dark:text-slate-400 font-medium">{op.createdAt}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleStartEditOpinion(op.id, op.content)}
                        className="p-1 text-slate-400 hover:text-amber-500 rounded transition cursor-pointer"
                        title="Modifier cet avis"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteOpinion(op.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded transition cursor-pointer"
                        title="Supprimer cet avis"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {editingOpinionId === op.id ? (
                    <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border-2 border-amber-400">
                      <textarea
                        value={editingOpinionText}
                        onChange={(e) => setEditingOpinionText(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs sm:text-sm font-bold p-3 rounded-xl border border-slate-200 dark:border-slate-800 outline-none focus:border-amber-400 min-h-[80px]"
                        autoFocus
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingOpinionId(null)}
                          className="px-3 py-1 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Annuler
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEditOpinion(op.id)}
                          className="px-3.5 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> Enregistrer
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                      {op.content}
                    </p>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                      onClick={() => handleLikeOpinion(op.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold transition cursor-pointer ${
                        op.hasLiked
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{op.likesCount} d'accord</span>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}

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
