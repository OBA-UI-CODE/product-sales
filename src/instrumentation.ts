/*
  Next calls onRequestError for every error thrown while rendering a page,
  running a server action or handling a route, so this is the one place that
  sees every server crash. Each is recorded (see lib/error-report.ts).

  Loaded lazily and only in the Node runtime, where node:crypto exists; Next
  also evaluates this file for the edge runtime.
*/
export async function onRequestError(
  error: unknown,
  request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  context: { routePath?: string; routeType?: string }
) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const err = error as Error & { digest?: string };
  const { recordError } = await import("@/lib/error-report");
  const ua = request.headers["user-agent"];

  await recordError({
    source: "server",
    message: err?.message || String(error),
    stack: err?.stack,
    digest: err?.digest,
    path: `${request.method} ${request.path}${context.routeType ? ` (${context.routeType})` : ""}`,
    userAgent: Array.isArray(ua) ? ua[0] : ua,
  });
}
