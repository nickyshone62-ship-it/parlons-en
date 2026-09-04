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
