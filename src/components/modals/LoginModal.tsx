'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signInUser } from '@/lib/auth/actions';
import { Lock, Mail, AlertCircle, LogIn } from 'lucide-react';

export interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Veuillez remplir tous les champs.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await signInUser(email, password);
      if (!res.success) {
        setErrorMessage(res.error || 'Connexion échouée.');
      } else {
        onClose();
        if (res.isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur lors de la connexion.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Connexion Sécurisée"
      description="Connecte-toi à ton espace anonyme pour retrouver tes échanges."
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <Input
          label="Adresse e-mail"
          type="email"
          placeholder="votre.email@exemple.com"
          leftIcon={<Mail className="w-4 h-4" />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="w-4 h-4" />}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="w-full"
          >
            Se connecter
          </Button>
        </div>

        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Pas encore de compte ?{' '}
          <Link
            href="/inscription"
            onClick={onClose}
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </form>
    </Modal>
  );
};
