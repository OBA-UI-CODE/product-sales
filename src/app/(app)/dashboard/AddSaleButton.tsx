"use client";

import { useState } from "react";
import { AddSaleModal } from "./AddSaleModal";

/*
  Two presentations of the same control, both from the design:

    header  Figma 203:4166 — 160x48 on web, 131x48 on tablet, radius/md,
            primary/default, label Inter SemiBold 16. Not present on the
            mobile frame.

            The width is a MINIMUM, not a fixed size, and the label is
            nowrap: at exactly 131px with 24px padding the label had only
            83px to sit in, so "+ Add Sale" wrapped onto two lines on tablet.
    fab     Figma 212:4899 — a 48px circle on primary/default carrying a 28px
            "+", floating above the bottom bar. Mobile only.

  The FAB's glyph is Roboto Bold in the file, which is not one of the two
  project faces; it is set in the body face here rather than pulling in a
  third font for one character.
*/
export function AddSaleButton({ variant = "header" }: { variant?: "header" | "fab" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {variant === "header" ? (
        <button
          onClick={() => setOpen(true)}
          className="hidden h-12 min-h-12 min-w-[131px] items-center justify-center whitespace-nowrap rounded-md bg-primary-default px-5 font-body text-[16px] font-semibold text-text-on-primary tab:flex web:min-w-[160px] web:px-6"
        >
          + Add Sale
        </button>
      ) : (
        <button
          onClick={() => setOpen(true)}
          aria-label="Add sale"
          className="fixed bottom-[111px] right-[30px] z-40 flex size-12 items-center justify-center overflow-hidden rounded-full bg-primary-default font-body text-[28px] font-bold leading-none text-text-primary tab:hidden"
        >
          +
        </button>
      )}
      {open && <AddSaleModal onClose={() => setOpen(false)} />}
    </>
  );
}
