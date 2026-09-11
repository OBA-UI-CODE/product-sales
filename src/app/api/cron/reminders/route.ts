import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { reminderMessage, sendPush } from "@/lib/push";

/*
  Sends one of the three daily sales reminders to every phone that asked
  for it. Called by pg_cron in the database (jobs reminder-morning,
  reminder-afternoon, reminder-evening at 08:00, 14:00, 20:00 Lagos) with a
  key that exists only in the database's vault; reminder_token_ok() says
  whether the key presented is the right one.

  Who gets what is decided in the database by reminder_targets(): it skips
  paused shops, removed staff, staff paused on Free, anyone who switched
  that reminder off, and, for the afternoon one, shops that have already
  logged a sale today.

  Devices that have gone (JOHTA uninstalled, notifications blocked) are
  deleted so they are not tried again.
*/

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SLOTS = ["morning", "afternoon", "evening"] as const;
type Slot = (typeof SLOTS)[number];

export async function GET(request: Request) {
  const token = (request.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  const slot = new URL(request.url).searchParams.get("slot") as Slot | null;
  if (!token || !slot || !SLOTS.includes(slot)) {
    return new NextResponse(null, { status: 401 });
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: ok } = await admin.rpc("reminder_token_ok", { p_token: token });
  if (ok !== true) return new NextResponse(null, { status: 401 });

  const { data: targets, error } = await admin.rpc("reminder_targets", { p_slot: slot });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (targets ?? []) as {
    subscription_id: string;
    endpoint: string;
    p256dh: string;
    auth: string;
    first_name: string;
    shop_name: string;
    sales_today: number;
    total_today: number;
  }[];

  let sent = 0;
  let failed = 0;
  const gone: string[] = [];
  const delivered: string[] = [];

  /* Ten at a time: quick for hundreds of phones, gentle on the push
     services. */
  for (let i = 0; i < rows.length; i += 10) {
    await Promise.all(
      rows.slice(i, i + 10).map(async (t) => {
        const result = await sendPush(
          t,
          reminderMessage(slot, {
            firstName: t.first_name,
            shopName: t.shop_name,
            salesToday: Number(t.sales_today),
            totalToday: Number(t.total_today),
          })
        );
        if (result === "sent") {
          sent++;
          delivered.push(t.subscription_id);
        } else if (result === "gone") gone.push(t.subscription_id);
        else failed++;
      })
    );
  }

  if (gone.length) await admin.from("push_subscriptions").delete().in("id", gone);
  if (delivered.length) {
    await admin
      .from("push_subscriptions")
      .update({ last_sent_at: new Date().toISOString() })
      .in("id", delivered);
  }

  return NextResponse.json({ slot, devices: rows.length, sent, failed, removed: gone.length });
}
