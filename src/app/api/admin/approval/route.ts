import { NextResponse } from 'next/server';
import { updateServerApprovalStatus, deleteServerUser, getServerAdminData } from '@/lib/admin/serverStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetIdOrEmail, action } = body;

    if (!targetIdOrEmail) {
      return NextResponse.json({ success: false, error: 'Target requis' }, { status: 400 });
    }

    if (action === 'delete') {
      deleteServerUser(targetIdOrEmail);
    } else if (action === 'approved' || action === 'rejected') {
      updateServerApprovalStatus(targetIdOrEmail, action);
    }

    const updatedData = await getServerAdminData();

    return NextResponse.json({
      success: true,
      approvals: updatedData.approvals,
      payments: updatedData.payments,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
