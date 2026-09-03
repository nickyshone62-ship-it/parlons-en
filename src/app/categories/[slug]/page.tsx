'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { PostCard } from '@/components/posts/PostCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { NewPostModal } from '@/components/modals/NewPostModal';
import { getPostsByCategory } from '@/lib/supabase/posts';
import { getCurrentUserSession } from '@/lib/auth/actions';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { MOCK_CATEGORIES } from '@/data/mockData';
import { Category, Post } from '@/types';
import { ArrowLeft, PlusCircle, Sparkles, Layers } from 'lucide-react';

export default function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const [category, setCategory] = useState<Category | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);

  useEffect(() => {
    async function loadCategoryData() {
      setIsLoading(true);
      const session = await getCurrentUserSession();
      setIsAuthenticated(Boolean(session.user));

      // Fetch all categories for modal
      try {
        const supabase = createBrowserClient();
        const { data: catData } = await supabase.from('categories').select('*');
        if (catData && catData.length > 0) {
          const mapped = catData.map((c: any, idx: number) => ({
            id: String(c.id || `supa-${idx}`),
            name: c.name || 'Catégorie',
            slug: c.slug || `cat-${idx}`,
            description: c.description || MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.description,
            icon: c.icon || MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.icon,
          }));
          setAllCategories(mapped);
        }
      } catch {
        // Fallback
      }

      // Fetch category posts
      const res = await getPostsByCategory(slug);
      setCategory(res.category);
      setPosts(res.posts);
      setIsLoading(false);
    }

    loadCategoryData();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
          <LoadingState type="card" count={3} />
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans">
        <Header />
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 w-full space-y-6">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Toutes les catégories
          </Link>
          <EmptyState
            title="Catégorie introuvable"
            description="La catégorie demandée n'existe pas ou a été déplacée."
          />
        </main>
        <Footer />
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Header onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/categories"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voir toutes les catégories</span>
        </Link>

        {/* Category Header Card */}
        <div className="p-6 sm:p-8 bg-white dark:bg-slate-900/90 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="emerald" size="md">
                Catégorie
              </Badge>
              <span className="text-xs text-slate-400 font-mono">#{category.slug}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                {category.description}
              </p>
            )}
          </div>

          <Button
            onClick={() => setIsNewPostModalOpen(true)}
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            className="w-full sm:w-auto shrink-0"
          >
            Publier dans {category.name}
          </Button>
        </div>

        {/* Posts List Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-500" />
              <span>Sujets et discussions ({posts.length})</span>
            </h2>
          </div>

          {posts.length === 0 ? (
            <EmptyState
              title={`Aucun sujet dans "${category.name}" pour l'instant`}
              description="Soyez la première personne à exposer votre préoccupation ou poser une question dans cette catégorie."
              icon={<Sparkles className="w-8 h-8" />}
              actionLabel={`Partager un problème dans ${category.name}`}
              onAction={() => setIsNewPostModalOpen(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
      <MobileNav onOpenNewPostModal={() => setIsNewPostModalOpen(true)} />

      <NewPostModal
        isOpen={isNewPostModalOpen}
        onClose={() => setIsNewPostModalOpen(false)}
        categories={allCategories}
        isAuthenticated={isAuthenticated}
      />
    </div>
  );
}
