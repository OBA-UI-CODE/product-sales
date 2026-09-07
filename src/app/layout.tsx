import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JOHTA — Every sale, accounted for.",
  description: "Sales, stock, and staff — one simple dashboard for your shop.",
  /*
    Next picks up src/app/icon.png and apple-icon.png automatically, so the
    tab icon and the iOS home-screen icon need no configuration. The manifest
    (src/app/manifest.ts) covers Android install.
  */
  applicationName: "JOHTA",
  appleWebApp: {
    // Lets an iPhone open it full screen from the home screen rather than
    // inside Safari with the address bar.
    capable: true,
    title: "JOHTA",
    statusBarStyle: "black-translucent",
  },
};

/* The colour behind the status bar and browser chrome. Matches bg/canvas so
   the app does not sit in a white frame on mobile. */
export const viewport: Viewport = {
  themeColor: "#0a0a0a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
