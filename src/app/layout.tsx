import type { Metadata, Viewport } from "next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  /*
    metadataBase makes every relative url in here absolute. Without it the
    Open Graph image resolves to a path, which WhatsApp, Facebook and X all
    ignore — which is why sharing a johta.click link showed no preview card.
  */
  metadataBase: new URL(SITE_URL),

  /*
    A template, so each page can set its own short title and still carry the
    brand. Every page previously shared one title, which tells Google they are
    interchangeable and gives it no reason to show the right one.
  */
  title: {
    default: "JOHTA. Every sale, accounted for.",
    template: "%s · JOHTA",
  },
  description:
    "Log daily sales, track stock and know who owes you, in one simple dashboard built for small shops in Nigeria. Free for one month.",
  keywords: [
    "shop record keeping",
    "sales tracking Nigeria",
    "small business inventory",
    "stock management app",
    "record sales app",
    "JOHTA",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "JOHTA",
    locale: "en_NG",
    url: SITE_URL,
    title: "JOHTA. Every sale, accounted for.",
    description:
      "Log daily sales, track stock and know who owes you, in one simple dashboard built for small shops in Nigeria.",
  },
  twitter: {
    card: "summary_large_image",
    title: "JOHTA. Every sale, accounted for.",
    description:
      "Log daily sales, track stock and know who owes you. Built for small shops.",
  },
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
      <head>
        {/*
          Catches Android's install offer before it is lost.

          Chrome fires beforeinstallprompt once, very early, often before
          React has hydrated anything. A listener registered inside a
          component would usually miss it, and the "Install JOHTA" button
          would then have nothing to trigger. So it is caught here, in the
          head, and parked on window for InstallApp to pick up.

          preventDefault stops Chrome showing its own mini-infobar, so the
          install offer is the same JOHTA button on every platform rather
          than a different surface on each. iOS never fires this event at
          all; InstallApp handles that case separately.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__johtaInstall=e;window.dispatchEvent(new Event('johta:installable'))});" +
              "window.addEventListener('appinstalled',function(){window.__johtaInstall=null;window.dispatchEvent(new Event('johta:installed'))});",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
