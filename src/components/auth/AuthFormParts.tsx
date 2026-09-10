"use client";

import { useEffect, useState } from "react";
import PasswordInput from "@/components/ui/PasswordInput";
import Link from "next/link";
import { BRAND, HomeLink } from "@/components/Brand";

/*
  Shared form pieces for Sign In / Sign Up, from the Figma Input (9:22) and
  Button (8:27) components.

    label        Inter 400 16/24, text/primary
    field        h52 (min 48), bg/surface, 1px border/default, r10, px16
    placeholder  Inter 400 16, text/muted
    primary btn  h48, primary/default, r10, DM Sans 600 20/24 -1
    divider      1px border/default rules either side of "or" (Inter 14)
    google btn   bg/surface + 1px border/default, r10, 16px mark
                 label Inter SemiBold 16/24 on tablet+ and Inter Medium on mobile

  The logo is the JOHTA wordmark in Dokdo, 40/48 -1 on mobile stepping to 56
  -1.5 above. Dokdo has a single weight, so the old SemiBold/Bold step is gone.
*/

export function AuthLogo() {
  return (
    <p className="w-full font-brand text-[40px] leading-[48px] tracking-[-1px] text-primary-text tab:text-[56px] tab:leading-none tab:tracking-[-1.5px]">
      <HomeLink>{BRAND}</HomeLink>
    </p>
  );
}

export function Field({
  id,
  label,
  type = "text",
  placeholder,
  autoComplete,
  required = true,
}: {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <label
        htmlFor={id}
        className="w-full font-body text-[16px] font-normal leading-[24px] text-text-primary"
      >
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="h-[52px] min-h-12 w-full rounded-md border border-border-default bg-bg-surface px-4 font-body text-[16px] font-normal text-text-primary placeholder:text-text-muted focus:border-primary-border focus:outline-none"
      />
    </div>
  );
}

/*
  Password field with a show/hide toggle.

  NOT IN FIGMA — there is no eye icon or password-visibility state anywhere in
  the file (checked all 777 node names). This is a designed addition, built to
  sit inside the existing Input spec rather than alter it: the field keeps its
  52px height, 1px border/default and 10px radius, and gains right padding so
  the value never runs under the control.

  The toggle behaviour and icon live in @/components/ui/PasswordInput, which is
  shared with the screens that have no Figma design (/reset-password, Settings)
  and therefore keep their own field styling.
*/
export function PasswordField({
  id,
  label,
  placeholder,
  autoComplete,
}: {
  id: string;
  label: string;
  placeholder: string;
  autoComplete?: string;
}) {
  return (
    <div className="flex w-full flex-col items-start gap-1.5">
      <label
        htmlFor={id}
        className="w-full font-body text-[16px] font-normal leading-[24px] text-text-primary"
      >
        {label}
      </label>

      <PasswordInput
        id={id}
        name={id}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required
        className="h-[52px] min-h-12 w-full rounded-md border border-border-default bg-bg-surface pl-4 pr-12 font-body text-[16px] font-normal text-text-primary placeholder:text-text-muted focus:border-primary-border focus:outline-none"
      />
    </div>
  );
}

export function SubmitButton({
  children,
  pending,
}: {
  children: React.ReactNode;
  pending?: boolean;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 min-h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-6 font-heading text-[20px] font-semibold leading-[24px] tracking-[-1px] text-text-on-primary disabled:opacity-70"
    >
      {children}
    </button>
  );
}

export function OrDivider() {
  return (
    <div className="flex w-full items-center justify-center gap-3 overflow-hidden">
      <div className="h-px min-w-px flex-1 bg-border-default" />
      <p className="whitespace-nowrap font-body text-[14px] font-normal text-text-secondary">
        or
      </p>
      <div className="h-px min-w-px flex-1 bg-border-default" />
    </div>
  );
}

/*
  Apps that open links in their own built-in browser. Google refuses to sign
  anyone in from these ("403: disallowed_useragent") because the app could
  read what is typed into Google's page. Safari, Chrome, and the in-app views
  WhatsApp uses on iPhone and Android (SFSafariViewController, Chrome Custom
  Tabs) are real browsers and are allowed, so they are NOT listed.

  Matched on the user agent, which is the only signal there is. A miss just
  means the old behaviour: Google shows its own error page.
*/
const IN_APP_BROWSERS: [RegExp, string][] = [
  [/Instagram/i, "Instagram"],
  [/FBAN|FBAV|FB_IAB|FBIOS|FB4A/i, "Facebook"],
  [/Messenger/i, "Messenger"],
  [/musical_ly|Bytedance|TikTok/i, "TikTok"],
  [/Snapchat/i, "Snapchat"],
  [/\bLine\//i, "LINE"],
  [/MicroMessenger/i, "WeChat"],
  [/WhatsApp/i, "WhatsApp"],
];

function useInAppBrowser() {
  const [app, setApp] = useState<string | null>(null);
  const [android, setAndroid] = useState(false);
  useEffect(() => {
    const ua = navigator.userAgent;
    setApp(IN_APP_BROWSERS.find(([re]) => re.test(ua))?.[1] ?? null);
    setAndroid(/Android/i.test(ua));
  }, []);
  return { app, android };
}

/*
  In an app's built-in browser, the Google button would only lead to Google's
  error page, so it is replaced by what to do instead. On Android there is a
  one-tap way out: an intent link that opens this same page in Chrome. iPhone
  has no equivalent, so it says where the "open in browser" option lives and
  offers to copy the link. Email sign-in, above this, works everywhere.
*/
function InAppBrowserNotice({ app, android }: { app: string; android: boolean }) {
  const [copied, setCopied] = useState(false);
  const here =
    typeof window === "undefined"
      ? ""
      : window.location.host + window.location.pathname;

  return (
    <div className="flex w-full flex-col gap-3 rounded-md border border-border-default bg-bg-surface p-4">
      <p className="font-body text-[14px] leading-[20px] text-text-secondary">
        Google sign-in doesn&rsquo;t work inside {app}&rsquo;s browser.{" "}
        {android
          ? "Open this page in Chrome to continue with Google."
          : "Tap the … or share menu and choose “Open in browser” (or Safari) to continue with Google."}{" "}
        Your email and password work here as normal.
      </p>
      {android ? (
        <a
          href={`intent://${here}#Intent;scheme=https;package=com.android.chrome;end`}
          className="press flex min-h-12 w-full items-center justify-center rounded-md bg-primary-default px-4 font-body text-[16px] font-semibold text-text-on-primary"
        >
          Open in Chrome
        </a>
      ) : (
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(window.location.href);
              setCopied(true);
            } catch {
              /* Some in-app browsers block the clipboard; the menu route
                 in the text still works. */
            }
          }}
          className="press flex min-h-12 w-full items-center justify-center rounded-md border border-border-default bg-bg-canvas px-4 font-body text-[16px] font-semibold text-text-primary"
        >
          {copied ? "Link copied. Paste it into Safari" : "Copy link"}
        </button>
      )}
    </div>
  );
}

export function GoogleButton({ action }: { action: () => Promise<void> }) {
  const { app, android } = useInAppBrowser();
  if (app) return <InAppBrowserNotice app={app} android={android} />;

  return (
    <form action={action} className="w-full">
      <button
        type="submit"
        className="flex min-h-12 w-full items-center justify-center rounded-md border border-border-default bg-bg-surface py-3"
      >
        <span className="flex items-center gap-2 tab:gap-3">
          <img
            src="/figma/icon-google.svg"
            alt=""
            width={16}
            height={16}
            className="size-4 shrink-0"
          />
          <span className="whitespace-nowrap font-body text-[16px] font-medium leading-[24px] text-text-primary tab:font-semibold">
            Continue with Google
          </span>
        </span>
      </button>
    </form>
  );
}

export function AltActionRow({
  prompt,
  linkLabel,
  href,
}: {
  prompt: string;
  linkLabel: string;
  href: string;
}) {
  return (
    <div className="flex w-full items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap">
      <p className="font-body text-[16px] font-normal leading-[24px] text-text-secondary">
        {prompt}
      </p>
      <Link
        href={href}
        className="font-heading text-[18px] font-semibold leading-[22px] tracking-[-1px] text-primary-text"
      >
        {linkLabel}
      </Link>
    </div>
  );
}

export function FormError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="w-full font-body text-[14px] leading-[20px] text-danger">
      {message}
    </p>
  );
}
