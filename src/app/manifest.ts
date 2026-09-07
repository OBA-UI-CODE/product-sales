import type { MetadataRoute } from "next";

/*
  Web app manifest — what a phone uses when someone adds JOHTA to their home
  screen. Without it, an installed shortcut gets a screenshot of the page
  instead of the logo, and opens in a browser tab with the address bar.

  The icon is the footer lockup: the rounded square on primary/border with the
  J in Dokdo.

  Two icon entries, because they are used differently:
    any       the icon as drawn, with its own rounded corners
    maskable  square, colour to every edge, glyph inside the middle 80%.
              Android crops icons to its own shape (circle, squircle,
              teardrop) and would slice the corners off the "any" version.
*/
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JOHTA — Every sale, accounted for.",
    short_name: "JOHTA",
    description:
      "Log daily sales, track stock and keep record of who owes you — built for small shops.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    orientation: "portrait",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
