import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
      {
        userAgent: [
          "Googlebot",
          "Bingbot",
          "Applebot",
          "Google-Extended",
          "GPTBot",
          "PerplexityBot",
          "ClaudeBot",
        ],
        allow: "/",
        disallow: ["/admin", "/admin/*"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
