import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { createUniqueAnonymousIdentity } from '@/lib/auth/actions';
import { MOCK_CATEGORIES } from '@/data/mockData';
import { savePostSolutionStatus, getPostSolutionStatus, getPostViews } from '@/lib/viewsManager';
import { Post, Answer, Category, PostStatus } from '@/types';

const BLACKLISTED_POST_IDS = new Set([
  '1fbdc918-a000-4635-b62f-42ec45a8d3ab',
  '52fbabd4-41d0-46df-98bd-093de0de1b17',
]);

/**
 * Ensures a valid profile and anonymous identity exist in public.profiles and public.anonymous_identities
 * to satisfy foreign key constraints (e.g. posts_author_id_fkey) before post/comment insertion.
 */
async function ensureUserProfileAndIdentity(
  supabase: ReturnType<typeof createBrowserClient>,
  userId: string
) {
  const now = new Date().toISOString();

  await Promise.all([
    supabase.from('profiles').upsert(
      {
        id: userId,
        username: `anonyme_${userId.slice(0, 6)}`,
        role: 'user',
        created_at: now,
        updated_at: now,
      },
      { onConflict: 'id' }
    ),
    createUniqueAnonymousIdentity(supabase, userId),
  ]);
}

/**
 * Deletes a post from public.posts using the authenticated user session
 */
export async function deleteRealPost(postId: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  BLACKLISTED_POST_IDS.add(postId);

  await supabase.from('comments').delete().eq('post_id', postId);

  if (user) {
    await supabase.from('posts').delete().eq('id', postId);
  }

  return { success: true };
}

/**
 * Creates a new problem / post in public.posts
 */
/**
 * Creates a new problem / post in public.posts with fail-proof local fallback
 */
export async function createRealPost(
  categoryId: string,
  title: string,
  content: string
): Promise<{ success: boolean; postId?: string; error?: string }> {
  const supabase = createBrowserClient();
  let user: any = null;

  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user || null;
  } catch (e) {}

  if (!user) {
    return {
      success: false,
      error: "Vous devez être inscrit (500 FCFA) et connecté pour pouvoir créer une publication sur la plateforme.",
    };
  }

  let anonymousName = 'Utilisateur #4821';

  try {
    await ensureUserProfileAndIdentity(supabase, user.id);
    const { data: ident } = await supabase
      .from('anonymous_identities')
      .select('anonymous_name')
      .eq('user_id', user.id)
      .maybeSingle();
    if (ident?.anonymous_name) {
      anonymousName = ident.anonymous_name;
    }
  } catch (e) {
    console.error("Identity setup notice:", e);
  }

  let targetCategoryId = categoryId;
  const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(categoryId);

  if (!isUuid) {
    try {
      const { data: dbCategories } = await supabase.from('categories').select('id, slug, name');
      if (dbCategories && dbCategories.length > 0) {
        const mockCat = MOCK_CATEGORIES.find((c) => c.id === categoryId);
        const matched = dbCategories.find(
          (c) =>
            c.id === categoryId ||
            c.slug === mockCat?.slug ||
            c.name.toLowerCase() === mockCat?.name.toLowerCase()
        );
        targetCategoryId = matched ? matched.id : dbCategories[0].id;
      }
    } catch (e) {}
  }

  let newPostId = `post-${Date.now()}`;
  let isSavedInSupabase = false;

  // 1. Primary DB Persistence: Save post in Neon PostgreSQL via API Route
  try {
    const neonRes = await fetch('/api/neon/posts/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        categoryId: targetCategoryId,
        title: title.trim(),
        content: content.trim(),
        authorId: user?.id || null,
      }),
    });
    if (neonRes.ok) {
      const neonJson = await neonRes.json();
      if (neonJson.success && neonJson.post?.id) {
        newPostId = neonJson.post.id;
        isSavedInSupabase = true;
      }
    }
  } catch (e) {}

  if (user && !isSavedInSupabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            author_id: user.id,
            category_id: targetCategoryId,
            title: title.trim(),
            content: content.trim(),
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .maybeSingle();

      if (!error && data?.id) {
        newPostId = data.id;
        isSavedInSupabase = true;
      }
    } catch (err: any) {}
  }

  // Always save a local copy to localStorage so the post appears instantly everywhere
  if (typeof window !== 'undefined') {
    const catObj = MOCK_CATEGORIES.find((c) => c.id === categoryId || c.id === targetCategoryId) || {
      id: targetCategoryId,
      name: 'Discussion & Entraide',
      slug: 'general',
    };

    const newLocalPost: Post = {
      id: newPostId,
      title: title.trim(),
      content: content.trim(),
      category_id: targetCategoryId,
      category_name: catObj.name,
      category_slug: catObj.slug,
      created_at: "À l'instant",
      views_count: 1,
      upvotes_count: 0,
      answers_count: 0,
      status: 'open',
      is_demo: false,
      author_pseudonym: anonymousName,
      author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(anonymousName)}`,
    };

    try {
      const existing = localStorage.getItem('parlons_en_local_posts_v1');
      const list: Post[] = existing ? JSON.parse(existing) : [];
      const filtered = list.filter((p) => p.id !== newPostId);
      localStorage.setItem('parlons_en_local_posts_v1', JSON.stringify([newLocalPost, ...filtered]));
    } catch (e) {
      console.error("Local post persistence error:", e);
    }
  }

  return { success: true, postId: newPostId };
}

/**
 * Fetches all real posts combining Supabase database & local fallback posts
 */
export async function getRealPosts(): Promise<Post[]> {
  const supabase = createBrowserClient();
  let dbPosts: Post[] = [];

  // 1. Primary Source: Query Neon API route /api/neon/posts
  try {
    const res = await fetch('/api/neon/posts', { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.posts) && json.posts.length > 0) {
        dbPosts = json.posts
          .filter((p: any) => p && p.id && !BLACKLISTED_POST_IDS.has(p.id))
          .map((p: any) => {
            const anonymousName = p.author_pseudonym || 'Utilisateur Anonyme';
            const savedLocal = getPostSolutionStatus(p.id);

            let normalizedStatus: PostStatus = 'open';
            if (savedLocal?.status === 'resolved' || p.status?.startsWith('resolved') || p.status === 'resolved') {
              normalizedStatus = 'resolved';
            } else if (savedLocal?.status === 'testing' || p.status?.startsWith('testing') || p.status === 'testing') {
              normalizedStatus = 'testing';
            }

            return {
              id: p.id,
              title: p.title,
              content: p.content,
              category_id: p.category_id,
              category_name: p.category_name || 'Général',
              category_slug: p.category_slug || 'general',
              created_at: formatRelativeTime(p.created_at),
              views_count: getPostViews(p.id),
              upvotes_count: 0,
              answers_count: 0,
              status: normalizedStatus,
              is_demo: false,
              author_pseudonym: anonymousName,
              author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(anonymousName)}`,
            };
          });
      }
    }
  } catch (e) {}

  // 2. Fallback Source: Query Supabase DB
  if (dbPosts.length === 0) {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id,
          author_id,
          category_id,
          title,
          content,
          status,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (!postsError && postsData && postsData.length > 0) {
        const filteredData = postsData.filter((p) => !BLACKLISTED_POST_IDS.has(p.id));

        if (filteredData.length > 0) {
          const authorIds = Array.from(new Set(filteredData.map((p) => p.author_id)));
          const postIds = filteredData.map((p) => p.id);

          const [{ data: categories }, { data: identities }, { data: comments }] = await Promise.all([
            supabase.from('categories').select('id, name, slug'),
            supabase.from('anonymous_identities').select('user_id, anonymous_name').in('user_id', authorIds),
            supabase.from('comments').select('id, post_id').in('post_id', postIds),
          ]);

          const catMap = new Map((categories || []).map((c) => [c.id, c]));
          const identMap = new Map((identities || []).map((i) => [i.user_id, i.anonymous_name]));

          const commentsCountMap = new Map<string, number>();
          (comments || []).forEach((c) => {
            commentsCountMap.set(c.post_id, (commentsCountMap.get(c.post_id) || 0) + 1);
          });

          dbPosts = filteredData.map((p) => {
            const cat = catMap.get(p.category_id);
            const anonymousName = identMap.get(p.author_id) || 'Utilisateur Anonyme';
            const answersCount = commentsCountMap.get(p.id) || 0;

            const savedLocal = getPostSolutionStatus(p.id);

            let normalizedStatus: PostStatus = 'open';
            if (savedLocal?.status === 'resolved' || p.status?.startsWith('resolved') || p.status === 'resolved') {
              normalizedStatus = 'resolved';
            } else if (savedLocal?.status === 'testing' || p.status?.startsWith('testing') || p.status === 'testing') {
              normalizedStatus = 'testing';
            }

            return {
              id: p.id,
              title: p.title,
              content: p.content,
              category_id: p.category_id,
              category_name: cat?.name || 'Général',
              category_slug: cat?.slug || 'general',
              created_at: formatRelativeTime(p.created_at),
              views_count: getPostViews(p.id),
              upvotes_count: 0,
              answers_count: answersCount,
              status: normalizedStatus,
              is_demo: false,
              author_pseudonym: anonymousName,
              author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(anonymousName)}`,
            };
          });
        }
      }
    } catch (e) {
      console.error("Error fetching Supabase posts", e);
    }
  }

  // Get local fallback posts
  let localPosts: Post[] = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('parlons_en_local_posts_v1');
      if (saved) {
        localPosts = JSON.parse(saved);
      }
    } catch (e) {}
  }

  const dbPostIds = new Set(dbPosts.map((p) => p.id));
  const uniqueLocal = localPosts.filter((p) => !dbPostIds.has(p.id) && !BLACKLISTED_POST_IDS.has(p.id));

  return [...uniqueLocal, ...dbPosts];
}

/**
 * Fetches category and all posts matching this category in parallel
 */
export async function getPostsByCategory(slugOrId: string): Promise<{ category: Category | null; posts: Post[] }> {
  const supabase = createBrowserClient();

  const { data: categories } = await supabase.from('categories').select('*');
  const foundCat = (categories || []).find((c) => String(c.id) === slugOrId || c.slug === slugOrId);
  const mockCat = MOCK_CATEGORIES.find((c) => c.slug === slugOrId || c.id === slugOrId);

  const category: Category | null = foundCat
    ? {
        id: String(foundCat.id),
        name: foundCat.name || 'Catégorie',
        slug: foundCat.slug || slugOrId,
        description: foundCat.description || "Questions et difficultés partagées par la communauté.",
        icon: foundCat.icon || 'HeartHandshake',
      }
    : mockCat || null;

  if (!category) return { category: null, posts: [] };

  const allPosts = await getRealPosts();
  const categoryPosts = allPosts.filter(
    (p) =>
      p.category_id === category.id ||
      p.category_slug === category.slug ||
      p.category_name.toLowerCase() === category.name.toLowerCase() ||
      (mockCat && (p.category_id === mockCat.id || p.category_slug === mockCat.slug))
  );

  return { category, posts: categoryPosts };
}

/**
 * Fetches single post detail with parallel query execution (category, author, comments count)
 */
export async function getRealPostById(postId: string): Promise<{ post: Post | null; isAuthor: boolean }> {
  if (BLACKLISTED_POST_IDS.has(postId)) {
    return { post: null, isAuthor: false };
  }

  const supabase = createBrowserClient();
  let user: any = null;
  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user || null;
  } catch (e) {}

  try {
    const { data: p } = await supabase
      .from('posts')
      .select(`
        id,
        author_id,
        category_id,
        title,
        content,
        status,
        created_at
      `)
      .eq('id', postId)
      .maybeSingle();

    if (p && !BLACKLISTED_POST_IDS.has(p.id)) {
      const [{ data: cat }, { data: ident }, { count }] = await Promise.all([
        supabase.from('categories').select('name, slug').eq('id', p.category_id).maybeSingle(),
        supabase.from('anonymous_identities').select('anonymous_name').eq('user_id', p.author_id).maybeSingle(),
        supabase.from('comments').select('id', { count: 'exact', head: true }).eq('post_id', postId),
      ]);

      let normalizedStatus: PostStatus = 'open';
      let testingCommentId: string | null = null;
      let resolvedCommentId: string | null = null;

      const savedLocal = getPostSolutionStatus(postId);
      if (savedLocal?.status === 'resolved') {
        normalizedStatus = 'resolved';
        resolvedCommentId = savedLocal.commentId || null;
      } else if (savedLocal?.status === 'testing') {
        normalizedStatus = 'testing';
        testingCommentId = savedLocal.commentId || null;
      }

      if (p.status?.startsWith('testing:')) {
        normalizedStatus = 'testing';
        testingCommentId = p.status.split('testing:')[1];
      } else if (p.status?.startsWith('resolved:')) {
        normalizedStatus = 'resolved';
        resolvedCommentId = p.status.split('resolved:')[1];
      } else if (p.status === 'resolved') {
        normalizedStatus = 'resolved';
      } else if (p.status === 'testing') {
        normalizedStatus = 'testing';
      }

      const pseudonym = ident?.anonymous_name || 'Utilisateur Anonyme';

      const post: Post = {
        id: p.id,
        title: p.title,
        content: p.content,
        category_id: p.category_id,
        category_name: cat?.name || 'Général',
        category_slug: cat?.slug || 'general',
        created_at: formatRelativeTime(p.created_at),
        views_count: getPostViews(p.id),
        upvotes_count: 0,
        answers_count: count || 0,
        status: normalizedStatus,
        testing_comment_id: testingCommentId || undefined,
        resolved_comment_id: resolvedCommentId || undefined,
        is_demo: false,
        author_pseudonym: pseudonym,
        author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pseudonym)}`,
      };

      const isAuthor = Boolean(user && user.id === p.author_id);
      return { post, isAuthor };
    }
  } catch (e) {}

  // Fallback to local posts if not found in DB
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('parlons_en_local_posts_v1');
      if (saved) {
        const list: Post[] = JSON.parse(saved);
        const match = list.find((item) => item.id === postId);
        if (match) {
          return { post: match, isAuthor: true };
        }
      }
    } catch (e) {}
  }

  return { post: null, isAuthor: false };
}

/**
 * Adds a new comment / answer to a post in public.comments with local fallback
 */
export async function createRealComment(
  postId: string,
  content: string
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  const supabase = createBrowserClient();
  let user: any = null;

  try {
    const { data: userData } = await supabase.auth.getUser();
    user = userData?.user || null;
  } catch (e) {}

  if (!user) {
    try {
      const { data: anonData } = await supabase.auth.signInAnonymously();
      user = anonData?.user || null;
    } catch (e) {}
  }

  let anonymousName = 'Utilisateur Anonyme';
  if (user) {
    try {
      await ensureUserProfileAndIdentity(supabase, user.id);
      const { data: ident } = await supabase
        .from('anonymous_identities')
        .select('anonymous_name')
        .eq('user_id', user.id)
        .maybeSingle();
      if (ident?.anonymous_name) anonymousName = ident.anonymous_name;
    } catch (e) {}
  } else if (typeof window !== 'undefined') {
    let savedGuest = localStorage.getItem('parlons_en_guest_pseudo');
    if (!savedGuest) {
      savedGuest = `Utilisateur #${1000 + Math.floor(Math.random() * 8999)}`;
      localStorage.setItem('parlons_en_guest_pseudo', savedGuest);
    }
    anonymousName = savedGuest;
  }

  let newCommentId = `comment-${Date.now()}`;

  // 1. Primary DB Persistence: Save comment in Neon PostgreSQL via API Route
  try {
    const neonRes = await fetch('/api/neon/comments/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        content: content.trim(),
        authorId: user?.id || null,
      }),
    });
    if (neonRes.ok) {
      const neonJson = await neonRes.json();
      if (neonJson.success && neonJson.comment?.id) {
        newCommentId = neonJson.comment.id;
      }
    }
  } catch (e) {}

  if (user) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            author_id: user.id,
            content: content.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select('id')
        .maybeSingle();

      if (!error && data?.id) {
        newCommentId = data.id;
      }
    } catch (e) {}
  }

  // Always save comment to local storage as fallback
  if (typeof window !== 'undefined') {
    const newCommentObj: Answer & { hasVoted: boolean } = {
      id: newCommentId,
      post_id: postId,
      content: content.trim(),
      author_pseudonym: anonymousName,
      created_at: "À l'instant",
      upvotes_count: 0,
      is_accepted: false,
      is_demo: false,
      hasVoted: false,
      solution_status: 'none',
      author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(anonymousName)}`,
    };

    try {
      const existing = localStorage.getItem('parlons_en_local_comments_v1');
      const map: Record<string, any[]> = existing ? JSON.parse(existing) : {};
      const list = map[postId] || [];
      const filtered = list.filter((c: any) => c.id !== newCommentId);
      map[postId] = [...filtered, newCommentObj];
      localStorage.setItem('parlons_en_local_comments_v1', JSON.stringify(map));
    } catch (e) {
      console.error("Local comment save notice:", e);
    }
  }

  return { success: true, commentId: newCommentId };
}

/**
 * Fetches comments for a post combining Supabase & local fallback comments
 */
export async function getRealComments(postId: string): Promise<(Answer & { hasVoted: boolean })[]> {
  const supabase = createBrowserClient();
  let dbComments: (Answer & { hasVoted: boolean })[] = [];

  // 1. Primary Source: Query Neon API Route /api/neon/comments
  try {
    const res = await fetch(`/api/neon/comments?postId=${encodeURIComponent(postId)}`, { cache: 'no-store' });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.comments) && json.comments.length > 0) {
        dbComments = json.comments.map((c: any) => {
          const pseudonym = c.author_pseudonym || 'Utilisateur Anonyme';
          return {
            id: c.id,
            post_id: c.post_id,
            content: c.content,
            created_at: formatRelativeTime(c.created_at),
            upvotes_count: 0,
            is_accepted: false,
            is_demo: false,
            author_pseudonym: pseudonym,
            author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pseudonym)}`,
            hasVoted: false,
            solution_status: 'none' as const,
            helped_users_count: 0,
            has_helped_user: false,
          };
        });
      }
    }
  } catch (e) {}

  // 2. Fallback Source: Query Supabase DB
  if (dbComments.length === 0) {
    try {
      let user: any = null;
      try {
        const { data: userData } = await supabase.auth.getUser();
        user = userData?.user || null;
      } catch (e) {}

      const [{ data: postData }, { data: comments, error }] = await Promise.all([
        supabase.from('posts').select('status').eq('id', postId).maybeSingle(),
        supabase.from('comments').select('*').eq('post_id', postId).order('created_at', { ascending: true }),
      ]);

      if (!error && comments && comments.length > 0) {
        let testingCommentId: string | null = null;
        let resolvedCommentId: string | null = null;

        const savedLocal = getPostSolutionStatus(postId);
        if (savedLocal?.status === 'testing' && savedLocal.commentId) {
          testingCommentId = savedLocal.commentId;
        } else if (savedLocal?.status === 'resolved' && savedLocal.commentId) {
          resolvedCommentId = savedLocal.commentId;
        }

        if (postData?.status?.startsWith('testing:')) {
          testingCommentId = postData.status.split('testing:')[1];
        } else if (postData?.status?.startsWith('resolved:')) {
          resolvedCommentId = postData.status.split('resolved:')[1];
        }

        const authorIds = Array.from(new Set(comments.map((c) => c.author_id)));
        const commentIds = comments.map((c) => c.id);

        const [{ data: identities }, { data: votes }] = await Promise.all([
          supabase.from('anonymous_identities').select('user_id, anonymous_name').in('user_id', authorIds),
          supabase.from('votes').select('comment_id, user_id, vote_type').in('comment_id', commentIds),
        ]);

        const identMap = new Map((identities || []).map((i) => [i.user_id, i.anonymous_name]));
        const likesCountMap = new Map<string, number>();
        const helpedCountMap = new Map<string, number>();
        const userVotedSet = new Set<string>();
        const userHelpedSet = new Set<string>();

        (votes || []).forEach((v) => {
          if (!v.vote_type || v.vote_type === 'like' || v.vote_type === 'useful') {
            likesCountMap.set(v.comment_id, (likesCountMap.get(v.comment_id) || 0) + 1);
            if (user && v.user_id === user.id) userVotedSet.add(v.comment_id);
          }
        });

        dbComments = comments.map((c) => {
          let solStatus: 'none' | 'testing' | 'confirmed' = 'none';
          if (resolvedCommentId === c.id) solStatus = 'confirmed';
          else if (testingCommentId === c.id) solStatus = 'testing';

          const pseudonym = identMap.get(c.author_id) || 'Utilisateur Anonyme';

          return {
            id: c.id,
            post_id: c.post_id,
            content: c.content,
            created_at: formatRelativeTime(c.created_at),
            upvotes_count: likesCountMap.get(c.id) || 0,
            is_accepted: solStatus === 'confirmed',
            is_demo: false,
            author_pseudonym: pseudonym,
            author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pseudonym)}`,
            hasVoted: userVotedSet.has(c.id),
            solution_status: solStatus,
            helped_users_count: helpedCountMap.get(c.id) || 0,
            has_helped_user: userHelpedSet.has(c.id),
          };
        });
      }
    } catch (e) {
      console.error("Error fetching Supabase comments", e);
    }
  }
        } else if (v.vote_type === 'helped_me') {
          helpedCountMap.set(v.comment_id, (helpedCountMap.get(v.comment_id) || 0) + 1);
          if (user && v.user_id === user.id) userHelpedSet.add(v.comment_id);
        } else if (v.vote_type === 'author_solution') {
          resolvedCommentId = v.comment_id;
        }
      });

      dbComments = comments.map((c) => {
        let solStatus: 'none' | 'testing' | 'confirmed' = 'none';
        if (resolvedCommentId === c.id) solStatus = 'confirmed';
        else if (testingCommentId === c.id) solStatus = 'testing';

        const pseudonym = identMap.get(c.author_id) || 'Utilisateur Anonyme';

        return {
          id: c.id,
          post_id: c.post_id,
          content: c.content,
          created_at: formatRelativeTime(c.created_at),
          upvotes_count: likesCountMap.get(c.id) || 0,
          is_accepted: solStatus === 'confirmed',
          is_demo: false,
          author_pseudonym: pseudonym,
          author_avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(pseudonym)}`,
          hasVoted: userVotedSet.has(c.id),
          solution_status: solStatus,
          helped_users_count: helpedCountMap.get(c.id) || 0,
          has_helped_user: userHelpedSet.has(c.id),
        };
      });
    }
  } catch (e) {
    console.error("Error fetching Supabase comments", e);
  }

  // Fetch local comments fallback
  let localComments: (Answer & { hasVoted: boolean })[] = [];
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('parlons_en_local_comments_v1');
      if (saved) {
        const map = JSON.parse(saved);
        if (map && map[postId] && Array.isArray(map[postId])) {
          localComments = map[postId];
        }
      }
    } catch (e) {}
  }

  const dbCommentIds = new Set(dbComments.map((c) => c.id));
  const uniqueLocal = localComments.filter((c) => !dbCommentIds.has(c.id));

  const allComments = [...dbComments, ...uniqueLocal];

  return allComments.sort((a, b) => {
    if (a.solution_status === 'confirmed' && b.solution_status !== 'confirmed') return -1;
    if (b.solution_status === 'confirmed' && a.solution_status !== 'confirmed') return 1;
    if (a.solution_status === 'testing' && b.solution_status !== 'testing') return -1;
    if (b.solution_status === 'testing' && a.solution_status !== 'testing') return 1;
    return 0;
  });
}

/**
 * Toggles a useful vote on a comment for connected users or visitors seamlessly
 */
export async function toggleCommentVote(commentId: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: true, action: 'guest_toggled' };
  }

  const { data: existingVote } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .or('vote_type.eq.like,vote_type.eq.useful,vote_type.is.null')
    .maybeSingle();

  if (existingVote) {
    const { error } = await supabase.from('votes').delete().eq('id', existingVote.id);
    if (error) return { success: false, error: error.message };
    return { success: true, action: 'removed' };
  } else {
    const { error } = await supabase.from('votes').insert([
      {
        user_id: user.id,
        comment_id: commentId,
        vote_type: 'like',
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) return { success: false, error: error.message };
    return { success: true, action: 'added' };
  }
}

/**
 * Toggles "Cette solution m'a aussi aidé" (helped_me) on a comment
 */
export async function toggleHelpedMeVote(commentId: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: true, action: 'guest_toggled' };
  }

  const { data: existing } = await supabase
    .from('votes')
    .select('id')
    .eq('user_id', user.id)
    .eq('comment_id', commentId)
    .eq('vote_type', 'helped_me')
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from('votes').delete().eq('id', existing.id);
    if (error) return { success: false, error: error.message };
    return { success: true, action: 'removed' };
  } else {
    const { error } = await supabase.from('votes').insert([
      {
        user_id: user.id,
        comment_id: commentId,
        vote_type: 'helped_me',
        created_at: new Date().toISOString(),
      },
    ]);
    if (error) return { success: false, error: error.message };
    return { success: true, action: 'added' };
  }
}

/**
 * Post Author selects a comment as track to test (💡 Choisir cette piste)
 */
export async function chooseTrackToTest(postId: string, commentId: string) {
  savePostSolutionStatus(postId, 'testing', commentId);

  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase
    .from('posts')
    .update({ status: `testing:${commentId}`, updated_at: new Date().toISOString() })
    .eq('id', postId);

  if (error && user) {
    await supabase
      .from('posts')
      .update({ status: `testing:${commentId}`, updated_at: new Date().toISOString() })
      .eq('id', postId)
      .eq('author_id', user.id);
  }

  return { success: true };
}

/**
 * Post Author evaluates tested track (worked = true -> 🏆 Solution confirmée, worked = false -> reset to open)
 */
export async function evaluateTestedTrack(postId: string, commentId: string, worked: boolean) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (worked) {
    savePostSolutionStatus(postId, 'resolved', commentId);

    await supabase
      .from('posts')
      .update({ status: `resolved:${commentId}`, updated_at: new Date().toISOString() })
      .eq('id', postId);

    if (user) {
      try {
        await supabase.from('votes').insert([
          {
            user_id: user.id,
            comment_id: commentId,
            vote_type: 'author_solution',
            created_at: new Date().toISOString(),
          },
        ]);
      } catch {
        // Ignore duplicate
      }
    }

    return { success: true, status: 'resolved' };
  } else {
    savePostSolutionStatus(postId, 'open');

    await supabase
      .from('posts')
      .update({ status: 'open', updated_at: new Date().toISOString() })
      .eq('id', postId);

    return { success: true, status: 'open' };
  }
}

/**
 * Marks a post status as resolved (legacy direct button)
 */
export async function markPostAsResolved(postId: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Non autorisé." };
  }

  const { error } = await supabase
    .from('posts')
    .update({ status: 'resolved', updated_at: new Date().toISOString() })
    .eq('id', postId)
    .eq('author_id', user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Reports a post or comment for moderation
 */
export async function reportContent(postId?: string, commentId?: string, reason?: string) {
  const supabase = createBrowserClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Vous devez être connecté pour signaler un contenu." };
  }

  const { error } = await supabase.from('reports').insert([
    {
      reporter_id: user.id,
      post_id: postId || null,
      comment_id: commentId || null,
      reason: reason || 'Contenu inapproprié',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "À l'instant";
    if (diffInSeconds < 3600) return `Il y a ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Il y a ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `Il y a ${Math.floor(diffInSeconds / 86400)}j`;

    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  } catch {
    return "Récemment";
  }
}

/**
 * Purges all posts, comments, votes, and anonymous identities from Supabase database to start clean.
 */
export async function deleteAllDiscussionsAndResetDatabase() {
  const supabase = createBrowserClient();
  const dummyUUID = '00000000-0000-0000-0000-000000000000';

  try {
    await Promise.all([
      supabase.from('votes').delete().neq('id', dummyUUID),
      supabase.from('comments').delete().neq('id', dummyUUID),
      supabase.from('reports').delete().neq('id', dummyUUID),
    ]);

    await supabase.from('posts').delete().neq('id', dummyUUID);
    await supabase.from('anonymous_identities').delete().neq('id', dummyUUID);

    if (typeof window !== 'undefined') {
      localStorage.clear();
      sessionStorage.clear();
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Erreur lors de la réinitialisation" };
  }
}
