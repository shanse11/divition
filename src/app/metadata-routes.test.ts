import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { siteConfig } from "@/config/site";

const baseUrl = siteConfig.url.replace(/\/$/, "");

describe("sitemap", () => {
  it("lists only requested public routes with absolute URLs", () => {
    expect(sitemap().map(({ url }) => url)).toEqual([
      baseUrl,
      `${baseUrl}/tarot`,
      `${baseUrl}/daily`,
      `${baseUrl}/zodiac`,
      `${baseUrl}/dream`,
      `${baseUrl}/relationship`,
      `${baseUrl}/about`,
    ]);
  });

  it("does not expose private, result, share, or authentication routes", () => {
    const urls = sitemap().map(({ url }) => url);
    for (const path of [
      "/history",
      "/favorites",
      "/profile",
      "/settings",
      "/tarot/result/example",
      "/share/example",
      "/login",
      "/register",
    ]) {
      expect(urls).not.toContain(`${baseUrl}${path}`);
    }
  });
});

describe("robots", () => {
  it("allows public pages, links the sitemap, and disallows private route families", () => {
    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/private/",
          "/history",
          "/favorites",
          "/profile",
          "/settings",
          "/results",
          "/tarot/result/",
          "/share/",
        ],
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    });
  });
});
