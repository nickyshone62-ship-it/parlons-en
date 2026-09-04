'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Home, MessageCircle, Plus, Bell, User, ShieldCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getCurrentUserSession, isAdminUser } from '@/lib/auth/actions';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface MobileNavProps {
  onOpenNewPostModal?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenNewPostModal }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      const session = await getCurrentUserSession();
      setIsAuthenticated(Boolean(session.user));
      setIsAdmin(isAdminUser(session));
    }
    checkAuth();
  }, [pathname]);

  const handleProfilClick = () => {
    if (isAuthenticated) {
      router.push('/profil');
    } else {
      router.push('/connexion');
    }
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 px-3 py-2 shadow-2xl">
      <nav className="flex items-center justify-around">
        {/* Accueil */}
        <Link
          href="/"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer min-w-[56px]',
            pathname === '/'
              ? 'text-blue-600 dark:text-blue-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-extrabold mt-1">Accueil</span>
        </Link>

        {/* Chat Communautaire */}
        <Link
          href="/chat"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer min-w-[56px] relative',
            pathname.startsWith('/chat')
              ? 'text-blue-600 dark:text-blue-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <div className="relative">
            <MessageCircle className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] font-extrabold mt-1">Chat</span>
        </Link>

        {/* Publier */}
        <button
          onClick={onOpenNewPostModal}
          className="flex flex-col items-center justify-center -mt-5 cursor-pointer group"
          aria-label="Publier un nouveau problème"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 group-active:scale-95 transition">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
            Publier
          </span>
        </button>

        {/* Admin Link if Admin */}
        {isAdmin && (
          <Link
            href="/admin"
            className={cn(
              'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[48px]',
              pathname.startsWith('/admin')
                ? 'text-amber-500 font-black'
                : 'text-amber-600 dark:text-amber-400 hover:text-amber-500'
            )}
          >
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-extrabold mt-1 text-amber-500">Admin</span>
          </Link>
        )}

        {/* Profil */}
        <button
          onClick={handleProfilClick}
          className={cn(
            'flex flex-col items-center justify-center py-1 px-2 rounded-xl transition cursor-pointer min-w-[48px]',
            pathname === '/profil'
              ? 'text-blue-600 dark:text-blue-400 font-black'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          )}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-extrabold mt-1">Profil</span>
        </button>

      </nav>
    </div>
  );
};
