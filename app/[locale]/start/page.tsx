export const dynamic = "force-static";
export const dynamicParams = false;
export { generateLocaleParams as generateStaticParams } from "@/lib/i18n/static-params";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";
import { withLocale } from "@/lib/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "courseTitle", "/start", messages.hero.description);
}

export default async function StartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;
  const messages = await getMessages(locale);
  const steps =
    locale === "zh-CN"
      ? [
          "创建钱包并离线备份助记词。",
          "做一笔小额 SOL 转账并在浏览器核对。",
          "每天读一篇课程和一个术语。",
        ]
      : [
          "Set up a wallet and backup your seed phrase offline.",
          "Run a tiny SOL transfer and verify on explorer.",
          "Read one lesson and one glossary term daily.",
        ];

  return (
    <div className="space-y-4">
      <PageHero title={messages.hero.primary} description={messages.hero.description} />
      <div className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
        <ol className="list-decimal space-y-2 pl-5 text-zinc-300">
          {steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <Link href={withLocale(locale, "/course")} className="mt-4 inline-flex rounded-lg bg-zinc-100 px-4 py-2 text-sm text-black">
          {messages.hero.secondary}
        </Link>
      </div>
    </div>
  );
}
