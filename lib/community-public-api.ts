import "server-only";

import { headers } from "next/headers";
import type { Locale } from "@/lib/i18n/config";
import type { CommunityPost } from "@/lib/community-supabase";

type ListResponse = {
  posts: CommunityPost[];
  total: number;
  page: number;
  pageSize: number;
};

type DetailResponse = {
  post: CommunityPost;
};

async function baseUrl() {
  const h = await headers();
  const host = h.get("x-forwarded-host") || h.get("host");

  if (!host) {
    throw new Error("Cannot resolve request host for community API fetch");
  }

  const proto = h.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function fetchCommunityPostsViaApi(input: {
  locale: Locale;
  page: number;
  pageSize: number;
}) {
  const root = await baseUrl();
  const params = new URLSearchParams({
    locale: input.locale,
    page: String(input.page),
    pageSize: String(input.pageSize),
  });

  const res = await fetch(`${root}/api/community/posts?${params}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch posts (${res.status})`);
  }

  return (await res.json()) as ListResponse;
}

export async function fetchCommunityPostViaApi(input: {
  id: string;
  locale: Locale;
}) {
  const root = await baseUrl();
  const params = new URLSearchParams({ locale: input.locale });

  const res = await fetch(`${root}/api/community/posts/${input.id}?${params}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch post (${res.status})`);
  }

  const json = (await res.json()) as DetailResponse;
  return json.post;
}
