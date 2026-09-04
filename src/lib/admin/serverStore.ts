import { UserAccountApproval } from './approval';
import { PaymentRecord } from '@/types';
import { createClient as createBrowserClient } from '@/lib/supabase/client';

export interface ServerStoreData {
  approvals: UserAccountApproval[];
  payments: PaymentRecord[];
}

// In-memory global store to survive API route calls on Node.js server
const globalServerStore: ServerStoreData = {
  approvals: [],
  payments: [],
};

/**
 * Syncs and retrieves all admin data from server store and Supabase DB
 */
export async function getServerAdminData(): Promise<ServerStoreData> {
  const supabase = createBrowserClient();
  const approvalMap = new Map<string, UserAccountApproval>();
  const paymentMap = new Map<string, PaymentRecord>();

  // 1. Seed with global in-memory store
  globalServerStore.approvals.forEach((a) => {
    if (a && (a.id || a.email)) {
      approvalMap.set((a.id || a.email).toLowerCase(), a);
    }
  });

  globalServerStore.payments.forEach((p) => {
    if (p && (p.id || p.user_email)) {
      paymentMap.set((p.id || p.user_email).toLowerCase(), p);
    }
  });

  // 2. Fetch from Supabase DB profiles & anonymous_identities
  try {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, username, approval_status, is_approved, created_at');

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
        const key = id.toLowerCase();
        const existingApp = approvalMap.get(key);

        const email = existingApp?.email || (p.username && p.username.includes('@') ? p.username : `${p.username || 'user'}@parlons-en.fr`);
        const fullName = existingApp?.fullName || p.username || 'Membre Inscrit';
        const anonName = anonMap.get(id) || existingApp?.anonymousName || `Utilisateur #${1000 + idx * 37}`;
        const status = p.approval_status || (p.is_approved ? 'approved' : 'pending');

        const dbApp: UserAccountApproval = {
          id: id,
          email: email,
          fullName: fullName,
          anonymousName: anonName,
          status: status === 'approved' || status === 'rejected' ? status : 'pending',
          createdAt: p.created_at || existingApp?.createdAt || new Date().toISOString(),
        };

        approvalMap.set(key, dbApp);
        if (email) approvalMap.set(email.toLowerCase(), dbApp);

        // Synthetic payment record if missing
        const payKey = email.toLowerCase();
        if (!paymentMap.has(payKey)) {
          const synthPay: PaymentRecord = {
            id: `pay-prof-${id}`,
            user_name: fullName,
            user_email: email,
            amount: 500,
            payment_method: 'Paiement Inscription',
            payment_screenshot_url: '',
            status: status === 'approved' || status === 'rejected' ? status : 'pending',
            created_at: p.created_at || new Date().toISOString(),
          };
          paymentMap.set(payKey, synthPay);
        }
      });
    }
  } catch (e) {
    console.error("Error loading server store from Supabase profiles:", e);
  }

  // 3. Fetch from account_approvals table if created
  try {
    const { data: dbApprovals } = await supabase.from('account_approvals').select('*');
    if (dbApprovals && dbApprovals.length > 0) {
      dbApprovals.forEach((a: any) => {
        const id = a.id || a.user_id;
        if (!id) return;
        const key = id.toLowerCase();
        const existing = approvalMap.get(key);

        const item: UserAccountApproval = {
          id: id,
          email: a.email || existing?.email || `${id}@parlons-en.fr`,
          fullName: a.full_name || a.fullName || existing?.fullName || 'Membre Inscrit',
          anonymousName: a.anonymous_name || a.anonymousName || existing?.anonymousName || 'Utilisateur',
          status: a.status || existing?.status || 'pending',
          createdAt: a.created_at || a.createdAt || existing?.createdAt || new Date().toISOString(),
        };
        approvalMap.set(key, item);
        if (item.email) approvalMap.set(item.email.toLowerCase(), item);
      });
    }
  } catch (e) {}

  // 4. Fetch from payments table if created
  try {
    const { data: dbPayments } = await supabase.from('payments').select('*');
    if (dbPayments && dbPayments.length > 0) {
      dbPayments.forEach((p: any) => {
        const pKey = (p.id || p.user_email || '').toLowerCase();
        if (!pKey) return;
        paymentMap.set(pKey, {
          id: p.id || `pay-${Date.now()}`,
          user_name: p.user_name || 'Membre Inscrit',
          user_email: p.user_email || '',
          amount: p.amount || 500,
          payment_method: p.payment_method || 'Orange Money',
          payment_screenshot_url: p.payment_screenshot_url || '',
          status: p.status || 'pending',
          created_at: p.created_at || new Date().toISOString(),
        });
      });
    }
  } catch (e) {}

  const finalApprovals = Array.from(new Set(approvalMap.values()));
  const finalPayments = Array.from(new Set(paymentMap.values()));

  globalServerStore.approvals = finalApprovals;
  globalServerStore.payments = finalPayments;

  return {
    approvals: finalApprovals,
    payments: finalPayments,
  };
}

export function addServerRegistration(approval: UserAccountApproval) {
  const key = (approval.id || approval.email).toLowerCase();
  const existingIdx = globalServerStore.approvals.findIndex(
    (a) => a.id.toLowerCase() === key || a.email.toLowerCase() === key
  );

  if (existingIdx >= 0) {
    globalServerStore.approvals[existingIdx] = {
      ...globalServerStore.approvals[existingIdx],
      ...approval,
    };
  } else {
    globalServerStore.approvals.unshift(approval);
  }
}

export function addServerPayment(payment: PaymentRecord) {
  const key = (payment.id || payment.user_email).toLowerCase();
  const existingIdx = globalServerStore.payments.findIndex(
    (p) => p.id.toLowerCase() === key || p.user_email.toLowerCase() === key
  );

  if (existingIdx >= 0) {
    globalServerStore.payments[existingIdx] = {
      ...globalServerStore.payments[existingIdx],
      ...payment,
    };
  } else {
    globalServerStore.payments.unshift(payment);
  }
}

export function updateServerApprovalStatus(targetIdOrEmail: string, status: 'approved' | 'rejected') {
  const cleanTarget = targetIdOrEmail.toLowerCase();
  globalServerStore.approvals = globalServerStore.approvals.map((a) =>
    a.id.toLowerCase() === cleanTarget || a.email.toLowerCase() === cleanTarget
      ? { ...a, status }
      : a
  );

  globalServerStore.payments = globalServerStore.payments.map((p) =>
    p.id.toLowerCase() === cleanTarget || p.user_email.toLowerCase() === cleanTarget
      ? { ...p, status }
      : p
  );
}

export function deleteServerUser(targetIdOrEmail: string) {
  const cleanTarget = targetIdOrEmail.toLowerCase();
  globalServerStore.approvals = globalServerStore.approvals.filter(
    (a) =>
      a.id.toLowerCase() !== cleanTarget &&
      a.email.toLowerCase() !== cleanTarget &&
      !a.anonymousName.toLowerCase().includes(cleanTarget)
  );

  globalServerStore.payments = globalServerStore.payments.filter(
    (p) =>
      p.id.toLowerCase() !== cleanTarget &&
      p.user_email.toLowerCase() !== cleanTarget &&
      !p.user_name.toLowerCase().includes(cleanTarget)
  );
}
