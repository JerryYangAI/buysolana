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
    title: locale === "zh-CN" ? "游戏场景 | buysolanas.com" : "Game Solutions | buysolanas.com",
    description:
      locale === "zh-CN"
        ? "围绕钱包、资产与玩家经济的游戏上手路径。"
        : "Gaming-focused onboarding for wallets, assets, and player economies.",
    path: "/solutions/games",
  });
}

export default async function GamesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
      <h1 className="text-3xl font-semibold text-zinc-100">Games</h1>
      <p className="mt-3 text-zinc-300">
        {locale === "zh-CN"
          ? "探索 Solana 在低延迟游戏资产与玩家所有权中的应用。"
          : "Explore how Solana can support low-latency game assets and ownership models."}
      </p>
    </article>
  );
}
