import { PaymentRecord, ReportItem } from '@/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

const LOCAL_STORAGE_PAYMENTS_KEY = 'parlons_en_admin_payments_v1';
const LOCAL_STORAGE_REPORTS_KEY = 'parlons_en_admin_reports_v1';

const INITIAL_PAYMENTS: PaymentRecord[] = [];
const INITIAL_REPORTS: ReportItem[] = [];
const INITIAL_WARNINGS: import('@/types').UserWarning[] = [];
const DEMO_USERS: AdminUserItem[] = [];

export function resetAdminSpaceToZero(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify([]));
      localStorage.setItem(LOCAL_STORAGE_WARNINGS_KEY, JSON.stringify([]));
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify({}));
      localStorage.setItem('parlons_en_chat_topics_v2', JSON.stringify([]));
      localStorage.setItem('parlons_en_account_approvals_v1', JSON.stringify([]));
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      // Ignore
    }
  }
}

export function getStoredPayments(): PaymentRecord[] {
  if (typeof window === 'undefined') return INITIAL_PAYMENTS;
  const saved = localStorage.getItem(LOCAL_STORAGE_PAYMENTS_KEY);
  if (!saved) {
    localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(INITIAL_PAYMENTS));
    return INITIAL_PAYMENTS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_PAYMENTS;
  }
}

export function saveStoredPayments(payments: PaymentRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
  }
}

export function addPaymentRecord(record: Omit<PaymentRecord, 'id' | 'created_at' | 'status' | 'amount'>): PaymentRecord {
  const current = getStoredPayments();
  const newRecord: PaymentRecord = {
    ...record,
    id: `pay-${Date.now()}`,
    amount: 500,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  const updated = [newRecord, ...current];
  saveStoredPayments(updated);
  return newRecord;
}

export function updatePaymentStatus(paymentId: string, status: 'approved' | 'rejected'): PaymentRecord[] {
  const current = getStoredPayments();
  const updated = current.map((p) => (p.id === paymentId ? { ...p, status } : p));
  saveStoredPayments(updated);
  return updated;
}

export function getAdminStats() {
  const payments = getStoredPayments();
  const approved = payments.filter((p) => p.status === 'approved');
  const pending = payments.filter((p) => p.status === 'pending');
  const totalRevenue = approved.reduce((acc, p) => acc + p.amount, 0);

  return {
    totalRevenue,
    approvedCount: approved.length,
    pendingCount: pending.length,
    totalPaymentsCount: payments.length,
  };
}

export function getStoredReports(): ReportItem[] {
  if (typeof window === 'undefined') return INITIAL_REPORTS;
  const saved = localStorage.getItem(LOCAL_STORAGE_REPORTS_KEY);
  if (!saved) {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(INITIAL_REPORTS));
    return INITIAL_REPORTS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_REPORTS;
  }
}

export function updateReportStatus(reportId: string, status: 'resolved' | 'dismissed'): ReportItem[] {
  const current = getStoredReports();
  const updated = current.map((r) => (r.id === reportId ? { ...r, status } : r));
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_REPORTS_KEY, JSON.stringify(updated));
  }
  return updated;
}

const LOCAL_STORAGE_WARNINGS_KEY = 'parlons_en_admin_warnings_v1';

export function getStoredWarnings(): import('@/types').UserWarning[] {
  if (typeof window === 'undefined') return INITIAL_WARNINGS;
  const saved = localStorage.getItem(LOCAL_STORAGE_WARNINGS_KEY);
  if (!saved) {
    localStorage.setItem(LOCAL_STORAGE_WARNINGS_KEY, JSON.stringify(INITIAL_WARNINGS));
    return INITIAL_WARNINGS;
  }
  try {
    return JSON.parse(saved);
  } catch {
    return INITIAL_WARNINGS;
  }
}

export function addWarningToUser(user_pseudonym: string, reason: string, post_title?: string): import('@/types').UserWarning[] {
  const current = getStoredWarnings();
  const newWarning: import('@/types').UserWarning = {
    id: `warn-${Date.now()}`,
    user_pseudonym,
    reason,
    post_title,
    created_at: new Date().toISOString(),
    status: 'active',
  };
  const updated = [newWarning, ...current];
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_WARNINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}

export function dismissWarning(warningId: string): import('@/types').UserWarning[] {
  const current = getStoredWarnings();
  const updated = current.map((w) => (w.id === warningId ? { ...w, status: 'dismissed' as const } : w));
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_WARNINGS_KEY, JSON.stringify(updated));
  }
  return updated;
}

// ==================== USERS & CHAT CONTROL ====================

const CHAT_MESSAGES_KEY = 'parlons_en_chat_messages_v2';

export interface AdminUserItem {
  id: string;
  email: string;
  name: string;
  anonymousName: string;
  paymentStatus: string;
  createdAt: string;
}

export function getAdminUsersList(): AdminUserItem[] {
  const payments = getStoredPayments();
  if (payments.length > 0) {
    return payments.map((p, idx) => ({
      id: p.id || `usr-${idx}`,
      email: p.user_email,
      name: p.user_name,
      anonymousName: `Utilisateur #${1000 + idx * 37}`,
      paymentStatus: p.status,
      createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : 'Récemment',
    }));
  }
  return DEMO_USERS;
}

export function getStoredChatMessagesMap(): Record<string, any[]> {
  if (typeof window === 'undefined') return { 'topic-1': [] };
  const saved = localStorage.getItem(CHAT_MESSAGES_KEY);
  if (!saved) return { 'topic-1': [] };
  try {
    return JSON.parse(saved);
  } catch {
    return { 'topic-1': [] };
  }
}

export function deleteChatMessageFromTopic(topicId: string, messageId: string): Record<string, any[]> {
  const messagesMap = getStoredChatMessagesMap();
  if (messagesMap[topicId]) {
    messagesMap[topicId] = messagesMap[topicId].filter((msg) => msg.id !== messageId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messagesMap));
    }
  }
  return messagesMap;
}

export function postAdminAnnouncementToChat(content: string, topicId: string = 'topic-1'): Record<string, any[]> {
  const messagesMap = getStoredChatMessagesMap();
  const newAdminMessage = {
    id: `admin-msg-${Date.now()}`,
    topicId,
    senderId: 'admin-official',
    senderName: '📢 Administrateur (Modération)',
    senderAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=AdminOfficialBadge',
    content: `📢 [MESSAGE OFFICIEL D'ADMINISTRATION] : ${content.trim()}`,
    createdAt: "À l'instant",
    isSelf: false,
  };

  if (!messagesMap[topicId]) {
    messagesMap[topicId] = [];
  }

  messagesMap[topicId] = [...messagesMap[topicId], newAdminMessage];

  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messagesMap));
  }

  return messagesMap;
}


