import { LOCALES } from "@/lib/i18n/config";

export function generateLocaleParams() {
  return LOCALES.map((locale) => ({ locale }));
}
