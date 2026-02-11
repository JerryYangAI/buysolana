import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";
import type { TocItem } from "@/lib/content";

type Props = {
  locale: Locale;
  title: string;
  description: string;
  toc: TocItem[];
  tldr?: string[];
  nextRead?: string[];
  nextReadBasePath?: string;
  labels: {
    toc: string;
    tldr: string;
    nextRead: string;
    disclaimer: string;
  };
  children: React.ReactNode;
};

export function ArticleLayout({
  locale,
  title,
  description,
  toc,
  tldr,
  nextRead,
  nextReadBasePath = "/learn",
  labels,
  children,
}: Props) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <article className="rounded-2xl border border-white/12 bg-white/[0.03] p-6">
        <h1 className="text-3xl font-semibold text-zinc-100">{title}</h1>
        <p className="mt-3 text-zinc-300">{description}</p>

        {tldr && tldr.length > 0 && (
          <section className="mt-6 rounded-xl border border-cyan-300/30 bg-cyan-300/10 p-4">
            <h2 className="text-sm font-semibold text-cyan-100">{labels.tldr}</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-cyan-50">
              {tldr.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        <div className="mt-8">{children}</div>

        <section className="mt-8 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
          {labels.disclaimer} <Link href={withLocale(locale, "/security")} className="underline">/security</Link>
        </section>
      </article>

      <aside className="space-y-4">
        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold text-zinc-100">{labels.toc}</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {toc.length === 0 ? <li>-</li> : null}
            {toc.map((item) => (
              <li key={item.id} className={item.depth === 3 ? "pl-3" : ""}>
                <a href={`#${item.id}`} className="hover:text-white">
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-white/12 bg-white/[0.03] p-4">
          <h2 className="text-sm font-semibold text-zinc-100">{labels.nextRead}</h2>
          <ul className="mt-3 space-y-2 text-sm text-zinc-300">
            {(nextRead || []).map((slug) => (
              <li key={slug}>
                <Link href={withLocale(locale, `${nextReadBasePath}/${slug}`)} className="hover:text-white">
                  {slug}
                </Link>
              </li>
            ))}
            {!nextRead || nextRead.length === 0 ? <li>-</li> : null}
          </ul>
        </section>
      </aside>
    </div>
  );
}
