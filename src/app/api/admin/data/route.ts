import { NextResponse } from 'next/server';
import { getServerAdminData } from '@/lib/admin/serverStore';

export async function GET() {
  try {
    const data = await getServerAdminData();
    const userMap = new Map<string, any>();

    // Seed users from approvals (profiles)
    if (Array.isArray(data.approvals)) {
      data.approvals.forEach((a, idx) => {
        if (a && (a.id || a.email)) {
          const key = (a.id || a.email).toLowerCase();
          userMap.set(key, {
            id: a.id || `usr-${idx}`,
            email: a.email,
            name: a.fullName || a.email.split('@')[0],
            anonymousName: a.anonymousName || `Utilisateur #${1000 + idx * 37}`,
            paymentStatus: a.status || 'pending',
            createdAt: a.createdAt ? new Date(a.createdAt).toLocaleDateString('fr-FR') : 'Récemment',
          });
        }
      });
    }

    // Merge payments for any user not yet in approvals
    if (Array.isArray(data.payments)) {
      data.payments.forEach((p, idx) => {
        if (p && (p.id || p.user_email)) {
          const key = (p.id || p.user_email).toLowerCase();
          if (!userMap.has(key)) {
            userMap.set(key, {
              id: p.id || `usr-${idx}`,
              email: p.user_email,
              name: p.user_name || p.user_email.split('@')[0],
              anonymousName: `Utilisateur #${1000 + idx * 37}`,
              paymentStatus: p.status,
              createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : 'Récemment',
            });
          }
        }
      });
    }

    const users = Array.from(userMap.values());

    return NextResponse.json({
      success: true,
      approvals: data.approvals,
      payments: data.payments,
      users,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
