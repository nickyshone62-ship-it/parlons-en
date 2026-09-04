import { NextResponse } from 'next/server';
import { fetchNeonChatTopics, createNeonChatTopicRecord } from '@/lib/db/neonQueries';

export async function GET() {
  try {
    const topics = await fetchNeonChatTopics();
    return NextResponse.json({ success: true, source: 'neon', topics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, topics: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, categorySlug, categoryName, authorPseudonym, authorAvatar } = body;

    if (!id || !title) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const topic = await createNeonChatTopicRecord({
      id,
      title,
      categorySlug,
      categoryName,
      authorPseudonym,
      authorAvatar,
    });

    return NextResponse.json({ success: true, source: 'neon', topic });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
