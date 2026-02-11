import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://buysolanas.com/sitemap.xml",
    host: "https://buysolanas.com",
  };
}
