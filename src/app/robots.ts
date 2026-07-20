import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const privatePaths = [
  "/api/",
  "/private/",
  "/history",
  "/favorites",
  "/profile",
  "/settings",
  "/results",
  "/tarot/result/",
  "/share/",
] as const;

export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [...privatePaths],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
