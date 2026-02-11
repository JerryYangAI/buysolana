import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { withLocale } from "@/lib/i18n/routing";
import { LanguageSwitcher } from "@/components/language-switcher";

type Props = {
  locale: Locale;
  labels: {
    prices: string;
    learn: string;
    solutions: string;
    community: string;
    news: string;
    blogPodcast: string;
    siteName: string;
    en: string;
    zhCN: string;
  };
};

export function Header({ locale, labels }: Props) {
  const items = [
    { href: "/prices", label: labels.prices },
    { href: "/learn", label: labels.learn },
    { href: "/solutions", label: labels.solutions },
    { href: "/community", label: labels.community },
    { href: "/news", label: labels.news },
    { href: "/blog", label: labels.blogPodcast },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0c12]/90 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href={withLocale(locale, "/")} className="text-sm font-semibold tracking-[0.12em] text-zinc-100 uppercase">
          {labels.siteName}
        </Link>

        <nav className="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
          {items.map((item) => (
            <Link
              key={item.href}
              href={withLocale(locale, item.href)}
              className="transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <LanguageSwitcher locale={locale} labels={{ en: labels.en, zhCN: labels.zhCN }} />
      </div>

      <nav className="border-t border-white/10 px-4 py-2 text-xs text-zinc-300 md:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-4 overflow-x-auto whitespace-nowrap">
          {items.map((item) => (
            <Link
              key={item.href}
              href={withLocale(locale, item.href)}
              className="rounded-full border border-white/15 bg-white/5 px-3 py-1 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
