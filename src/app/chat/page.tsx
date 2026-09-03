'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { NewPostModal } from '@/components/modals/NewPostModal';
import { NewChatTopicModal } from '@/components/modals/NewChatTopicModal';
import { Button } from '@/components/ui/Button';
import { getCurrentUserSession } from '@/lib/auth/actions';
import { UserSession } from '@/types';
import {
  MessageSquare,
  PlusCircle,
  Send,
  ShieldCheck,
  Users,
  Sparkles,
  Heart,
  Briefcase,
  GraduationCap,
  Rocket,
  Coffee,
  User,
  Clock,
  MessageSquarePlus,
  Flame,
  Search,
  Filter,
} from 'lucide-react';

export interface UserChatTopic {
  id: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  authorPseudonym: string;
  authorAvatar: string;
  createdAt: string;
  activeCount: number;
  isAdminTopic?: boolean;
}

export interface ChatMessage {
  id: string;
  topicId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  isSelf: boolean;
}

const INITIAL_TOPICS: UserChatTopic[] = [
  {
    id: 'topic-1',
    title: '💬 Salon de Discussion Générale & Entraide',
    categorySlug: 'general',
    categoryName: 'Café & Discussion',
    authorPseudonym: 'Communauté',
    authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=General1',
    createdAt: 'À l\'instant',
    activeCount: 1,
    isAdminTopic: true,
  },
];

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'topic-1': [],
};

export default function ChatPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [topics, setTopics] = useState<UserChatTopic[]>(INITIAL_TOPICS);
  const [activeTopic, setActiveTopic] = useState<UserChatTopic>(INITIAL_TOPICS[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [inputValue, setInputValue] = useState('');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadUser() {
      const currentSession = await getCurrentUserSession();
      setSession(currentSession);
      
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('parlons_en_chat_messages_v2');
        if (saved) {
          try {
            setMessages(JSON.parse(saved));
          } catch (e) {
            console.error("Failed to parse saved chat messages", e);
          }
        }
      }
    }
    loadUser();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && messages) {
      localStorage.setItem('parlons_en_chat_messages_v2', JSON.stringify(messages));
    }
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTopic]);

  const currentPseudonym = session?.anonymousIdentity?.anonymous_name || 'Utilisateur #4821';
  const currentAvatar = session?.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentPseudonym)}`;

  const filteredTopics = activeFilter === 'all'
    ? topics
    : topics.filter((t) => t.categorySlug === activeFilter);

  const currentMessages = messages[activeTopic.id] || [];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputValue.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      topicId: activeTopic.id,
      senderId: session?.user?.id || 'guest',
      senderName: currentPseudonym,
      senderAvatar: currentAvatar,
      content: textToSend,
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages((prev) => ({
      ...prev,
      [activeTopic.id]: [...(prev[activeTopic.id] || []), userMsg],
    }));

    setInputValue('');
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const handleTopicCreated = (topicData: {
    title: string;
    categorySlug: string;
    categoryName: string;
    initialMessage: string;
  }) => {
    const newTopicId = `topic-${Date.now()}`;
    const newTopic: UserChatTopic = {
      id: newTopicId,
      title: topicData.title,
      categorySlug: topicData.categorySlug,
      categoryName: topicData.categoryName,
      authorPseudonym: currentPseudonym,
      authorAvatar: currentAvatar,
      createdAt: "À l'instant",
      activeCount: 1,
    };

    const starterMsg: ChatMessage = {
      id: `msg-starter-${Date.now()}`,
      topicId: newTopicId,
      senderId: session?.user?.id || 'guest',
      senderName: currentPseudonym,
      senderAvatar: currentAvatar,
      content: topicData.initialMessage,
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setTopics((prev) => [newTopic, ...prev]);
    setMessages((prev) => ({
      ...prev,
      [newTopicId]: [starterMsg],
    }));

    setActiveTopic(newTopic);
    setIsNewTopicModalOpen(false);
  };

  const handleEmojiClick = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F0F7FF] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300 antialiased">
      <Header onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 w-full flex flex-col space-y-6 pb-24 md:pb-12">
        
        {/* TOP HEADER & ACTION BANNER */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white rounded-[32px] p-6 sm:p-8 shadow-2xl shadow-blue-600/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-blue-400/30">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-md border border-white/30">
              <ShieldCheck className="w-4 h-4 text-amber-300 shrink-0" />
              <span>Chat Libre & Anonyme</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Sujets de Chat Communautaires
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium leading-relaxed">
              Proposez un sujet de conversation ou rejoignez les salons lancés par d'autres membres en temps réel.
            </p>
          </div>

          <Button
            onClick={() => setIsNewTopicModalOpen(true)}
            variant="primary"
            size="lg"
            leftIcon={<MessageSquarePlus className="w-5 h-5" />}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-xl shadow-amber-400/40 py-3.5 px-6 text-sm sm:text-base border-none shrink-0"
          >
            Proposer un sujet de chat
          </Button>
        </div>

        {/* CATEGORY FILTER TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-xs font-black uppercase text-slate-500 flex items-center gap-1 shrink-0 ml-1">
            <Filter className="w-3.5 h-3.5" /> Thèmes :
          </span>
          {[
            { slug: 'all', name: 'Tous les sujets' },
            { slug: 'relations', name: 'Relations' },
            { slug: 'etudes', name: 'Études' },
            { slug: 'travail', name: 'Travail' },
            { slug: 'entrepreneuriat', name: 'Entrepreneuriat' },
            { slug: 'general', name: 'Café & Général' },
          ].map((tab) => {
            const isActive = activeFilter === tab.slug;
            return (
              <button
                key={tab.slug}
                onClick={() => setActiveFilter(tab.slug)}
                className={`px-4 py-2 rounded-full text-xs font-black transition cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-blue-50 dark:hover:bg-slate-800'
                }`}
              >
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* MAIN CHAT CONTAINER (TOPIC LIST + LIVE CHAT WINDOW) */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          
          {/* LEFT COLUMN: USER CREATED TOPICS LIST */}
          <div className="w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-[32px] p-4 border-2 border-blue-200/80 dark:border-slate-800 shadow-xl shadow-blue-600/10 space-y-3">
            
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Sujets en Direct</span>
              </span>
              <span className="text-[11px] font-black bg-blue-600/10 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {filteredTopics.length} Sujets
              </span>
            </div>

            <div className="space-y-2 overflow-x-auto lg:overflow-y-auto max-h-56 lg:max-h-[500px] flex lg:flex-col gap-2.5 lg:gap-2 pb-1 lg:pb-0 scrollbar-none">
              {filteredTopics.map((topic) => {
                const isActive = activeTopic.id === topic.id;
                return (
                  <button
                    key={topic.id}
                    onClick={() => setActiveTopic(topic)}
                    className={`w-full p-3.5 rounded-2xl transition text-left cursor-pointer shrink-0 lg:shrink space-y-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-white/20 text-white' : 'bg-blue-600/10 text-blue-600 dark:text-blue-400'
                      }`}>
                        {topic.categoryName}
                      </span>
                      <span className={`text-[10px] font-bold ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                        {topic.createdAt}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black line-clamp-2 leading-snug">
                      {topic.title}
                    </h4>

                    <div className="flex items-center justify-between text-[11px] font-bold pt-1 border-t border-white/10 dark:border-slate-800">
                      <div className="flex items-center gap-1.5">
                        <img src={topic.authorAvatar} alt="Avatar" className="w-4 h-4 rounded-full" />
                        <span className="truncate max-w-[100px]">{topic.authorPseudonym}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                        isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}>
                        {topic.activeCount} en ligne
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE CHAT STREAM */}
          <div className="flex-1 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-blue-200/80 dark:border-slate-800 shadow-2xl shadow-blue-600/10 flex flex-col h-[580px] sm:h-[620px] overflow-hidden">
            
            {/* Chat Stream Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between border-b border-blue-500/30 shrink-0">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/30">
                    {activeTopic.categoryName}
                  </span>
                  <span className="text-xs text-blue-100 font-bold">
                    Lancé par {activeTopic.authorPseudonym}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-1">
                  {activeTopic.title}
                </h2>
              </div>

              <div className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black backdrop-blur-md border border-white/30 shrink-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{activeTopic.activeCount} en ligne</span>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50/40 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 scrollbar-thin scrollbar-thumb-blue-400">
              {currentMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 max-w-xl animate-fade-in ${
                    msg.isSelf ? 'ml-auto flex-row-reverse' : ''
                  }`}
                >
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-md overflow-hidden shrink-0">
                    <img
                      src={msg.senderAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover rounded-[14px]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-[11px] font-black ${msg.isSelf ? 'justify-end text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                      <span>{msg.senderName}</span>
                      <span className="text-[10px] font-bold opacity-60">• {msg.createdAt}</span>
                    </div>

                    <div
                      className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold leading-relaxed shadow-sm ${
                        msg.isSelf
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                          : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}

              <div ref={messagesEndRef} />
            </div>

            {/* Emoji Shortcut Bar */}
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none shrink-0">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider shrink-0">Réagir :</span>
              {['💬', '💡', '❤️', '👍', '👏', '🚀', '🔥', '✨'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => handleEmojiClick(emoji)}
                  className="w-7 h-7 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-sm flex items-center justify-center border border-slate-200 dark:border-slate-800 shrink-0 transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Message Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shrink-0">
              <input
                ref={inputRef}
                type="text"
                placeholder={`Tapez votre réponse... (Réponses illimitées)`}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="flex-1 bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 border border-slate-200 dark:border-slate-800 rounded-full px-4 py-3 text-xs sm:text-sm font-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                leftIcon={<Send className="w-4 h-4" />}
                className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-lg border-none px-5 py-3 text-xs sm:text-sm shrink-0"
              >
                Envoyer 🚀
              </Button>
            </form>

          </div>

        </div>

      </main>

      <MobileNav onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      {/* New Post Modal */}
      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        onSuccess={() => {
          setIsNewPostModalOpen(false);
          router.push('/problemes');
        }}
      />

      {/* New Chat Topic Modal */}
      <NewChatTopicModal
        isOpen={isNewTopicModalOpen}
        onClose={() => setIsNewTopicModalOpen(false)}
        onTopicCreated={handleTopicCreated}
      />
    </div>
  );
}
