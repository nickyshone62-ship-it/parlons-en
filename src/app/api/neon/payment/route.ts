import { NextResponse } from 'next/server';
import { createNeonPaymentRecord } from '@/lib/db/neonQueries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { user_name, user_email, payment_method, payment_screenshot_url, transaction_id } = body;

    if (!user_email || !user_name || !payment_method) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const paymentId = `pay-${Date.now()}`;
    const payment = await createNeonPaymentRecord({
      id: paymentId,
      userName: user_name,
      userEmail: user_email,
      paymentMethod: payment_method,
      paymentScreenshotUrl: payment_screenshot_url || '',
      transactionId: transaction_id || '',
    });

    return NextResponse.json({ success: true, source: 'neon', payment });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
