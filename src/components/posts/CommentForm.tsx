'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createRealComment } from '@/lib/supabase/posts';
import { Send, ShieldCheck, LogIn } from 'lucide-react';

export interface CommentFormProps {
  postId: string;
  isAuthenticated: boolean;
  onCommentAdded?: () => void;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  postId,
  isAuthenticated,
  onCommentAdded,
}) => {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await createRealComment(postId, content);
      if (!res.success) {
        setErrorMessage(res.error || "Impossible de publier la réponse.");
      } else {
        setContent('');
        if (onCommentAdded) onCommentAdded();
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Erreur inattendue.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-3">
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Vous devez être connecté pour proposer une piste de solution.
        </p>
        <Button
          onClick={() => router.push('/connexion')}
          variant="outline"
          size="sm"
          leftIcon={<LogIn className="w-4 h-4" />}
        >
          Se connecter pour répondre
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white dark:bg-slate-900/80 p-4 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Votre réponse bienveillante
        </label>
        <Badge variant="emerald" size="sm" icon={<ShieldCheck className="w-3 h-3" />}>
          Réponse Anonyme
        </Badge>
      </div>

      <Textarea
        placeholder="Proposez vos conseils ou partagez une expérience similaire pour aider..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={3}
        required
      />

      {errorMessage && (
        <p className="text-xs text-rose-500">{errorMessage}</p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          rightIcon={<Send className="w-4 h-4" />}
        >
          Publier la réponse
        </Button>
      </div>
    </form>
  );
};
