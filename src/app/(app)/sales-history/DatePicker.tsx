"use client";

import { useRouter } from "next/navigation";

export default function DatePicker({
  defaultValue,
  min,
  max,
}: {
  defaultValue: string;
  /* Free shops cannot pick a day before their 30-day window. */
  min?: string;
  /* No picking days that have not happened yet. */
  max?: string;
}) {
  const router = useRouter();

  return (
    <input
      type="date"
      defaultValue={defaultValue}
      min={min}
      max={max}
      onChange={(e) => router.push(`/sales-history?view=day&date=${e.target.value}`)}
      className="h-11 rounded-md border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-sm"
    />
  );
}
