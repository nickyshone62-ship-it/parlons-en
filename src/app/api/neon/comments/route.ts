import { NextResponse } from 'next/server';
import { fetchNeonComments } from '@/lib/db/neonQueries';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json({ success: false, error: 'postId requis' }, { status: 400 });
    }

    const comments = await fetchNeonComments(postId);
    return NextResponse.json({ success: true, source: 'neon', comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, comments: [] }, { status: 500 });
  }
}
