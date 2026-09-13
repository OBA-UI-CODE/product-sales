"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { signUpWithEmail, signInWithGoogle, type SignupFormState } from "./actions";
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
  Sign Up — Figma 183:1640 (web) / 183:1535 (tablet) / 183:1568 (mobile)

  Same shell as Sign In. The panel headline highlights "trades" in
  #eb6767 (a raw colour in the file, not a token), SemiBold like the rest.

  CONTENT BUG in the file: the bottom row on Sign Up reads "Don't have an
  account? Sign In", which is the Sign In row left unedited. Corrected here to
  "Already have an account?" — flagged for fixing at the source.

  signUpWithEmail is unchanged: it creates only the auth.users row and stashes
  the name in user metadata. The shops/profiles rows are created at the end of
  onboarding, so a signed-up user with no shop is a valid intermediate state.
*/

/*
  Illustration geometry (the shop-front image added 13 Sept), in PANEL
  coordinates. One 1416x1111 source, drawn uncropped at every size and
  running off the panel's right edge (and on web, down to its bottom):

    mobile  456:8619  356x279 at left 155, top 118   (393 panel)
    tablet  456:8615  453x355 at left 387, top 0     (738 panel)
    web     456:8612  722x567 at left 232, top 285   (742x852 panel)

  Mobile is pinned by its left edge, so on narrower phones the shop crops on
  the right instead of sliding under the tagline. Tablet is pinned by its
  right edge (-102 = 387 + 453 - 738), because that panel is full width and
  only grows past the file's 738.
*/
const PANEL_BOX =
  "absolute left-[155px] top-[118px] h-[279px] w-[356px] " +
  "tab:left-auto tab:right-[-102px] tab:top-0 tab:h-[355px] tab:w-[453px] " +
  "web:left-[232px] web:right-auto web:top-[285px] web:h-[567px] web:w-[722px]";

/*
  Why a "Continue with Google" from this page came back. Sign In has had
  these all along; here a failed attempt used to reload the form with no
  word of explanation. Behind Suspense because useSearchParams would otherwise
  opt the whole route into client rendering.
*/
const GOOGLE_ERRORS: Record<string, string> = {
  google_oauth_failed:
    "Google sign-up didn't complete. Try again, or sign up with your email.",
  google_unavailable:
    "Google sign-up isn't available right now. Please sign up with your email.",
};

function GoogleNotice() {
  const message = GOOGLE_ERRORS[useSearchParams().get("error") ?? ""];
  return message ? <FormError message={message} /> : null;
}

export default function SignupPage() {
  const [state, formAction, pending] = useActionState<SignupFormState, FormData>(
    signUpWithEmail,
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
              Create your account
            </p>
            <p className="font-body text-[16px] font-normal leading-[24px] text-text-secondary tab:whitespace-nowrap tab:font-heading tab:text-[18px] tab:font-semibold tab:leading-[22px] tab:tracking-[-1px]">
              Start your one month free trial. No card required.
            </p>

            <Field
              id="fullName"
              label="Full Name"
              placeholder="e.g adaobi doe"
              autoComplete="name"
            />
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
              autoComplete="new-password"
            />

            <FormError message={state.error} />
            <SubmitButton pending={pending}>Create Account</SubmitButton>
          </form>

          <div className="flex w-full flex-col items-start gap-6">
            <OrDivider />
            <Suspense>
              <GoogleNotice />
            </Suspense>
            <GoogleButton action={signInWithGoogle} />
            <AltActionRow
              prompt="Already have an account?"
              linkLabel="Sign In"
              href="/login"
            />
          </div>
        </>
      }
      panel={
        <AuthPanel
          /* 331 here, not Sign In's 408 — hardcoding Sign In's value pushed
             this tagline past the bottom of the panel. */
          webTaglineGap="web:gap-[331px]"
          image={
            <div className={PANEL_BOX}>
              <img
                src="/figma/auth-panel-signup-shop.webp"
                alt="A small shop front with an awning, stocked with hair, food, clothes, shoes and toys"
                className="absolute inset-0 size-full max-w-none object-cover"
              />
            </div>
          }
          headline={
            <>
              Open to everyday <span className="text-[#eb6767]">trades</span>,
              easy on the budget.
            </>
          }
          tagline={
            <>
              {/* The wordmark is a size up from the lines under it
                  (24/32/40 against 18/24/32). The full stop is green only on
                  the web frame; tablet and mobile draw it white. */}
              <p>
                <span className="font-brand text-[24px] text-primary-text tab:text-[32px] web:text-[40px]">
                  {BRAND}
                </span>
                <span className="web:text-primary-text">.</span>
              </p>
              <p>Simple &amp;</p>
              <p>Transparent.</p>
            </>
          }
        />
      }
    />
  );
}
