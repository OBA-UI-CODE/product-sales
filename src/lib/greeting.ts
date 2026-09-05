/**
 * Reko's target users are Nigerian shop owners, so "today" and the
 * time-of-day greeting are computed against Africa/Lagos time — same
 * convention already used for "today" boundaries elsewhere in the app —
 * rather than the server's or visitor's local time.
 */
export function getGreetingHeadline(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Africa/Lagos",
    }).format(new Date())
  );

  if (hour >= 5 && hour < 12) {
    return "How Market Today.";
  }
  if (hour >= 12 && hour < 18) {
    return "Shey Sales Dey Alright?";
  }
  return "How Much We Make Today?";
}

export function getGreetingPrefix(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Africa/Lagos",
    }).format(new Date())
  );

  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 18) return "Good Afternoon";
  return "Good Evening";
}
