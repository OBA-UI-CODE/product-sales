"use client";

import { useState } from "react";
import { Receipt } from "lucide-react";

/*
  Gets the receipt for a sale and hands it to the customer.

  On a phone this opens the system share sheet, so the receipt goes straight
  into a WhatsApp chat, which is how shop owners here actually pass things to
  customers. Where sharing a file is not supported, it falls back to a normal
  download.

  Two details that matter:

  · The image is fetched rather than linked. A plain <a download> would work on
    desktop, but it cannot feed the share sheet, and on iOS it tends to open
    the image in a new tab instead of saving it. Fetching gives us a Blob that
    both paths can use.

  · navigator.share is checked with canShare({ files }) rather than just
    "share" in navigator. Several browsers expose share but refuse files, and
    calling it then throws after the user has already tapped.
*/
export default function ReceiptButton({
  saleId,
  label = "Receipt",
  className = "",
}: {
  saleId: string;
  label?: string;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handle() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/receipt/${saleId}`, { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const blob = await res.blob();
      const file = new File([blob], `receipt-${saleId.slice(0, 8)}.png`, {
        type: "image/png",
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Receipt" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      /* AbortError means the person opened the share sheet and changed their
         mind, which is not a failure and should not be shouted about. */
      if ((e as Error)?.name !== "AbortError") {
        setError("Could not make that receipt. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handle}
        disabled={busy}
        className={`press flex h-11 items-center justify-center gap-2 rounded-[10px] border border-[var(--color-border)] px-4 text-sm font-semibold disabled:opacity-50 ${className}`}
      >
        <Receipt size={16} aria-hidden />
        {busy ? "Preparing..." : label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {error}
        </p>
      )}
    </div>
  );
}
