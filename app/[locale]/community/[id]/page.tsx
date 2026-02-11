export const runtime = "edge";

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CommentForm } from "@/components/community/comment-form";
import { fetchCommunityPostViaApi } from "@/lib/community-public-api";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale, id } = await params;
  if (!isLocale(locale)) return {};

  const post = await fetchCommunityPostViaApi({ id, locale });
  if (!post) return {};

  return localizedMetadata({
    locale,
    title: `${post.title} | buysolanas.com`,
    description: post.body,
    path: `/community/${id}`,
  });
}

export default async function CommunityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isLocale(locale)) return null;

  const post = await fetchCommunityPostViaApi({ id, locale });
  if (!post) notFound();

  const messages = await getMessages(locale);
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || "";

  return (
    <div className="space-y-4">
      <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
        <h1 className="text-3xl font-semibold text-zinc-100">{post.title}</h1>
        <p className="mt-3 text-zinc-300">{post.body}</p>
        <p className="mt-2 text-xs text-zinc-500">{post.author}</p>
      </article>

      <section className="space-y-3">
        {post.comments.map((comment) => (
          <article key={comment.id} className="rounded-xl border border-white/10 bg-[#0d111a] p-4">
            <p className="text-sm text-zinc-200">{comment.body}</p>
            <p className="mt-2 text-xs text-zinc-500">{comment.author}</p>
          </article>
        ))}
      </section>

      <CommentForm
        postId={post.id}
        turnstileSiteKey={turnstileSiteKey}
        labels={{
          authorField: messages.community.authorField,
          commentField: messages.community.commentField,
          submit: messages.buttons.comment,
          rateLimit: messages.community.rateLimit,
        }}
      />
    </div>
  );
}
