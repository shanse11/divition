import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

const publicRoutes = [
  { path: "", changeFrequency: "weekly", priority: 1 },
  { path: "/tarot", changeFrequency: "weekly", priority: 0.9 },
  { path: "/daily", changeFrequency: "daily", priority: 0.9 },
  { path: "/zodiac", changeFrequency: "daily", priority: 0.8 },
  { path: "/dream", changeFrequency: "monthly", priority: 0.8 },
  { path: "/relationship", changeFrequency: "monthly", priority: 0.8 },
  { path: "/about", changeFrequency: "monthly", priority: 0.5 },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteConfig.url.replace(/\/$/, "");

  return publicRoutes.map(({ path, changeFrequency, priority }) => ({
    url: `${baseUrl}${path}`,
    changeFrequency,
    priority,
  }));
}
