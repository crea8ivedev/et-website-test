"use client";
import { useEffect } from "react";

export default function LordiconPlayer() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = () => {
      window.__encircleLordiconInitPromise ??= (async () => {
        if (typeof customElements !== "undefined" && customElements.get("lord-icon")) return;
        const lottie = (await import("lottie-web/build/player/lottie_light")).default;
        const { defineElement } = await import("@lordicon/element");
        defineElement(lottie.loadAnimation);
      })();
      void window.__encircleLordiconInitPromise;
    };

    // Defer until browser is idle so Lottie doesn't compete with LCP.
    // 3 s hard timeout ensures icons still load on slow devices.
    if ("requestIdleCallback" in window) {
      const id = requestIdleCallback(init, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(init, 1000);
    return () => clearTimeout(id);
  }, []);

  return null;
}
