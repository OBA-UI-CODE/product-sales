"use client";

import { useState } from "react";

/*
  Password input with a show/hide toggle.

  NOT IN FIGMA — there is no eye icon or password-visibility state anywhere in
  the design file (checked all 777 node names). Designed to the brand system's
  icon style: outline, ~1.75px stroke, rounded caps, 20px to match the other
  input-scale marks.

  Deliberately style-agnostic: the caller supplies the input's className so each
  screen keeps its own field styling, and only the toggle behaviour and icon are
  shared. Callers must leave right padding (pr-12 or similar) so the value never
  runs under the control.

  Accessibility: a real <button type="button"> so it can never submit the form,
  an aria-label describing the ACTION, aria-pressed for the state, and the icon
  marked aria-hidden. Toggling preserves name/autoComplete so autofill and
  password managers keep working.
*/

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3.25" />
      {off && <path d="M4 20 20 4" />}
    </svg>
  );
}

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  /* Extra classes for the toggle, e.g. to nudge it for a shorter field. */
  toggleClassName?: string;
};

export default function PasswordInput({
  className,
  toggleClassName = "",
  id,
  ...props
}: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative w-full">
      <input
        {...props}
        id={id}
        type={visible ? "text" : "password"}
        className={className}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        aria-controls={id}
        className={`absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-text-muted transition-colors hover:text-text-primary focus:text-text-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-primary-border ${toggleClassName}`}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  );
}
