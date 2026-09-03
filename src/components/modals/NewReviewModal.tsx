'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Star, Send, AlertCircle, Sparkles } from 'lucide-react';
import { createRealUserReview } from '@/lib/supabase/reviews';

export interface NewReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  currentPseudonym?: string;
  currentAvatar?: string;
}

export const NewReviewModal: React.FC<NewReviewModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPseudonym = 'Utilisateur Anonyme',
  currentAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Guest',
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!content.trim()) {
      setErrorMessage("Veuillez rédiger un commentaire pour exprimer votre avis.");
      return;
    }

    if (content.trim().length < 10) {
      setErrorMessage("Votre avis doit contenir au moins 10 caractères.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await createRealUserReview(rating, content);
      if (res.success) {
        setContent('');
        setRating(5);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setErrorMessage(res.error || "Impossible d'enregistrer l'avis.");
      }
    } catch (e: any) {
      setErrorMessage(e?.message || "Erreur lors de la publication de l'avis.");
    } finally {
      setIsLoading(false);
    }
  };

  const activeRating = hoverRating || rating;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <span className="flex items-center gap-2">
          <span>Donner votre avis sur la plateforme</span>
          <Badge variant="amber" size="sm" icon={<Star className="w-3.5 h-[#FFFC00] text-amber-500 fill-amber-400" />}>
            Avis Public
          </Badge>
        </span>
      }
      description="Partagez votre expérience sur PARLONS-EN. Votre avis sera visible par l'ensemble des visiteurs et membres de la communauté."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/15 border border-rose-400 rounded-2xl text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Rating Selector */}
        <div className="space-y-2 text-center bg-amber-400/10 dark:bg-slate-900 p-4 rounded-3xl border border-amber-300/40 dark:border-slate-800">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Votre note globale *
          </label>

          <div className="flex items-center justify-center gap-2 py-1">
            {[1, 2, 3, 4, 5].map((starNum) => (
              <button
                key={starNum}
                type="button"
                onMouseEnter={() => setHoverRating(starNum)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(starNum)}
                className="p-1 text-2xl transition transform hover:scale-125 focus:outline-none cursor-pointer"
              >
                <Star
                  className={`w-8 h-8 ${
                    starNum <= activeRating
                      ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                      : 'text-slate-300 dark:text-slate-700'
                  }`}
                />
              </button>
            ))}
          </div>

          <p className="text-xs font-black text-amber-600 dark:text-amber-400">
            {activeRating === 5 && "⭐ Excellent ! Une expérience exceptionnelle !"}
            {activeRating === 4 && "⭐ Très satisfait ! La plateforme m'aide beaucoup."}
            {activeRating === 3 && "⭐ Moyen. Utile mais peut encore s'améliorer."}
            {activeRating === 2 && "⭐ Décevant. Des choses à revoir."}
            {activeRating === 1 && "⭐ Insatisfaisant."}
          </p>
        </div>

        {/* User Identity Card */}
        <div className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="w-10 h-10 rounded-full border-2 border-amber-400 overflow-hidden shrink-0">
            <img src={currentAvatar} alt="Avatar" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>{currentPseudonym}</span>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[10px] text-slate-500 font-bold">Votre pseudo anonyme sera affiché sur l'avis</span>
          </div>
        </div>

        {/* Content Textarea */}
        <Textarea
          label="Votre témoignage ou avis *"
          placeholder="Racontez comment la plateforme vous a aidé(e) ou donnez vos impressions sincères..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          required
        />

        {/* Submit Bar */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" type="button" onClick={onClose} className="rounded-full">
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Send className="w-4 h-4" />}
            className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-lg border-none px-6"
          >
            Publier mon avis 🚀
          </Button>
        </div>
      </form>
    </Modal>
  );
};
