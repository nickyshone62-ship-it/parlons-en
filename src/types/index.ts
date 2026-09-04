export type PostStatus = 'open' | 'in_progress' | 'testing' | 'resolved';

export interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface AnonymousIdentity {
  id?: string;
  user_id: string;
  anonymous_name: string;
  created_at?: string;
}

export interface UserSession {
  user: {
    id: string;
    email?: string;
    user_metadata?: {
      first_name?: string;
      last_name?: string;
      full_name?: string;
      avatar_url?: string;
    };
  } | null;
  profile: Profile | null;
  anonymousIdentity: AnonymousIdentity | null;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  posts_count?: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  category_id: string;
  category_name: string;
  category_slug: string;
  created_at: string;
  views_count: number;
  upvotes_count: number;
  answers_count: number;
  status: PostStatus;
  testing_comment_id?: string | null;
  resolved_comment_id?: string | null;
  is_demo: boolean;
  author_pseudonym: string;
  author_avatar_url?: string;
}

export interface Answer {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  upvotes_count: number;
  views_count?: number;
  is_accepted: boolean;
  is_demo: boolean;
  author_pseudonym: string;
  author_avatar_url?: string;
  solution_status?: 'none' | 'chosen' | 'testing' | 'confirmed';
  helped_users_count?: number;
  has_helped_user?: boolean;
}

export interface HowItWorksStep {
  step: number;
  title: string;
  description: string;
  iconName: string;
}

export interface PaymentRecord {
  id: string;
  user_id?: string;
  user_email: string;
  user_name: string;
  transaction_id?: string;
  payment_screenshot_url?: string;
  payment_method: 'orange_money' | 'wave' | string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface ReportItem {
  id: string;
  post_id?: string;
  comment_id?: string;
  reason: string;
  reporter_email?: string;
  created_at: string;
  status: 'pending' | 'resolved' | 'dismissed';
}

export interface UserWarning {
  id: string;
  user_pseudonym: string;
  reason: string;
  post_title?: string;
  created_at: string;
  status: 'active' | 'dismissed';
}


