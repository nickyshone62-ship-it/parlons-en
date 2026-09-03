'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, ShieldAlert, Send } from 'lucide-react';

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserPseudonym: string;
  postTitle?: string;
  onConfirmWarning: (reason: string) => void;
}

const PRESET_REASONS = [
  "⚠️ Propos négatifs, agressifs ou irrespectueux envers la communauté",
  "❓ Publication sans sens, absurde ou hors-sujet",
  "🚫 Non-respect de la charte d'entraide et de bienveillance",
  "📢 Spam ou propos répétitifs non constructifs",
];

export const WarningModal: React.FC<WarningModalProps> = ({
  isOpen,
  onClose,
  targetUserPseudonym,
  postTitle,
  onConfirmWarning,
}) => {
  const [selectedReason, setSelectedReason] = useState(PRESET_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = useCustom ? customReason.trim() : selectedReason;
    if (!finalReason) return;
    onConfirmWarning(finalReason);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="⚠️ Mettre en garde un utilisateur">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-amber-500/15 border-2 border-amber-400/60 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-0.5">
            <div className="font-black text-slate-900 dark:text-white">
              Destinataire : <span className="text-amber-600 dark:text-amber-400">{targetUserPseudonym}</span>
            </div>
            {postTitle && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold truncate">
                Sujet concerné : "{postTitle}"
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-black text-slate-800 dark:text-slate-200">
            Motif de la mise en garde :
          </label>

          <div className="space-y-2">
            {PRESET_REASONS.map((reason, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition text-xs font-bold ${
                  !useCustom && selectedReason === reason
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300'
                }`}
              >
                <input
                  type="radio"
                  name="warning_reason"
                  checked={!useCustom && selectedReason === reason}
                  onChange={() => {
                    setUseCustom(false);
                    setSelectedReason(reason);
                  }}
                  className="accent-amber-500"
                />
                <span>{reason}</span>
              </label>
            ))}

            <label
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border-2 cursor-pointer transition text-xs font-bold ${
                useCustom
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-slate-900 dark:text-white shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-amber-300'
              }`}
            >
              <input
                type="radio"
                name="warning_reason"
                checked={useCustom}
                onChange={() => setUseCustom(true)}
                className="accent-amber-500"
              />
              <span>Autre raison spécifique...</span>
            </label>
          </div>

          {useCustom && (
            <textarea
              placeholder="Rédigez le motif de la mise en garde..."
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border-2 border-amber-400 text-xs font-bold outline-none"
              rows={3}
              required
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} size="sm" className="rounded-xl text-xs font-bold">
            Annuler
          </Button>
          <Button
            type="submit"
            size="sm"
            leftIcon={<Send className="w-3.5 h-3.5" />}
            className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs border-none shadow-md"
          >
            Envoyer la Mise en Garde ⚠️
          </Button>
        </div>
      </form>
    </Modal>
  );
};
