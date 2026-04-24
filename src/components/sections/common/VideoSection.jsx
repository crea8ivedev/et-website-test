"use client";
import React, { useRef, useEffect } from "react";

const lerp = (a, b, t) => a + (b - a) * t;

export default function VideoSection({ data }) {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video) return;

    let rafId = null;

    const update = () => {
      rafId = null;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      // Mirrors offset: ["start end", "end end"]
      const startDelta = rect.top - vh;
      const endDelta = rect.bottom - vh;
      const range = startDelta - endDelta;
      const raw = range === 0 ? 1 : Math.min(1, Math.max(0, startDelta / range));

      const t = Math.min(1, raw / 0.9);
      video.style.transform = `scale(${lerp(0.55, 1, t)})`;
      video.style.borderRadius = `${lerp(800, 0, t)}px`;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  if (data?.hide_section === "yes") return null;

  const videoUrl = typeof data.video === "string" ? data.video : data.video?.url || "";
  const posterUrl =
    typeof data.poster_image === "string" ? data.poster_image : data.poster_image?.url || "";

  return (
    <section ref={sectionRef} className="video-wrapper relative overflow-hidden">
      <div className="w-full overflow-hidden relative aspect-video">
        <video
          ref={videoRef}
          muted
          loop
          autoPlay
          playsInline
          preload="none"
          src={videoUrl}
          poster={posterUrl}
          className="absolute inset-0 object-cover pointer-events-none"
          style={{
            transform: "scale(0.55)",
            borderRadius: "800px",
            width: "100%",
            height: "100%",
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            willChange: "transform",
          }}
        />
      </div>
    </section>
  );
}
