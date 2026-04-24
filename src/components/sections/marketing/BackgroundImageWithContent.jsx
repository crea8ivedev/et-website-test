"use client";
import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";

const lerp = (a, b, t) => a + (b - a) * t;

function ContentInner({ data }) {
  return (
    <div className="max-md:px-25 lg:max-w-740 w-full">
      <div className="left-content flex flex-col gap-y-25">
        {data?.heading && (
          <div className="title title-white">
            <h2>{safeParse(data.heading)}</h2>
          </div>
        )}
        {data?.sub_heading && <i>{data.sub_heading}</i>}
        {data?.description && (
          <div className="global-content content">{safeParse(data.description)}</div>
        )}
      </div>
    </div>
  );
}

export default function BackgroundImageWithContent({ data }) {
  const siteworkRef = useRef(null);
  const imgWrapRef = useRef(null);
  const overlayRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const section = siteworkRef.current;
    const imgWrap = imgWrapRef.current;
    const overlay = overlayRef.current;
    const text = textRef.current;
    if (!section || !imgWrap || !overlay) return;

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

      const scaleT = Math.min(1, raw / 0.9);
      imgWrap.style.transform = `scale(${lerp(0.55, 1, scaleT)})`;
      imgWrap.style.borderRadius = `${lerp(800, 0, scaleT)}px`;
      overlay.style.opacity = lerp(0, 0.7, raw);

      if (text) {
        const textT = Math.min(1, Math.max(0, (raw - 0.88) / 0.12));
        text.style.opacity = textT;
        text.style.transform = `translate3d(0, ${lerp(40, 0, textT)}px, 0)`;
      }
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

  return (
    <section
      ref={siteworkRef}
      className="sitework-wrapper relative w-full overflow-hidden max-md:py-50"
    >
      <div
        ref={imgWrapRef}
        className="img relative w-full aspect-video overflow-hidden"
        style={{
          transform: "scale(0.55)",
          borderRadius: "800px",
          transformOrigin: "center center",
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
      >
        {data?.background_image?.url ? (
          <Image
            src={
              typeof data.background_image === "string"
                ? data.background_image
                : data.background_image?.url || ""
            }
            className="size-full object-cover"
            width={2000}
            height={800}
            sizes="100vw"
            alt="Site Work"
          />
        ) : (
          <div className="size-full bg-black-800" />
        )}
        <div
          ref={overlayRef}
          style={{ opacity: 0 }}
          className="absolute inset-0 bg-black-800"
        />
      </div>

      <div
        ref={textRef}
        style={{ opacity: 0, transform: "translate3d(0, 40px, 0)", willChange: "opacity, transform" }}
        className="hidden md:flex absolute inset-0 flex-wrap items-center justify-center text-center pointer-events-none"
      >
        <ContentInner data={data} />
      </div>

      <Reveal
        delay={300}
        className="md:hidden relative mt-40 flex flex-wrap items-center justify-center"
      >
        <ContentInner data={data} />
      </Reveal>
    </section>
  );
}
