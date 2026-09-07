"use client";

import { useActionState } from "react";
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

  Same shell as Sign In. Unlike Sign In, this panel's headline is plain
  SemiBold throughout — no highlighted word.

  CONTENT BUG in the file: the bottom row on Sign Up reads "Don't have an
  account? Sign In", which is the Sign In row left unedited. Corrected here to
  "Already have an account?" — flagged for fixing at the source.

  signUpWithEmail is unchanged: it creates only the auth.users row and stashes
  the name in user metadata. The shops/profiles rows are created at the end of
  onboarding, so a signed-up user with no shop is a valid intermediate state.
*/

/*
  Illustration geometry, converted into PANEL coordinates.

  Web (183:1635): the file reports top 270 inside an inset box at top 48, so
  the real top is 318 and the bottom is 862 against an 852 panel — it runs past
  the bottom edge. Its calc(50% + 131.5px) is measured on the 696-wide inset
  box, which re-centres on the 742-wide panel as calc(50% + 156.5px).

  This one also carries an inner CROP: the source is scaled to 152.56% height
  and pulled up by 52.63%, so the visible window is the middle band of a taller
  image. Rendering it with a plain object-cover showed the wrong half.
*/
const PANEL_BOX =
  "absolute top-[100px] left-[calc(50%+102px)] h-[297px] w-[189px] -translate-x-1/2 overflow-hidden rounded-xl " +
  "tab:top-[27px] tab:left-[calc(50%+262.5px)] tab:h-[375px] tab:w-[213px] " +
  "web:top-[318px] web:left-[calc(50%+156.5px)] web:h-[544px] web:w-[433px]";

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
              Start your 1 month free trial. No card required.
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
                src="/figma/auth-panel-signup.webp"
                alt="A beauty and accessories stall stocked with products"
                className="absolute left-0 top-[-52.63%] h-[152.56%] w-full max-w-none object-cover"
              />
            </div>
          }
          headline={<>Open to everyday trades, easy on the budget.</>}
          tagline={
            <>
              <p>
                <span className="font-brand text-primary-text">{BRAND}</span>.
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
