import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";

type Props = {
  locale: Locale;
  title: string;
  description: string;
  cta: string;
  href: string;
};

export function SectionCard({ locale, title, description, cta, href }: Props) {
  return (
    <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-5">
      <h2 className="text-xl font-semibold text-zinc-100">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-zinc-300">{description}</p>
      <Link
        href={withLocale(locale, href)}
        className="mt-4 inline-flex rounded-lg bg-zinc-100 px-4 py-2 text-sm font-medium text-black"
      >
        {cta}
      </Link>
    </article>
  );
}
