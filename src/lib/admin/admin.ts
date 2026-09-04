import { PaymentRecord, ReportItem } from '@/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { broadcastChatMessage, broadcastChatTopic } from '@/lib/supabase/chat';

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

/**
 * Fetches real payments from Server API (/api/admin/data) + Supabase DB merged with local storage so admin sees payment screenshots & submissions across devices
 */
export async function fetchRealPayments(): Promise<PaymentRecord[]> {
  const supabase = createBrowserClient();
  const localPayments = getStoredPayments();
  const paymentMap = new Map<string, PaymentRecord>();

  localPayments.forEach((p) => {
    if (p && p.id) {
      paymentMap.set(p.id, p);
    }
  });

  // Query Server API route /api/admin/data
  try {
    const res = await fetch('/api/admin/data', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.payments)) {
        json.payments.forEach((p: PaymentRecord) => {
          if (p && p.id) {
            paymentMap.set(p.id, p);
          }
        });
      }
    }
  } catch (e) {}

  try {
    const { data: dbPayments } = await supabase
      .from('payments')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbPayments && dbPayments.length > 0) {
      dbPayments.forEach((p: any) => {
        paymentMap.set(p.id, {
          id: p.id,
          user_name: p.user_name || p.user_email?.split('@')[0] || 'Membre',
          user_email: p.user_email || 'user@parlons-en.fr',
          amount: p.amount || 500,
          payment_method: p.payment_method || 'Orange Money',
          payment_screenshot_url: p.payment_screenshot_url || '',
          status: p.status || 'pending',
          created_at: p.created_at || new Date().toISOString(),
        });
      });
    }
  } catch (e) {}

  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, created_at, approval_status, is_approved');

    if (profiles && profiles.length > 0) {
      profiles.forEach((prof: any) => {
        const email = prof.username && prof.username.includes('@') ? prof.username : `${prof.username || 'user'}@parlons-en.fr`;
        const exists = Array.from(paymentMap.values()).some((p) => p.user_email.toLowerCase() === email.toLowerCase());
        if (!exists) {
          const synthId = `pay-prof-${prof.id}`;
          paymentMap.set(synthId, {
            id: synthId,
            user_name: prof.username || 'Nouveau Membre',
            user_email: email,
            amount: 500,
            payment_method: 'Paiement Inscription',
            payment_screenshot_url: '',
            status: prof.approval_status === 'approved' || prof.is_approved ? 'approved' : prof.approval_status === 'rejected' ? 'rejected' : 'pending',
            created_at: prof.created_at || new Date().toISOString(),
          });
        }
      });
    }
  } catch (e) {}

  const list = Array.from(paymentMap.values());
  saveStoredPayments(list);
  return list;
}

export async function addPaymentRecord(record: Omit<PaymentRecord, 'id' | 'created_at' | 'status' | 'amount'>): Promise<PaymentRecord> {
  const supabase = createBrowserClient();
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

  // Call Server API
  try {
    await fetch('/api/admin/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(record),
    });
  } catch (e) {}

  try {
    await supabase.from('payments').upsert([
      {
        id: newRecord.id,
        user_name: record.user_name,
        user_email: record.user_email,
        amount: 500,
        payment_method: record.payment_method,
        payment_screenshot_url: record.payment_screenshot_url || '',
        status: 'pending',
        created_at: newRecord.created_at,
      },
    ]);
  } catch (e) {}

  return newRecord;
}

export async function updatePaymentStatus(paymentId: string, status: 'approved' | 'rejected'): Promise<PaymentRecord[]> {
  const supabase = createBrowserClient();
  const current = getStoredPayments();
  const targetPayment = current.find((p) => p.id === paymentId);

  // Call Server API
  try {
    await fetch('/api/admin/approval', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetIdOrEmail: paymentId, action: status }),
    });
  } catch (e) {}

  try {
    await supabase.from('payments').update({ status }).eq('id', paymentId);
  } catch (e) {}

  if (targetPayment && targetPayment.user_email) {
    try {
      const emailPrefix = targetPayment.user_email.split('@')[0];
      await supabase
        .from('profiles')
        .update({ approval_status: status, is_approved: status === 'approved' })
        .or(`username.eq.${emailPrefix},username.eq.${targetPayment.user_email}`);
    } catch (e) {}

    try {
      await supabase
        .from('account_approvals')
        .update({ status })
        .eq('email', targetPayment.user_email);
    } catch (e) {}
  }

  const updated = current.map((p) => (p.id === paymentId ? { ...p, status } : p));
  saveStoredPayments(updated);
  return fetchRealPayments();
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

export async function fetchRealAdminUsers(): Promise<AdminUserItem[]> {
  const supabase = createBrowserClient();
  const userMap = new Map<string, AdminUserItem>();

  // Query Server API route /api/admin/data
  try {
    const res = await fetch('/api/admin/data', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.users)) {
        json.users.forEach((u: AdminUserItem) => {
          if (u && (u.id || u.email)) {
            userMap.set((u.id || u.email).toLowerCase(), u);
          }
        });
      }
    }
  } catch (e) {}

  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, created_at, approval_status, is_approved');

    const { data: anonIdentities } = await supabase
      .from('anonymous_identities')
      .select('user_id, anonymous_name');

    const anonMap = new Map<string, string>();
    if (anonIdentities) {
      anonIdentities.forEach((ai: any) => {
        if (ai.user_id && ai.anonymous_name) {
          anonMap.set(ai.user_id, ai.anonymous_name);
        }
      });
    }

    if (profiles && profiles.length > 0) {
      profiles.forEach((p: any, idx: number) => {
        const id = p.id;
        const email = p.username && p.username.includes('@') ? p.username : `${p.username || 'user'}@parlons-en.fr`;
        const anonName = anonMap.get(id) || `Utilisateur #${1000 + idx * 37}`;
        const status = p.approval_status === 'approved' || p.is_approved ? 'approved' : p.approval_status === 'rejected' ? 'rejected' : 'pending';

        userMap.set(id.toLowerCase(), {
          id: id,
          email: email,
          name: p.username || 'Membre Inscrit',
          anonymousName: anonName,
          paymentStatus: status,
          createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : 'Récemment',
        });
      });
    }
  } catch (e) {}

  const payments = await fetchRealPayments();
  payments.forEach((p, idx) => {
    const key = p.user_email.toLowerCase();
    if (!userMap.has(key)) {
      userMap.set(key, {
        id: p.id || `usr-${idx}`,
        email: p.user_email,
        name: p.user_name,
        anonymousName: `Utilisateur #${1000 + idx * 37}`,
        paymentStatus: p.status,
        createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : 'Récemment',
      });
    }
  });

  return Array.from(userMap.values());
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
    createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    isAdminMessage: true,
  };

  if (!messagesMap[topicId]) {
    messagesMap[topicId] = [];
  }

  messagesMap[topicId] = [...messagesMap[topicId], newAdminMessage];

  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messagesMap));
  }

  broadcastChatMessage(newAdminMessage as any).catch(() => {});

  return messagesMap;
}

export function sendAdminReplyToTopic(content: string, topicId: string): Record<string, any[]> {
  const messagesMap = getStoredChatMessagesMap();
  const newAdminMessage = {
    id: `admin-reply-${Date.now()}`,
    topicId,
    senderId: 'admin-official',
    senderName: '🛡️ Administrateur',
    senderAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=AdminOfficialBadge',
    content: content.trim(),
    createdAt: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    isSelf: false,
    isAdminMessage: true,
  };

  if (!messagesMap[topicId]) {
    messagesMap[topicId] = [];
  }

  messagesMap[topicId] = [...messagesMap[topicId], newAdminMessage];

  if (typeof window !== 'undefined') {
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messagesMap));
  }

  broadcastChatMessage(newAdminMessage as any).catch(() => {});

  return messagesMap;
}

export function startOrGetAdminUserChatTopic(userPseudonym: string, userName?: string): { topicId: string; topicTitle: string } {
  const cleanId = `admin-chat-${userPseudonym.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
  const topicTitle = `💬 Support Direct : ${userPseudonym}${userName ? ` (${userName})` : ''}`;

  const newTopic = {
    id: cleanId,
    title: topicTitle,
    categorySlug: 'general',
    categoryName: 'Support Administrateur',
    authorPseudonym: 'Modération Officielle',
    authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=AdminOfficialBadge',
    createdAt: "À l'instant",
    activeCount: 2,
    isAdminTopic: true,
  };

  if (typeof window !== 'undefined') {
    try {
      const savedTopics = localStorage.getItem('parlons_en_chat_topics_v2');
      const topicsList = savedTopics ? JSON.parse(savedTopics) : [];
      const exists = topicsList.some((t: any) => t.id === cleanId);
      if (!exists) {
        localStorage.setItem('parlons_en_chat_topics_v2', JSON.stringify([newTopic, ...topicsList]));
      }
    } catch (e) {}
  }

  broadcastChatTopic(newTopic as any).catch(() => {});

  return { topicId: cleanId, topicTitle };
}

export function editChatMessageInTopic(topicId: string, messageId: string, newContent: string): Record<string, any[]> {
  const messagesMap = getStoredChatMessagesMap();
  if (messagesMap[topicId]) {
    messagesMap[topicId] = messagesMap[topicId].map((msg) =>
      msg.id === messageId ? { ...msg, content: newContent } : msg
    );
    if (typeof window !== 'undefined') {
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messagesMap));
    }
    const targetMsg = messagesMap[topicId].find((m) => m.id === messageId);
    if (targetMsg) {
      broadcastChatMessage(targetMsg).catch(() => {});
    }
  }
  return messagesMap;
}


