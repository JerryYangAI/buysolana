import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";

type Props = {
  locale: Locale;
  disclaimer: string;
  risk: string;
  security: string;
};

export function Footer({ locale, disclaimer, risk, security }: Props) {
  return (
    <footer className="border-t border-white/10 bg-[#090b10]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-zinc-400 sm:px-6">
        <p>{disclaimer}</p>
        <p>{risk}</p>
        <Link href={withLocale(locale, "/security")} className="text-zinc-200 underline underline-offset-4">
          {security}
        </Link>
      </div>
    </footer>
  );
}
