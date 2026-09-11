"use client";

import { useEffect, useState } from "react";
import { Download, Plus, Share, X } from "lucide-react";

/*
  One "Install JOHTA" button, on every platform.

  What happens when it is tapped depends on what the phone allows:

    Android / desktop Chrome / Edge
        The browser offered an install (beforeinstallprompt, caught in the
        root layout's head). Tapping calls its prompt() and the system
        install dialog opens. One tap, done.

    iPhone / iPad in Safari
        Apple does not implement beforeinstallprompt, and there is no other
        API, so no website can install itself on iOS with one tap. There is
        an open request on Apple's developer forum asking for exactly that.
        The only route is Share -> Add to Home Screen, so tapping opens a
        step-by-step guide to it instead.

    iPhone in Chrome, Firefox or another browser
        Apple does not let those browsers add to the home screen at all, so
        the button explains that the page has to be opened in Safari.

  WHY THIS REPLACED IosInstallHint: that banner was a card of instructions
  shaped like a button. People tapped it and nothing happened, because there
  was nothing for it to do. Here the whole thing is a real button, and on
  iPhone it opens something useful.

  Hidden entirely once the app is running from the home screen.
*/

const DISMISSED_KEY = "johta:install-dismissed";

type Mode = "prompt" | "ios-safari" | "ios-other" | null;

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __johtaInstall?: InstallPromptEvent | null;
  }
}

function isStandalone() {
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
}

function detectMode(): Mode {
  if (typeof window === "undefined") return null;
  if (isStandalone()) return null;
  if (window.__johtaInstall) return "prompt";

  const ua = navigator.userAgent;
  const iphone = /iPhone|iPod/.test(ua);
  /* iPadOS reports itself as a Mac; a Mac with a touch screen is an iPad. */
  const ipad = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (!iphone && !ipad) return null;

  /* Chrome, Firefox, Edge and Opera on iOS are Safari underneath but are
     not permitted to add to the home screen. */
  return /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) ? "ios-other" : "ios-safari";
}

function readDismissed() {
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

export default function InstallApp({
  variant,
}: {
  /* floating: a bar pinned to the bottom of the marketing site.
     inline:   a card in the page flow, for inside the app, where the bottom
               of the screen already belongs to the nav bar.
     settings: always shown, never dismissible, so anyone who closed the
               banner can still find it. */
  variant: "floating" | "inline" | "settings";
}) {
  const [mode, setMode] = useState<Mode>(null);
  const [dismissed, setDismissed] = useState(true);
  const [guideOpen, setGuideOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setMode(detectMode());
    setDismissed(variant !== "settings" && readDismissed());

    /* The install offer can arrive after first render; listen for it. */
    const onInstallable = () => setMode(detectMode());
    const onInstalled = () => setMode(null);
    window.addEventListener("johta:installable", onInstallable);
    window.addEventListener("johta:installed", onInstalled);
    return () => {
      window.removeEventListener("johta:installable", onInstallable);
      window.removeEventListener("johta:installed", onInstalled);
    };
  }, [variant]);

  if (!mode || dismissed) return null;

  async function install() {
    if (mode === "prompt" && window.__johtaInstall) {
      setBusy(true);
      try {
        await window.__johtaInstall.prompt();
        const { outcome } = await window.__johtaInstall.userChoice;
        /* The event can only be used once, whatever the answer. */
        window.__johtaInstall = null;
        if (outcome === "accepted") setMode(null);
        else setMode(detectMode());
      } finally {
        setBusy(false);
      }
      return;
    }
    setGuideOpen(true);
  }

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      /* If it cannot be remembered it returns next visit. Harmless. */
    }
  }

  const label =
    mode === "ios-other" ? "Install JOHTA (open in Safari)" : "Install JOHTA";

  const button = (
    <button
      type="button"
      onClick={install}
      disabled={busy}
      className="press flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary-default px-4 font-heading text-[16px] font-semibold text-text-on-primary disabled:opacity-60"
    >
      <Download size={18} aria-hidden />
      {busy ? "Opening..." : label}
    </button>
  );

  const shell =
    variant === "floating"
      ? "fixed inset-x-3 bottom-3 z-50 tab:hidden"
      : "w-full";

  return (
    <>
      {/*
        The Settings section's heading lives here, not on the page, so it
        goes when the button goes. It used to sit on the page by itself, and
        once the app was installed (or on a browser that cannot install) it
        was left as a heading with nothing under it.
      */}
      {variant === "settings" && (
        <h2 className="-mb-4 font-heading text-xl font-semibold">
          Install the app
        </h2>
      )}
      <div className={shell}>
        <div className="flex flex-col gap-3 rounded-md border border-border-strong bg-bg-surface p-4 shadow-lg">
          {variant !== "settings" && (
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-col gap-1">
                <p className="font-heading text-[16px] font-semibold leading-[20px] text-text-primary">
                  Get JOHTA on your home screen
                </p>
                <p className="font-body text-[14px] leading-[20px] text-text-secondary">
                  Opens like an app, no browser bar.
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
          )}
          <div className="flex">{button}</div>
        </div>
      </div>

      {guideOpen && (
        <IosGuide mode={mode} onClose={() => setGuideOpen(false)} />
      )}
    </>
  );
}

/*
  The iPhone instructions, as numbered steps with the actual glyphs Safari
  shows, because "tap Share" means nothing until you have seen the icon.
*/
function IosGuide({ mode, onClose }: { mode: Mode; onClose: () => void }) {
  const inSafari = mode === "ios-safari";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="How to install JOHTA"
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="flex w-full max-w-[480px] flex-col gap-5 rounded-t-md bg-bg-surface p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-heading text-[20px] font-semibold leading-[24px] text-text-primary">
            {inSafari ? "Install JOHTA on your iPhone" : "Open this page in Safari"}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="press flex size-9 shrink-0 items-center justify-center rounded-full bg-bg-canvas text-text-secondary"
          >
            <X size={18} />
          </button>
        </div>

        {inSafari ? (
          <ol className="flex flex-col gap-4">
            <Step n={1}>
              Tap the <Glyph><Share size={16} /></Glyph> <b>Share</b> button
              at the bottom of Safari.
            </Step>
            <Step n={2}>
              Scroll down and tap <Glyph><Plus size={16} /></Glyph>{" "}
              <b>Add to Home Screen</b>.
            </Step>
            <Step n={3}>
              Tap <b>Add</b> in the top corner. JOHTA appears on your home
              screen.
            </Step>
          </ol>
        ) : (
          <p className="font-body text-[15px] leading-[22px] text-text-secondary">
            Apple only lets Safari add websites to the home screen. Copy this
            page&rsquo;s address, open Safari, paste it in, then tap Install
            again.
          </p>
        )}

        {/*
          The trap nobody warns you about: links opened from WhatsApp on an
          iPhone open inside WhatsApp's own browser, which looks exactly like
          Safari but has no "Add to Home Screen" in its share menu. It cannot
          be detected from the page, so it is said plainly.
        */}
        <p className="rounded-md bg-bg-canvas px-4 py-3 font-body text-[14px] leading-[20px] text-text-secondary">
          Opened this from WhatsApp? Tap the <b>Safari</b> or compass icon
          first to leave WhatsApp&rsquo;s browser.
          &ldquo;Add to Home Screen&rdquo; only appears in real Safari.
        </p>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-default font-heading text-[14px] font-semibold text-text-on-primary">
        {n}
      </span>
      <span className="pt-0.5 font-body text-[15px] leading-[22px] text-text-secondary">
        {children}
      </span>
    </li>
  );
}

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex translate-y-[3px] items-center text-primary-text">
      {children}
    </span>
  );
}
