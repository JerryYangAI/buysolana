import "server-only";

import type { Locale } from "@/lib/i18n/config";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export type CommunityComment = {
  id: string;
  author: string;
  body: string;
  createdAt: string;
  status?: string;
};

export type CommunityPost = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: string;
  status?: string;
  locale?: string;
  comments: CommunityComment[];
};

type PostRow = {
  id: string;
  locale: string;
  title: string;
  body: string;
  author_name: string | null;
  status: string;
  created_at: string;
};

type CommentRow = {
  id: string;
  post_id: string;
  body: string;
  author_name: string | null;
  status: string;
  created_at: string;
};

type AskRow = {
  id: string;
  locale: string;
  subject: string;
  body: string;
  email: string | null;
  status: string;
  created_at: string;
};

function mapPost(row: PostRow): CommunityPost {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    author: row.author_name || "anonymous",
    createdAt: row.created_at,
    status: row.status,
    locale: row.locale,
    comments: [],
  };
}

function mapComment(row: CommentRow): CommunityComment {
  return {
    id: row.id,
    body: row.body,
    author: row.author_name || "anonymous",
    createdAt: row.created_at,
    status: row.status,
  };
}

export async function listPublishedPosts(input: {
  locale?: Locale;
  page: number;
  pageSize: number;
}) {
  const supabase = getSupabaseAdmin();
  const from = (input.page - 1) * input.pageSize;
  const to = from + input.pageSize - 1;

  let query = supabase
    .from("posts")
    .select("id, locale, title, body, author_name, status, created_at", { count: "exact" })
    .eq("status", "published");

  if (input.locale) {
    query = query.eq("locale", input.locale);
  }

  const { data, error, count } = await query.order("created_at", { ascending: false }).range(from, to);

  if (error) {
    throw new Error(`Failed to list posts: ${error.message}`);
  }

  return {
    posts: ((data || []) as PostRow[]).map(mapPost),
    total: count || 0,
    page: input.page,
    pageSize: input.pageSize,
  };
}

export async function getPublishedPostById(postId: string, locale?: Locale) {
  const supabase = getSupabaseAdmin();

  let postQuery = supabase
    .from("posts")
    .select("id, locale, title, body, author_name, status, created_at")
    .eq("id", postId)
    .eq("status", "published");

  if (locale) {
    postQuery = postQuery.eq("locale", locale);
  }

  postQuery = postQuery.limit(1);

  const singleQuery = postQuery.maybeSingle();

  const { data: postData, error: postError } = await singleQuery;

  if (postError) {
    throw new Error(`Failed to get post: ${postError.message}`);
  }

  if (!postData) {
    return null;
  }

  const { data: commentsData, error: commentsError } = await supabase
    .from("comments")
    .select("id, post_id, body, author_name, status, created_at")
    .eq("post_id", postId)
    .eq("status", "published")
    .order("created_at", { ascending: true });

  if (commentsError) {
    throw new Error(`Failed to get comments: ${commentsError.message}`);
  }

  return {
    ...mapPost(postData as PostRow),
    comments: ((commentsData || []) as CommentRow[]).map(mapComment),
  };
}

export async function createPendingPost(input: {
  locale: Locale;
  title: string;
  body: string;
  authorName?: string;
}) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      locale: input.locale,
      title: input.title,
      body: input.body,
      author_name: input.authorName || null,
      status: "pending",
    })
    .select("id, locale, title, body, author_name, status, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to create post: ${error.message}`);
  }

  return mapPost(data as PostRow);
}

export async function createPendingComment(input: {
  postId: string;
  body: string;
  authorName?: string;
}) {
  const supabase = getSupabaseAdmin();

  const { data: postData, error: postError } = await supabase
    .from("posts")
    .select("id")
    .eq("id", input.postId)
    .eq("status", "published")
    .limit(1)
    .maybeSingle();

  if (postError) {
    throw new Error(`Failed to validate post: ${postError.message}`);
  }

  if (!postData) {
    return null;
  }

  const { data, error } = await supabase
    .from("comments")
    .insert({
      post_id: input.postId,
      body: input.body,
      author_name: input.authorName || null,
      status: "pending",
    })
    .select("id, post_id, body, author_name, status, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to create comment: ${error.message}`);
  }

  return mapComment(data as CommentRow);
}

export async function createPendingAsk(input: {
  locale: Locale;
  subject: string;
  body: string;
  email?: string;
}) {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("asks")
    .insert({
      locale: input.locale,
      subject: input.subject,
      body: input.body,
      email: input.email || null,
      status: "pending",
    })
    .select("id, locale, subject, body, email, status, created_at")
    .single();

  if (error) {
    throw new Error(`Failed to create ask: ${error.message}`);
  }

  return data as AskRow;
}
