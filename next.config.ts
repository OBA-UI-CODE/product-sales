import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* No "X-Powered-By: Next.js" on every response; it only tells a stranger
     what to look up. */
  poweredByHeader: false,

  /* The receipt image reads its fonts from disk at request time. Vercel only
     ships files it can see being imported, so name the folder explicitly or
     the route would 500 in production while working locally. */
  outputFileTracingIncludes: {
    "/api/receipt/[saleId]": ["./assets/receipt-fonts/**"],
  },

  /*
    One address for the site: johta.click.

    johta.vercel.app (Vercel's own address, from before the domain) and
    www.johta.click both served the full site. Anything saved from the old
    address, like a home-screen icon or a bookmark, kept opening it, and
    Google sign-in broke there: Supabase only returns people to addresses
    on its allow list, so it dropped them on the johta.click homepage, and the
    half-finished sign-in cannot follow them to a different address. They had
    to sign in twice.

    Forwarding every request on those two hosts, path and query string
    included, means nobody is ever on them. Preview deployments have their own
    johta-<hash>.vercel.app addresses and are not affected.
  */
  /*
    Security headers on every response. The site sent none.

    frame-ancestors 'none' / X-Frame-Options DENY: nobody can show JOHTA
      inside their own page, so a lookalike site cannot lay invisible
      buttons over the real sign-in form (clickjacking). Nothing legitimate
      frames JOHTA; Paystack is a redirect, not an embed.
    HSTS: once seen, browsers only ever use https for johta.click, for two
      years, so a hostile Wi-Fi cannot downgrade the first request.
    nosniff: a file is treated as the type it says it is.
    Referrer-Policy: other sites see only "johta.click", never full urls
      such as /api/receipt/<sale id>.
    Permissions-Policy: camera, microphone and location are switched off;
      JOHTA uses none of them.

    Not a full Content-Security-Policy: Next's inline scripts, the install
    prompt script and the JSON-LD would all need nonces, which is a larger
    change than the protection it adds here.
  */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
        ],
      },
    ];
  },

  async redirects() {
    return ["johta.vercel.app", "www.johta.click"].map((host) => ({
      source: "/:path*",
      has: [{ type: "host" as const, value: host }],
      destination: "https://johta.click/:path*",
      permanent: true,
    }));
  },
};

export default nextConfig;
