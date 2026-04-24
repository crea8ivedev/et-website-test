"use client";
import React, { useRef } from "react";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const lerp = (a, b, t) => a + (b - a) * t;

export default function TransformativeSolutions({ data, title }) {
  const imgBoxRef = useRef(null);
  const raw = useScrollProgress(imgBoxRef, { offset: ["start end", "end end"] });
  // Clamp to the 0.1–0.8 working window that the original useTransform used.
  const t = Math.min(1, Math.max(0, (raw - 0.1) / 0.7));
  const scale = lerp(0.3, 1, t);
  const borderRadius = lerp(300, 0, t);

  if (!data) return null;

  return (
    <section
      ref={imgBoxRef}
      className={`common-content-wrapper white relative overflow-hidden${data?.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="bg-white benefits-wrapper-info relative rounded-10">
        <div className="container-fluid-lg z-1">
          <div className="flex flex-wrap items-start justify-between m-0 max-lg:pt-50 lg:pt-80 pb-40 w-full">
            <div className="w-full max-lg:mb-40 mb-60">
              {data?.heading && (
                <div className="title-black">
                  <h2 className="text-black-800">{safeParse(data.heading)}</h2>
                </div>
              )}
            </div>
            <div className="w-full lg:w-6/12 ms-auto">
              {data?.description && (
                <div className="content mb-40">
                  <p>{data.description}</p>
                </div>
              )}
              {data?.cta_button?.url && (
                <Link
                  href={data.cta_button.url}
                  target={data.cta_button.target || "_self"}
                  aria-label={data.cta_button.title}
                  className="btn btn-black"
                >
                  <span className="btn-txt">
                    {data.cta_button.title}
                    <span className="btn-txt-extra" data-txt={data.cta_button.title}></span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
        {(() => {
          const imgObj = data?.featured_images || data?.featured_image;
          const imgSrc = typeof imgObj === "string" ? imgObj : imgObj?.url;

          if (!imgSrc) return null;

          return (
            <div className="w-full flex justify-center items-center relative overflow-hidden z-1">
              <img
                src={imgSrc}
                alt={imgObj?.alt || "featured image"}
                className="object-cover pointer-events-none z-3 aspect-16/8"
                style={{
                  transform: `scale(${scale})`,
                  borderRadius: `${borderRadius}px`,
                  width: "100%",
                  height: "100%",
                  transformOrigin: "center center",
                  willChange: "transform, border-radius",
                }}
              />
            </div>
          );
        })()}
      </div>
    </section>
  );
}
