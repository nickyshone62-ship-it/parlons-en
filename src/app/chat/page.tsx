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
  ArrowDown,
  LogIn,
  Trash2,
} from 'lucide-react';

import {
  UserChatTopic,
  ChatMessage,
  INITIAL_TOPICS,
  subscribeToRealtimeChat,
  broadcastChatMessage,
  broadcastChatTopic,
  fetchAllChatTopics,
  fetchAllChatMessages,
  deleteChatMessage,
  deleteAllChatMessages,
} from '@/lib/supabase/chat';

const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'topic-1': [],
};

export default function ChatPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [topics, setTopics] = useState<UserChatTopic[]>(INITIAL_TOPICS);
  const [activeTopic, setActiveTopic] = useState<UserChatTopic>(INITIAL_TOPICS[0]);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>(INITIAL_MESSAGES);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileTab, setMobileTab] = useState<'topics' | 'chat'>('chat');
  const [inputValue, setInputValue] = useState('');
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isScrolledUpRef = useRef(false);
  const [showScrollBottomBtn, setShowScrollBottomBtn] = useState(false);

  useEffect(() => {
    let unsubscribeFunc: (() => void) | null = null;

    async function loadData() {
      const currentSession = await getCurrentUserSession();
      setSession(currentSession);
      
      const userId = currentSession?.user?.id || 'guest';
      const pseudo = currentSession?.anonymousIdentity?.anonymous_name || 'Utilisateur #4821';

      // Load initial topics and messages from DB + LocalStorage
      const loadedTopics = await fetchAllChatTopics();
      if (loadedTopics.length > 0) {
        setTopics(loadedTopics);
        setActiveTopic(loadedTopics[0]);
      }

      const loadedMsgs = await fetchAllChatMessages();
      setMessages(loadedMsgs);
      setIsLoaded(true);

      // Subscribe to Supabase Realtime multi-user broadcast channel
      unsubscribeFunc = subscribeToRealtimeChat(
        userId,
        pseudo,
        (incomingMsg) => {
          setMessages((prev) => {
            const list = prev[incomingMsg.topicId] || [];
            const exists = list.some((m) => m.id === incomingMsg.id);
            if (exists) return prev;

            const updatedList = [...list, incomingMsg];
            const updatedMap = {
              ...prev,
              [incomingMsg.topicId]: updatedList,
            };
            if (typeof window !== 'undefined') {
              localStorage.setItem('parlons_en_chat_messages_v2', JSON.stringify(updatedMap));
            }
            return updatedMap;
          });
        },
        (incomingTopic) => {
          setTopics((prev) => {
            const exists = prev.some((t) => t.id === incomingTopic.id);
            if (exists) return prev;

            const updatedTopics = [incomingTopic, ...prev];
            if (typeof window !== 'undefined') {
              localStorage.setItem('parlons_en_chat_topics_v2', JSON.stringify(updatedTopics));
            }
            return updatedTopics;
          });
        }
      );
    }

    loadData();

    return () => {
      if (unsubscribeFunc) unsubscribeFunc();
    };
  }, []);

  // Save messages only after initial load completes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('parlons_en_chat_messages_v2', JSON.stringify(messages));
    }
  }, [messages, isLoaded]);

  // Save topics only after initial load completes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem('parlons_en_chat_topics_v2', JSON.stringify(topics));
    }
  }, [topics, isLoaded]);

  const handleContainerScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isAtBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    isScrolledUpRef.current = !isAtBottom;
    setShowScrollBottomBtn(!isAtBottom);
  };

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
    isScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
  };

  useEffect(() => {
    isScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    setTimeout(() => scrollToBottom(false), 50);
  }, [activeTopic]);

  useEffect(() => {
    if (!isScrolledUpRef.current) {
      scrollToBottom(true);
    }
  }, [messages]);

  const handleSelectTopic = (topic: UserChatTopic) => {
    setActiveTopic(topic);
    setMobileTab('chat');
    isScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    setTimeout(() => {
      scrollToBottom(false);
      inputRef.current?.focus();
    }, 50);
  };

  const currentPseudonym = session?.anonymousIdentity?.anonymous_name || 'Utilisateur #4821';
  const currentAvatar = session?.user?.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(currentPseudonym)}`;

  const filteredTopics = topics.filter((t) => {
    const matchesFilter = activeFilter === 'all' || t.categorySlug === activeFilter;
    const matchesSearch = !searchQuery.trim() || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.authorPseudonym.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const currentMessages = messages[activeTopic.id] || [];

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!session?.user) {
      router.push('/connexion');
      return;
    }

    const textToSend = inputValue.trim();
    if (!textToSend) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      topicId: activeTopic.id,
      senderId: session?.user?.id || 'guest',
      senderName: currentPseudonym,
      senderAvatar: currentAvatar,
      content: textToSend,
      createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isSelf: true,
    };

    setMessages((prev) => {
      const updatedList = [...(prev[activeTopic.id] || []), userMsg];
      const updatedMap = {
        ...prev,
        [activeTopic.id]: updatedList,
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('parlons_en_chat_messages_v2', JSON.stringify(updatedMap));
      }
      return updatedMap;
    });

    // Broadcast message via Supabase Realtime to all online users across browsers
    broadcastChatMessage(userMsg);

    setInputValue('');
    isScrolledUpRef.current = false;
    setShowScrollBottomBtn(false);
    setTimeout(() => {
      scrollToBottom(true);
      inputRef.current?.focus();
    }, 50);
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!selectedTopic) return;
    await deleteChatMessage(msgId, selectedTopic.id);
    setChatMessages((prev) => ({
      ...prev,
      [selectedTopic.id]: (prev[selectedTopic.id] || []).filter((m) => m.id !== msgId),
    }));
  };

  const handleClearCurrentTopicMessages = async () => {
    if (!selectedTopic) return;
    await deleteAllChatMessages();
    setChatMessages((prev) => ({
      ...prev,
      [selectedTopic.id]: [],
    }));
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

    setTopics((prev) => {
      const updatedTopics = [newTopic, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('parlons_en_chat_topics_v2', JSON.stringify(updatedTopics));
      }
      return updatedTopics;
    });

    setMessages((prev) => {
      const updatedMap = {
        ...prev,
        [newTopicId]: [starterMsg],
      };
      if (typeof window !== 'undefined') {
        localStorage.setItem('parlons_en_chat_messages_v2', JSON.stringify(updatedMap));
      }
      return updatedMap;
    });

    // Broadcast new topic and starter message to all online users via Supabase Realtime
    broadcastChatTopic(newTopic);
    broadcastChatMessage(starterMsg);

    setActiveTopic(newTopic);
    setMobileTab('chat');
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
            onClick={() => {
              if (!session?.user) {
                router.push('/connexion');
              } else {
                setIsNewTopicModalOpen(true);
              }
            }}
            variant="primary"
            size="md"
            leftIcon={<MessageSquarePlus className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
            className="w-full sm:w-auto max-w-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-full shadow-lg shadow-amber-400/30 py-2.5 sm:py-3.5 px-4 sm:px-6 text-xs sm:text-sm md:text-base border-none shrink-0"
          >
            <span>Proposer un sujet</span>
          </Button>
        </div>

        {/* SEARCH & CATEGORY FILTER BAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-1">
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

          {/* Quick Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un sujet..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full pl-9 pr-4 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* MOBILE VIEW TOGGLE TABS (ONLY VISIBLE ON MOBILE SCREENS) */}
        <div className="flex lg:hidden bg-slate-200/80 dark:bg-slate-900 p-1 rounded-2xl gap-1">
          <button
            onClick={() => setMobileTab('topics')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              mobileTab === 'topics'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Salons de chat ({filteredTopics.length})</span>
          </button>

          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 cursor-pointer ${
              mobileTab === 'chat'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-blue-300" />
            <span>Discussion ({currentMessages.length})</span>
          </button>
        </div>

        {/* MAIN CHAT CONTAINER (TOPIC LIST + LIVE CHAT WINDOW) */}
        <div className="flex flex-col lg:flex-row gap-4 w-full">
          
          {/* LEFT COLUMN: USER CREATED TOPICS LIST */}
          <div className={`w-full lg:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-[32px] p-4 border-2 border-blue-200/80 dark:border-slate-800 shadow-xl shadow-blue-600/10 space-y-3 ${
            mobileTab === 'chat' ? 'hidden lg:block' : 'block'
          }`}>
            
            <div className="flex items-center justify-between px-2 pt-1">
              <span className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                <span>Sujets en Direct</span>
              </span>
              <span className="text-[11px] font-black bg-blue-600/10 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                {filteredTopics.length} Sujets
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[480px] sm:max-h-[520px] flex flex-col gap-2 pr-1 scrollbar-thin scrollbar-thumb-blue-200">
              {filteredTopics.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-bold space-y-2">
                  <p>Aucun sujet ne correspond à votre recherche.</p>
                  <Button
                    onClick={() => { setSearchQuery(''); setActiveFilter('all'); }}
                    variant="outline"
                    size="sm"
                    className="rounded-full text-[11px]"
                  >
                    Réinitialiser les filtres
                  </Button>
                </div>
              ) : (
                filteredTopics.map((topic) => {
                  const isActive = activeTopic.id === topic.id;
                  return (
                    <button
                      key={topic.id}
                      onClick={() => handleSelectTopic(topic)}
                      className={`w-full p-3.5 rounded-2xl transition-all duration-200 text-left cursor-pointer space-y-2 hover:scale-[1.01] active:scale-[0.98] ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-400/50'
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
                })
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: LIVE CHAT STREAM */}
          <div className={`flex-1 bg-white dark:bg-slate-900 rounded-[32px] border-2 border-blue-200/80 dark:border-slate-800 shadow-2xl shadow-blue-600/10 flex-col h-[580px] sm:h-[620px] overflow-hidden ${
            mobileTab === 'topics' ? 'hidden lg:flex' : 'flex'
          }`}>
            
            {/* Chat Stream Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between border-b border-blue-500/30 shrink-0">
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  {/* Back to topics button on mobile */}
                  <button
                    onClick={() => setMobileTab('topics')}
                    className="lg:hidden text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full font-bold transition flex items-center gap-1"
                  >
                    ← Salons
                  </button>
                  <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full border border-white/30">
                    {activeTopic.categoryName}
                  </span>
                  <span className="text-xs text-blue-100 font-bold hidden sm:inline">
                    Lancé par {activeTopic.authorPseudonym}
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white leading-snug line-clamp-1">
                  {activeTopic.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleClearCurrentTopicMessages}
                  className="p-1.5 bg-white/10 hover:bg-rose-500/80 text-white rounded-xl text-xs font-black transition border border-white/20 flex items-center gap-1 cursor-pointer"
                  title="Vider les messages du salon"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Vider</span>
                </button>
                <div className="flex items-center gap-1.5 bg-white/20 text-white px-3 py-1 rounded-full text-xs font-black backdrop-blur-md border border-white/30">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>En Direct</span>
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div
              ref={messagesContainerRef}
              onScroll={handleContainerScroll}
              className="relative flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gradient-to-b from-blue-50/40 via-white to-blue-50/20 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 scrollbar-thin scrollbar-thumb-blue-400"
            >
              {currentMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 my-auto">
                  <div className="w-14 h-14 rounded-3xl bg-blue-100 dark:bg-slate-800 text-blue-600 flex items-center justify-center shadow-inner">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200">
                    Salon prêt pour la discussion !
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm font-medium">
                    Soyez la première personne à envoyer un message bienveillant ou poser une question dans ce salon.
                  </p>
                </div>
              ) : (
                currentMessages.map((msg) => {
                  const isUserMsg = Boolean(
                    msg.isSelf ||
                    msg.senderName === currentPseudonym ||
                    (session?.user?.id && msg.senderId === session.user.id)
                  );

                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-3 max-w-xl animate-fade-in ${
                        isUserMsg ? 'ml-auto flex-row-reverse' : ''
                      }`}
                    >
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-md overflow-hidden shrink-0">
                        <img
                          src={msg.senderAvatar}
                          alt="Avatar"
                          className="w-full h-full object-cover rounded-[14px]"
                        />
                      </div>

                      <div className="space-y-1 group">
                        <div className={`flex items-center gap-2 text-[11px] font-black ${isUserMsg ? 'justify-end text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>
                          <span>{msg.senderName}</span>
                          <span className="text-[10px] font-bold opacity-60">• {msg.createdAt}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/60 transition opacity-0 group-hover:opacity-100 cursor-pointer ml-1"
                            title="Supprimer ce message"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div
                          className={`p-3.5 rounded-2xl text-xs sm:text-sm font-bold leading-relaxed shadow-sm ${
                            isUserMsg
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              <div ref={messagesEndRef} />

              {/* Floating scroll down button when user scrolls up */}
              {showScrollBottomBtn && (
                <div className="sticky bottom-2 flex justify-center z-30 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => scrollToBottom(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs px-4 py-2 rounded-full shadow-2xl flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-white/20"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Défiler vers les derniers messages</span>
                  </button>
                </div>
              )}
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

            {/* Message Input Bar / Login Guard */}
            {!session?.user ? (
              <div className="p-4 sm:p-5 bg-slate-900 text-white border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                <div className="flex items-center gap-3 text-center sm:text-left">
                  <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">Compte membre requis pour chater</h4>
                    <p className="text-[11px] text-slate-400 font-medium">Vous devez disposer d'un compte membre validé pour envoyer des messages ou créer un salon.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                  <Button
                    onClick={() => router.push('/connexion')}
                    variant="primary"
                    size="sm"
                    leftIcon={<LogIn className="w-4 h-4" />}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-full text-xs flex-1 sm:flex-initial"
                  >
                    Se connecter
                  </Button>
                  <Button
                    onClick={() => router.push('/inscription')}
                    variant="outline"
                    size="sm"
                    className="rounded-full border-slate-700 hover:bg-slate-800 text-white text-xs font-bold flex-1 sm:flex-initial"
                  >
                    Créer un compte
                  </Button>
                </div>
              </div>
            ) : (
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
            )}

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
