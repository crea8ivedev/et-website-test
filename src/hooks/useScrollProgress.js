import { useEffect, useRef, useState } from "react";

// Drop-in replacement for framer-motion's `useScroll({ target, offset })`.
// Returns progress ∈ [0, 1] based on how far `target` has traveled through
// the configured offset window, without pulling in the framer-motion runtime.
//
// `offset` takes the same two-keyword shape framer-motion accepts, e.g.
// ["start end", "end end"]: the first keyword anchors a point on the target
// (start=top edge, end=bottom edge, or 0–100% strings), the second anchors a
// point on the viewport the same way. Progress hits 0 when the target
// anchor aligns with the viewport anchor for the first pair, and 1 when
// aligned for the second pair.
const ANCHOR_TO_RATIO = {
  start: 0,
  end: 1,
  center: 0.5,
};

function anchorToRatio(anchor) {
  if (ANCHOR_TO_RATIO[anchor] !== undefined) return ANCHOR_TO_RATIO[anchor];
  const parsed = parseFloat(anchor) / 100;
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseAnchorPair(pair) {
  const [targetAnchor, viewportAnchor] = pair.split(/\s+/);
  return {
    target: anchorToRatio(targetAnchor),
    viewport: anchorToRatio(viewportAnchor),
  };
}

export function useScrollProgress(ref, { offset = ["start end", "end start"] } = {}) {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef(null);
  const offsetKey = offset.join("|");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const [startPair, endPair] = offsetKey.split("|").map(parseAnchorPair);

    const compute = () => {
      rafRef.current = null;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || document.documentElement.clientHeight;

      const targetStartY = rect.top + rect.height * startPair.target;
      const targetEndY = rect.top + rect.height * endPair.target;
      const viewportStartY = vh * startPair.viewport;
      const viewportEndY = vh * endPair.viewport;

      const startDelta = targetStartY - viewportStartY;
      const endDelta = targetEndY - viewportEndY;
      const range = startDelta - endDelta;

      if (range === 0) {
        setProgress(startDelta <= 0 ? 1 : 0);
        return;
      }
      const raw = startDelta / range;
      setProgress(Math.min(1, Math.max(0, raw)));
    };

    const onScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(compute);
    };

    compute();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ref, offsetKey]);

  return progress;
}
