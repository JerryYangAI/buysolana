import { NextRequest, NextResponse } from "next/server";
import { apiError, normalizeOptionalString } from "@/lib/api/response";
import { getPublishedPostById } from "@/lib/community-supabase";
import { isLocale, type Locale } from "@/lib/i18n/config";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const postId = normalizeOptionalString(id);

  if (!postId) {
    return apiError(400, "INVALID_ID", "Post id is required");
  }

  const localeParam = request.nextUrl.searchParams.get("locale");
  let locale: Locale | undefined;

  if (localeParam) {
    if (!isLocale(localeParam)) {
      return apiError(400, "INVALID_LOCALE", "locale must be en or zh-CN");
    }
    locale = localeParam;
  }

  try {
    const post = await getPublishedPostById(postId, locale);

    if (!post) {
      return apiError(404, "POST_NOT_FOUND", "Post not found");
    }

    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load post";
    return apiError(500, "INTERNAL_ERROR", message);
  }
}
