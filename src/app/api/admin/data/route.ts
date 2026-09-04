import { NextResponse } from 'next/server';
import { getServerAdminData } from '@/lib/admin/serverStore';

export async function GET() {
  try {
    const data = await getServerAdminData();
    const users = data.payments.map((p, idx) => ({
      id: p.id || `usr-${idx}`,
      email: p.user_email,
      name: p.user_name,
      anonymousName: `Utilisateur #${1000 + idx * 37}`,
      paymentStatus: p.status,
      createdAt: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : 'Récemment',
    }));

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
