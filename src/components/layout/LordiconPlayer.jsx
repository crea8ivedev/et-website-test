"use client";

import { useEffect } from "react";
export default function LordiconPlayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Ensure we only initialize once, even if this component mounts multiple times.
    window.__encircleLordiconInitPromise ??= (async () => {
      if (typeof customElements !== "undefined" && customElements.get("lord-icon")) return;
      const lottie = (await import("lottie-web/build/player/lottie_light")).default;
      const { defineElement } = await import("@lordicon/element");
      defineElement(lottie.loadAnimation);
    })();

    // Fire and forget; errors will surface in DevTools console.
    void window.__encircleLordiconInitPromise;
  }, []);

  return null;
}
