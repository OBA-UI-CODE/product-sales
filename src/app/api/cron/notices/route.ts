import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendNotice, type NoticeKind } from "@/lib/notices";
import { SUPPORT_EMAIL } from "@/lib/site";

/*
  The daily account-email job. Vercel Cron calls it at 07:00 UTC (08:00 in
  Lagos), see vercel.json, with "Authorization: Bearer <CRON_SECRET>"; any
  other caller is turned away.

  For each shop still in its free month:
    · three days or less left      -> "3 days left" (trial_ending_3d)
    · otherwise, from Monday 14 September 2026, shops that existed before
      then get the one-off announcement of the Free and Paid plans
      (plans_announcement). Shops that sign up later saw the plans on the
      pricing page, so they only get the reminder.

  Each shop gets each email once. A row in shop_notices is claimed BEFORE
  sending (the primary key refuses a second claim) and released if the send
  fails, so a retry or a double run cannot email anyone twice, and a failure
  is tried again the next day.

  Two ways to check it without emailing any shop, both with the secret:
    ?dry=1   says who would get what today, sends nothing
             (&asOf=<ISO date> asks the same question for another day)
    ?test=1  sends both emails, with sample details, to the support inbox
*/

export const dynamic = "force-dynamic";

const ANNOUNCE_FROM = new Date("2026-09-14T07:00:00Z");
const THREE_DAYS = 3 * 86_400_000;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse(null, { status: 401 });
  }

  const url = new URL(request.url);

  if (url.searchParams.get("test") === "1") {
    const sample = { shopName: "Vic wears", firstName: "Victoria", trialEndsAt: "2026-10-08T12:00:00Z" };
    const results = await Promise.all(
      (["plans_announcement", "trial_ending_3d"] as NoticeKind[]).map(async (kind) => ({
        kind,
        ...(await sendNotice(kind, sample, SUPPORT_EMAIL)),
      }))
    );
    return NextResponse.json({ test: true, to: SUPPORT_EMAIL, results });
  }

  const dry = url.searchParams.get("dry") === "1";
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const asOf = dry ? url.searchParams.get("asOf") : null;
  const now = asOf && !Number.isNaN(Date.parse(asOf)) ? new Date(asOf) : new Date();
  const { data: shops, error } = await admin
    .from("shops")
    .select("id, name, owner_id, created_at, trial_ends_at")
    .eq("subscription_status", "trialing")
    .gt("trial_ends_at", now.toISOString())
    .is("deactivated_at", null)
    .is("deletion_requested_at", null);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const ids = (shops ?? []).map((s) => s.id);
  const { data: already } = ids.length
    ? await admin.from("shop_notices").select("shop_id, kind").in("shop_id", ids)
    : { data: [] };
  const sentBefore = new Set((already ?? []).map((n) => `${n.shop_id}:${n.kind}`));

  const planned: { shop: string; kind: NoticeKind; trialEnds: string }[] = [];
  const sent: typeof planned = [];
  const failed: { shop: string; kind: NoticeKind; error: string }[] = [];

  for (const shop of shops ?? []) {
    if (!shop.owner_id || !shop.trial_ends_at) continue;
    const left = new Date(shop.trial_ends_at).getTime() - now.getTime();

    let kind: NoticeKind | null = null;
    if (left <= THREE_DAYS) {
      if (!sentBefore.has(`${shop.id}:trial_ending_3d`)) kind = "trial_ending_3d";
    } else if (
      now >= ANNOUNCE_FROM &&
      new Date(shop.created_at) < ANNOUNCE_FROM &&
      !sentBefore.has(`${shop.id}:plans_announcement`)
    ) {
      kind = "plans_announcement";
    }
    if (!kind) continue;

    const entry = { shop: shop.name, kind, trialEnds: shop.trial_ends_at };
    planned.push(entry);
    if (dry) continue;

    /* Claim first. A conflict means another run already has it. */
    const { error: claimError } = await admin
      .from("shop_notices")
      .insert({ shop_id: shop.id, kind });
    if (claimError) continue;
    /* The reminder covers everything the announcement says, so an owner who
       gets the reminder first never gets the announcement after it. */
    if (kind === "trial_ending_3d") {
      await admin.from("shop_notices").upsert(
        { shop_id: shop.id, kind: "plans_announcement" },
        { onConflict: "shop_id,kind", ignoreDuplicates: true }
      );
    }

    const release = () =>
      admin.from("shop_notices").delete().eq("shop_id", shop.id).eq("kind", kind);

    const [{ data: owner }, { data: profile }] = await Promise.all([
      admin.auth.admin.getUserById(shop.owner_id),
      admin.from("profiles").select("name").eq("id", shop.owner_id).maybeSingle(),
    ]);
    const email = owner?.user?.email;
    if (!email || email.endsWith(".invalid")) {
      await release();
      failed.push({ shop: shop.name, kind, error: "owner has no usable email" });
      continue;
    }

    const result = await sendNotice(
      kind,
      {
        shopName: shop.name,
        firstName: (profile?.name ?? "").trim().split(/\s+/)[0] ?? "",
        trialEndsAt: shop.trial_ends_at,
      },
      email
    );
    if (result.ok) sent.push(entry);
    else {
      await release();
      failed.push({ shop: shop.name, kind, error: result.error ?? "send failed" });
    }
  }

  return NextResponse.json({
    ranAt: now.toISOString(),
    dry,
    shopsInTrial: shops?.length ?? 0,
    ...(dry ? { wouldSend: planned } : { sent, failed }),
  });
}
