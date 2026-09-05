"use client";

import { useState } from "react";
import { AddSaleModal } from "./AddSaleModal";

export function AddSaleButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-11 items-center rounded-[10px] bg-[var(--color-primary)] px-5 font-semibold text-white transition hover:bg-[var(--color-primary-hover)]"
      >
        + Add Sale
      </button>
      {open && <AddSaleModal onClose={() => setOpen(false)} />}
    </>
  );
}
