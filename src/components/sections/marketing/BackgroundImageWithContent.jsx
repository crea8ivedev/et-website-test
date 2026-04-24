"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";
import { useScrollProgress } from "@/hooks/useScrollProgress";

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
  const raw = useScrollProgress(siteworkRef, { offset: ["start end", "end end"] });

  // Mirror the original useTransform ranges.
  const scaleT = Math.min(1, raw / 0.9);
  const scale = lerp(0.55, 1, scaleT);
  const radius = lerp(800, 0, scaleT);
  const overlayOpacity = lerp(0, 0.7, raw);
  // Text block fades in only over the last 12% of the scroll.
  const textT = Math.min(1, Math.max(0, (raw - 0.88) / 0.12));
  const textOpacity = textT;
  const textY = lerp(40, 0, textT);

  if (data?.hide_section === "yes") return null;

  return (
    <section
      ref={siteworkRef}
      className="sitework-wrapper relative w-full overflow-hidden max-md:py-50"
    >
      <div
        style={{
          transform: `scale(${scale})`,
          borderRadius: `${radius}px`,
          transformOrigin: "center center",
          willChange: "transform, border-radius",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
        }}
        className="img relative w-full aspect-video overflow-hidden"
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
            alt="Site Work"
          />
        ) : (
          <div className="size-full bg-black-800" />
        )}
        <div
          style={{ opacity: overlayOpacity, willChange: "opacity" }}
          className="absolute inset-0 bg-black-800"
        />
      </div>

      <div
        style={{
          opacity: textOpacity,
          transform: `translate3d(0, ${textY}px, 0)`,
          willChange: "opacity, transform",
        }}
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
