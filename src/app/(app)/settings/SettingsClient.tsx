"use client";

import { useActionState, useTransition } from "react";
import { X } from "lucide-react";
import { addStaffAccount, removeStaffAccount, type AddStaffState } from "./actions";
import { initials } from "@/lib/format";

interface Staff {
  id: string;
  name: string;
  role: string;
}

const initialState: AddStaffState = {};

export default function SettingsClient({
  staff,
  currentUserId,
  isOwner,
}: {
  staff: Staff[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const [state, formAction, pending] = useActionState(addStaffAccount, initialState);
  const [removing, startTransition] = useTransition();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-[32px] font-semibold">Settings</h1>

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold">Staff Accounts</h2>
        <div className="flex flex-col gap-3">
          {staff.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-border-strong)] text-sm">
                  {initials(s.name)}
                </div>
                <div className="flex flex-col">
                  <span>{s.name}</span>
                  <span className="text-sm text-[var(--color-text-secondary)]">
                    {s.role}
                  </span>
                </div>
              </div>
              {isOwner && s.id !== currentUserId && (
                <button
                  disabled={removing}
                  onClick={() =>
                    startTransition(() => removeStaffAccount(s.id))
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {isOwner && (
        <div className="flex flex-col gap-4 rounded-[14px] bg-[var(--color-bg-surface)] p-6">
          <h3 className="font-semibold">Add a staff account</h3>
          {state.error && (
            <p className="rounded-[10px] bg-[var(--color-danger-bg)] px-4 py-3 text-sm text-[var(--color-danger)]">
              {state.error}
            </p>
          )}
          <form action={formAction} className="flex flex-col gap-4">
            <input
              name="name"
              required
              placeholder="e.g. Amaka Obi"
              className="h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="Email"
              className="h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
            />
            <input
              name="password"
              type="password"
              required
              placeholder="Temporary password"
              className="h-11 rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] px-4 text-sm"
            />
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-[10px] bg-[var(--color-primary)] font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Adding..." : "Add staff account"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
