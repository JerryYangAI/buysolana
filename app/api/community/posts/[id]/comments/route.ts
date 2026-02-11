export const runtime = "edge";

import { NextResponse } from "next/server";
import { countUrlsInFields, enforceDuplicateCheck, isLengthBetween } from "@/lib/antiabuse/spam";
import { extractClientIp, enforceRateLimit } from "@/lib/antiabuse/rateLimit";
import { verifyTurnstile } from "@/lib/antiabuse/turnstile";
import { apiError, normalizeOptionalString } from "@/lib/api/response";
import { createPendingComment } from "@/lib/community-supabase";

const ENDPOINT_PATH = "/api/community/posts/[id]/comments";
const COMMENT_MIN = 1;
const COMMENT_MAX = 5000;
const AUTHOR_MAX = 40;

function turnstileStatus(code: string) {
  return code === "TURNSTILE_TOKEN_REQUIRED" ? 400 : 403;
}

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const postId = normalizeOptionalString(id);

  if (!postId) {
    return apiError(400, "INVALID_ID", "Post id is required");
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const body = normalizeOptionalString(payload.body);
  const authorName = normalizeOptionalString(payload.author_name ?? payload.author);
  const turnstileToken = normalizeOptionalString(payload.turnstileToken);

  if (!isLengthBetween(body, COMMENT_MIN, COMMENT_MAX)) {
    return apiError(400, "INVALID_COMMENT", `comment length must be ${COMMENT_MIN}-${COMMENT_MAX}`);
  }

  if (authorName.length > AUTHOR_MAX) {
    return apiError(400, "INVALID_AUTHOR", `author_name length must be <= ${AUTHOR_MAX}`);
  }

  if (countUrlsInFields([body]) > 2) {
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
    content: [postId, body, authorName].join("\n"),
    ttlSeconds: 600,
  });

  if (!duplicate.ok) {
    return apiError(409, "DUPLICATE_SUBMISSION", "Duplicate content detected. Please wait before resubmitting.");
  }

  try {
    const comment = await createPendingComment({
      postId,
      body,
      authorName: authorName || undefined,
    });

    if (!comment) {
      return apiError(404, "POST_NOT_FOUND", "Post not found");
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create comment";
    return apiError(500, "INTERNAL_ERROR", message);
  }
}
