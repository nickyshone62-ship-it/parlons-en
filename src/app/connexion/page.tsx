'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { signInUser } from '@/lib/auth/actions';
import { Mail, Lock, ShieldCheck, LogIn, AlertCircle, MessageSquare } from 'lucide-react';

export default function ConnexionPage() {
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
        setErrorMessage(res.error || 'Identifiants incorrects.');
      } else {
        if (typeof window !== 'undefined') {
          localStorage.setItem('parlons_en_has_seen_onboarding', 'true');
        }
        if (res.isAdmin) {
          router.push('/admin');
        } else {
          router.push('/');
        }
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erreur inattendue.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header />

      {/* Main Container with generous spacing for 100% mobile visibility */}
      <main className="flex-1 flex items-start sm:items-center justify-center px-3 sm:px-6 pt-3 sm:pt-6 pb-36 md:pb-12">
        
        {/* Compact & Super High-Contrast Card */}
        <div className="w-full max-w-md rounded-[32px] bg-white dark:bg-slate-900 shadow-2xl shadow-blue-600/20 overflow-hidden border-2 border-blue-300/80 dark:border-slate-800 p-4 sm:p-7 space-y-4">
          
          {/* Header & Logo Badge */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-blue-600/10 text-blue-800 dark:text-blue-300 text-xs font-black border border-blue-500/20">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Espace Membre Anonyme</span>
            </div>

            {/* Compact Brand Logo Badge */}
            <div className="relative w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                <div className="w-11 h-11 sm:w-15 sm:h-15 rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-inner">
                  <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 fill-white/20 text-white stroke-[2]" />
                </div>
              </div>
            </div>

            <div className="space-y-0.5">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white tracking-tight">
                Se connecter
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold">
                Retrouve ton espace et tes échanges en toute sécurité.
              </p>
            </div>
          </div>

          {/* Form Fields with High Contrast */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 bg-rose-500/15 border border-rose-400 rounded-2xl text-rose-700 dark:text-rose-300 font-extrabold text-xs flex items-center gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
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

            {/* High-Contrast Action CTA Button */}
            <div className="pt-1">
              <Button
                type="submit"
                variant="primary"
                isLoading={isLoading}
                leftIcon={<LogIn className="w-5 h-5" />}
                className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-xl shadow-amber-400/40 py-3 text-base border-none tracking-wide"
              >
                Se connecter
              </Button>
            </div>
          </form>

          {/* Super High-Contrast Bottom Link (Clear Spacing Above Bottom Nav) */}
          <div className="pt-3 pb-3 border-t border-blue-200 dark:border-slate-800 text-center text-xs font-black text-slate-700 dark:text-slate-300">
            <span>Pas encore inscrit ?</span>{' '}
            <Link
              href="/inscription"
              className="font-black text-blue-700 dark:text-blue-300 hover:text-blue-900 underline underline-offset-4 text-sm ml-1 inline-block py-1"
            >
              Créer un compte
            </Link>
          </div>

        </div>
      </main>

      <MobileNav />
    </div>
  );
}
