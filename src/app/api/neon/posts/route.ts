import { NextResponse } from 'next/server';
import { fetchNeonPosts } from '@/lib/db/neonQueries';

export async function GET() {
  try {
    const posts = await fetchNeonPosts();
    return NextResponse.json({ success: true, source: 'neon', posts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, posts: [] }, { status: 500 });
  }
}
