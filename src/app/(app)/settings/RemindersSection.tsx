"use client";

import { useEffect, useState, useTransition } from "react";
import { Bell, BellOff } from "lucide-react";
import {
  forgetDevice,
  saveDevice,
  saveReminderPrefs,
  sendTestReminder,
  type ReminderPrefs,
} from "./reminder-actions";

/*
  Sales reminders on this phone: turning them on, choosing which of the
  three, a test, and turning them off. Owners and staff alike; free on
  every plan.

  What a phone can do decides what is shown:
    · iPhone in Safari (not installed): Apple only allows notifications
      from JOHTA once it is on the home screen, so it says that.
    · no notification support at all (in-app browsers, old phones): says so.
    · notifications blocked for JOHTA: says where to unblock them, since a
      site cannot ask again once refused.
  Not in Figma; follows the other Settings cards.
*/

type State = "loading" | "on" | "off" | "denied" | "ios-install" | "unsupported";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

/* The push services want the public key as raw bytes, not the base64url
   text it is stored as. */
function keyBytes(base64url: string): Uint8Array<ArrayBuffer> {
  const padded = (base64url + "=".repeat((4 - (base64url.length % 4)) % 4))
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

function isIos() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}
function isStandalone() {
  return (
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia?.("(display-mode: standalone)").matches === true
  );
}

function deviceOf(sub: PushSubscription) {
  const json = sub.toJSON() as { endpoint: string; keys?: { p256dh?: string; auth?: string } };
  return {
    endpoint: json.endpoint,
    p256dh: json.keys?.p256dh ?? "",
    auth: json.keys?.auth ?? "",
    userAgent: navigator.userAgent,
  };
}

const SLOTS: { key: keyof ReminderPrefs; label: string; detail: string }[] = [
  { key: "morning", label: "Morning, 8am", detail: "A good-morning nudge to log the day's sales" },
  { key: "afternoon", label: "Afternoon, 2pm", detail: "Only if nothing has been logged yet today" },
  { key: "evening", label: "Evening, 8pm", detail: "Today's total, or a nudge if nothing was logged" },
];

export default function RemindersSection({ initialPrefs }: { initialPrefs: ReminderPrefs }) {
  const [state, setState] = useState<State>("loading");
  const [prefs, setPrefs] = useState(initialPrefs);
  const [message, setMessage] = useState<{ tone: "good" | "error"; text: string } | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    (async () => {
      const supported =
        "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
      if (!supported) {
        setState(isIos() && !isStandalone() ? "ios-install" : "unsupported");
        return;
      }
      if (Notification.permission === "denied") return setState("denied");
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub && Notification.permission === "granted") {
        /*
          The phone says reminders are on, but the server may not know it
          for THIS login: a shared shop phone last used by someone else, or
          a device the server dropped. Saving it again on every visit keeps
          the two in step, so "on" here always means reminders will arrive.
        */
        await saveDevice(deviceOf(sub));
        setState("on");
      } else {
        setState("off");
      }
    })().catch(() => setState("unsupported"));
  }, []);

  function turnOn() {
    setMessage(null);
    start(async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setState(permission === "denied" ? "denied" : "off");
          return;
        }
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: keyBytes(VAPID_PUBLIC_KEY),
          }));
        const result = await saveDevice(deviceOf(sub));
        if (result.error) {
          setMessage({ tone: "error", text: result.error });
          return;
        }
        setState("on");
        setMessage({ tone: "good", text: "Reminders are on for this phone." });
      } catch {
        setMessage({ tone: "error", text: "Could not turn reminders on here. Please try again." });
      }
    });
  }

  function turnOff() {
    setMessage(null);
    start(async () => {
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await forgetDevice(sub.endpoint);
        await sub.unsubscribe();
      }
      setState("off");
      setMessage({ tone: "good", text: "Reminders are off for this phone." });
    });
  }

  function toggle(key: keyof ReminderPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    start(async () => {
      const result = await saveReminderPrefs(next);
      if (result.error) {
        setPrefs(prefs);
        setMessage({ tone: "error", text: result.error });
      }
    });
  }

  function test() {
    setMessage(null);
    start(async () => {
      const result = await sendTestReminder();
      setMessage(
        result.error
          ? { tone: "error", text: result.error }
          : { tone: "good", text: "Test sent. It should appear on your phone in a few seconds." }
      );
    });
  }

  if (state === "loading") return null;

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-heading text-xl font-semibold">Reminders</h2>

      <div className="flex flex-col gap-4 rounded-md bg-[var(--color-bg-surface)] p-5 tab:p-6">
        <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">
          A notification on this phone to help you remember to log sales,
          even when JOHTA is closed.
        </p>

        {message && (
          <p
            role={message.tone === "error" ? "alert" : "status"}
            className={`rounded-md px-4 py-3 text-sm ${
              message.tone === "error"
                ? "bg-[var(--color-danger-bg)] text-[var(--color-danger)]"
                : "bg-primary-subtle text-primary-text"
            }`}
          >
            {message.text}
          </p>
        )}

        {state === "ios-install" && (
          <p className="rounded-md bg-[var(--color-bg-canvas)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            On iPhone, reminders work once JOHTA is on your home screen. Install
            it (the Install the app section below shows how), open JOHTA from
            the home screen, then come back here.
          </p>
        )}

        {state === "unsupported" && (
          <p className="rounded-md bg-[var(--color-bg-canvas)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            This browser cannot show reminders. Open johta.click in Chrome (or
            Safari on iPhone, from the home screen) to turn them on.
          </p>
        )}

        {state === "denied" && (
          <p className="rounded-md bg-[var(--color-bg-canvas)] px-4 py-3 text-sm text-[var(--color-text-secondary)]">
            Notifications are blocked for JOHTA on this phone. Allow them in
            your phone&rsquo;s settings for johta.click (in Chrome: tap the
            icon beside the address, then Permissions), then come back here.
          </p>
        )}

        {state === "off" && (
          <button
            type="button"
            onClick={turnOn}
            disabled={pending}
            className="press flex h-11 items-center justify-center gap-2 rounded-md bg-[var(--color-primary)] px-6 font-semibold text-white disabled:opacity-50 tab:self-start"
          >
            <Bell size={16} aria-hidden />
            {pending ? "Turning on..." : "Turn on reminders"}
          </button>
        )}

        {state === "on" && (
          <>
            <div className="flex flex-col divide-y divide-[var(--color-border)] rounded-md border border-[var(--color-border)]">
              {SLOTS.map((s) => (
                <label key={s.key} className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3">
                  <span className="flex min-w-0 flex-col">
                    <span className="font-semibold">{s.label}</span>
                    <span className="text-sm text-[var(--color-text-secondary)]">{s.detail}</span>
                  </span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={prefs[s.key]}
                    onChange={() => toggle(s.key)}
                    className="size-5 shrink-0 accent-[var(--color-primary)]"
                  />
                </label>
              ))}
            </div>
            <div className="flex flex-col gap-3 tab:flex-row">
              <button
                type="button"
                onClick={test}
                disabled={pending}
                className="press flex h-11 items-center justify-center gap-2 rounded-md border border-[var(--color-border)] px-6 text-sm font-semibold disabled:opacity-50"
              >
                <Bell size={16} aria-hidden />
                Send a test notification
              </button>
              <button
                type="button"
                onClick={turnOff}
                disabled={pending}
                className="press flex h-11 items-center justify-center gap-2 rounded-md px-6 text-sm font-semibold text-[var(--color-text-secondary)] disabled:opacity-50"
              >
                <BellOff size={16} aria-hidden />
                Turn off on this phone
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
