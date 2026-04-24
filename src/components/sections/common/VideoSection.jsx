"use client";
import React, { useRef } from "react";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const lerp = (a, b, t) => a + (b - a) * t;

export default function VideoSection({ data }) {
  const fullvideoRef = useRef(null);
  const raw = useScrollProgress(fullvideoRef, { offset: ["start end", "end end"] });
  // Mirrors the original useTransform([0, 0.9], [0.55, 1]) working range.
  const t = Math.min(1, raw / 0.9);
  const scale = lerp(0.55, 1, t);
  const borderRadius = lerp(800, 0, t);

  if (data?.hide_section === "yes") return null;

  const videoUrl = typeof data.video === "string" ? data.video : data.video?.url || "";
  const posterUrl =
    typeof data.poster_image === "string" ? data.poster_image : data.poster_image?.url || "";

  return (
    <section ref={fullvideoRef} className="video-wrapper relative overflow-hidden">
      <div className="w-full overflow-hidden relative aspect-video">
        <video
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          src={videoUrl}
          poster={posterUrl}
          className="absolute inset-0 object-cover pointer-events-none"
          style={{
            transform: `scale(${scale})`,
            borderRadius: `${borderRadius}px`,
            width: "100%",
            height: "100%",
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform, border-radius",
          }}
        />
      </div>
    </section>
  );
}
