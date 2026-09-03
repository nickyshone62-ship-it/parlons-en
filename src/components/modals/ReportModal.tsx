'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { reportContent } from '@/lib/supabase/posts';
import { Flag, CheckCircle2, ShieldAlert } from 'lucide-react';

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId?: string;
  commentId?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  postId,
  commentId,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setIsLoading(true);
    try {
      const res = await reportContent(postId, commentId, reason);
      if (res.success) {
        setIsSuccess(true);
      }
    } catch {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setReason('');
    setIsSuccess(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={
        <span className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
          <Flag className="w-5 h-5 text-rose-500" />
          <span>Signaler un contenu</span>
        </span>
      }
      description="Si ce contenu enfreint la charte de bienveillance ou est inapproprié, signalez-le à l'équipe de modération."
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-slate-800 dark:text-slate-100">
              Signalement transmis
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Merci de nous aider à maintenir PARLONS-EN un espace bienveillant et sécurisé.
            </p>
          </div>
          <Button onClick={handleReset} variant="outline" size="sm">
            Fermer
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            label="Motif du signalement"
            placeholder="Explicitez brièvement pourquoi ce contenu vous semble inapproprié..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            required
          />

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              Chaque signalement est examiné de façon neutre et confidentielle par l'équipe de modération.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" onClick={handleReset} size="sm">
              Annuler
            </Button>
            <Button type="submit" variant="danger" size="sm" isLoading={isLoading}>
              Envoyer le signalement
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
