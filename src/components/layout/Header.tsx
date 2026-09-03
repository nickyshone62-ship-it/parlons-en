'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  MessageSquare,
  Search,
  PlusCircle,
  User,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { getCurrentUserSession, signOutUser } from '@/lib/auth/actions';
import { UserSession } from '@/types';

interface HeaderProps {
  onOpenNewPostModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenNewPostModal }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadSession() {
      const res = await getCurrentUserSession();
      setSession(res);
    }
    loadSession();
  }, [pathname]);

  const handleSignOut = async () => {
    await signOutUser();
    setSession(null);
    router.push('/connexion');
    router.refresh();
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const userAvatar = session?.user?.user_metadata?.avatar_url || session?.profile?.avatar_url;
  const anonymousName = session?.anonymousIdentity?.anonymous_name || 'Mon Profil';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-slate-950/90 border-b border-blue-100/60 dark:border-slate-800/80 px-3 sm:px-8 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
        
        {/* Brand Logo Badge */}
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 group shrink-0 cursor-pointer"
            title="Accueil Parlons-En"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center font-black shadow-md shadow-blue-500/25 group-hover:scale-105 transition">
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20" />
            </div>
            <span className="text-base sm:text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent uppercase">
              PARLONS-EN
            </span>
          </Link>

          {/* Main Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-2">
            <Link
              href="/problemes"
              className={`px-3 py-1.5 rounded-full text-xs font-black transition ${
                pathname.startsWith('/problemes')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              Problèmes
            </Link>
            <Link
              href="/chat"
              className={`px-3 py-1.5 rounded-full text-xs font-black transition flex items-center gap-1 ${
                pathname.startsWith('/chat')
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Chat</span>
            </Link>
          </nav>
        </div>

        {/* Global Search Bar (Visible on Mobile & Desktop) */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-1 max-w-xs sm:max-w-md items-center relative order-3 sm:order-2 w-full sm:w-auto"
        >
          <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-1.5 sm:py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition"
          />
        </form>

        {/* Navigation & User Profile (Visible on Mobile & Desktop) */}
        <div className="flex items-center gap-2 sm:gap-3 order-2 sm:order-3">
          {session?.user ? (
            <>
              {onOpenNewPostModal && (
                <Button
                  onClick={onOpenNewPostModal}
                  variant="primary"
                  size="sm"
                  leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
                  className="text-[11px] sm:text-xs font-black rounded-full px-3 py-1.5"
                >
                  Nouveau Problème
                </Button>
              )}

              <Link href="/profil">
                <div className="flex items-center gap-1.5 p-1 pr-2.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800 transition cursor-pointer">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                    {userAvatar ? (
                      <img src={userAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200 truncate max-w-[80px] sm:max-w-[120px]">
                    {anonymousName}
                  </span>
                </div>
              </Link>

              <button
                onClick={handleSignOut}
                className="p-1.5 sm:p-2 text-slate-500 hover:text-rose-500 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Link href="/connexion">
                <Button variant="outline" size="sm" className="text-[11px] sm:text-xs rounded-full px-3 py-1.5">
                  Connexion
                </Button>
              </Link>
              <Link href="/inscription">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<Sparkles className="w-3.5 h-3.5" />}
                  className="text-[11px] sm:text-xs rounded-full px-3 py-1.5"
                >
                  S'inscrire
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};
