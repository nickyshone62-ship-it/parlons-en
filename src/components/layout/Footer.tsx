'use client';

import React from 'react';
import { ShieldCheck, Heart, MessageSquare } from 'lucide-react';
import { resetPlatformToZero } from '@/lib/resetData';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-24 md:pb-12 mt-16 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white font-bold">
                <MessageSquare className="w-5 h-5 fill-white/20" />
              </div>
              <span className="text-xl font-bold text-slate-100 tracking-tight">
                PARLONS-EN
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md leading-relaxed">
              Une plateforme communautaire bienveillante et sécurisée. Expose anonymement tes difficultés et trouve des pistes de solution concrètes grâce à l'écoute de la communauté.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 p-2.5 rounded-xl border border-emerald-500/20 max-w-sm">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Anonymat garanti • Aucune donnée personnelle revendue</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <a href="#" className="hover:text-emerald-400 transition">
                  Accueil
                </a>
              </li>
              <li>
                <a href="#discussions" className="hover:text-emerald-400 transition">
                  Discussions Populaires
                </a>
              </li>
              <li>
                <a href="#categories" className="hover:text-emerald-400 transition">
                  Toutes les Catégories
                </a>
              </li>
              <li>
                <a href="#comment-ca-marche" className="hover:text-emerald-400 transition">
                  Comment ça marche ?
                </a>
              </li>
            </ul>
          </div>

          {/* Charte & Respect */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              Charte & Respect
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>Écoute active & Non-jugement</li>
              <li>Soutien mutuel bienveillant</li>
              <li>Modération communautaire</li>
              <li>Lignes d'assistance d'urgence</li>
            </ul>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} PARLONS-EN — Socle UI/UX Communautaire Anonyme.</p>
          <div className="flex items-center gap-4">
            <button
              onClick={() => resetPlatformToZero()}
              className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-1 rounded border border-rose-500/30 transition cursor-pointer"
              title="Effacer les données locales, déconnecter les sessions et repartir à zéro"
            >
              🔄 Retour
            </button>
            <p className="flex items-center gap-1">
              Conçu avec <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> pour l'entraide.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
