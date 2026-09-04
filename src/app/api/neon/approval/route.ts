import { NextResponse } from 'next/server';
import { updateNeonApprovalStatus } from '@/lib/db/neonQueries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { targetIdOrEmail, action } = body;

    if (!targetIdOrEmail || (action !== 'approved' && action !== 'rejected')) {
      return NextResponse.json({ success: false, error: 'Paramètres invalides' }, { status: 400 });
    }

    await updateNeonApprovalStatus(targetIdOrEmail, action);

    return NextResponse.json({ success: true, source: 'neon', status: action });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
