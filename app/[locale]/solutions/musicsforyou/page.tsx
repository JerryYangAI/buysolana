export const dynamic = "force-static";
export const dynamicParams = false;
export { generateLocaleParams as generateStaticParams } from "@/lib/i18n/static-params";
import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/metadata";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return localizedMetadata({
    locale,
    title: locale === "zh-CN" ? "音乐场景 | buysolanas.com" : "MusicSForYou | buysolanas.com",
    description:
      locale === "zh-CN"
        ? "创作者权益与粉丝连接的 Solana 学习案例。"
        : "Music creator workflows and direct monetization with Solana rails.",
    path: "/solutions/musicsforyou",
  });
}

export default async function MusicSForYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
      <h1 className="text-3xl font-semibold text-zinc-100">MusicSForYou</h1>
      <p className="mt-3 text-zinc-300">
        {locale === "zh-CN"
          ? "用于学习创作者直连变现与数字内容所有权的实践路径。"
          : "A learning path for fan-funded releases and creator-owned distribution."}
      </p>
    </article>
  );
}
