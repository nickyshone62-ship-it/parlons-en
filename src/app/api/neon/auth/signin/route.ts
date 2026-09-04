import { NextResponse } from 'next/server';
import { findNeonProfileByEmail, assignNeonAnonymousIdentity } from '@/lib/db/neonQueries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email requis' }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const profile = await findNeonProfileByEmail(cleanEmail);
    const userId = profile ? profile.id : `usr-${Date.now()}`;
    const anonymousName = await assignNeonAnonymousIdentity(userId, cleanEmail);

    const isAdmin = Boolean(
      cleanEmail === 'nickyshone62@gmail.com' ||
      cleanEmail === 'admin@parlons-en.fr' ||
      profile?.role === 'admin'
    );

    const user = {
      id: userId,
      email: cleanEmail,
      user_metadata: {
        first_name: profile?.username?.split('@')[0] || 'Membre',
        last_name: '',
        role: isAdmin ? 'admin' : 'user',
        avatar_url: profile?.avatar_url || '',
      },
    };

    return NextResponse.json({
      success: true,
      source: 'neon',
      user,
      profile: profile ? { ...profile, role: isAdmin ? 'admin' : (profile.role || 'user') } : null,
      isAdmin,
      anonymousName: isAdmin ? '👑 Administrateur PARLONS-EN' : anonymousName,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
