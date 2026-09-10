"use client";

import { useEffect } from "react";
import { reportClientError } from "@/components/ErrorReporter";

/*
  The last resort: the root layout itself crashed, so none of the site's
  styles or fonts can be relied on. Plain inline styles, in the brand colours,
  and its own <html> and <body>, which Next requires here.
*/
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (!error.digest) reportClientError(error.message, error.stack);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif",
          padding: 24,
        }}
      >
        <div style={{ maxWidth: 480 }}>
          <h1 style={{ fontSize: 28, margin: "0 0 12px" }}>Something went wrong</h1>
          <p style={{ color: "#bdbdbd", lineHeight: 1.5, margin: "0 0 24px" }}>
            JOHTA ran into a problem. We have been told about it, and your
            records are safe.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              height: 48,
              padding: "0 24px",
              borderRadius: 10,
              border: 0,
              background: "#158060",
              color: "#fff",
              fontWeight: 600,
              fontSize: 16,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
