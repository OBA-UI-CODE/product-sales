import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
