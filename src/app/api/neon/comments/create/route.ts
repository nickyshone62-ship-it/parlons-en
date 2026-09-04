import { NextResponse } from 'next/server';
import { createNeonCommentRecord } from '@/lib/db/neonQueries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postId, content, authorId } = body;

    if (!postId || !content) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    const defaultAuthorId = authorId || 'a0000000-0000-0000-0000-000000000001';
    const newComment = await createNeonCommentRecord(postId, defaultAuthorId, content);

    return NextResponse.json({ success: true, source: 'neon', comment: newComment });
  } catch (error: any) {
    console.error('Error creating comment in Neon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
