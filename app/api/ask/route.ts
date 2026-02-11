import { NextResponse } from "next/server";
import { countUrlsInFields, enforceDuplicateCheck, isLengthBetween } from "@/lib/antiabuse/spam";
import { extractClientIp, enforceRateLimit } from "@/lib/antiabuse/rateLimit";
import { verifyTurnstile } from "@/lib/antiabuse/turnstile";
import { apiError, isValidEmail, normalizeOptionalString } from "@/lib/api/response";
import { createPendingAsk } from "@/lib/community-supabase";
import { isLocale } from "@/lib/i18n/config";

const ENDPOINT_PATH = "/api/ask";
const SUBJECT_MIN = 3;
const SUBJECT_MAX = 120;
const BODY_MIN = 10;
const BODY_MAX = 20000;

function turnstileStatus(code: string) {
  return code === "TURNSTILE_TOKEN_REQUIRED" ? 400 : 403;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const locale = normalizeOptionalString(payload.locale);
  const question = normalizeOptionalString(payload.question);
  const subject = normalizeOptionalString(payload.subject) || question.slice(0, 80);
  const body = normalizeOptionalString(payload.body) || question;
  const email = normalizeOptionalString(payload.email);
  const turnstileToken = normalizeOptionalString(payload.turnstileToken);

  if (!isLocale(locale)) {
    return apiError(400, "INVALID_LOCALE", "locale must be en or zh-CN");
  }

  if (!isLengthBetween(subject, SUBJECT_MIN, SUBJECT_MAX)) {
    return apiError(400, "INVALID_SUBJECT", `subject length must be ${SUBJECT_MIN}-${SUBJECT_MAX}`);
  }

  if (!isLengthBetween(body, BODY_MIN, BODY_MAX)) {
    return apiError(400, "INVALID_BODY", `body length must be ${BODY_MIN}-${BODY_MAX}`);
  }

  if (countUrlsInFields([subject, body]) > 2) {
    return apiError(400, "TOO_MANY_URLS", "At most 2 URLs are allowed.");
  }

  if (email && !isValidEmail(email)) {
    return apiError(400, "INVALID_EMAIL", "email format is invalid");
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
    content: [locale, subject, body, email].join("\n"),
    ttlSeconds: 600,
  });

  if (!duplicate.ok) {
    return apiError(409, "DUPLICATE_SUBMISSION", "Duplicate content detected. Please wait before resubmitting.");
  }

  try {
    const ask = await createPendingAsk({
      locale,
      subject,
      body,
      email: email || undefined,
    });

    return NextResponse.json({ ok: true, id: ask.id, status: ask.status }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create ask";
    return apiError(500, "INTERNAL_ERROR", message);
  }
}
