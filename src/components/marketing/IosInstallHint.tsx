"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

/*
  "Add JOHTA to your home screen" — iPhone only.

  Android Chrome offers to install a web app on its own. iOS never does:
  Apple does not implement the install prompt, so the only route is
  Share -> Add to Home Screen, and nobody discovers that by accident. Shop
  owners sent a link on WhatsApp were opening it in Safari every time and
  concluding there was no app.

  The manifest and apple-touch-icon are already in place, so once it IS added
  it opens full screen with the JOHTA icon. This is purely the missing
  instruction.

  ---------------------------------------------------------------------------
  Why the detection is this fussy

  Three separate things have to be true, and each has a trap:

  · It must be iOS. iPadOS reports itself as "Macintosh" in the user agent,
    so an iPad is only distinguishable from a desktop Mac by the fact that it
    has a touch screen — hence the maxTouchPoints check.

  · It must be SAFARI. Chrome, Firefox and Edge on iOS are all Safari
    underneath, but none of them can add a site to the home screen — Apple
    does not give them the API. Showing this banner there would be telling
    someone to do something impossible, so those are excluded by their UA
    markers (CriOS / FxiOS / EdgiOS).

  · It must not already be installed. navigator.standalone is the iOS way of
    saying "you are running from the home screen"; display-mode: standalone
    is the standard one. Either means the banner has already done its job.

  All of it runs in an effect rather than during render, so the server never
  emits this markup and there is nothing to mismatch on hydration.
*/

const DISMISSED_KEY = "johta:ios-install-hint-dismissed";

function shouldShow(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  const ua = navigator.userAgent;

  const isIphoneOrIpod = /iPhone|iPod/.test(ua);
  /* iPadOS pretends to be a Mac; a Mac with a touch screen is an iPad. */
  const isIpad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (!isIphoneOrIpod && !isIpad) return false;

  /* Every other iOS browser is Safari underneath but cannot do this. */
  if (/CriOS|FxiOS|EdgiOS|OPiOS|Chrome/.test(ua)) return false;

  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true;
  if (standalone) return false;

  try {
    if (window.localStorage.getItem(DISMISSED_KEY) === "1") return false;
  } catch {
    /* Private browsing can throw on access. Not a reason to hide the hint. */
  }

  return true;
}

/* The iOS share glyph — a box with an arrow leaving the top. Drawn rather
   than described, because "the share button" means nothing until you have
   seen the shape. */
function ShareGlyph() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 3v13" />
      <path d="M8 7l4-4 4 4" />
      <path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
    </svg>
  );
}

export default function IosInstallHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(shouldShow());
  }, []);

  if (!show) return null;

  function dismiss() {
    setShow(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* If it cannot be remembered the hint returns next visit, which is
         mildly annoying and much better than crashing the page. */
    }
  }

  return (
    <div
      role="complementary"
      aria-label="Install JOHTA on your iPhone"
      className="fixed inset-x-3 bottom-3 z-50 flex items-start gap-3 rounded-[14px] border border-border-strong bg-bg-surface p-4 shadow-lg tab:hidden"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="font-heading text-[16px] font-semibold leading-[20px] text-text-primary">
          Add JOHTA to your home screen
        </p>
        <p className="flex flex-wrap items-center gap-x-1 font-body text-[14px] leading-[20px] text-text-secondary">
          <span>Tap</span>
          <span className="inline-flex items-center text-primary-text">
            <ShareGlyph />
          </span>
          <span>below, then</span>
          <span className="text-text-primary">Add to Home Screen</span>
          <span>&mdash; it opens like an app.</span>
        </p>
      </div>

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="press -mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-full text-text-secondary"
      >
        <X size={18} />
      </button>
    </div>
  );
}
