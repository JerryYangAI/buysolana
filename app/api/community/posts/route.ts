export const runtime = "edge";

import { NextRequest, NextResponse } from "next/server";
import { countUrlsInFields, enforceDuplicateCheck, isLengthBetween } from "@/lib/antiabuse/spam";
import { extractClientIp, enforceRateLimit } from "@/lib/antiabuse/rateLimit";
import { verifyTurnstile } from "@/lib/antiabuse/turnstile";
import { apiError, normalizeOptionalString, toBoundedInt } from "@/lib/api/response";
import { createPendingPost, listPublishedPosts } from "@/lib/community-supabase";
import { isLocale, type Locale } from "@/lib/i18n/config";

const ENDPOINT_PATH = "/api/community/posts";
const TITLE_MIN = 3;
const TITLE_MAX = 120;
const BODY_MIN = 10;
const BODY_MAX = 20000;
const AUTHOR_MAX = 40;

function turnstileStatus(code: string) {
  return code === "TURNSTILE_TOKEN_REQUIRED" ? 400 : 403;
}

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get("locale");
  const page = toBoundedInt(request.nextUrl.searchParams.get("page"), {
    fallback: 1,
    min: 1,
    max: 10000,
  });
  const pageSize = toBoundedInt(request.nextUrl.searchParams.get("pageSize"), {
    fallback: 20,
    min: 1,
    max: 50,
  });

  let locale: Locale | undefined;
  if (localeParam) {
    if (!isLocale(localeParam)) {
      return apiError(400, "INVALID_LOCALE", "locale must be en or zh-CN");
    }
    locale = localeParam;
  }

  try {
    const data = await listPublishedPosts({ locale, page, pageSize });
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load posts";
    return apiError(500, "INTERNAL_ERROR", message);
  }
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const locale = normalizeOptionalString(payload.locale);
  const title = normalizeOptionalString(payload.title);
  const body = normalizeOptionalString(payload.body);
  const authorName = normalizeOptionalString(payload.author_name ?? payload.author);
  const turnstileToken = normalizeOptionalString(payload.turnstileToken);

  if (!isLocale(locale)) {
    return apiError(400, "INVALID_LOCALE", "locale must be en or zh-CN");
  }

  if (!isLengthBetween(title, TITLE_MIN, TITLE_MAX)) {
    return apiError(400, "INVALID_TITLE", `title length must be ${TITLE_MIN}-${TITLE_MAX}`);
  }

  if (!isLengthBetween(body, BODY_MIN, BODY_MAX)) {
    return apiError(400, "INVALID_BODY", `body length must be ${BODY_MIN}-${BODY_MAX}`);
  }

  if (authorName.length > AUTHOR_MAX) {
    return apiError(400, "INVALID_AUTHOR", `author_name length must be <= ${AUTHOR_MAX}`);
  }

  if (countUrlsInFields([title, body]) > 2) {
    return apiError(400, "TOO_MANY_URLS", "At most 2 URLs are allowed.");
  }

  const ip = extractClientIp(request.headers);

  const turnstile = await verifyTurnstile(turnstileToken, ip === "unknown" ? undefined : ip);
  if (!turnstile.ok) {
    return apiError(turnstileStatus(turnstile.code), turnstile.code, turnstile.message);
  }

  const limited = await enforceRateLimit({
    path: ENDPOINT_PATH,
    ip,
    limit: 1,
    ttlSeconds: 30,
  });

  if (!limited.ok) {
    return apiError(429, "RATE_LIMITED", "Too many requests. Please wait 30 seconds.");
  }

  const duplicate = await enforceDuplicateCheck({
    path: ENDPOINT_PATH,
    ip,
    content: [locale, title, body, authorName].join("\n"),
    ttlSeconds: 600,
  });

  if (!duplicate.ok) {
    return apiError(409, "DUPLICATE_SUBMISSION", "Duplicate content detected. Please wait before resubmitting.");
  }

  try {
    const post = await createPendingPost({
      locale,
      title,
      body,
      authorName: authorName || undefined,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create post";
    return apiError(500, "INTERNAL_ERROR", message);
  }
}
