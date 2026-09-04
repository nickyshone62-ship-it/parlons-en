import { NextResponse } from 'next/server';
import { createNeonPostRecord } from '@/lib/db/neonQueries';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { categoryId, title, content, authorId } = body;

    if (!categoryId || !title || !content) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants.' }, { status: 400 });
    }

    const defaultAuthorId = authorId || 'a0000000-0000-0000-0000-000000000001';
    const newPost = await createNeonPostRecord(defaultAuthorId, categoryId, title, content);

    return NextResponse.json({ success: true, source: 'neon', post: newPost });
  } catch (error: any) {
    console.error('Error creating post in Neon:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
