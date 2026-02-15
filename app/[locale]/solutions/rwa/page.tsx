export const dynamic = "force-static";
export const dynamicParams = false;
export { generateLocaleParams as generateStaticParams } from "@/lib/i18n/static-params";

import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/metadata";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  const title = locale === "zh-CN" ? "RWA 场景 | buysolanas.com" : "RWA Solutions | buysolanas.com";
  const description =
    locale === "zh-CN"
      ? "面向新手的现实资产代币化学习路径。"
      : "Tokenized real-world asset education and onboarding pathways.";

  return localizedMetadata({
    locale,
    title,
    description,
    path: "/solutions/rwa",
  });
}

export default async function RwaPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const title = locale === "zh-CN" ? "RWA" : "RWA";
  const body =
    locale === "zh-CN"
      ? "学习 Solana 在现实资产代币化流程中的关键角色与风险点。"
      : "Learn how Solana can support tokenized real-world asset workflows.";

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
      <h1 className="text-3xl font-semibold text-zinc-100">{title}</h1>
      <p className="mt-3 text-zinc-300">{body}</p>
    </article>
  );
}
