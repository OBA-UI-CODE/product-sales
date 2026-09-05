"use client";

import { useRouter } from "next/navigation";

export default function DatePicker({ defaultValue }: { defaultValue: string }) {
  const router = useRouter();

  return (
    <input
      type="date"
      defaultValue={defaultValue}
      onChange={(e) => router.push(`/sales-history?date=${e.target.value}`)}
      className="h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] px-4 text-sm"
    />
  );
}
