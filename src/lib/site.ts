/*
  The site's own address, in one place.

  Everything that has to produce an ABSOLUTE url — the sitemap, robots.txt,
  canonical links, and the Open Graph tags that decide what WhatsApp shows
  when someone shares a link — needs this. Relative paths are fine inside the
  app and useless in any of those.

  Read from the environment so a preview deployment describes itself rather
  than claiming to be the live site, which would have preview URLs competing
  with johta.click in search results.
*/
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://johta.click"
).replace(/\/$/, "");
