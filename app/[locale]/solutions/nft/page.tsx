import type { Metadata } from "next";
import { localizedMetadata } from "@/lib/metadata";
import { isLocale } from "@/lib/i18n/config";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return localizedMetadata({
    locale,
    title: locale === "zh-CN" ? "NFT 场景 | buysolanas.com" : "NFT Solutions | buysolanas.com",
    description:
      locale === "zh-CN"
        ? "NFT 在会员、票务和数字权益中的非投机应用。"
        : "NFT use-cases beyond speculation for memberships and digital products.",
    path: "/solutions/nft",
  });
}

export default async function NftPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
      <h1 className="text-3xl font-semibold text-zinc-100">NFT</h1>
      <p className="mt-3 text-zinc-300">
        {locale === "zh-CN"
          ? "理解 NFT 在访问控制、门票与忠诚度系统中的实用价值。"
          : "Understand utility NFTs for access control, ticketing, and loyalty systems."}
      </p>
    </article>
  );
}
