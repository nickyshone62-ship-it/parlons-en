import { NextResponse } from 'next/server';
import { fetchNeonUserReviews, createNeonUserReviewRecord } from '@/lib/db/neonQueries';

export async function GET() {
  try {
    const reviews = await fetchNeonUserReviews();
    return NextResponse.json({ success: true, source: 'neon', reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, reviews: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, rating, content, authorPseudonym, authorAvatar, userId } = body;

    if (!rating || !content || !authorPseudonym) {
      return NextResponse.json({ success: false, error: 'Champs requis manquants' }, { status: 400 });
    }

    const reviewId = id || `rev-${Date.now()}`;
    const newReview = await createNeonUserReviewRecord({
      id: reviewId,
      userId: userId || null,
      rating,
      content,
      authorPseudonym,
      authorAvatar,
    });

    return NextResponse.json({ success: true, source: 'neon', review: newReview });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
