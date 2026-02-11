import { NextRequest, NextResponse } from "next/server";
import { isAdminSessionValid } from "@/lib/admin/auth";
import { getPendingModeration } from "@/lib/admin/moderation";
import { apiError, toBoundedInt } from "@/lib/api/response";

export async function GET(request: NextRequest) {
  const ok = await isAdminSessionValid();
  if (!ok) {
    return apiError(401, "UNAUTHORIZED", "Admin login required");
  }

  const page = toBoundedInt(request.nextUrl.searchParams.get("page"), {
    fallback: 1,
    min: 1,
    max: 10000,
  });

  const pageSize = toBoundedInt(request.nextUrl.searchParams.get("pageSize"), {
    fallback: 20,
    min: 1,
    max: 100,
  });

  try {
    const result = await getPendingModeration({ page, pageSize });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load moderation data";
    return apiError(500, "INTERNAL_ERROR", message);
  }
}
