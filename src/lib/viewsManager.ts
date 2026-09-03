/**
 * Utility manager for real visitor view counting and progressive like accumulation per post & comment
 */
const VIEWS_KEY_PREFIX = 'parlons_views_';
const LIKES_KEY_PREFIX = 'parlons_likes_count_';
const inMemoryVisited = new Set<string>();

export function getPostViews(postId: string, defaultBase: number = 1): number {
  if (typeof window === 'undefined') return defaultBase;
  try {
    const stored = localStorage.getItem(`${VIEWS_KEY_PREFIX}${postId}`);
    if (stored !== null) {
      return Math.max(parseInt(stored, 10), defaultBase);
    }
  } catch {
    // Ignore
  }
  return defaultBase;
}

/**
 * Increments post or comment views exactly once per unique person/visitor.
 * If the same person views the content again, the view count WILL NOT increase.
 */
export function incrementPostViews(postId: string, defaultBase: number = 1): number {
  if (typeof window === 'undefined') return defaultBase;

  const userVisitedKey = `parlons_user_viewed_${postId}`;

  try {
    const hasAlreadyViewed = localStorage.getItem(userVisitedKey);

    if (hasAlreadyViewed === 'true' || inMemoryVisited.has(postId)) {
      return getPostViews(postId, defaultBase);
    }

    inMemoryVisited.add(postId);
    localStorage.setItem(userVisitedKey, 'true');

    const current = getPostViews(postId, defaultBase);
    const updated = current + 1;
    localStorage.setItem(`${VIEWS_KEY_PREFIX}${postId}`, updated.toString());
    return updated;
  } catch {
    return getPostViews(postId, defaultBase);
  }
}

/**
 * Gets accumulated likes count for a comment
 */
export function getCommentLikes(commentId: string, defaultBase: number = 0): number {
  if (typeof window === 'undefined') return defaultBase;
  try {
    const stored = localStorage.getItem(`${LIKES_KEY_PREFIX}${commentId}`);
    if (stored !== null) {
      return Math.max(parseInt(stored, 10), defaultBase);
    }
  } catch {
    // Ignore
  }
  return defaultBase;
}

/**
 * Updates accumulated likes count progressively for a comment
 */
export function updateCommentLikesCount(commentId: string, delta: number, defaultBase: number = 0): number {
  if (typeof window === 'undefined') return defaultBase;
  try {
    const current = getCommentLikes(commentId, defaultBase);
    const updated = Math.max(0, current + delta);
    localStorage.setItem(`${LIKES_KEY_PREFIX}${commentId}`, updated.toString());
    return updated;
  } catch {
    return defaultBase;
  }
}

const SOLUTION_KEY_PREFIX = 'parlons_solution_status_';

export function savePostSolutionStatus(postId: string, status: string, commentId?: string) {
  if (typeof window === 'undefined') return;
  try {
    const data = JSON.stringify({ status, commentId, timestamp: new Date().toISOString() });
    localStorage.setItem(`${SOLUTION_KEY_PREFIX}${postId}`, data);
  } catch {
    // Ignore
  }
}

export function getPostSolutionStatus(postId: string): { status: string; commentId?: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(`${SOLUTION_KEY_PREFIX}${postId}`);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore
  }
  return null;
}
