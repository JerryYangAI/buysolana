export const runtime = "edge";

export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { ModerationConsole } from "@/components/admin/moderation-console";
import { isAdminSessionValid } from "@/lib/admin/auth";
import { getPendingModeration } from "@/lib/admin/moderation";
import { isLocale } from "@/lib/i18n/config";
import { localizedMetadata } from "@/lib/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};

  return localizedMetadata({
    locale,
    title: "Admin Moderation | buysolanas.com",
    description: "Internal moderation dashboard for pending submissions.",
    path: "/admin/moderation",
  });
}

export default async function ModerationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) return null;

  const initialAuthenticated = await isAdminSessionValid();
  const initialData = initialAuthenticated
    ? await getPendingModeration({ page: 1, pageSize: 20 })
    : null;

  return <ModerationConsole initialAuthenticated={initialAuthenticated} initialData={initialData} />;
}
