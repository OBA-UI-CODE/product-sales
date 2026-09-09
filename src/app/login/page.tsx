"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { signInWithEmail, signInWithGoogle, type LoginFormState } from "./actions";
import AuthShell, { AuthPanel } from "@/components/auth/AuthShell";
import { BRAND } from "@/components/Brand";
import {
  AltActionRow,
  AuthLogo,
  Field,
  FormError,
  GoogleButton,
  OrDivider,
  PasswordField,
  SubmitButton,
} from "@/components/auth/AuthFormParts";

/*
  Notices carried in the query string — an expired confirmation link, a
  password reset that went through, a failed Google sign-in. Without these the
  user clicks a dead link and lands on a blank sign-in form with no idea why.

  In its own component behind Suspense because useSearchParams opts the whole
  route into client rendering otherwise.
*/
const NOTICES: Record<string, { text: string; tone: "error" | "good" }> = {
  link_expired: {
    text: "That confirmation link has expired or was already used. Sign in below, or sign up again to get a new link.",
    tone: "error",
  },
  invalid_link: {
    text: "That link didn't look right. Try opening it again from your email, or sign up for a new one.",
    tone: "error",
  },
  auth_callback_failed: {
    text: "We couldn't finish signing you in. Please try again.",
    tone: "error",
  },
  google_oauth_failed: {
    text: "Google sign-in didn't complete. Try again, or use your email and password.",
    tone: "error",
  },
};

/*
  Notices for things that went RIGHT but end with the user signed out, so
  there is nowhere else to tell them. Kept separate from NOTICES because they
  arrive as ?notice= rather than ?error= — pausing your own shop is not an
  error, and should not be shown in red.
*/
const SIGNED_OUT_NOTICES: Record<string, string> = {
  paused:
    "Your shop is paused and your subscription has stopped. Sign in whenever you want to open it again. Nothing has been deleted.",
  deletion_scheduled:
    "Your shop is scheduled for deletion and your subscription has stopped. If you change your mind, sign in within 30 days and everything comes back.",
  account_deleted: "Your account has been deleted.",
};

function LoginNotice() {
  const params = useSearchParams();

  if (params.get("reset") === "success") {
    return (
      <p
        role="status"
        className="w-full rounded-md bg-primary-subtle px-4 py-3 font-body text-[14px] leading-[20px] text-primary-text"
      >
        Your password has been changed. Sign in with it below.
      </p>
    );
  }

  const signedOut = SIGNED_OUT_NOTICES[params.get("notice") ?? ""];
  if (signedOut) {
    return (
      <p
        role="status"
        className="w-full rounded-md bg-primary-subtle px-4 py-3 font-body text-[14px] leading-[20px] text-primary-text"
      >
        {signedOut}
      </p>
    );
  }

  const notice = NOTICES[params.get("error") ?? ""];
  if (!notice) return null;

  return (
    <p
      role="alert"
      className={`w-full rounded-md px-4 py-3 font-body text-[14px] leading-[20px] ${
        notice.tone === "error"
          ? "bg-danger-bg text-danger"
          : "bg-primary-subtle text-primary-text"
      }`}
    >
      {notice.text}
    </p>
  );
}

/*
  Sign In — Figma 180:10177 (web) / 180:10139 (tablet) / 180:10140 (mobile)

  Marketing panel: "oversight" is DM Sans REGULAR in green/100 inside an
  otherwise SemiBold headline — a deliberate weight change mid-sentence.

  Server actions (signInWithEmail / signInWithGoogle) are unchanged; only the
  visual layer was rebuilt. signInWithEmail keeps its deliberately vague error
  so the form cannot be used to discover whether an email is registered.
*/

/*
  Illustration geometry, converted into PANEL coordinates.

  Mobile  (180:10190) top 100, h297 — bottom 397 = the panel height exactly.
  Tablet  (180:10172) top  27, h375 — bottom 402 against a 356 panel, clipped.
  Web     (180:10125) the file reports top 137 inside an inset box at top 48,
          so the real top is 185 and the bottom is 862 against an 852 panel —
          it runs past the bottom edge. Horizontally the file's
          calc(50% + 153.5px) is measured on the 692-wide inset box; re-centred
          on the 742-wide panel that becomes calc(50% + 176.5px).
*/
const PANEL_IMAGE =
  "absolute top-[100px] left-[calc(50%+102px)] h-[297px] w-[189px] -translate-x-1/2 rounded-xl object-cover " +
  "tab:top-[27px] tab:left-[calc(50%+262.5px)] tab:h-[375px] tab:w-[213px] " +
  "web:top-[185px] web:left-[calc(50%+176.5px)] web:h-[677px] web:w-[385px]";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState<LoginFormState, FormData>(
    signInWithEmail,
    {}
  );

  return (
    <AuthShell
      form={
        <>
          <AuthLogo />
          <form
            action={formAction}
            className="flex w-full flex-col items-start gap-6 overflow-hidden"
          >
            <p className="whitespace-nowrap font-heading text-[32px] font-semibold leading-[39px] tracking-[-1px] text-text-primary tab:text-[40px] tab:leading-[48px]">
              Welcome back
            </p>
            <p className="whitespace-nowrap font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:font-heading tab:text-[18px] tab:font-semibold tab:leading-[22px] tab:tracking-[-1px]">
              Sign in to your JOHTA dashboard
            </p>

            <Field
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
            />
            <PasswordField
              id="password"
              label="Password"
              placeholder="••••••••"
              autoComplete="current-password"
            />

            <div className="flex w-full items-start justify-end overflow-hidden">
              <Link
                href="/forgot-password"
                className="whitespace-nowrap font-body text-[16px] font-normal leading-[24px] text-primary-text"
              >
                Forgot password?
              </Link>
            </div>

            <Suspense fallback={null}>
              <LoginNotice />
            </Suspense>
            <FormError message={state.error} />
            <SubmitButton pending={pending}>Sign In</SubmitButton>
          </form>

          <div className="flex w-full flex-col items-start gap-6">
            <OrDivider />
            <GoogleButton action={signInWithGoogle} />
            <AltActionRow
              prompt="Don't have an account?"
              linkLabel="Sign up"
              href="/signup"
            />
          </div>
        </>
      }
      panel={
        <AuthPanel
          webTaglineGap="web:gap-[408px]"
          image={
            <img
              src="/figma/auth-panel-signin.webp"
              alt="A shop owner holding a sign reading Sales"
              className={PANEL_IMAGE}
            />
          }
          /*
            The headline breaks differently per breakpoint in the file:
              web            "Monitor all sales," / "leaving no space" / "for oversight."
              tablet/mobile  "Monitor all sales," / "leaving no space for" / "oversight."
            Getting this wrong pushed the headline to four lines, which in turn
            shoved the tagline out of the panel's fixed height.
          */
          headline={
            <>
              Monitor all sales,
              <br />
              leaving no space{" "}
              <br className="hidden web:inline" />
              for{" "}
              <br className="web:hidden" />
              <span className="font-normal text-green-100">oversight</span>.
            </>
          }
          tagline={
            <>
              <p>
                <span className="font-brand text-primary-text">{BRAND}</span>.
              </p>
              <p>Every Sale.</p>
              <p>Accounted For.</p>
            </>
          }
        />
      }
    />
  );
}
