import type { Locale } from "@/lib/i18n/config";
import { getMessages } from "@/lib/i18n/messages";
import { localizedMetadata } from "@/lib/metadata";

type MetaKey =
  | "homeTitle"
  | "pricesTitle"
  | "learnTitle"
  | "solutionsTitle"
  | "communityTitle"
  | "newsTitle"
  | "blogTitle"
  | "podcastTitle"
  | "courseTitle"
  | "glossaryTitle"
  | "askTitle"
  | "securityTitle";

export async function pageMetadata(locale: Locale, key: MetaKey, path: string, description?: string) {
  const messages = await getMessages(locale);
  return localizedMetadata({
    locale,
    title: messages.meta[key],
    description: description || messages.meta.homeDescription,
    path,
  });
}
