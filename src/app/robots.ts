import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/*
  There was no robots.txt at all — johta.click/robots.txt returned 404.

  A missing file is not the same as a blocked one: crawlers treat "no
  robots.txt" as "crawl everything", so this was not why the site failed to
  appear in Google. But it is the first URL a crawler asks for, and it is
  where the sitemap is advertised, so without it Google has to discover every
  page by following links from a domain it has never seen before.

  The signed-in app is disallowed. Not for secrecy — those routes redirect to
  /login without a session, so there is nothing to leak — but because a
  crawler spending its time on pages that always redirect is time not spent on
  the pages meant to rank.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/dashboard",
        "/sales-history",
        "/insights",
        "/products",
        "/debts",
        "/settings",
        "/onboarding",
        "/account/",
        "/api/",
        "/auth/",
        "/reset-password",
        "/forgot-password",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
