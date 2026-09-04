import { NextResponse } from 'next/server';
import { addServerRegistration } from '@/lib/admin/serverStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, email, fullName, anonymousName } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email indisponible' }, { status: 400 });
    }

    const newApproval = {
      id: id || `usr-${Date.now()}`,
      email,
      fullName: fullName || email.split('@')[0],
      anonymousName: anonymousName || 'Utilisateur Anonyme',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };

    addServerRegistration(newApproval);

    return NextResponse.json({ success: true, approval: newApproval });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
