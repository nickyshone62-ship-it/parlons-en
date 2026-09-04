import { createClient as createBrowserClient } from '@/lib/supabase/client';

export interface UserAccountApproval {
  id: string;
  email: string;
  fullName: string;
  anonymousName: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

const LOCAL_STORAGE_APPROVALS_KEY = 'parlons_en_account_approvals_v1';

export function getStoredAccountApprovals(): UserAccountApproval[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(LOCAL_STORAGE_APPROVALS_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch {
    return [];
  }
}

export function saveStoredAccountApprovals(approvals: UserAccountApproval[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_APPROVALS_KEY, JSON.stringify(approvals));
  }
}

/**
 * Fetches all registered account approvals from Supabase DB (profiles + anonymous_identities + account_approvals)
 * merged with local storage so accounts registered on any device are visible in Admin Space.
 */
export async function fetchAllAccountApprovals(): Promise<UserAccountApproval[]> {
  const supabase = createBrowserClient();
  const localApprovals = getStoredAccountApprovals();
  const approvalMap = new Map<string, UserAccountApproval>();

  localApprovals.forEach((item) => {
    if (item && (item.id || item.email)) {
      const key = (item.id || item.email).toLowerCase();
      approvalMap.set(key, item);
    }
  });

  // 1. Fetch from public.profiles and public.anonymous_identities
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
      profiles.forEach((p: any) => {
        const id = p.id;
        const key = id.toLowerCase();
        const existing = approvalMap.get(key);

        const anonName = anonMap.get(id) || existing?.anonymousName || `Utilisateur #${id.substring(0, 4)}`;
        const status = p.approval_status || (p.is_approved ? 'approved' : 'pending');
        const email = existing?.email || (p.username && p.username.includes('@') ? p.username : `${p.username || 'user'}@parlons-en.fr`);
        const fullName = existing?.fullName || p.username || 'Membre Inscrit';

        const dbApproval: UserAccountApproval = {
          id: id,
          email: email,
          fullName: fullName,
          anonymousName: anonName,
          status: (status === 'approved' || status === 'rejected') ? status : 'pending',
          createdAt: p.created_at || existing?.createdAt || new Date().toISOString(),
        };

        approvalMap.set(key, dbApproval);
      });
    }
  } catch (e) {
    console.error("Error fetching DB profiles for admin approval:", e);
  }

  // 2. Fetch from account_approvals table if present
  try {
    const { data: dbApprovals } = await supabase
      .from('account_approvals')
      .select('*');

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
      });
    }
  } catch (e) {}

  const merged = Array.from(approvalMap.values());
  saveStoredAccountApprovals(merged);
  return merged;
}

/**
 * Registers a newly created user account for admin approval (local + DB persistence)
 */
export async function registerUserForApproval(user: { id: string; email: string; fullName: string; anonymousName: string }): Promise<UserAccountApproval> {
  const supabase = createBrowserClient();
  const current = getStoredAccountApprovals();
  const existing = current.find((a) => a.id === user.id || a.email === user.email);

  const newApproval: UserAccountApproval = {
    id: user.id,
    email: user.email,
    fullName: user.fullName || user.email.split('@')[0],
    anonymousName: user.anonymousName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updated = existing
    ? current.map((a) => (a.id === user.id || a.email === user.email ? newApproval : a))
    : [newApproval, ...current];

  saveStoredAccountApprovals(updated);

  // DB persistence
  try {
    await supabase.from('account_approvals').upsert([
      {
        id: user.id,
        email: user.email,
        full_name: newApproval.fullName,
        anonymous_name: user.anonymousName,
        status: 'pending',
        created_at: newApproval.createdAt,
      },
    ]);
  } catch (e) {}

  try {
    await supabase.from('profiles').upsert([
      {
        id: user.id,
        username: user.email.split('@')[0],
        approval_status: 'pending',
        is_approved: false,
        updated_at: new Date().toISOString(),
      },
    ], { onConflict: 'id' });
  } catch (e) {}

  return newApproval;
}

/**
 * Approves a user account by Admin
 */
export async function approveUserAccount(userIdOrEmail: string): Promise<UserAccountApproval[]> {
  const supabase = createBrowserClient();
  const target = userIdOrEmail.trim();

  try {
    await supabase
      .from('profiles')
      .update({ approval_status: 'approved', is_approved: true })
      .or(`id.eq.${target},username.eq.${target}`);
  } catch (e) {}

  try {
    await supabase
      .from('account_approvals')
      .update({ status: 'approved' })
      .or(`id.eq.${target},email.eq.${target}`);
  } catch (e) {}

  const current = getStoredAccountApprovals();
  const updated = current.map((item) =>
    item.id === target || item.email.toLowerCase() === target.toLowerCase()
      ? { ...item, status: 'approved' as const }
      : item
  );

  saveStoredAccountApprovals(updated);
  return fetchAllAccountApprovals();
}

/**
 * Rejects a user account by Admin
 */
export async function rejectUserAccount(userIdOrEmail: string): Promise<UserAccountApproval[]> {
  const supabase = createBrowserClient();
  const target = userIdOrEmail.trim();

  try {
    await supabase
      .from('profiles')
      .update({ approval_status: 'rejected', is_approved: false })
      .or(`id.eq.${target},username.eq.${target}`);
  } catch (e) {}

  try {
    await supabase
      .from('account_approvals')
      .update({ status: 'rejected' })
      .or(`id.eq.${target},email.eq.${target}`);
  } catch (e) {}

  const current = getStoredAccountApprovals();
  const updated = current.map((item) =>
    item.id === target || item.email.toLowerCase() === target.toLowerCase()
      ? { ...item, status: 'rejected' as const }
      : item
  );

  saveStoredAccountApprovals(updated);
  return fetchAllAccountApprovals();
}

/**
 * Checks if a user's account is approved (synchronous version for immediate UI rendering)
 */
export function checkUserApprovalStatus(userId?: string, email?: string): 'pending' | 'approved' | 'rejected' {
  if (!userId && !email) return 'approved';

  const cleanEmail = email?.trim().toLowerCase();
  if (cleanEmail === 'nickyshone62@gmail.com' || cleanEmail === 'admin@parlons-en.fr') {
    return 'approved';
  }

  if (typeof window !== 'undefined' && localStorage.getItem('parlons_en_is_admin') === 'true') {
    return 'approved';
  }

  const current = getStoredAccountApprovals();
  const record = current.find((a) => (userId && a.id === userId) || (cleanEmail && a.email.toLowerCase() === cleanEmail));

  if (!record) {
    return 'pending';
  }

  return record.status;
}

/**
 * Checks if a user's account is approved (async DB version that queries Supabase profiles)
 */
export async function checkUserApprovalStatusAsync(userId?: string, email?: string): Promise<'pending' | 'approved' | 'rejected'> {
  if (!userId && !email) return 'approved';

  const cleanEmail = email?.trim().toLowerCase();
  if (cleanEmail === 'nickyshone62@gmail.com' || cleanEmail === 'admin@parlons-en.fr') {
    return 'approved';
  }

  if (typeof window !== 'undefined' && localStorage.getItem('parlons_en_is_admin') === 'true') {
    return 'approved';
  }

  const supabase = createBrowserClient();

  if (userId) {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('approval_status, is_approved')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        if (data.approval_status === 'approved' || data.is_approved) {
          const current = getStoredAccountApprovals();
          const updated = current.map((a) => (a.id === userId ? { ...a, status: 'approved' as const } : a));
          saveStoredAccountApprovals(updated);
          return 'approved';
        }
        if (data.approval_status === 'rejected') {
          return 'rejected';
        }
      }
    } catch (e) {}
  }

  return checkUserApprovalStatus(userId, email);
}

/**
 * Deletes a user account completely (by ID, email, or anonymous name like "Utilisateur #3509" or "3509")
 */
export async function deleteUserAccount(identifier: string): Promise<UserAccountApproval[]> {
  const supabase = createBrowserClient();
  const cleanId = identifier.trim().toLowerCase();

  try {
    await supabase
      .from('profiles')
      .delete()
      .or(`id.eq.${cleanId},email.eq.${cleanId},username.ilike.%${cleanId}%`);
  } catch (e) {}

  try {
    await supabase
      .from('account_approvals')
      .delete()
      .or(`id.eq.${cleanId},email.eq.${cleanId}`);
  } catch (e) {}

  const current = getStoredAccountApprovals();
  const updated = current.filter((item) => {
    const matchesId = item.id.toLowerCase() === cleanId;
    const matchesEmail = item.email.toLowerCase() === cleanId;
    const matchesAnon = item.anonymousName.toLowerCase().includes(cleanId);
    return !matchesId && !matchesEmail && !matchesAnon;
  });

  saveStoredAccountApprovals(updated);

  if (typeof window !== 'undefined') {
    try {
      // Clear payments & warnings associated with this user
      const payments = localStorage.getItem('parlons_en_admin_payments_v1');
      if (payments) {
        const parsed = JSON.parse(payments);
        const filtered = parsed.filter(
          (p: any) =>
            !p.user_email?.toLowerCase().includes(cleanId) &&
            !p.user_name?.toLowerCase().includes(cleanId)
        );
        localStorage.setItem('parlons_en_admin_payments_v1', JSON.stringify(filtered));
      }
    } catch (e) {}
  }

  return fetchAllAccountApprovals();
}
