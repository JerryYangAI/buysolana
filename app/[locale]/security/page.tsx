export const runtime = "edge";

import type { Metadata } from "next";
import { PageHero } from "@/components/ui/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "securityTitle", "/security", messages.security.description);
}

export default async function SecurityPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const messages = await getMessages(locale);
  const items =
    locale === "zh-CN"
      ? [
          "助记词离线保存，绝不分享。",
          "大额操作前先做小额测试。",
          "每次签名前核对交易详情。",
          "避免访问未知链接和未验证扩展。",
        ]
      : [
          "Keep seed phrases offline and never share them.",
          "Use test transfers before large amounts.",
          "Review transaction details before every signature.",
          "Avoid unknown links and unverified browser extensions.",
        ];

  return (
    <div className="space-y-4">
      <PageHero title={messages.security.title} description={messages.security.description} />
      <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-5 text-zinc-300">
        <ul className="list-disc space-y-2 pl-5">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
