import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { SITE_URL } from "@/lib/site";

/*
  Delivery receipt from a phone: JOHTA's service worker (public/sw.js) posts
  here each time a push actually reaches the device, with that device's
  push endpoint. It turns "the push service accepted it" into "the phone
  got it", which is what tells an offline or battery-restricted phone apart
  from one that received the reminder but did not show it.

  Only this site's own pages and service worker may post; the endpoint is a
  long unguessable URL the device already holds, and all this can do is
  stamp a time on that device's row.
*/

export const dynamic = "force-dynamic";

const ALLOWED = new Set([SITE_URL, "http://localhost:3000"]);

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && !ALLOWED.has(origin)) return new NextResponse(null, { status: 403 });

  let body: { endpoint?: unknown; tag?: unknown };
  try {
    body = JSON.parse((await request.text()).slice(0, 2000));
  } catch {
    return new NextResponse(null, { status: 400 });
  }
  const endpoint = typeof body.endpoint === "string" ? body.endpoint : "";
  if (!endpoint.startsWith("https://")) return new NextResponse(null, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "service unavailable" }, { status: 503 });
  }
  const admin = createClient(
    url,
    key,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const { error } = await admin
    .from("push_subscriptions")
    .update({
      last_received_at: new Date().toISOString(),
      last_received_tag: typeof body.tag === "string" ? body.tag.slice(0, 60) : null,
    })
    .eq("endpoint", endpoint);

  if (error) {
    return NextResponse.json({ error: "could not record receipt" }, { status: 503 });
  }

  return new NextResponse(null, { status: 204 });
}
