"use client";

import ErrorScreen from "@/components/ErrorScreen";

/* A crash on the website, sign-in or onboarding. */
export default function RootError(props: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-bg-canvas">
      <ErrorScreen {...props} inApp={false} />
    </main>
  );
}
