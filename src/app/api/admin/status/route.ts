import { NextResponse } from 'next/server';
import { getServerAdminData } from '@/lib/admin/serverStore';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId')?.toLowerCase();
  const email = searchParams.get('email')?.toLowerCase();

  if (email === 'nickyshone62@gmail.com' || email === 'admin@parlons-en.fr') {
    return NextResponse.json({ status: 'approved' });
  }

  try {
    const data = await getServerAdminData();
    const found = data.approvals.find(
      (a) =>
        (userId && a.id.toLowerCase() === userId) ||
        (email && a.email.toLowerCase() === email)
    );

    if (found) {
      return NextResponse.json({ status: found.status });
    }

    return NextResponse.json({ status: 'pending' });
  } catch (error) {
    return NextResponse.json({ status: 'pending' });
  }
}
