import { queryNeon } from './neon';

export interface NeonCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  posts_count?: number;
}

export interface NeonPost {
  id: string;
  author_id: string;
  category_id: string;
  title: string;
  content: string;
  status: string;
  created_at: string;
  category_name?: string;
  category_slug?: string;
  author_pseudonym?: string;
}

export interface NeonComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  author_pseudonym?: string;
}

export interface NeonUserReview {
  id: string;
  user_id?: string;
  rating: number;
  content: string;
  author_pseudonym: string;
  author_avatar?: string;
  created_at: string;
}

/**
 * Categories Queries
 */
export async function fetchNeonCategories(): Promise<NeonCategory[]> {
  return queryNeon<NeonCategory>(
    `SELECT id, name, slug, description, icon, color, posts_count FROM public.categories ORDER BY name ASC`
  );
}

/**
 * Posts Queries
 */
export async function fetchNeonPosts(): Promise<NeonPost[]> {
  return queryNeon<NeonPost>(
    `SELECT 
      p.id, p.author_id, p.category_id, p.title, p.content, p.status, p.created_at,
      c.name AS category_name, c.slug AS category_slug,
      COALESCE(ai.anonymous_name, 'Utilisateur Anonyme') AS author_pseudonym
    FROM public.posts p
    LEFT JOIN public.categories c ON p.category_id = c.id
    LEFT JOIN public.anonymous_identities ai ON p.author_id = ai.user_id
    ORDER BY p.created_at DESC`
  );
}

export async function createNeonPostRecord(authorId: string, categoryId: string, title: string, content: string): Promise<NeonPost | null> {
  const rows = await queryNeon<NeonPost>(
    `INSERT INTO public.posts (author_id, category_id, title, content, status)
     VALUES ($1, $2, $3, $4, 'open')
     RETURNING id, author_id, category_id, title, content, status, created_at`,
    [authorId, categoryId, title.trim(), content.trim()]
  );
  return rows[0] || null;
}

/**
 * Comments Queries
 */
export async function fetchNeonComments(postId: string): Promise<NeonComment[]> {
  return queryNeon<NeonComment>(
    `SELECT 
      c.id, c.post_id, c.author_id, c.content, c.created_at,
      COALESCE(ai.anonymous_name, 'Utilisateur Anonyme') AS author_pseudonym
    FROM public.comments c
    LEFT JOIN public.anonymous_identities ai ON c.author_id = ai.user_id
    WHERE c.post_id = $1
    ORDER BY c.created_at ASC`,
    [postId]
  );
}

export async function createNeonCommentRecord(postId: string, authorId: string, content: string): Promise<NeonComment | null> {
  const rows = await queryNeon<NeonComment>(
    `INSERT INTO public.comments (post_id, author_id, content)
     VALUES ($1, $2, $3)
     RETURNING id, post_id, author_id, content, created_at`,
    [postId, authorId, content.trim()]
  );
  return rows[0] || null;
}

/**
 * User Reviews Queries
 */
export async function fetchNeonUserReviews(): Promise<NeonUserReview[]> {
  return queryNeon<NeonUserReview>(
    `SELECT id, user_id, rating, content, author_pseudonym, author_avatar, created_at 
     FROM public.user_reviews 
     ORDER BY created_at DESC`
  );
}

export async function createNeonUserReviewRecord(review: {
  id: string;
  userId?: string | null;
  rating: number;
  content: string;
  authorPseudonym: string;
  authorAvatar?: string;
}): Promise<NeonUserReview | null> {
  const rows = await queryNeon<NeonUserReview>(
    `INSERT INTO public.user_reviews (id, user_id, rating, content, author_pseudonym, author_avatar)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING
     RETURNING id, user_id, rating, content, author_pseudonym, author_avatar, created_at`,
    [review.id, review.userId || null, review.rating, review.content.trim(), review.authorPseudonym, review.authorAvatar || '']
  );
  return rows[0] || null;
}

/**
 * Chat Topics & Messages Queries
 */
export async function fetchNeonChatTopics() {
  return queryNeon(
    `SELECT id, title, category_slug, category_name, author_pseudonym, author_avatar, created_at
     FROM public.chat_topics
     ORDER BY created_at DESC`
  );
}

export async function createNeonChatTopicRecord(topic: {
  id: string;
  title: string;
  categorySlug?: string;
  categoryName?: string;
  authorPseudonym?: string;
  authorAvatar?: string;
}) {
  const rows = await queryNeon(
    `INSERT INTO public.chat_topics (id, title, category_slug, category_name, author_pseudonym, author_avatar)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING
     RETURNING *`,
    [
      topic.id,
      topic.title,
      topic.categorySlug || 'general',
      topic.categoryName || 'Discussion & Entraide',
      topic.authorPseudonym || 'Communauté',
      topic.authorAvatar || '',
    ]
  );
  return rows[0] || null;
}

export async function fetchNeonChatMessages() {
  return queryNeon(
    `SELECT id, topic_id, sender_id, sender_name, sender_avatar, content, created_at
     FROM public.chat_messages
     ORDER BY created_at ASC`
  );
}

export async function createNeonChatMessageRecord(msg: {
  id: string;
  topicId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
}) {
  const rows = await queryNeon(
    `INSERT INTO public.chat_messages (id, topic_id, sender_id, sender_name, sender_avatar, content)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING
     RETURNING *`,
    [msg.id, msg.topicId, msg.senderId, msg.senderName, msg.senderAvatar || '', msg.content.trim()]
  );
  return rows[0] || null;
}

/**
 * Payments & Approvals Queries
 */
export async function createNeonPaymentRecord(payment: {
  id: string;
  userId?: string | null;
  userName: string;
  userEmail: string;
  amount?: number;
  paymentMethod: string;
  paymentScreenshotUrl?: string;
  transactionId?: string;
}) {
  const rows = await queryNeon(
    `INSERT INTO public.payments (id, user_id, user_name, user_email, amount, payment_method, payment_screenshot_url, status, transaction_id)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', $8)
     ON CONFLICT (id) DO NOTHING
     RETURNING *`,
    [
      payment.id,
      payment.userId || null,
      payment.userName,
      payment.userEmail,
      payment.amount || 500,
      payment.paymentMethod,
      payment.paymentScreenshotUrl || '',
      payment.transactionId || null,
    ]
  );
  return rows[0] || null;
}

export async function updateNeonApprovalStatus(targetIdOrEmail: string, status: 'approved' | 'rejected') {
  await Promise.all([
    queryNeon(
      `UPDATE public.account_approvals SET status = $1 WHERE LOWER(id) = LOWER($2) OR LOWER(email) = LOWER($2)`,
      [status, targetIdOrEmail]
    ),
    queryNeon(
      `UPDATE public.payments SET status = $1 WHERE LOWER(id) = LOWER($2) OR LOWER(user_email) = LOWER($2)`,
      [status, targetIdOrEmail]
    ),
    queryNeon(
      `UPDATE public.profiles SET approval_status = $1, is_approved = $2 WHERE LOWER(id) = LOWER($3) OR LOWER(username) = LOWER($3)`,
      [status, status === 'approved', targetIdOrEmail]
    ),
  ]);
  return true;
}

/**
 * Standalone User Auth Queries (Neon PostgreSQL)
 */
export async function findNeonProfileByEmail(email: string) {
  const rows = await queryNeon(
    `SELECT id, username, avatar_url, role, approval_status, is_approved, created_at, updated_at
     FROM public.profiles
     WHERE LOWER(username) = LOWER($1) OR LOWER(username) = LOWER($2)
     LIMIT 1`,
    [email, `${email.split('@')[0]}`]
  );
  return rows[0] || null;
}

export async function findNeonProfileById(userId: string) {
  const rows = await queryNeon(
    `SELECT id, username, avatar_url, role, approval_status, is_approved, created_at, updated_at
     FROM public.profiles
     WHERE id::text = $1
     LIMIT 1`,
    [userId]
  );
  return rows[0] || null;
}

export async function assignNeonAnonymousIdentity(userId: string, email: string) {
  // Deterministic 4-digit code from userId or email
  let hash = 0;
  const str = userId || email;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const anonCode = 1000 + (Math.abs(hash) % 9000);
  const anonName = `Utilisateur #${anonCode}`;

  const rows = await queryNeon(
    `INSERT INTO public.anonymous_identities (user_id, anonymous_name)
     VALUES ($1, $2)
     ON CONFLICT (user_id) DO UPDATE SET anonymous_name = EXCLUDED.anonymous_name
     RETURNING anonymous_name`,
    [userId, anonName]
  );

  return rows[0]?.anonymous_name || anonName;
}

export async function registerNeonUser(user: {
  email: string;
  fullName: string;
  avatarUrl?: string;
}) {
  const emailPrefix = user.email.split('@')[0];
  const isDefaultAdmin = user.email.toLowerCase() === 'nickyshone62@gmail.com';
  const role = isDefaultAdmin ? 'admin' : 'user';
  const approvalStatus = isDefaultAdmin ? 'approved' : 'pending';
  const isApproved = isDefaultAdmin;

  const profileRows = await queryNeon(
    `INSERT INTO public.profiles (username, avatar_url, role, approval_status, is_approved)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT DO NOTHING
     RETURNING id, username, avatar_url, role, approval_status, is_approved, created_at`,
    [user.email, user.avatarUrl || '', role, approvalStatus, isApproved]
  );

  let profile = profileRows[0];
  if (!profile) {
    profile = await findNeonProfileByEmail(user.email);
  }

  const userId = profile ? profile.id : `usr-${Date.now()}`;
  const anonName = await assignNeonAnonymousIdentity(userId, user.email);

  await queryNeon(
    `INSERT INTO public.account_approvals (id, email, full_name, anonymous_name, status)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE SET status = EXCLUDED.status`,
    [userId, user.email, user.fullName || emailPrefix, anonName, approvalStatus]
  );

  return { profile, userId, anonymousName: anonName };
}

/**
 * Admin Data Sync Queries
 */
export async function fetchNeonAdminOverview() {
  const [profiles, payments, approvals] = await Promise.all([
    queryNeon(`SELECT id, username, role, approval_status, is_approved, created_at FROM public.profiles ORDER BY created_at DESC`),
    queryNeon(`SELECT id, user_name, user_email, amount, payment_method, payment_screenshot_url, status, created_at FROM public.payments ORDER BY created_at DESC`),
    queryNeon(`SELECT id, email, full_name, anonymous_name, status, created_at FROM public.account_approvals ORDER BY created_at DESC`),
  ]);

  return { profiles, payments, approvals };
}
