export const runtime = "edge";

import type { Metadata } from "next";
import { AskForm } from "@/components/community/ask-form";
import { PageHero } from "@/components/ui/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "askTitle", "/ask", messages.ask.description);
}

export default async function AskPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || "";

  return (
    <div className="space-y-4">
      <PageHero title={messages.ask.title} description={messages.ask.description} />
      <AskForm
        locale={locale}
        turnstileSiteKey={turnstileSiteKey}
        labels={{
          emailField: messages.ask.emailField,
          questionField: messages.ask.questionField,
          autoThread: messages.ask.autoThread,
          submit: messages.buttons.submit,
        }}
      />
    </div>
  );
}
