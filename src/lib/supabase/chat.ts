import { createClient } from './client';

export interface UserChatTopic {
  id: string;
  title: string;
  categorySlug: string;
  categoryName: string;
  authorPseudonym: string;
  authorAvatar: string;
  createdAt: string;
  activeCount: number;
  isAdminTopic?: boolean;
}

export interface ChatMessage {
  id: string;
  topicId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  createdAt: string;
  isSelf: boolean;
}

export const CHAT_TOPICS_KEY = 'parlons_en_chat_topics_v2';
export const CHAT_MESSAGES_KEY = 'parlons_en_chat_messages_v2';

export const INITIAL_TOPICS: UserChatTopic[] = [
  {
    id: 'topic-1',
    title: '💬 Salon de Discussion Générale & Entraide',
    categorySlug: 'general',
    categoryName: 'Café & Discussion',
    authorPseudonym: 'Communauté',
    authorAvatar: 'https://api.dicebear.com/7.x/identicon/svg?seed=General1',
    createdAt: 'À l\'instant',
    activeCount: 1,
    isAdminTopic: true,
  },
];

export function getOrCreateGuestId(): { guestId: string; guestName: string; guestAvatar: string } {
  if (typeof window === 'undefined') {
    return {
      guestId: 'guest-ssr',
      guestName: 'Utilisateur Anonyme',
      guestAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=GuestSSR',
    };
  }
  let guestId = sessionStorage.getItem('parlons_en_guest_id');
  let guestName = sessionStorage.getItem('parlons_en_guest_name');
  let guestAvatar = sessionStorage.getItem('parlons_en_guest_avatar');

  if (!guestId) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    guestId = `guest-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    guestName = `Utilisateur #${randomNum}`;
    guestAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestId}`;

    sessionStorage.setItem('parlons_en_guest_id', guestId);
    sessionStorage.setItem('parlons_en_guest_name', guestName);
    sessionStorage.setItem('parlons_en_guest_avatar', guestAvatar);
  }

  return {
    guestId,
    guestName: guestName || 'Utilisateur Anonyme',
    guestAvatar: guestAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${guestId}`,
  };
}

let activeRealtimeChannel: any = null;

function getSharedChatChannel() {
  if (!activeRealtimeChannel) {
    const supabase = createClient();
    activeRealtimeChannel = supabase.channel('parlons_en_live_chat_room', {
      config: {
        broadcast: { self: false },
      },
    });
    activeRealtimeChannel.subscribe();
  }
  return activeRealtimeChannel;
}

/**
 * Subscribe to Supabase Realtime broadcast channel for multi-user chat updates
 */
export function subscribeToRealtimeChat(
  currentUserId: string,
  currentPseudonym: string,
  onNewMessage: (msg: ChatMessage) => void,
  onNewTopic: (topic: UserChatTopic) => void
) {
  const channel = getSharedChatChannel();

  channel
    .on('broadcast', { event: 'new_message' }, ({ payload }: any) => {
      if (payload && payload.id && payload.topicId && payload.content) {
        const isSelfMsg = Boolean(
          currentUserId &&
          currentUserId !== 'guest-ssr' &&
          payload.senderId === currentUserId
        );

        onNewMessage({
          ...payload,
          isSelf: isSelfMsg,
        } as ChatMessage);
      }
    })
    .on('broadcast', { event: 'new_topic' }, ({ payload }: any) => {
      if (payload && payload.id && payload.title) {
        onNewTopic(payload as UserChatTopic);
      }
    });

  return () => {
    // Keep shared channel alive
  };
}

/**
 * Broadcast a new message to all online users and persist
 */
export async function broadcastChatMessage(msg: ChatMessage) {
  const supabase = createClient();
  const channel = getSharedChatChannel();

  // Broadcast to all active users via shared Supabase Realtime channel
  try {
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg,
    });
  } catch (e) {
    console.error("Broadcast error", e);
  }

  // 1. Save in Neon PostgreSQL via API route
  try {
    await fetch('/api/neon/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: msg.id,
        topicId: msg.topicId,
        senderId: msg.senderId,
        senderName: msg.senderName,
        senderAvatar: msg.senderAvatar,
        content: msg.content,
      }),
    });
  } catch (e) {}

  // 2. Try Supabase DB persistence fallback
  try {
    await supabase.from('chat_messages').insert([
      {
        id: msg.id,
        topic_id: msg.topicId,
        sender_id: msg.senderId,
        sender_name: msg.senderName,
        sender_avatar: msg.senderAvatar,
        content: msg.content,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {}
}

/**
 * Broadcast a new topic to all online users and persist
 */
export async function broadcastChatTopic(topic: UserChatTopic) {
  const supabase = createClient();
  const channel = getSharedChatChannel();

  try {
    await channel.send({
      type: 'broadcast',
      event: 'new_topic',
      payload: topic,
    });
  } catch (e) {
    console.error("Topic broadcast error", e);
  }

  // 1. Save in Neon PostgreSQL via API route
  try {
    await fetch('/api/neon/chat/topics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: topic.id,
        title: topic.title,
        categorySlug: topic.categorySlug,
        categoryName: topic.categoryName,
        authorPseudonym: topic.authorPseudonym,
        authorAvatar: topic.authorAvatar,
      }),
    });
  } catch (e) {}

  // 2. Try Supabase DB persistence fallback
  try {
    await supabase.from('chat_topics').insert([
      {
        id: topic.id,
        title: topic.title,
        category_slug: topic.categorySlug,
        category_name: topic.categoryName,
        author_pseudonym: topic.authorPseudonym,
        author_avatar: topic.authorAvatar,
        created_at: new Date().toISOString(),
      },
    ]);
  } catch (e) {}
}

/**
 * Fetch topics from Neon DB, Supabase & local storage
 */
export async function fetchAllChatTopics(): Promise<UserChatTopic[]> {
  const supabase = createClient();
  let dbTopics: UserChatTopic[] = [];

  // 1. Primary Source: Query Neon API route /api/neon/chat/topics
  try {
    const res = await fetch('/api/neon/chat/topics', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.topics) && json.topics.length > 0) {
        dbTopics = json.topics.map((t: any) => ({
          id: t.id,
          title: t.title,
          categorySlug: t.category_slug || 'general',
          categoryName: t.category_name || 'Café & Général',
          authorPseudonym: t.author_pseudonym || 'Anonyme',
          authorAvatar: t.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.id}`,
          createdAt: 'Publié',
          activeCount: 1,
        }));
      }
    }
  } catch (e) {}

  // 2. Fallback Source: Query Supabase
  if (dbTopics.length === 0) {
    try {
      const { data } = await supabase
        .from('chat_topics')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        dbTopics = data.map((t: any) => ({
          id: t.id,
          title: t.title,
          categorySlug: t.category_slug || 'general',
          categoryName: t.category_name || 'Café & Général',
          authorPseudonym: t.author_pseudonym || 'Anonyme',
          authorAvatar: t.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.id}`,
          createdAt: 'Publié',
          activeCount: 1,
        }));
      }
    } catch (e) {}
  }

  let localTopics: UserChatTopic[] = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CHAT_TOPICS_KEY);
      if (saved) {
        localTopics = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const topicMap = new Map<string, UserChatTopic>();
  INITIAL_TOPICS.forEach((t) => topicMap.set(t.id, t));
  localTopics.forEach((t) => topicMap.set(t.id, t));
  dbTopics.forEach((t) => topicMap.set(t.id, t));

  return Array.from(topicMap.values());
}

/**
 * Fetch messages from Neon DB, Supabase & local storage
 */
export async function fetchAllChatMessages(): Promise<Record<string, ChatMessage[]>> {
  const supabase = createClient();
  const messageMap: Record<string, ChatMessage[]> = { 'topic-1': [] };

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CHAT_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          Object.assign(messageMap, parsed);
        }
      }
    } catch (e) {}
  }

  // 1. Primary Source: Query Neon API route /api/neon/chat/messages
  try {
    const res = await fetch('/api/neon/chat/messages', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.messagesMap && typeof json.messagesMap === 'object') {
        Object.keys(json.messagesMap).forEach((topicId) => {
          if (!messageMap[topicId]) {
            messageMap[topicId] = [];
          }
          json.messagesMap[topicId].forEach((msgObj: ChatMessage) => {
            const existingIdx = messageMap[topicId].findIndex((existing) => existing.id === msgObj.id);
            if (existingIdx >= 0) {
              const currentIsSelf = messageMap[topicId][existingIdx].isSelf;
              messageMap[topicId][existingIdx] = { ...msgObj, isSelf: currentIsSelf };
            } else {
              messageMap[topicId].push(msgObj);
            }
          });
        });
      }
    }
  } catch (e) {}

  try {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (data && data.length > 0) {
      data.forEach((m: any) => {
        const msgObj: ChatMessage = {
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
        };

        if (!messageMap[m.topic_id]) {
          messageMap[m.topic_id] = [];
        }

        const existingIdx = messageMap[m.topic_id].findIndex((existing) => existing.id === m.id);
        if (existingIdx >= 0) {
          // Preserve local isSelf status if present
          const currentIsSelf = messageMap[m.topic_id][existingIdx].isSelf;
          messageMap[m.topic_id][existingIdx] = {
            ...msgObj,
            isSelf: currentIsSelf,
          };
        } else {
          messageMap[m.topic_id].push(msgObj);
        }
      });
    }
  } catch (e) {}

  return messageMap;
}

/**
 * Delete a specific chat message from Supabase DB and local storage
 */
export async function deleteChatMessage(messageId: string, topicId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    await supabase.from('chat_messages').delete().eq('id', messageId);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CHAT_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[topicId]) {
          parsed[topicId] = parsed[topicId].filter((m: ChatMessage) => m.id !== messageId);
          localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(parsed));
        }
      }
    } catch (e) {}
  }

  return true;
}

/**
 * Purges all chat messages from Supabase DB and local storage
 */
export async function deleteAllChatMessages(): Promise<boolean> {
  const supabase = createClient();
  const dummyUUID = '00000000-0000-0000-0000-000000000000';

  try {
    await supabase.from('chat_messages').delete().neq('id', dummyUUID);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify({}));
    } catch (e) {}
  }

  return true;
}

/**
 * Edit a specific chat message in Supabase DB and local storage
 */
export async function editChatMessage(messageId: string, topicId: string, newContent: string): Promise<boolean> {
  const supabase = createClient();

  try {
    await supabase.from('chat_messages').update({ content: newContent }).eq('id', messageId);
  } catch (e) {}

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(CHAT_MESSAGES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed[topicId]) {
          parsed[topicId] = parsed[topicId].map((m: ChatMessage) =>
            m.id === messageId ? { ...m, content: newContent } : m
          );
          localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(parsed));
        }
      }
    } catch (e) {}
  }

  return true;
}
