'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { Category } from '@/types';
import { createRealPost } from '@/lib/supabase/posts';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { getCurrentUserSession } from '@/lib/auth/actions';
import { MOCK_CATEGORIES } from '@/data/mockData';
import {
  ShieldCheck,
  Send,
  AlertCircle,
  LogIn,
  Heart,
  Briefcase,
  Brain,
  Coins,
  UserX,
  Compass,
  Tag,
  CheckCircle2,
} from 'lucide-react';

const CATEGORY_ICON_MAP: Record<string, React.ReactNode> = {
  'relations-famille': <Heart className="w-4 h-4 text-rose-500" />,
  'travail-etudes': <Briefcase className="w-4 h-4 text-indigo-500" />,
  'sante-mentale': <Brain className="w-4 h-4 text-teal-500" />,
  'finances-budget': <Coins className="w-4 h-4 text-amber-500" />,
  'isolement-solitude': <UserX className="w-4 h-4 text-purple-500" />,
  'orientation-vie': <Compass className="w-4 h-4 text-blue-500" />,
};

export interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories?: Category[];
  isAuthenticated?: boolean;
  onSuccess?: () => void;
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  categories: passedCategories,
  isAuthenticated: passedAuth,
  onSuccess,
}) => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(passedCategories || MOCK_CATEGORIES);
  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAuth, setIsAuth] = useState<boolean>(Boolean(passedAuth));

  useEffect(() => {
    async function loadData() {
      if (isOpen) {
        const session = await getCurrentUserSession();
        setIsAuth(Boolean(session.user));

        const supabase = createBrowserClient();
        const { data: dbCategories } = await supabase.from('categories').select('id, name, slug, icon, description');
        if (dbCategories && dbCategories.length > 0) {
          setCategories(dbCategories as Category[]);
          setSelectedCatId(dbCategories[0].id);
        } else if (passedCategories && passedCategories.length > 0) {
          setCategories(passedCategories);
          setSelectedCatId(passedCategories[0].id);
        } else {
          setCategories(MOCK_CATEGORIES);
          setSelectedCatId(MOCK_CATEGORIES[0].id);
        }
      }
    }
    loadData();
  }, [isOpen, passedCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCatId) {
      setErrorMessage("Veuillez sélectionner une catégorie.");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Le titre de votre problème est obligatoire.");
      return;
    }

    if (!content.trim()) {
      setErrorMessage("La description de votre problème est obligatoire.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await createRealPost(selectedCatId, title, content);
      if (!res.success) {
        setErrorMessage(res.error || "Impossible de publier le problème.");
      } else {
        handleReset();
        if (onSuccess) onSuccess();
        router.push(`/problemes/${res.postId}`);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur lors de la publication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setContent('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        <span className="flex items-center gap-2">
          <span>Publier un problème</span>
          <Badge variant="blue" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            100% Anonyme
          </Badge>
        </span>
      }
      description="Exprimez-vous librement en toute confidentialité. Votre publication sera associée uniquement à votre pseudo anonyme."
      maxWidth="lg"
    >
      {!isAuth ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-14 h-14 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <LogIn className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-lg font-black text-slate-900 dark:text-slate-100">
              Connexion requise
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
              Vous devez être connecté pour publier un problème. Votre identité réelle restera toujours masquée.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={handleReset} className="rounded-full">
              Annuler
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                handleReset();
                router.push('/connexion');
              }}
              leftIcon={<LogIn className="w-4 h-4" />}
              className="rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black border-none"
            >
              Se connecter
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-300 rounded-2xl text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ÉTAPE 1: SÉLECTION DE LA CATÉGORIE (TOTALEMENT SÉPARÉE ET DISTINCTE) */}
          <div className="space-y-4 p-5 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950 rounded-3xl border-2 border-blue-300/80 dark:border-slate-800 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60 dark:border-slate-800">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400">
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black shadow-md">1</span>
                <span>Étape 1 : Sélectionnez la Catégorie Concernée</span>
              </div>
              {selectedCatId && (
                <span className="text-[11px] font-black text-blue-700 dark:text-blue-300 bg-blue-600/10 px-3 py-1 rounded-full border border-blue-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  {categories.find(c => c.id === selectedCatId)?.name}
                </span>
              )}
            </div>

            {/* Menu Déroulant de Sélection Rapide */}
            <div className="space-y-1.5">
              <label htmlFor="category-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                📌 Choisissez dans la liste déroulante :
              </label>
              <select
                id="category-select"
                value={selectedCatId}
                onChange={(e) => setSelectedCatId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border-2 border-blue-400/80 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-extrabold text-xs sm:text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition cursor-pointer shadow-sm"
                required
              >
                <option value="" disabled>-- Choisir une catégorie --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="py-2 text-slate-900 font-bold">
                    {cat.name} {cat.description ? `(${cat.description})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cartes Individuelles & Totalement Séparées pour chaque Catégorie */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                ✨ Ou cliquez directement sur la catégorie de votre choix ci-dessous :
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-64 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-blue-400">
                {categories.map((cat) => {
                  const isSelected = selectedCatId === cat.id;
                  const icon = CATEGORY_ICON_MAP[cat.slug] || <Tag className="w-4 h-4 text-blue-500" />;
                  
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={`p-3.5 rounded-2xl transition-all duration-200 cursor-pointer relative flex items-start gap-3 border-2 shadow-sm ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white border-blue-600 shadow-xl shadow-blue-500/30 scale-[1.02] ring-2 ring-blue-400/50'
                          : 'bg-white dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/80 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
                          isSelected
                            ? 'bg-white/20 text-white border border-white/30 backdrop-blur-md'
                            : 'bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-slate-600'
                        }`}
                      >
                        {icon}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-black text-xs sm:text-sm tracking-tight truncate">
                            {cat.name}
                          </span>
                          {isSelected && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 shadow-sm">
                              Sélectionné
                            </span>
                          )}
                        </div>

                        {cat.description && (
                          <p className={`text-[11px] font-medium leading-relaxed line-clamp-2 ${
                            isSelected ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'
                          }`}>
                            {cat.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SÉPARATION NETTE ENTRE LA CATÉGORIE ET LE FORMULAIRE DE RÉDACTION */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-dashed border-blue-300 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs font-black uppercase tracking-wider">
              <span className="bg-white dark:bg-slate-900 px-4 text-blue-700 dark:text-blue-400 font-black flex items-center gap-2 border border-blue-200 dark:border-slate-800 rounded-full py-1 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
                Étape 2 : Rédaction du Problème
              </span>
            </div>
          </div>

          {/* ÉTAPE 2: DETAILS DU PROBLEME */}
          <div className="space-y-4 p-4 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border-2 border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
              <span>Étape 2 : Détails de votre situation</span>
            </div>

            <Input
              label="Titre de votre sujet *"
              placeholder="Ex : Comment gérer la pression et l'épuisement au quotidien ?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <Textarea
              label="Description détaillée *"
              placeholder="Décrivez votre situation, ce que vous ressentez et les conseils ou retours d'expériences que vous cherchez..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              required
            />
          </div>

          <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-xs text-blue-900 dark:text-blue-200 font-bold flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              Votre publication sera liée exclusivement à votre pseudo anonyme neutre pour garantir votre entière confidentialité.
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button variant="outline" onClick={handleReset} className="rounded-full">
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              rightIcon={<Send className="w-4 h-4" />}
              className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-lg border-none"
            >
              Publier anonymement
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
