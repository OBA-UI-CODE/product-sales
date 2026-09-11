"use server";

import { createClient as createAdminClient } from "@supabase/supabase-js";
import { getCurrentShopContext } from "@/lib/shop-context";
import { sendPush } from "@/lib/push";

/*
  The Settings side of the sales reminders: remembering which phones said
  yes, each person's on/off choices, and a test notification.

  Everything a person does to their own devices and settings goes through
  their own signed-in client, so the database's row-level security decides
  (a user can only add, see or remove their own devices). The service role
  is used for exactly two things: freeing a phone that was last used by a
  different login, and reading your own devices to send the test.
*/

export interface ReminderPrefs {
  morning: boolean;
  afternoon: boolean;
  evening: boolean;
}

function admin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export async function saveDevice(device: {
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent: string;
}): Promise<{ error?: string }> {
  const { supabase, user, profile } = await getCurrentShopContext();
  if (!device.endpoint.startsWith("https://")) return { error: "That device could not be registered." };

  /*
    One phone, one owner of its reminders. If this phone was last signed in
    as someone else (a shared shop phone, say), it now belongs to whoever
    turned reminders on, and the previous person stops getting them here.
  */
  await admin().from("push_subscriptions").delete().eq("endpoint", device.endpoint).neq("user_id", user.id);

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      shop_id: profile.shop_id,
      endpoint: device.endpoint,
      p256dh: device.p256dh,
      auth: device.auth,
      user_agent: device.userAgent.slice(0, 300),
    },
    { onConflict: "endpoint" }
  );
  return error ? { error: "Could not turn reminders on. Please try again." } : {};
}

export async function forgetDevice(endpoint: string): Promise<void> {
  const { supabase } = await getCurrentShopContext();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}

export async function saveReminderPrefs(prefs: ReminderPrefs): Promise<{ error?: string }> {
  const { supabase, user } = await getCurrentShopContext();
  const { error } = await supabase.from("notification_prefs").upsert({
    user_id: user.id,
    morning: !!prefs.morning,
    afternoon: !!prefs.afternoon,
    evening: !!prefs.evening,
    updated_at: new Date().toISOString(),
  });
  return error ? { error: "Could not save that. Please try again." } : {};
}

/* Sends a sample to every phone this person has turned reminders on for. */
export async function sendTestReminder(): Promise<{ sent: number; error?: string }> {
  const { user, profile } = await getCurrentShopContext();
  const db = admin();
  const { data: devices } = await db
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", user.id);
  if (!devices?.length) return { sent: 0, error: "Reminders are not on for any of your devices yet." };

  const first = profile.name.trim().split(/\s+/)[0] ?? "";
  let sent = 0;
  for (const d of devices) {
    const result = await sendPush(d, {
      title: `Reminders are on${first ? `, ${first}` : ""}`,
      body: "This is how JOHTA will remind you to log your sales. Tap to open.",
      url: "/dashboard",
      tag: "reminder-test",
    });
    if (result === "sent") sent++;
    if (result === "gone") await db.from("push_subscriptions").delete().eq("id", d.id);
  }
  return sent ? { sent } : { sent, error: "The test could not be delivered. Try turning reminders off and on again." };
}
