'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Badge } from '@/components/ui/Badge';
import { ShieldCheck, Send, AlertCircle, MessageSquarePlus } from 'lucide-react';

export interface ChatCategoryOption {
  id: string;
  name: string;
  slug: string;
}

const CHAT_CATEGORIES: ChatCategoryOption[] = [
  { id: 'cat-relations', name: 'Relations & Famille', slug: 'relations' },
  { id: 'cat-etudes', name: 'Études & Orientation', slug: 'etudes' },
  { id: 'cat-travail', name: 'Travail & Carrière', slug: 'travail' },
  { id: 'cat-entrepreneuriat', name: 'Entrepreneuriat & Projets', slug: 'entrepreneuriat' },
  { id: 'cat-general', name: 'Café & Discussion Libre', slug: 'general' },
];

export interface NewChatTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTopicCreated: (topicData: {
    title: string;
    categorySlug: string;
    categoryName: string;
    initialMessage: string;
  }) => void;
}

export const NewChatTopicModal: React.FC<NewChatTopicModalProps> = ({
  isOpen,
  onClose,
  onTopicCreated,
}) => {
  const [selectedCat, setSelectedCat] = useState<ChatCategoryOption>(CHAT_CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMessage("Le titre de votre sujet de chat est obligatoire.");
      return;
    }

    if (!initialMessage.trim()) {
      setErrorMessage("Le message d'amorce est obligatoire pour démarrer l'échange.");
      return;
    }

    onTopicCreated({
      title: title.trim(),
      categorySlug: selectedCat.slug,
      categoryName: selectedCat.name,
      initialMessage: initialMessage.trim(),
    });

    handleReset();
  };

  const handleReset = () => {
    setTitle('');
    setInitialMessage('');
    setErrorMessage(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        <span className="flex items-center gap-2">
          <span>Proposer un sujet de chat</span>
          <Badge variant="blue" size="sm" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
            100% Anonyme
          </Badge>
        </span>
      }
      description="Créez un salon de discussion autour d'une question ou d'une situation. Les autres membres pourront vous rejoindre en temps réel."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-500/10 border border-rose-300 rounded-2xl text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Category Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 ml-1">
            Thématique du sujet *
          </label>
          <div className="flex flex-wrap gap-2 p-2 border-2 border-blue-100 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
            {CHAT_CATEGORIES.map((cat) => {
              const isSelected = selectedCat.id === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-black transition cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Titre de votre sujet de chat *"
          placeholder="Ex : Des retours d'expériences sur le changement de carrière à 30 ans ?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Question ou message d'amorce *"
          placeholder="Posez votre question ou présentez la situation pour ouvrir le débat..."
          value={initialMessage}
          onChange={(e) => setInitialMessage(e.target.value)}
          rows={3}
          required
        />

        <div className="p-3.5 bg-blue-600/10 border border-blue-500/20 rounded-2xl text-xs text-blue-900 dark:text-blue-200 font-bold flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <span>
            Votre salon de chat sera ouvert immédiatement et associé à votre pseudo anonyme avec avatar Bitmoji.
          </span>
        </div>

        <div className="pt-2 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleReset} className="rounded-full">
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<MessageSquarePlus className="w-4 h-4" />}
            className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-lg border-none"
          >
            Lancer le salon 🚀
          </Button>
        </div>
      </form>
    </Modal>
  );
};
