import { createClient } from "@/lib/supabase/server";
import { MOCK_CATEGORIES } from "@/data/mockData";
import { HomePageClient } from "@/components/home/HomePageClient";
import { getRealPosts } from "@/lib/supabase/posts";
import { Category, Post } from "@/types";

export const revalidate = 0; // Dynamic data for live posts

export default async function Home() {
  let categories: Category[] = MOCK_CATEGORIES;
  let realPosts: Post[] = [];

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*");

    if (!error && data && data.length > 0) {
      categories = data.map((cat: any, idx: number) => ({
        id: String(cat.id || `supa-${idx}`),
        name: cat.name || cat.title || "Catégorie",
        slug: cat.slug || `cat-${idx}`,
        description:
          cat.description ||
          MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.description ||
          "Entraide et partage d'expériences.",
        icon:
          cat.icon ||
          MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.icon ||
          "HeartHandshake",
        color:
          cat.color ||
          MOCK_CATEGORIES[idx % MOCK_CATEGORIES.length]?.color ||
          "emerald",
        posts_count:
          typeof cat.posts_count === "number"
            ? cat.posts_count
            : Math.floor(Math.random() * 25) + 8,
      }));
    }

    // Fetch real posts from Supabase
    realPosts = await getRealPosts();
  } catch (err) {
    console.error("Error fetching homepage data:", err);
    categories = MOCK_CATEGORIES;
  }

  return <HomePageClient categories={categories} initialRealPosts={realPosts} />;
}
