import { NextResponse } from "next/server";
import getPostByCategory from "@/services/posts/getPostByCategory";

// GET /api/posts?categoryId=<id>&perPage=3
// Thin server route so client components can fetch posts without importing
// server-only modules (unstable_cache, next: { revalidate }) directly.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const rawCategoryId = searchParams.get("categoryId");
  const rawPerPage = searchParams.get("perPage");

  const categoryId =
    rawCategoryId && !Number.isNaN(Number(rawCategoryId)) ? Number(rawCategoryId) : null;
  const perPage =
    rawPerPage && !Number.isNaN(Number(rawPerPage))
      ? Math.min(Math.max(Number(rawPerPage), 1), 12)
      : 3;

  try {
    const res = await getPostByCategory(categoryId, { perPage });
    return NextResponse.json(
      { data: res?.data || [] },
      { headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("[api/posts] error:", error);
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
