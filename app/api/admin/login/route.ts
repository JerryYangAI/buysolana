export const runtime = "edge";

import { NextResponse } from "next/server";
import { apiError, normalizeOptionalString } from "@/lib/api/response";
import { isAdminConfigured, setAdminSessionCookie, verifyAdminPassword } from "@/lib/admin/auth";

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return apiError(500, "ADMIN_NOT_CONFIGURED", "Admin authentication is not configured.");
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const password = normalizeOptionalString(payload.password);

  if (!password) {
    return apiError(400, "MISSING_PASSWORD", "Password is required");
  }

  if (!(await verifyAdminPassword(password))) {
    return apiError(403, "INVALID_CREDENTIALS", "Invalid admin password");
  }

  await setAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
