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
 * Registers a newly created user account for admin approval
 */
export function registerUserForApproval(user: { id: string; email: string; fullName: string; anonymousName: string }): UserAccountApproval {
  const current = getStoredAccountApprovals();
  const existing = current.find((a) => a.id === user.id || a.email === user.email);
  if (existing) return existing;

  const newApproval: UserAccountApproval = {
    id: user.id,
    email: user.email,
    fullName: user.fullName || user.email.split('@')[0],
    anonymousName: user.anonymousName,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updated = [newApproval, ...current];
  saveStoredAccountApprovals(updated);
  return newApproval;
}

/**
 * Approves a user account by Admin
 */
export async function approveUserAccount(userIdOrEmail: string): Promise<UserAccountApproval[]> {
  const supabase = createBrowserClient();

  try {
    await supabase.from('profiles').update({ approval_status: 'approved', is_approved: true }).eq('id', userIdOrEmail);
  } catch (e) {}

  const current = getStoredAccountApprovals();
  const updated = current.map((item) =>
    item.id === userIdOrEmail || item.email === userIdOrEmail
      ? { ...item, status: 'approved' as const }
      : item
  );

  saveStoredAccountApprovals(updated);
  return updated;
}

/**
 * Rejects a user account by Admin
 */
export async function rejectUserAccount(userIdOrEmail: string): Promise<UserAccountApproval[]> {
  const supabase = createBrowserClient();

  try {
    await supabase.from('profiles').update({ approval_status: 'rejected', is_approved: false }).eq('id', userIdOrEmail);
  } catch (e) {}

  const current = getStoredAccountApprovals();
  const updated = current.map((item) =>
    item.id === userIdOrEmail || item.email === userIdOrEmail
      ? { ...item, status: 'rejected' as const }
      : item
  );

  saveStoredAccountApprovals(updated);
  return updated;
}

/**
 * Checks if a user's account is approved
 */
export function checkUserApprovalStatus(userId?: string, email?: string): 'pending' | 'approved' | 'rejected' {
  if (!userId && !email) return 'approved';

  const current = getStoredAccountApprovals();
  const record = current.find((a) => (userId && a.id === userId) || (email && a.email === email));

  if (!record) {
    return 'pending';
  }

  return record.status;
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
      .or(`id.eq.${cleanId},email.eq.${cleanId},anonymous_name.ilike.%${cleanId}%`);
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

  return updated;
}
