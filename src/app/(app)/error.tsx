"use client";

import ErrorScreen from "@/components/ErrorScreen";

/* A crash inside the signed-in app. The sidebar and nav stay, so only the
   page itself is replaced. */
export default function AppError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ErrorScreen {...props} inApp />;
}
