/**
 * JOHTA's target users are Nigerian shop owners, so "today" and the
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

/*
  How wide each headline is, in ems of the heading face (DM Sans SemiBold, no
  letter-spacing), measured in the browser. The dashboard uses it to shrink a
  line just enough to fit a phone on one line.

  Measured at 22px, the smallest size a line reaches (the evening line on a
  320px phone). DM Sans is a variable font with an optical-size axis: it draws
  slightly WIDER letters at small sizes, so an em width taken at 40px or 100px
  under-estimates the width at 28px by around 5% and the line ran past the
  edge. Using the widest measurement means a line can stop a pixel or two
  short of the edge, never over it. If a headline changes, measure it again;
  a missing entry falls back to the widest.
*/
export const HEADLINE_EM: Record<string, number> = {
  "How Market Today.": 8.9716,
  "Shey Sales Dey Alright?": 11.2095,
  "How Much We Make Today?": 13.2464,
};

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
