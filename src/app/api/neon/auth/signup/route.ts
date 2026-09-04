import { NextResponse } from 'next/server';
import { registerNeonUser, createNeonPaymentRecord } from '@/lib/db/neonQueries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, firstName, lastName, avatarUrl, transactionId, paymentMethod } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email requis' }, { status: 400 });
    }

    const fullName = `${firstName || ''} ${lastName || ''}`.trim() || email.split('@')[0];
    const result = await registerNeonUser({
      email: email.trim(),
      fullName,
      avatarUrl: avatarUrl || '',
    });

    if (transactionId || paymentMethod) {
      await createNeonPaymentRecord({
        id: `pay-${Date.now()}`,
        userId: result.userId,
        userName: fullName,
        userEmail: email.trim(),
        paymentMethod: paymentMethod || 'Orange Money',
        transactionId: transactionId || '',
      });
    }

    return NextResponse.json({
      success: true,
      source: 'neon',
      user: {
        id: result.userId,
        email: email.trim(),
        user_metadata: {
          first_name: firstName || '',
          last_name: lastName || '',
          full_name: fullName,
          avatar_url: avatarUrl || '',
        },
      },
      profile: result.profile,
      anonymousName: result.anonymousName,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
