export const runtime = "edge";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { fetchCommunityPostsViaApi } from "@/lib/community-public-api";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";
import { withLocale } from "@/lib/i18n/routing";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "communityTitle", "/community", messages.community.description);
}

function toInt(value: string | undefined, fallback: number, min: number, max: number) {
  const n = Number.parseInt(value || "", 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; pageSize?: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const sp = await searchParams;

  const messages = await getMessages(locale);
  const page = toInt(sp.page, 1, 1, 10000);
  const pageSize = toInt(sp.pageSize, 20, 1, 50);
  const { posts, total } = await fetchCommunityPostsViaApi({ locale, page, pageSize });
  const maxPage = Math.max(1, Math.ceil(total / pageSize));
  const prevPage = Math.max(1, page - 1);
  const nextPage = Math.min(maxPage, page + 1);

  return (
    <div className="space-y-4">
      <PageHero
        title={messages.community.title}
        description={messages.community.description}
      >
        <Link href={withLocale(locale, "/community/new")} className="rounded-lg bg-zinc-100 px-4 py-2 text-sm text-black">
          {messages.community.newPost}
        </Link>
      </PageHero>

      <div className="grid gap-3">
        {posts.length === 0 ? <p className="text-sm text-zinc-400">{messages.community.empty}</p> : null}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={withLocale(locale, `/community/${post.id}`)}
            className="rounded-2xl border border-white/12 bg-white/[0.03] p-5"
          >
            <h2 className="text-lg font-semibold text-zinc-100">{post.title}</h2>
            <p className="mt-1 line-clamp-2 text-sm text-zinc-300">{post.body}</p>
            <p className="mt-2 text-xs text-zinc-500">{post.author}</p>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/12 bg-white/[0.03] p-4 text-sm text-zinc-300">
        <p>
          Page {page} / {maxPage}
        </p>
        <div className="flex gap-2">
          <Link
            href={withLocale(locale, `/community?page=${prevPage}&pageSize=${pageSize}`)}
            className="rounded border border-white/20 px-3 py-1 disabled:opacity-40"
            aria-disabled={page <= 1}
          >
            Prev
          </Link>
          <Link
            href={withLocale(locale, `/community?page=${nextPage}&pageSize=${pageSize}`)}
            className="rounded border border-white/20 px-3 py-1"
            aria-disabled={page >= maxPage}
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
