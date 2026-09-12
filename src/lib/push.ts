import webpush from "web-push";
import { SUPPORT_EMAIL } from "@/lib/site";
import { formatNaira } from "@/lib/format";

/*
  Sending phone notifications (Web Push), server-side only.

  The VAPID key pair proves to Google's, Apple's and Mozilla's push services
  that a notification really comes from JOHTA. The public half is in
  NEXT_PUBLIC_VAPID_PUBLIC_KEY (the browser needs it to subscribe); the
  private half, VAPID_PRIVATE_KEY, lives only in Vercel and .env.local.
*/

let configured = false;
function configure(): boolean {
  if (configured) return true;
  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) return false;
  webpush.setVapidDetails(`mailto:${SUPPORT_EMAIL}`, pub, priv);
  configured = true;
  return true;
}

export interface PushTarget {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface PushMessage {
  title: string;
  body: string;
  url: string;
  tag: string;
}

export type PushResult = "sent" | "gone" | "failed";

/*
  "gone" means the phone has uninstalled JOHTA, cleared its data or turned
  notifications off: the push service answers 404 or 410, and that device
  should be forgotten so it is not tried again every day.
*/
export async function sendPush(target: PushTarget, message: PushMessage): Promise<PushResult> {
  if (!configure()) return "failed";
  try {
    await webpush.sendNotification(
      { endpoint: target.endpoint, keys: { p256dh: target.p256dh, auth: target.auth } },
      JSON.stringify(message),
      /*
        urgency "high": Android holds "normal" pushes while the phone is idle
        (Doze, battery saver), sometimes for hours, so the 8am and 2pm
        reminders of 12 September 2026 were accepted by Google's push service
        but never shown on the owner's idle phone, while tests sent with
        the phone in hand arrived at once. A reminder is only useful on time.
        TTL: one that arrives four hours late is worse than none.
      */
      { TTL: 4 * 3600, urgency: "high" }
    );
    return "sent";
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    return status === 404 || status === 410 ? "gone" : "failed";
  }
}

/* The three reminders' wording. No em dashes, by house style. */
export function reminderMessage(
  slot: "morning" | "afternoon" | "evening",
  who: { firstName: string; shopName: string; salesToday: number; totalToday: number }
): PushMessage {
  const name = who.firstName ? `, ${who.firstName}` : "";
  if (slot === "morning") {
    return {
      title: `Good morning${name}`,
      body: `Ready to log today's sales at ${who.shopName}? Tap to open JOHTA.`,
      url: "/dashboard",
      tag: "reminder-morning",
    };
  }
  if (slot === "afternoon") {
    return {
      title: "No sales logged yet today",
      body: `Don't forget to record today's sales at ${who.shopName}.`,
      url: "/dashboard",
      tag: "reminder-afternoon",
    };
  }
  if (who.salesToday > 0) {
    return {
      title: `Today at ${who.shopName}: ${formatNaira(who.totalToday)}`,
      body: `From ${who.salesToday} ${who.salesToday === 1 ? "sale" : "sales"}. Tap to see the day.`,
      url: "/sales-history",
      tag: "reminder-evening",
    };
  }
  return {
    title: "No sales logged today",
    body: `Did you sell anything at ${who.shopName} today? Log it before you close.`,
    url: "/dashboard",
    tag: "reminder-evening",
  };
}
