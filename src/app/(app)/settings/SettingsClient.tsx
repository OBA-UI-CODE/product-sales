"use client";

import { useActionState, useState, useTransition } from "react";
import { KeyRound, X } from "lucide-react";
import {
  addStaffAccount,
  removeStaffAccount,
  resetStaffPassword,
  type AddStaffState,
  type StaffState,
} from "./actions";
import PasswordInput from "@/components/ui/PasswordInput";
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

  /*
    Removal now reports back. It used to be fired into a transition with its
    result thrown away — which is how it went unnoticed that removing anyone
    who had logged a sale failed every single time.
  */
  const [removing, startRemove] = useTransition();
  const [removeResult, setRemoveResult] = useState<StaffState>({});

  /* Which staff row has its password form open, if any. */
  const [resetting, setResetting] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-heading text-[32px] font-semibold">Settings</h1>

      <div className="flex flex-col gap-4">
        <h2 className="font-heading text-xl font-semibold">Staff Accounts</h2>

        {removeResult.error && <Alert tone="error">{removeResult.error}</Alert>}
        {removeResult.success && <Alert tone="good">{removeResult.success}</Alert>}

        <div className="flex flex-col gap-3">
          {staff.map((s) => {
            const isSelf = s.id === currentUserId;
            const canManage = isOwner && !isSelf;

            return (
              <div
                key={s.id}
                className="flex flex-col gap-3 rounded-[14px] bg-[var(--color-bg-surface)] px-4 py-3"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-border-strong)] text-sm">
                      {initials(s.name)}
                    </div>
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate">{s.name}</span>
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {s.role}
                      </span>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        aria-label={`Set a new password for ${s.name}`}
                        title="Set a new password"
                        onClick={() =>
                          setResetting(resetting === s.id ? null : s.id)
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-border-strong)]"
                      >
                        <KeyRound size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${s.name}`}
                        title="Remove from this shop"
                        disabled={removing}
                        onClick={() =>
                          startRemove(async () =>
                            setRemoveResult(await removeStaffAccount(s.id))
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-border-strong)] disabled:opacity-50"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                {resetting === s.id && (
                  <ResetPasswordForm
                    staffId={s.id}
                    name={s.name}
                    onDone={() => setResetting(null)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {isOwner && (
        <div className="flex flex-col gap-4 rounded-[14px] bg-[var(--color-bg-surface)] p-6">
          <h3 className="font-semibold">Add a staff account</h3>
          {state.error && <Alert tone="error">{state.error}</Alert>}
          {state.success && <Alert tone="good">{state.success}</Alert>}
          {/* key resets the fields after a successful add, so the owner is not
              left looking at the previous person's details. */}
          <form
            key={state.success ?? "add-staff"}
            action={formAction}
            className="flex flex-col gap-4"
          >
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
            {/* Toggle via the shared PasswordInput; field styling unchanged. */}
            <PasswordInput
              id="staff-password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="Temporary password"
              className="h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-canvas)] pl-4 pr-12 text-sm"
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

/*
  Setting a staff member's password.

  Staff administer nothing about their own account by design — the owner runs
  the shop, including its logins. This is what makes that practical: without
  it, the only way to change a password was to remove the person and add them
  back, retyping their name and email each time.
*/
function ResetPasswordForm({
  staffId,
  name,
  onDone,
}: {
  staffId: string;
  name: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState<StaffState, FormData>(
    resetStaffPassword,
    {}
  );

  if (state.success) {
    return (
      <div className="flex flex-col gap-3 rounded-[10px] bg-[var(--color-bg-canvas)] p-4">
        <Alert tone="good">{state.success}</Alert>
        <button
          type="button"
          onClick={onDone}
          className="h-10 self-start rounded-[10px] border border-[var(--color-border)] px-4 text-sm font-semibold"
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-[10px] bg-[var(--color-bg-canvas)] p-4"
    >
      <input type="hidden" name="staffId" value={staffId} />
      <p className="text-sm text-[var(--color-text-secondary)]">
        Set a new password for {name}, then tell them what it is. They will be
        signed out of any device they are using now.
      </p>
      {state.error && <Alert tone="error">{state.error}</Alert>}
      <PasswordInput
        id={`reset-${staffId}`}
        name="password"
        required
        autoComplete="new-password"
        placeholder="New password"
        className="h-11 w-full rounded-[10px] border border-[var(--color-border)] bg-[var(--color-bg-surface)] pl-4 pr-12 text-sm"
      />
      <div className="flex flex-col gap-2 tab:flex-row">
        <button
          type="submit"
          disabled={pending}
          className="h-11 shrink-0 rounded-[10px] bg-[var(--color-primary)] px-6 text-sm font-semibold text-white disabled:opacity-50"
        >
          {pending ? "Saving..." : "Set password"}
        </button>
        <button
          type="button"
          onClick={onDone}
          disabled={pending}
          className="h-11 shrink-0 rounded-[10px] border border-[var(--color-border)] px-6 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function Alert({
  tone,
  children,
}: {
  tone: "error" | "good";
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-[10px] px-4 py-3 text-sm ${
        tone === "error"
          ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
          : "bg-primary-subtle text-primary-text"
      }`}
    >
      {children}
    </p>
  );
}
