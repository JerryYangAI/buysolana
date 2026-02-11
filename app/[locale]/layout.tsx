import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ChatWidget } from "@/components/chat-widget";
import { isLocale, LOCALES, type Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) return {};

  const messages = await getMessages(locale);
  return {
    title: {
      default: messages.meta.homeTitle,
      template: `%s`,
    },
    description: messages.meta.homeDescription,
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  const l = locale as Locale;
  const messages = await getMessages(l);

  return (
    <div lang={l} className="min-h-screen">
      <Header
        locale={l}
        labels={{
          prices: messages.nav.prices,
          learn: messages.nav.learn,
          solutions: messages.nav.solutions,
          community: messages.nav.community,
          news: messages.nav.news,
          blogPodcast: messages.nav.blogPodcast,
          siteName: messages.site.name,
          en: messages.locale.en,
          zhCN: messages.locale.zhCN,
        }}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">{children}</main>

      <Footer
        locale={l}
        disclaimer={messages.footer.disclaimer}
        risk={messages.footer.risk}
        security={messages.footer.security}
      />

      <ChatWidget
        locale={l}
        labels={{
          title: messages.chat.title,
          placeholder: messages.chat.placeholder,
          send: messages.chat.send,
          refusal: messages.chat.tradingRefusal,
          routeHint: messages.chat.routeHint,
        }}
      />
    </div>
  );
}
