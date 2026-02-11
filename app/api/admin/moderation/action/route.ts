export const runtime = "edge";

import { NextResponse } from "next/server";
import { applyModerationAction, type ModerationAction, type ModerationEntity } from "@/lib/admin/moderation";
import { isAdminSessionValid } from "@/lib/admin/auth";
import { apiError, normalizeOptionalString } from "@/lib/api/response";

function isEntity(value: string): value is ModerationEntity {
  return value === "posts" || value === "comments" || value === "asks";
}

function isAction(value: string): value is ModerationAction {
  return value === "publish" || value === "hide";
}

export async function POST(request: Request) {
  const ok = await isAdminSessionValid();
  if (!ok) {
    return apiError(401, "UNAUTHORIZED", "Admin login required");
  }

  let payload: Record<string, unknown>;

  try {
    payload = (await request.json()) as Record<string, unknown>;
  } catch {
    return apiError(400, "INVALID_JSON", "Request body must be valid JSON");
  }

  const entity = normalizeOptionalString(payload.entity);
  const id = normalizeOptionalString(payload.id);
  const action = normalizeOptionalString(payload.action);

  if (!isEntity(entity)) {
    return apiError(400, "INVALID_ENTITY", "entity must be posts/comments/asks");
  }

  if (!id) {
    return apiError(400, "INVALID_ID", "id is required");
  }

  if (!isAction(action)) {
    return apiError(400, "INVALID_ACTION", "action must be publish/hide");
  }

  try {
    const result = await applyModerationAction({ entity, id, action });
    return NextResponse.json({ ok: true, item: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to apply moderation action";
    return apiError(500, "INTERNAL_ERROR", message);
  }
}
