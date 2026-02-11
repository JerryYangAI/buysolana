import "server-only";

import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type ModerationEntity = "posts" | "comments" | "asks";
export type ModerationAction = "publish" | "hide";

export type PendingPost = {
  id: string;
  locale: string;
  title: string;
  body: string;
  author_name: string | null;
  status: string;
  created_at: string;
};

export type PendingComment = {
  id: string;
  post_id: string;
  body: string;
  author_name: string | null;
  status: string;
  created_at: string;
};

export type PendingAsk = {
  id: string;
  locale: string;
  subject: string;
  body: string;
  email: string | null;
  status: string;
  created_at: string;
};

export async function getPendingModeration(input: { page: number; pageSize: number }) {
  const supabase = getSupabaseAdmin();
  const from = (input.page - 1) * input.pageSize;
  const to = from + input.pageSize - 1;

  const [postsRes, commentsRes, asksRes] = await Promise.all([
    supabase
      .from("posts")
      .select("id, locale, title, body, author_name, status, created_at", { count: "exact" })
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("comments")
      .select("id, post_id, body, author_name, status, created_at", { count: "exact" })
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .range(from, to),
    supabase
      .from("asks")
      .select("id, locale, subject, body, email, status, created_at", { count: "exact" })
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .range(from, to),
  ]);

  if (postsRes.error) throw new Error(`Failed to load pending posts: ${postsRes.error.message}`);
  if (commentsRes.error) throw new Error(`Failed to load pending comments: ${commentsRes.error.message}`);
  if (asksRes.error) throw new Error(`Failed to load pending asks: ${asksRes.error.message}`);

  return {
    posts: {
      items: (postsRes.data || []) as PendingPost[],
      total: postsRes.count || 0,
      page: input.page,
      pageSize: input.pageSize,
    },
    comments: {
      items: (commentsRes.data || []) as PendingComment[],
      total: commentsRes.count || 0,
      page: input.page,
      pageSize: input.pageSize,
    },
    asks: {
      items: (asksRes.data || []) as PendingAsk[],
      total: asksRes.count || 0,
      page: input.page,
      pageSize: input.pageSize,
    },
  };
}

function mapActionToStatus(action: ModerationAction) {
  return action === "publish" ? "published" : "hidden";
}

export async function applyModerationAction(input: {
  entity: ModerationEntity;
  id: string;
  action: ModerationAction;
}) {
  const supabase = getSupabaseAdmin();
  const status = mapActionToStatus(input.action);

  const { data, error } = await supabase
    .from(input.entity)
    .update({ status })
    .eq("id", input.id)
    .select("id, status")
    .single();

  if (error) {
    throw new Error(`Failed to update ${input.entity}: ${error.message}`);
  }

  return data as { id: string; status: string };
}
