import "server-only";

import { cache } from "react";
import type { Locale } from "@/lib/i18n/config";
import en from "@/messages/en.json";
import zhCN from "@/messages/zh-CN.json";

export type Messages = typeof en;

const catalogs: Record<Locale, Messages> = {
  en,
  "zh-CN": zhCN,
};

export const getMessages = cache(async (locale: Locale): Promise<Messages> => {
  return catalogs[locale];
});
