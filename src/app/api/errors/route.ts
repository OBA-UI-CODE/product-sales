import { NextResponse } from "next/server";
import { recordError } from "@/lib/error-report";
import { SITE_URL } from "@/lib/site";

/*
  Where browsers report crashes that happen on someone's phone, which the
  server otherwise never hears about (see components/ErrorReporter.tsx and
  the error pages).

  Open to anyone, since crashes happen signed out too, so it is kept narrow:
  only this site's own pages may post (Origin check), the body is capped, and
  lib/error-report.ts caps how many events and emails an hour can produce.
*/

export const dynamic = "force-dynamic";

const ALLOWED_ORIGINS = new Set([SITE_URL, "http://localhost:3000"]);
const MAX_BODY = 8_000;

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) return new NextResponse(null, { status: 413 });

  let body: { message?: unknown; stack?: unknown; digest?: unknown; path?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const str = (v: unknown) => (typeof v === "string" ? v : null);
  const message = str(body.message);
  if (!message) return new NextResponse(null, { status: 400 });

  await recordError({
    source: "client",
    message,
    stack: str(body.stack),
    digest: str(body.digest),
    path: str(body.path),
    userAgent: request.headers.get("user-agent"),
  });

  return new NextResponse(null, { status: 204 });
}
