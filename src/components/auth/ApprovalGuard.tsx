'use client';

import React, { useEffect, useState } from 'react';
import { getCurrentUserSession, signOutUser, isAdminUser } from '@/lib/auth/actions';
import { checkUserApprovalStatus, checkUserApprovalStatusAsync } from '@/lib/admin/approval';
import { UserSession } from '@/types';
import { Button } from '@/components/ui/Button';
import { ShieldAlert, Clock, RefreshCw, LogOut, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

export interface ApprovalGuardProps {
  children: React.ReactNode;
}

export const ApprovalGuard: React.FC<ApprovalGuardProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'rejected' | 'none'>('none');
  const [isChecking, setIsChecking] = useState(true);

  const checkStatus = async () => {
    setIsChecking(true);
    try {
      const currentSession = await getCurrentUserSession();
      setSession(currentSession);

      if (currentSession?.user) {
        // Admin account always bypasses approval guard completely
        if (isAdminUser(currentSession)) {
          setApprovalStatus('approved');
          setIsChecking(false);
          return;
        }

        const status = await checkUserApprovalStatusAsync(currentSession.user.id, currentSession.user.email);
        setApprovalStatus(status);
      } else {
        setApprovalStatus('approved'); // Visitors without account can browse public areas
      }
    } catch (e) {
      setApprovalStatus('approved');
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    setSession(null);
    setApprovalStatus('approved');
    router.push('/connexion');
  };

  // If user is on /admin, /connexion or /inscription, bypass approval screen so admin can login or user can sign out
  const isAuthOrAdminPage = pathname === '/admin' || pathname === '/connexion' || pathname === '/inscription';

  if (!isAuthOrAdminPage && session?.user && (approvalStatus === 'pending' || approvalStatus === 'rejected')) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 antialiased font-sans relative overflow-hidden">
        {/* Background Decorative Glow */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-lg w-full bg-slate-900/90 border border-slate-800 rounded-[36px] p-6 sm:p-10 shadow-2xl backdrop-blur-2xl text-center space-y-6 relative z-10 animate-fade-in">
          
          {/* Animated Status Icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl border ${
              approvalStatus === 'rejected'
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-500'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}>
              {approvalStatus === 'rejected' ? (
                <AlertCircle className="w-12 h-12" />
              ) : (
                <Clock className="w-12 h-12 animate-pulse" />
              )}
            </div>
            <span className={`absolute -bottom-1 right-0 w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-black ${
              approvalStatus === 'rejected' ? 'bg-rose-500 text-white' : 'bg-amber-400 text-slate-950'
            }`}>
              !
            </span>
          </div>

          {/* Badge & Title */}
          <div className="space-y-2">
            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black border ${
              approvalStatus === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              <ShieldAlert className="w-4 h-4" />
              <span>
                {approvalStatus === 'rejected'
                  ? 'Compte Non Approuvé'
                  : 'Compte en Attente d\'Approbation'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-snug">
              {approvalStatus === 'rejected'
                ? 'Accès refusé par l\'administrateur'
                : 'Approbation de votre compte requise'}
            </h1>
          </div>

          {/* Message Body */}
          <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            {approvalStatus === 'rejected'
              ? 'Votre compte n\'a pas été validé par l\'administrateur. Si vous pensez qu\'il s\'agit d\'une erreur, veuillez contacter l\'assistance.'
              : 'Bienvenue sur Parlons-En ! Pour garantir la sécurité et la confidentialité de la communauté, l\'administrateur doit approuver votre compte avant de vous accorder l\'accès à l\'ensemble des espaces.'}
          </p>

          {/* User Email & Account Details Card */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Compte :</span>
              <span className="text-white font-black">{session.user.email}</span>
            </div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 pt-1 border-t border-slate-800/80">
              <span>Pseudonyme :</span>
              <span className="text-amber-400 font-black">{session.anonymousIdentity?.anonymous_name || 'Utilisateur'}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Button
              onClick={checkStatus}
              isLoading={isChecking}
              variant="primary"
              size="md"
              leftIcon={<RefreshCw className="w-4 h-4" />}
              className="w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-lg border-none"
            >
              Vérifier mon statut
            </Button>

            <Button
              onClick={handleSignOut}
              variant="outline"
              size="md"
              leftIcon={<LogOut className="w-4 h-4 text-slate-400" />}
              className="w-full rounded-full border-slate-700 hover:bg-slate-800 text-slate-300 font-bold"
            >
              Se déconnecter
            </Button>
          </div>

        </div>
      </div>
    );
  }

  return <>{children}</>;
};
