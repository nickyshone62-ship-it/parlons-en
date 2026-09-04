import { NextResponse } from 'next/server';
import { fetchNeonCategories } from '@/lib/db/neonQueries';

export async function GET() {
  try {
    const categories = await fetchNeonCategories();
    return NextResponse.json({ success: true, source: 'neon', categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, categories: [] }, { status: 500 });
  }
}
