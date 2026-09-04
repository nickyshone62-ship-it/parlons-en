import { NextResponse } from 'next/server';
import { fetchNeonChatMessages, createNeonChatMessageRecord } from '@/lib/db/neonQueries';

export async function GET() {
  try {
    const rawMessages = await fetchNeonChatMessages();
    const messagesMap: Record<string, any[]> = {};

    if (Array.isArray(rawMessages)) {
      rawMessages.forEach((m: any) => {
        const topicId = m.topic_id;
        if (!messagesMap[topicId]) {
          messagesMap[topicId] = [];
        }
        messagesMap[topicId].push({
          id: m.id,
          topicId: m.topic_id,
          senderId: m.sender_id,
          senderName: m.sender_name || 'Utilisateur Anonyme',
          senderAvatar: m.sender_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${m.sender_id}`,
          content: m.content,
          createdAt: m.created_at
            ? new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
            : 'Récemment',
          isSelf: false,
        });
      });
    }

    return NextResponse.json({ success: true, source: 'neon', messagesMap });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, messagesMap: {} }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, topicId, senderId, senderName, senderAvatar, content } = body;

    if (!id || !topicId || !senderId || !content) {
      return NextResponse.json({ success: false, error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    const msg = await createNeonChatMessageRecord({
      id,
      topicId,
      senderId,
      senderName: senderName || 'Utilisateur Anonyme',
      senderAvatar,
      content,
    });

    return NextResponse.json({ success: true, source: 'neon', message: msg });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
