import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
  johta.click/sitemap.xml returned 404, so Google had no list of what exists
  here. On a brand-new domain with no inbound links that matters more than
  usual: there is nothing else pointing at these pages for a crawler to
  follow.

  Only public pages. The signed-in app is excluded for the same reason it is
  disallowed in robots.ts — those routes redirect to /login for a crawler, so
  listing them would be advertising a set of redirects.

  changeFrequency and priority are hints Google mostly ignores, but lastModified
  is used, so it is a real date rather than Date.now() on every request — a
  sitemap that claims every page changed one second ago is one Google learns to
  distrust.
*/
const LAST_MODIFIED = new Date("2026-09-09");

const PAGES: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/pricing", priority: 0.9 },
  { path: "/how-it-works", priority: 0.8 },
  { path: "/about", priority: 0.7 },
  { path: "/contact", priority: 0.6 },
  { path: "/signup", priority: 0.6 },
  { path: "/login", priority: 0.4 },
  { path: "/terms", priority: 0.3 },
  { path: "/privacy", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority,
  }));
}
