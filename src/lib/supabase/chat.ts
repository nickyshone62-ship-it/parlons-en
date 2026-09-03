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

/**
 * Subscribe to Supabase Realtime broadcast channel for multi-user chat updates
 */
export function subscribeToRealtimeChat(
  currentUserId: string,
  currentPseudonym: string,
  onNewMessage: (msg: ChatMessage) => void,
  onNewTopic: (topic: UserChatTopic) => void
) {
  const supabase = createClient();
  const channel = supabase.channel('parlons_en_live_chat_room', {
    config: {
      broadcast: { self: false },
    },
  });

  channel
    .on('broadcast', { event: 'new_message' }, ({ payload }) => {
      if (payload && payload.id && payload.topicId && payload.content) {
        const isSelfMsg = Boolean(
          payload.senderId === currentUserId ||
          payload.senderName === currentPseudonym
        );

        onNewMessage({
          ...payload,
          isSelf: isSelfMsg,
        } as ChatMessage);
      }
    })
    .on('broadcast', { event: 'new_topic' }, ({ payload }) => {
      if (payload && payload.id && payload.title) {
        onNewTopic(payload as UserChatTopic);
      }
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Broadcast a new message to all online users and persist
 */
export async function broadcastChatMessage(msg: ChatMessage) {
  const supabase = createClient();
  const channel = supabase.channel('parlons_en_live_chat_room');

  // Broadcast to all active users via Supabase Realtime
  try {
    await channel.send({
      type: 'broadcast',
      event: 'new_message',
      payload: msg,
    });
  } catch (e) {
    console.error("Broadcast error", e);
  }

  // Try DB persistence
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
  const channel = supabase.channel('parlons_en_live_chat_room');

  try {
    await channel.send({
      type: 'broadcast',
      event: 'new_topic',
      payload: topic,
    });
  } catch (e) {
    console.error("Topic broadcast error", e);
  }

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
 * Fetch topics from DB and local storage
 */
export async function fetchAllChatTopics(): Promise<UserChatTopic[]> {
  const supabase = createClient();
  let dbTopics: UserChatTopic[] = [];

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
 * Fetch messages from DB and local storage
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
          senderName: m.sender_name,
          senderAvatar: m.sender_avatar,
          content: m.content,
          createdAt: new Date(m.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          isSelf: false,
        };

        if (!messageMap[m.topic_id]) {
          messageMap[m.topic_id] = [];
        }

        const exists = messageMap[m.topic_id].some((existing) => existing.id === m.id);
        if (!exists) {
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
