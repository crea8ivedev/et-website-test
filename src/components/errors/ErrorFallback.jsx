"use client";

import { useEffect } from "react";

export default function ErrorFallback({ scope, error, reset, message }) {
  useEffect(() => {
    const payload = {
      scope,
      message: error?.message || null,
      digest: error?.digest || null,
      stack: error?.stack || null,
      name: error?.name || null,
      url: typeof window !== "undefined" ? window.location.href : null,
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      timestamp: new Date().toISOString(),
    };

    console.error(`[${scope}]`, payload);

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      try {
        const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
        navigator.sendBeacon("/api/log-error", blob);
      } catch {
        // sendBeacon can throw in some browsers with strict CSP — swallow
      }
    }
  }, [error, scope]);

  return (
    <main className="relative z-1 bg-black-800">
      <div className="ctm-error">
        <h2>Something went wrong!</h2>
        <p>{message || "An unexpected error occurred. Please try again later."}</p>
        <button onClick={() => reset()}>Try Again</button>
        {error?.digest && (
          <p
            aria-hidden="true"
            style={{
              fontSize: "0.7rem",
              opacity: 0.45,
              marginTop: "1.25rem",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            }}
          >
            ref: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
