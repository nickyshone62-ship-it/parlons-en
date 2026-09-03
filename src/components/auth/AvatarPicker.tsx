'use client';

import React, { useState } from 'react';
import { CHARACTER_AVATARS, AvatarOption } from '@/data/avatars';
import { Check, Dices, Sparkles, User } from 'lucide-react';

interface AvatarPickerProps {
  selectedAvatar: AvatarOption;
  onSelectAvatar: (avatar: AvatarOption) => void;
}

const SNAPCHAT_GRADIENTS = [
  'from-[#FFFC00] via-yellow-400 to-amber-500',
  'from-amber-400 via-[#FFFC00] to-yellow-400',
  'from-pink-500 via-rose-500 to-purple-600',
  'from-purple-500 via-indigo-500 to-blue-600',
  'from-cyan-400 via-teal-400 to-emerald-500',
  'from-amber-400 via-orange-500 to-red-500',
];

export function AvatarPicker({ selectedAvatar, onSelectAvatar }: AvatarPickerProps) {
  const [randomSeed, setRandomSeed] = useState<number>(0);
  const [showMoreModal, setShowMoreModal] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'all' | 'female' | 'male' | 'streetwear' | 'sunglasses'>('all');
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const filteredAvatars = CHARACTER_AVATARS.filter((avatar) => {
    if (activeTab === 'female') return avatar.gender === 'female';
    if (activeTab === 'male') return avatar.gender === 'male';
    if (activeTab === 'streetwear') return avatar.category === 'streetwear';
    if (activeTab === 'sunglasses') return avatar.category === 'sunglasses';
    return true;
  });

  const femaleCount = CHARACTER_AVATARS.filter((a) => a.gender === 'female').length;
  const maleCount = CHARACTER_AVATARS.filter((a) => a.gender === 'male').length;

  const handleImageError = (id: string) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  const handleGenerateRandom = () => {
    const randomIndex = Math.floor(Math.random() * CHARACTER_AVATARS.length);
    onSelectAvatar(CHARACTER_AVATARS[randomIndex]);
  };

  return (
    <div className="space-y-2.5 w-full max-w-full">
      {/* Snapchat Themed Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5 min-w-0">
          <span className="w-5 h-5 rounded-full bg-[#FFFC00] text-slate-950 flex items-center justify-center font-black text-[10px] shadow-xs shrink-0">
            👻
          </span>
          <span className="truncate">Bitmoji Snapchat (100 Dispo)</span>
        </label>

        <button
          type="button"
          onClick={handleGenerateRandom}
          className="flex items-center gap-1 px-2.5 py-1 bg-[#FFFC00] hover:bg-yellow-300 active:scale-95 text-slate-950 font-black rounded-full text-[11px] sm:text-xs transition shrink-0 shadow-md border border-yellow-400 cursor-pointer"
          title="Tirer un Bitmoji Snapchat au hasard"
        >
          <Dices className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Aléatoire 🎲</span>
        </button>
      </div>

      {/* Snapchat Gender & Category Filter Pills */}
      <div className="flex items-center gap-1 text-[11px] overflow-x-auto pb-0.5 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-0.5 rounded-full font-black transition shrink-0 ${
            activeTab === 'all'
              ? 'bg-[#FFFC00] text-slate-950 shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          ✨ Tous (100)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('female')}
          className={`px-2.5 py-0.5 rounded-full font-black transition shrink-0 ${
            activeTab === 'female'
              ? 'bg-[#FFFC00] text-slate-950 shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          👩 Féminins ({femaleCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('male')}
          className={`px-2.5 py-0.5 rounded-full font-black transition shrink-0 ${
            activeTab === 'male'
              ? 'bg-[#FFFC00] text-slate-950 shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          👨 Masculins ({maleCount})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('streetwear')}
          className={`px-2.5 py-0.5 rounded-full font-black transition shrink-0 ${
            activeTab === 'streetwear'
              ? 'bg-[#FFFC00] text-slate-950 shadow-xs'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}
        >
          🧢 Streetwear
        </button>
      </div>

      {/* Ultra-compact horizontal row of avatars */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-1 pr-6 scrollbar-none">
        {filteredAvatars.slice(0, 10).map((avatar) => {
          const isSelected = selectedAvatar.id === avatar.id;
          const isFailed = failedImages[avatar.id];

          return (
            <button
              key={avatar.id}
              type="button"
              onClick={() => onSelectAvatar(avatar)}
              className={`relative p-0.5 rounded-2xl border transition-all duration-150 outline-none shrink-0 ${
                isSelected
                  ? 'border-[#FFFC00] bg-[#FFFC00]/30 ring-4 ring-[#FFFC00] scale-105 shadow-lg z-10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:scale-105'
              }`}
            >
              <div
                className={`relative w-9 h-9 rounded-xl bg-gradient-to-br ${avatar.gradient} flex items-center justify-center shadow-xs overflow-hidden`}
              >
                {!isFailed ? (
                  <img
                    src={avatar.url}
                    alt="Bitmoji Snapchat"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImageError(avatar.id)}
                  />
                ) : (
                  <User className="w-4 h-4 text-slate-900" />
                )}
              </div>

              {isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FFFC00] text-slate-950 rounded-full flex items-center justify-center shadow font-black text-[10px] border border-slate-900">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}

        {/* Modal Opener button */}
        <button
          type="button"
          onClick={() => setShowMoreModal(true)}
          className="w-9 h-9 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md transition mr-2 gap-0.5"
          title="Voir toute la collection de 100 Bitmojis Snapchat"
        >
          <span>+{filteredAvatars.length > 10 ? filteredAvatars.length - 10 : 90}</span>
        </button>
      </div>

      {/* Popover / Modal for all 100 Bitmoji Snapchat avatars */}
      {showMoreModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border-2 border-yellow-400/40 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl space-y-4 shadow-2xl animate-fade-in text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#FFFC00] text-slate-950 flex items-center justify-center font-black text-xs shadow-xs">
                  👻
                </span>
                <span>Collection de 100 Bitmojis Stylés ({femaleCount} 👩 / {maleCount} 👨)</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowMoreModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Filter Tabs in Modal */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-full text-xs font-black transition ${
                  activeTab === 'all'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                ✨ Tous (100)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('female')}
                className={`px-3 py-1 rounded-full text-xs font-black transition ${
                  activeTab === 'female'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                👩 Féminins ({femaleCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('male')}
                className={`px-3 py-1 rounded-full text-xs font-black transition ${
                  activeTab === 'male'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                👨 Masculins ({maleCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('streetwear')}
                className={`px-3 py-1 rounded-full text-xs font-black transition ${
                  activeTab === 'streetwear'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                🧢 Streetwear
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sunglasses')}
                className={`px-3 py-1 rounded-full text-xs font-black transition ${
                  activeTab === 'sunglasses'
                    ? 'bg-[#FFFC00] text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                🕶️ Lunettes
              </button>
            </div>

            {/* Grid of 100 Avatars */}
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2.5 max-h-80 overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-amber-400">
              {filteredAvatars.map((avatar) => {
                const isSelected = selectedAvatar.id === avatar.id;
                return (
                  <button
                    key={avatar.id}
                    type="button"
                    onClick={() => {
                      onSelectAvatar(avatar);
                      setShowMoreModal(false);
                    }}
                    className={`relative p-1 rounded-2xl border flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-[#FFFC00] ring-4 ring-[#FFFC00] scale-110 bg-yellow-400/20 z-10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-yellow-400 hover:scale-105 bg-slate-50 dark:bg-slate-950'
                    }`}
                  >
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatar.gradient} overflow-hidden shadow-xs flex items-center justify-center`}>
                      <img src={avatar.url} alt="Bitmoji Snapchat" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

