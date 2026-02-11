import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

export const dynamic = "force-static";

export default function RootPage() {
  // Middleware handles locale detection first; this is a stable fallback.
  redirect(`/${DEFAULT_LOCALE}`);
}
