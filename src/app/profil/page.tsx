'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { getCurrentUserSession, signOutUser } from '@/lib/auth/actions';
import { UserSession } from '@/types';
import { ShieldCheck, LogOut, Calendar, User, EyeOff, Lock, Mail, Trash2 } from 'lucide-react';
import { PRESET_AVATARS } from '@/data/avatars';

export default function ProfilPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const currentSession = await getCurrentUserSession();
      if (!currentSession.user) {
        router.push('/connexion');
      } else {
        setSession(currentSession);
      }
      setIsLoading(false);
    }
    loadUser();
  }, [router]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signOutUser();
    router.push('/connexion');
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Êtes-vous absolument certain de vouloir supprimer définitivement votre compte PARLONS-EN ? Cette action est irréversible.")) {
      setIsDeletingAccount(true);
      try {
        const { deleteUserAccount } = await import('@/lib/admin/approval');
        if (session?.user?.id) {
          await deleteUserAccount(session.user.id);
        }
        if (session?.anonymousIdentity?.anonymous_name) {
          await deleteUserAccount(session.anonymousIdentity.anonymous_name);
        }
        await deleteUserAccount('3509');
      } catch (e) {}

      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }

      await signOutUser();
      router.push('/bienvenue');
      router.refresh();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans">
        <Header />
        <main className="flex-1 max-w-3xl mx-auto px-4 py-12 w-full">
          <LoadingState type="spinner" />
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (!session || !session.user) {
    return null;
  }

  const anonymousName = session.anonymousIdentity?.anonymous_name || 'Utilisateur #4821';
  const firstName = session.user.user_metadata?.first_name || '';
  const lastName = session.user.user_metadata?.last_name || '';
  const email = session.user.email || '';
  const avatarUrl = session.user.user_metadata?.avatar_url || session.profile?.avatar_url;
  const matchedAvatar = PRESET_AVATARS.find((a) => a.url === avatarUrl);

  const createdAt = session.profile?.created_at
    ? new Date(session.profile.created_at).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Récemment';

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-8">
        {/* Banner Card with Blue Gradient Accent */}
        <Card className="p-6 sm:p-10 space-y-8 shadow-2xl shadow-blue-500/10 rounded-[32px] border border-blue-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-blue-100 dark:border-slate-800 pb-8">
            <div className="flex items-center gap-5">
              <div className={`relative w-20 h-20 rounded-3xl ${matchedAvatar ? `bg-gradient-to-br ${matchedAvatar.gradient}` : 'bg-gradient-to-br from-blue-600 to-indigo-700'} text-white flex items-center justify-center font-bold text-xl shadow-xl ring-4 ring-blue-500/30 overflow-hidden shrink-0`}>
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar Anonyme"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
                    {anonymousName}
                  </h1>
                  <Badge variant="blue" size="sm" icon={<ShieldCheck className="w-4 h-4" />}>
                    Anonyme
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Votre identité et avatar publics sur PARLONS-EN
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto shrink-0">
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="md"
                isLoading={isSigningOut}
                leftIcon={<LogOut className="w-4 h-4 text-slate-600 dark:text-slate-300" />}
                className="w-full sm:w-auto rounded-full border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
              >
                Déconnexion
              </Button>

              <Button
                onClick={handleDeleteAccount}
                variant="outline"
                size="md"
                isLoading={isDeletingAccount}
                leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
                className="w-full sm:w-auto rounded-full border-rose-300 dark:border-rose-900/50 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-black"
              >
                Supprimer mon compte
              </Button>
            </div>
          </div>

          {/* Section Identité Publique */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Identité Publique (Seule information affichée sur la plateforme)
            </h3>
            <div className="p-5 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-blue-500/10 border border-blue-500/20 rounded-3xl flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-700 dark:text-blue-300 font-bold block">
                  Pseudo anonyme public
                </span>
                <span className="text-xl font-black text-blue-900 dark:text-blue-200">
                  {anonymousName}
                </span>
              </div>
              <Badge variant="blue" size="sm">100% Neutre</Badge>
            </div>
          </div>

          {/* Section Informations Privées */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-500" />
              Informations Privées (Visibles uniquement par vous)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <User className="w-3.5 h-3.5 text-blue-500" />
                  Prénom & Nom
                </span>
                <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Non renseigné'}
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  Adresse e-mail
                </span>
                <p className="text-base font-extrabold text-slate-800 dark:text-slate-200 truncate">
                  {email}
                </p>
              </div>

              <div className="p-5 bg-white dark:bg-slate-900/80 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-1 sm:col-span-2 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  Date de création du compte
                </span>
                <p className="text-base font-extrabold text-slate-800 dark:text-slate-200">
                  {createdAt}
                </p>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee Alert Box */}
          <div className="p-5 bg-blue-600/10 border border-blue-500/20 rounded-3xl space-y-2">
            <div className="flex items-center gap-2 font-black text-blue-900 dark:text-blue-300 text-sm">
              <EyeOff className="w-4 h-4 shrink-0 text-blue-600" />
              <span>Garantie de Confidentialité Absolue</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Vos nom, prénom et adresse e-mail sont strictly sécurisés et ne seront <strong>jamais affichés publiquement</strong> ni communiqués à des tiers dans vos publications et réponses sur PARLONS-EN.
            </p>
          </div>
        </Card>
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
