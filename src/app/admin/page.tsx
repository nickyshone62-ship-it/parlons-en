'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { Button } from '@/components/ui/Button';
import {
  getStoredPayments,
  updatePaymentStatus,
  getAdminStats,
  getStoredReports,
  updateReportStatus,
  getStoredWarnings,
  addWarningToUser,
  dismissWarning,
  getAdminUsersList,
  getStoredChatMessagesMap,
  deleteChatMessageFromTopic,
  postAdminAnnouncementToChat,
  AdminUserItem,
} from '@/lib/admin/admin';
import {
  getStoredAccountApprovals,
  approveUserAccount,
  rejectUserAccount,
  deleteUserAccount,
  UserAccountApproval,
} from '@/lib/admin/approval';
import { getRealPosts, deleteRealPost } from '@/lib/supabase/posts';
import { PaymentRecord, Post, ReportItem, UserWarning } from '@/types';
import { OrangeMoneyLogo, WaveLogo } from '@/components/ui/PaymentLogos';
import { WarningModal } from '@/components/modals/WarningModal';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  DollarSign,
  TrendingUp,
  MessageSquare,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Check,
  Ban,
  Users,
  Sparkles,
  ShieldAlert,
  AlertCircle,
  MessageCircle,
  Send,
  UserCheck,
} from 'lucide-react';

import { resetPlatformToZero } from '@/lib/resetData';

export default function AdminPage() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const [accountApprovals, setAccountApprovals] = useState<UserAccountApproval[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [warnings, setWarnings] = useState<UserWarning[]>([]);
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [chatMessagesMap, setChatMessagesMap] = useState<Record<string, any[]>>({});
  const [adminNoticeText, setAdminNoticeText] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeTab, setActiveTab] = useState<'approvals' | 'payments' | 'users' | 'chat' | 'posts' | 'reports' | 'warnings'>('approvals');
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Warning Modal State
  const [warningTarget, setWarningTarget] = useState<{ userPseudonym: string; postTitle?: string } | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUnlocked = sessionStorage.getItem('parlons_en_admin_unlocked');
      if (savedUnlocked === 'true') {
        setIsUnlocked(true);
      }
    }
  }, []);

  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const validAdminCode = process.env.NEXT_PUBLIC_ADMIN_CODE || 'Nick@2345';
    if (pinInput.trim() === validAdminCode || pinInput.trim() === 'Nick@2345') {
      setIsUnlocked(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('parlons_en_admin_unlocked', 'true');
      }
      setPinError(null);
      setPinInput('');
      loadAdminData();
    } else {
      setPinError('Code secret incorrect. Accès refusé ! ❌');
    }
  };

  const handleLockAdmin = () => {
    setIsUnlocked(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('parlons_en_admin_unlocked');
    }
  };

  const loadAdminData = async () => {
    const currentPayments = getStoredPayments();
    const currentReports = getStoredReports();
    const currentWarnings = getStoredWarnings();
    const currentUsers = getAdminUsersList();
    const currentChat = getStoredChatMessagesMap();
    const currentApprovals = getStoredAccountApprovals();

    setPayments(currentPayments);
    setReports(currentReports);
    setWarnings(currentWarnings);
    setUsersList(currentUsers);
    setChatMessagesMap(currentChat);
    setAccountApprovals(currentApprovals);

    try {
      const realPosts = await getRealPosts();
      setPosts(realPosts);
    } catch (e) {
      console.error("Erreur lors du chargement des posts", e);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleApproveAccount = async (idOrEmail: string) => {
    const updated = await approveUserAccount(idOrEmail);
    setAccountApprovals(updated);
    showToast("Compte membre approuvé avec succès ! Accès débloqué. ✅");
  };

  const handleRejectAccount = async (idOrEmail: string) => {
    const updated = await rejectUserAccount(idOrEmail);
    setAccountApprovals(updated);
    showToast("Accès au compte refusé. ❌");
  };

  const handleDeleteUserAccount = async (idOrName: string) => {
    const updated = await deleteUserAccount(idOrName);
    setAccountApprovals(updated);
    showToast(`Le compte utilisateur "${idOrName}" a été définitivement supprimé. 🗑️`);
  };

  const handleUpdatePayment = (id: string, newStatus: 'approved' | 'rejected') => {
    const updated = updatePaymentStatus(id, newStatus);
    setPayments(updated);
    showToast(newStatus === 'approved' ? 'Paiement de 500 F approuvé avec succès ! ✅' : 'Paiement rejeté ❌');
  };

  const handleDeletePost = async (postId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette discussion ?")) {
      await deleteRealPost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      showToast('Discussion supprimée avec succès.');
    }
  };

  const handleResolveReport = (reportId: string, status: 'resolved' | 'dismissed') => {
    const updated = updateReportStatus(reportId, status);
    setReports(updated);
    showToast(status === 'resolved' ? 'Signalement résolu.' : 'Signalement ignoré.');
  };

  const handleConfirmWarning = (reason: string) => {
    if (!warningTarget) return;
    const updated = addWarningToUser(warningTarget.userPseudonym, reason, warningTarget.postTitle);
    setWarnings(updated);
    showToast(`Mise en garde envoyée à ${warningTarget.userPseudonym} ⚠️`);
    setWarningTarget(null);
  };

  const handleDismissWarning = (warningId: string) => {
    const updated = dismissWarning(warningId);
    setWarnings(updated);
    showToast('Mise en garde levée.');
  };

  const handleDeleteChatMessage = (topicId: string, messageId: string) => {
    if (confirm("Supprimer ce message du chat en direct ?")) {
      const updated = deleteChatMessageFromTopic(topicId, messageId);
      setChatMessagesMap(updated);
      showToast('Message du chat supprimé ! 🗑️');
    }
  };

  const handlePostAdminNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminNoticeText.trim()) return;
    const updated = postAdminAnnouncementToChat(adminNoticeText);
    setChatMessagesMap(updated);
    setAdminNoticeText('');
    showToast('Message officiel de modération publié dans le chat ! 📢');
  };

  const stats = getAdminStats();

  const filteredPayments = payments.filter((p) => {
    if (paymentFilter !== 'all' && p.status !== paymentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.user_email.toLowerCase().includes(q) ||
        p.user_name.toLowerCase().includes(q) ||
        p.transaction_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex flex-col bg-[#070C18] text-white font-sans antialiased">
        <Header />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-3xl mx-auto shadow-lg shadow-amber-400/20 border-2 border-yellow-300">
              🔐
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Accès Administrateur Restreint
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Veuillez saisir le code secret réservé à l'administrateur pour déverrouiller le panneau de contrôle.
              </p>
            </div>

            <form onSubmit={handleUnlockAdmin} className="space-y-4">
              <div className="space-y-1">
                <input
                  type="password"
                  placeholder="Saisissez le code secret..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  className="w-full text-center tracking-widest text-xl font-black p-3.5 rounded-2xl bg-slate-950 border-2 border-slate-700 text-white outline-none focus:border-amber-400 transition"
                  autoFocus
                  required
                />
                {pinError && (
                  <p className="text-xs font-black text-rose-400 pt-1">
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-[#FFFC00] to-yellow-400 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-black rounded-2xl text-sm transition shadow-xl border border-yellow-300 cursor-pointer"
              >
                Déverrouiller l'Espace Admin 🔓
              </button>
            </form>

            <p className="text-[11px] text-slate-500 font-semibold">
              🔒 Espace strictement confidentiel Parlons-En.
            </p>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 font-sans antialiased">
      <Header />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border-2 border-amber-400 font-bold text-xs flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6 pb-36 space-y-6">
        
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-7 rounded-3xl shadow-xl border-2 border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-yellow-300">
              🛡️
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black border border-amber-400/40">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Panneau de Contrôle Administrateur</span>
              </div>
              <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Espace Admin Parlons-En
              </h1>
              <p className="text-xs text-slate-300 font-medium">
                Approbation des paiements (500 FCFA), modération et gestion globale.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                if (window.confirm("Êtes-vous sûr de vouloir supprimer toutes les discussions, commentaires, votes et remettre l'espace administrateur à 0 pour le démarrage officiel ?")) {
                  resetPlatformToZero();
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-black rounded-2xl text-xs transition border border-rose-500/40 shadow-sm cursor-pointer"
              title="Supprimer tous les sujets, messages et réinitialiser la plateforme à zéro"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>🧹 Tout remettre à 0 (Prod)</span>
            </button>

            <button
              onClick={loadAdminData}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition border border-slate-700 shadow-sm cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>
            <button
              onClick={handleLockAdmin}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-2xl text-xs transition shadow-sm border border-rose-500 cursor-pointer"
            >
              <span>Verrouiller 🔒</span>
            </button>
          </div>
        </div>

        {/* TOP METRICS CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Revenue */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-emerald-400/50 shadow-md space-y-1">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-black uppercase tracking-wider">Revenus Encaissés</span>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.totalRevenue.toLocaleString('fr-FR')} <span className="text-xs text-emerald-600 font-extrabold">FCFA</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold">500 F par inscription validée</p>
          </div>

          {/* Card 2: Pending Payments */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-amber-400/60 shadow-md space-y-1">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400">
              <span className="text-xs font-black uppercase tracking-wider">Paiements En Attente</span>
              <Clock className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
              {stats.pendingCount}
            </div>
            <p className="text-[10px] text-slate-500 font-bold">À vérifier et approuver</p>
          </div>

          {/* Card 3: Approved Count */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-blue-400/50 shadow-md space-y-1">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400">
              <span className="text-xs font-black uppercase tracking-wider">Paiements Validés</span>
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {stats.approvedCount}
            </div>
            <p className="text-[10px] text-slate-500 font-bold">Inscriptions débloquées</p>
          </div>

          {/* Card 4: Total Users */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border-2 border-indigo-400/50 shadow-md space-y-1">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400">
              <span className="text-xs font-black uppercase tracking-wider">Membres Inscrits</span>
              <Users className="w-5 h-5" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {usersList.length}
            </div>
            <p className="text-[10px] text-slate-500 font-bold">Comptes sur la plateforme</p>
          </div>

        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('approvals')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'approvals'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4 text-emerald-300" />
            <span>Approbations de Comptes</span>
            {accountApprovals.filter((a) => a.status === 'pending').length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                {accountApprovals.filter((a) => a.status === 'pending').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'payments'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Paiements (500 F)</span>
            {stats.pendingCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-black animate-pulse">
                {stats.pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'users'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Membres Inscrits ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'chat'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contrôle du Chat 💬</span>
          </button>

          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'posts'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Discussions ({posts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 shrink-0 ${
              activeTab === 'reports'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Signalements ({reports.filter((r) => r.status === 'pending').length})</span>
          </button>

          <button
            onClick={() => setActiveTab('warnings')}
            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition flex items-center gap-2 ${
              activeTab === 'warnings'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Avertissements ({warnings.filter((w) => w.status === 'active').length})</span>
          </button>
        </div>

        {/* TAB 0: ACCOUNT APPROVALS MANAGEMENT */}
        {activeTab === 'approvals' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-emerald-500" />
                  <span>Validation & Approbation des Comptes Membres</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Seuls les comptes formellement approuvés par l'administrateur peuvent accéder à la plateforme.
                </p>
              </div>

              <span className="text-xs font-black px-3.5 py-1 bg-amber-400/20 text-amber-800 dark:text-amber-300 rounded-full border border-amber-400/40 shrink-0">
                {accountApprovals.filter((a) => a.status === 'pending').length} en attente
              </span>
            </div>

            {accountApprovals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs font-bold space-y-2">
                <UserCheck className="w-8 h-8 text-slate-400 mx-auto" />
                <p>Aucun compte membre n'est actuellement répertorié pour approbation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {accountApprovals.map((userAcc) => (
                  <div
                    key={userAcc.id}
                    className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          {userAcc.fullName}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">({userAcc.email})</span>
                        <span
                          className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                            userAcc.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                              : userAcc.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                              : 'bg-amber-400/20 text-amber-800 dark:text-amber-300 border border-amber-400/30 animate-pulse'
                          }`}
                        >
                          {userAcc.status === 'approved'
                            ? '✅ Approuvé'
                            : userAcc.status === 'rejected'
                            ? '❌ Refusé'
                            : '⏳ En attente d\'approbation'}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                        <span>Pseudonyme : <strong className="text-blue-600 dark:text-blue-400">{userAcc.anonymousName}</strong></span>
                        <span>• Date : {new Date(userAcc.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-none border-slate-200/60 dark:border-slate-800">
                      {userAcc.status !== 'approved' && (
                        <Button
                          onClick={() => handleApproveAccount(userAcc.id)}
                          variant="primary"
                          size="sm"
                          leftIcon={<Check className="w-4 h-4" />}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-full shadow-md text-xs px-4"
                        >
                          Approuver le compte
                        </Button>
                      )}

                      {userAcc.status !== 'rejected' && (
                        <Button
                          onClick={() => handleRejectAccount(userAcc.id)}
                          variant="outline"
                          size="sm"
                          leftIcon={<Ban className="w-4 h-4 text-amber-500" />}
                          className="rounded-full border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950 text-amber-600 text-xs font-bold px-3.5"
                        >
                          Refuser
                        </Button>
                      )}

                      <Button
                        onClick={() => handleDeleteUserAccount(userAcc.id)}
                        variant="outline"
                        size="sm"
                        leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
                        className="rounded-full border-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950 text-rose-600 text-xs font-bold px-3.5"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 1: PAYMENTS MANAGEMENT */}
        {activeTab === 'payments' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            
            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
                <button
                  onClick={() => setPaymentFilter('all')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition shrink-0 ${
                    paymentFilter === 'all'
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  Tous ({payments.length})
                </button>
                <button
                  onClick={() => setPaymentFilter('pending')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition shrink-0 ${
                    paymentFilter === 'pending'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}
                >
                  En attente ({stats.pendingCount})
                </button>
                <button
                  onClick={() => setPaymentFilter('approved')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition shrink-0 ${
                    paymentFilter === 'approved'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                  }`}
                >
                  Approuvés ({stats.approvedCount})
                </button>
                <button
                  onClick={() => setPaymentFilter('rejected')}
                  className={`px-3 py-1 rounded-full text-xs font-black transition shrink-0 ${
                    paymentFilter === 'rejected'
                      ? 'bg-rose-500 text-white'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                  }`}
                >
                  Rejetés ({payments.filter((p) => p.status === 'rejected').length})
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Rechercher email, nom, ID TX..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Utilisateur</th>
                    <th className="p-3">Moyen & Montant</th>
                    <th className="p-3">Preuve / Capture d'Écran</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Actions d'Approbation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-bold">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-slate-400">
                        Aucun paiement trouvé pour ce filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-3">
                          <div className="font-black text-slate-900 dark:text-white">{payment.user_name}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{payment.user_email}</div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {payment.payment_method === 'orange_money' ? (
                              <OrangeMoneyLogo className="w-6 h-6 shrink-0" />
                            ) : (
                              <WaveLogo className="w-6 h-6 shrink-0" />
                            )}
                            <div>
                              <span className="font-black capitalize">{payment.payment_method.replace('_', ' ')}</span>
                              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-black">
                                {payment.amount} FCFA
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          {payment.payment_screenshot_url ? (
                            <button
                              type="button"
                              onClick={() => setPreviewScreenshotUrl(payment.payment_screenshot_url!)}
                              className="flex items-center gap-2.5 group cursor-pointer text-left"
                              title="Cliquer pour afficher la capture d'écran en grand"
                            >
                              <div className="w-12 h-12 rounded-xl border-2 border-amber-400 overflow-hidden bg-slate-950 shrink-0 shadow-md group-hover:scale-105 transition">
                                <img src={payment.payment_screenshot_url} alt="Capture de paiement" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 underline block group-hover:text-emerald-500">
                                  🔍 Voir la capture
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">Reçu joint</span>
                              </div>
                            </button>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 font-mono text-[11px]">
                              {payment.transaction_id || 'SMS de transfert'}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {payment.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Approuvé
                            </span>
                          )}
                          {payment.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-400 text-[10px] font-black border border-amber-400">
                              <Clock className="w-3 h-3 animate-spin" /> En attente
                            </span>
                          )}
                          {payment.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 dark:text-rose-400 text-[10px] font-black border border-rose-400">
                              <XCircle className="w-3 h-3" /> Rejeté
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {payment.status !== 'approved' && (
                              <button
                                onClick={() => handleUpdatePayment(payment.id, 'approved')}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-[11px] transition shadow-xs flex items-center gap-1"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approuver</span>
                              </button>
                            )}
                            {payment.status !== 'rejected' && (
                              <button
                                onClick={() => handleUpdatePayment(payment.id, 'rejected')}
                                className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-[11px] transition shadow-xs flex items-center gap-1"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                <span>Rejeter</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB: USERS LIST */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <span>Liste des Membres Inscrits ({usersList.length})</span>
              </h3>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-3 py-1 rounded-full border border-indigo-200">
                100% Comptes Enregistrés
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-[11px] font-black uppercase text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                    <th className="p-3">Membre</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Pseudo Anonyme Attribué</th>
                    <th className="p-3">Statut Inscription (500 F)</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-bold">
                  {usersList.map((userItem) => (
                    <tr key={userItem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                      <td className="p-3 font-black text-slate-900 dark:text-white">
                        {userItem.name}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {userItem.email}
                      </td>
                      <td className="p-3">
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black rounded-lg text-xs">
                          {userItem.anonymousName}
                        </span>
                      </td>
                      <td className="p-3">
                        {userItem.paymentStatus === 'approved' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-black border border-emerald-400">
                            <CheckCircle2 className="w-3 h-3" /> Payé (500 F)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-400 text-[10px] font-black border border-amber-400">
                            <Clock className="w-3 h-3 animate-spin" /> En attente (500 F)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() =>
                            setWarningTarget({
                              userPseudonym: userItem.anonymousName,
                            })
                          }
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-[11px] transition shadow-xs inline-flex items-center gap-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>Avertir ⚠️</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: CHAT CONTROL */}
        {activeTab === 'chat' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                  <span>Contrôle & Modération du Chat en Direct</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Supervisez les échanges de la communauté, supprimez les dérapages ou envoyez une mise en garde.
                </p>
              </div>

              <div className="px-3 py-1 bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-xs font-black rounded-full border border-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Flux Direct Actif</span>
              </div>
            </div>

            {/* Official Admin Announcement Form */}
            <form onSubmit={handlePostAdminNotice} className="p-4 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white space-y-2 border-2 border-blue-500/40 shadow-md">
              <label className="text-xs font-black flex items-center gap-2 text-amber-300">
                <ShieldCheck className="w-4 h-4" />
                <span>Publier un Message Officiel de Modération dans le Chat :</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ex: Merci de respecter la bienveillance et d'éviter les messages hors-sujet..."
                  value={adminNoticeText}
                  onChange={(e) => setAdminNoticeText(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-white/10 text-white placeholder:text-blue-200/60 text-xs font-bold outline-none border border-white/20 focus:border-amber-400"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-400 hover:bg-yellow-300 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1 shrink-0 shadow-md border border-yellow-400"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer au Chat</span>
                </button>
              </div>
            </form>

            {/* Live Chat Messages Feed per Topic */}
            <div className="space-y-4">
              {Object.entries(chatMessagesMap).map(([topicId, msgList]) => (
                <div key={topicId} className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      💬 Salon : <strong className="text-blue-600 dark:text-blue-400">{topicId === 'topic-1' ? 'Salon Général & Entraide' : topicId}</strong>
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">{msgList.length} messages</span>
                  </div>

                  {msgList.length === 0 ? (
                    <p className="text-xs text-slate-400 font-bold py-2">Aucun message dans ce salon.</p>
                  ) : (
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-300">
                      {msgList.map((msg: any) => (
                        <div
                          key={msg.id}
                          className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3 shadow-2xs"
                        >
                          <div className="flex items-start gap-2.5">
                            <img
                              src={msg.senderAvatar || 'https://api.dicebear.com/7.x/identicon/svg?seed=Default'}
                              alt="Avatar"
                              className="w-7 h-7 rounded-full bg-slate-200 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {msg.senderName}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">{msg.createdAt}</span>
                              </div>
                              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                                {msg.content}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() =>
                                setWarningTarget({
                                  userPseudonym: msg.senderName,
                                  postTitle: `Chat (${msg.content.slice(0, 30)}...)`,
                                })
                              }
                              className="p-1.5 bg-amber-500/20 text-amber-700 dark:text-amber-300 hover:bg-amber-500 hover:text-slate-950 rounded-lg text-[10px] font-black transition"
                              title="Avertir cet auteur"
                            >
                              ⚠️ Avertir
                            </button>
                            <button
                              onClick={() => handleDeleteChatMessage(topicId, msg.id)}
                              className="p-1.5 bg-rose-500/20 text-rose-700 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-lg text-[10px] font-black transition"
                              title="Supprimer ce message du chat"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: POSTS MODERATION */}
        {activeTab === 'posts' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span>Modération des Discussions Communautaires</span>
            </h3>

            {posts.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold py-4">Aucune discussion publiée pour le moment.</p>
            ) : (
              <div className="space-y-3">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-[10px] rounded-full">
                          {post.category_name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{post.created_at}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">{post.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{post.content}</p>
                      <div className="text-[10px] text-slate-500 font-bold">
                        Auteur : <span className="text-blue-600 dark:text-blue-400">{post.author_pseudonym}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() =>
                          setWarningTarget({
                            userPseudonym: post.author_pseudonym,
                            postTitle: post.title,
                          })
                        }
                        className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-1 shadow-xs"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        <span>Mettre en garde ⚠️</span>
                      </button>

                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl text-xs transition flex items-center gap-1 shadow-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Supprimer</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>Signalements à Traiter</span>
            </h3>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold py-4">Aucun signalement en attente.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-4 rounded-2xl bg-rose-500/10 border border-rose-300 dark:border-rose-900 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="text-xs font-black text-rose-700 dark:text-rose-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Raison : {rep.reason}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold">
                        Signaleur : {rep.reporter_email} | Statut : <strong>{rep.status}</strong>
                      </div>
                    </div>

                    {rep.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleResolveReport(rep.id, 'resolved')}
                          className="px-3 py-1 bg-emerald-600 text-white font-black text-xs rounded-xl hover:bg-emerald-700"
                        >
                          Résoudre
                        </button>
                        <button
                          onClick={() => handleResolveReport(rep.id, 'dismissed')}
                          className="px-3 py-1 bg-slate-600 text-white font-black text-xs rounded-xl hover:bg-slate-700"
                        >
                          Ignorer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: WARNINGS */}
        {activeTab === 'warnings' && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-slate-200 dark:border-slate-800 shadow-lg space-y-4">
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-500" />
              <span>Historique des Mises en Garde Membres</span>
            </h3>

            {warnings.length === 0 ? (
              <p className="text-xs text-slate-500 font-bold py-4">Aucun avertissement émis pour l'instant.</p>
            ) : (
              <div className="space-y-3">
                {warnings.map((warn) => (
                  <div
                    key={warn.id}
                    className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 dark:border-amber-900/60 flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white">
                          👤 {warn.user_pseudonym}
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            warn.status === 'active'
                              ? 'bg-amber-400 text-slate-950'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {warn.status === 'active' ? '⚠️ Mise en Garde Active' : 'Levée'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-bold">
                        Motif : "{warn.reason}"
                      </p>
                      {warn.post_title && (
                        <p className="text-[11px] text-slate-500 font-medium">Sujet : {warn.post_title}</p>
                      )}
                    </div>

                    {warn.status === 'active' && (
                      <button
                        onClick={() => handleDismissWarning(warn.id)}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl transition shrink-0"
                      >
                        Lever l'avertissement
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Warning Modal */}
      {warningTarget && (
        <WarningModal
          isOpen={Boolean(warningTarget)}
          onClose={() => setWarningTarget(null)}
          targetUserPseudonym={warningTarget.userPseudonym}
          postTitle={warningTarget.postTitle}
          onConfirmWarning={handleConfirmWarning}
        />
      )}

      {/* Payment Screenshot Preview Lightbox Modal */}
      {previewScreenshotUrl && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewScreenshotUrl(null)}
        >
          <div
            className="max-w-3xl w-full bg-slate-900 border-2 border-amber-400/60 rounded-3xl p-5 space-y-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span className="text-amber-400">📷</span>
                <span>Preuve de Paiement (Capture d'écran 500 FCFA)</span>
              </h3>
              <button
                onClick={() => setPreviewScreenshotUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-white font-black flex items-center justify-center transition cursor-pointer text-sm"
                title="Fermer"
              >
                ✕
              </button>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-2xl border border-slate-800 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={previewScreenshotUrl}
                alt="Capture de reçu de paiement"
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-lg"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-400 font-bold">
                Vérifiez la lisibilité du transfert avant de valider l'inscription.
              </span>
              <Button
                onClick={() => setPreviewScreenshotUrl(null)}
                variant="outline"
                size="sm"
                className="rounded-full border-slate-700 hover:bg-slate-800 text-white font-bold text-xs"
              >
                Fermer l'aperçu
              </Button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
