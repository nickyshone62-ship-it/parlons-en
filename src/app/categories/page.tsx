'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileNav } from '@/components/layout/MobileNav';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { MOCK_CATEGORIES } from '@/data/mockData';
import { Category } from '@/types';
import { ArrowLeft, Layers } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const { getRealPosts } = await import('@/lib/supabase/posts');
        const allPosts = await getRealPosts();
        
        const supabase = createBrowserClient();
        const { data, error } = await supabase.from('categories').select('*');

        const baseCategories = (!error && data && data.length > 0)
          ? data.map((cat: any, idx: number) => ({
              id: String(cat.id || `supa-${idx}`),
              name: cat.name || 'Catégorie',
              slug: cat.slug || `cat-${idx}`,
              description: cat.description || MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.description || "Entraide et conseils.",
              icon: cat.icon || MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.icon || 'HeartHandshake',
            }))
          : MOCK_CATEGORIES;

        // Calculate exact real posts count for each category (0 at start)
        const mapped: Category[] = baseCategories.map((cat) => {
          const categoryPosts = allPosts.filter(
            (p) =>
              p.category_id === cat.id ||
              p.category_slug === cat.slug ||
              p.category_name.toLowerCase() === cat.name.toLowerCase()
          );
          return {
            ...cat,
            posts_count: categoryPosts.length,
          };
        });

        setCategories(mapped);
      } catch {
        // Fallback with 0 posts for all categories
        setCategories(MOCK_CATEGORIES.map((c) => ({ ...c, posts_count: 0 })));
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à l'accueil</span>
        </Link>

        {/* Page Title */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <Layers className="w-4 h-4" />
            <span>Thématiques de la vie</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Toutes les Catégories
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
            Sélectionnez une thématique pour parcourir les discussions et trouver du soutien adapté à votre situation.
          </p>
        </div>

        {isLoading ? (
          <LoadingState type="card" count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} />
            ))}
          </div>
        )}
      </main>

      <Footer />
      <MobileNav />
    </div>
  );
}
