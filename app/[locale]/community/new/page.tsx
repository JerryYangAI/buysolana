import type { Metadata } from "next";
import { NewPostForm } from "@/components/community/new-post-form";
import { PageHero } from "@/components/ui/page-hero";
import { isLocale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { pageMetadata } from "@/lib/page-metadata";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const messages = await getMessages(locale);
  return pageMetadata(locale, "communityTitle", "/community/new", messages.community.description);
}

export default async function CommunityNewPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const messages = await getMessages(locale);
  const turnstileSiteKey = process.env.TURNSTILE_SITE_KEY || "";

  return (
    <div className="space-y-4">
      <PageHero title={messages.community.newPost} description={messages.community.description} />
      <NewPostForm
        locale={locale}
        turnstileSiteKey={turnstileSiteKey}
        labels={{
          titleField: messages.community.titleField,
          bodyField: messages.community.bodyField,
          authorField: messages.community.authorField,
          submit: messages.buttons.post,
          rateLimit: messages.community.rateLimit,
        }}
      />
    </div>
  );
}
