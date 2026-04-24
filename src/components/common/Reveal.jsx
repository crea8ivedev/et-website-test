"use client";
import React from "react";
import { useReveal } from "@/hooks/useReveal";

// Lightweight replacement for `<motion.div initial whileInView>` reveals.
// Each instance gets its own IntersectionObserver via useReveal, so elements
// fade/slide in independently as they enter the viewport — same UX as
// framer-motion's whileInView but ~0 JS cost (no framer-motion runtime).
//
// Usage:
//   <Reveal className="title ...">content</Reveal>
//   <Reveal className="content ..." delay={200}>content</Reveal>
//   <Reveal as="span" direction="left">content</Reveal>
const DIRECTION_CLASS = {
  up: "reveal-up",
  down: "reveal-down",
  left: "reveal-left",
  right: "reveal-right",
  scale: "reveal-scale",
  none: "",
};

const DELAY_CLASS = {
  0: "",
  100: "reveal-delay-100",
  200: "reveal-delay-200",
  300: "reveal-delay-300",
  400: "reveal-delay-400",
  500: "reveal-delay-500",
};

export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  direction = "up",
  delay = 0,
  threshold,
  rootMargin,
  ...rest
}) {
  const ref = useReveal({ threshold, rootMargin });
  const directionClass = DIRECTION_CLASS[direction] ?? "reveal-up";
  const delayClass = DELAY_CLASS[delay] ?? "";
  const merged = ["reveal", directionClass, delayClass, className].filter(Boolean).join(" ");
  return (
    <Tag ref={ref} className={merged} {...rest}>
      {children}
    </Tag>
  );
}

export default Reveal;
