import { NextResponse } from 'next/server';
import { addServerPayment } from '@/lib/admin/serverStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_email, user_name, payment_method, payment_screenshot_url } = body;

    if (!user_email) {
      return NextResponse.json({ success: false, error: 'Email requis pour le paiement' }, { status: 400 });
    }

    const newPayment = {
      id: `pay-${Date.now()}`,
      user_email,
      user_name: user_name || user_email.split('@')[0],
      amount: 500,
      payment_method: payment_method || 'Orange Money',
      payment_screenshot_url: payment_screenshot_url || '',
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };

    addServerPayment(newPayment);

    return NextResponse.json({ success: true, payment: newPayment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
