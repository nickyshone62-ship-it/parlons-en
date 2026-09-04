import { MOCK_CATEGORIES } from "@/data/mockData";
import { HomePageClient } from "@/components/home/HomePageClient";
import { fetchNeonCategories, fetchNeonPosts } from "@/lib/db/neonQueries";
import { getRealPosts } from "@/lib/supabase/posts";
import { Category, Post } from "@/types";

export const revalidate = 0; // Dynamic data for live posts

export default async function Home() {
  let categories: Category[] = MOCK_CATEGORIES;
  let realPosts: Post[] = [];

  try {
    const neonCats = await fetchNeonCategories();
    if (neonCats && neonCats.length > 0) {
      categories = neonCats.map((cat, idx) => ({
        id: String(cat.id || `neon-${idx}`),
        name: cat.name || "Catégorie",
        slug: cat.slug || `cat-${idx}`,
        description: cat.description || MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.description || "Entraide et partage d'expériences.",
        icon: cat.icon || MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.icon || "HeartHandshake",
        color: cat.color || MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.color || "emerald",
        posts_count: typeof cat.posts_count === "number" ? cat.posts_count : 0,
      }));
    }
  } catch (err) {
    categories = MOCK_CATEGORIES;
  }

  try {
    realPosts = await getRealPosts();
  } catch (err) {
    realPosts = [];
  }

  return <HomePageClient categories={categories} initialRealPosts={realPosts} />;
}
