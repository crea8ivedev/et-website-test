"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";

export default function JoinJourney({ data }) {
  const joinAreaRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = joinAreaRef.current;
    if (!el) return;

    let rafId = null;
    let pendingX = 0;
    let pendingY = 0;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      pendingX = e.clientX - cx;
      pendingY = e.clientY - cy;
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        setOffset({ x: pendingX, y: pendingY });
      });
    };

    const onLeave = () => {
      setOffset({ x: 0, y: 0 });
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const { x, y } = offset;
  const dist = Math.min(1, Math.hypot(x, y) / 260);
  const scaleSm = 0.85 + dist * (1.02 - 0.85);
  const scaleMd = 0.95 + dist * (1.035 - 0.95);

  // Each image slot uses a different coefficient + sign to produce parallax
  // depth — same values as the original framer-motion useTransform mapping.
  const tx = (factor) => x * factor;
  const ty = (factor) => y * factor;

  // The `transition` property keeps the motion smooth even though offset only
  // updates on pointer events — mimics the spring easing without a rAF loop.
  const parallaxTransition = "transform 0.25s cubic-bezier(0.22, 1, 0.36, 1)";

  const parallaxStyle = (dx, dy, scale, extra = {}) => ({
    transform: `translate3d(${tx(dx)}px, ${ty(dy)}px, 0) scale(${scale})`,
    transition: parallaxTransition,
    willChange: "transform",
    ...extra,
  });

  const collage = data?.image_gallery || [];
  // 1×1 transparent SVG; Next.js Image accepts data-URIs. Used when an image
  // slot in the gallery is missing, so <Image> doesn't error on empty src.
  const EMPTY_IMG =
    "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxIiBoZWlnaHQ9IjEiLz4=";
  const getImg = (idx) => {
    const item = collage[idx];
    if (!item) return EMPTY_IMG;

    const imgValue =
      item?.image ||
      item?.gallery_image ||
      item?.gallery_images ||
      item?.images ||
      item?.url ||
      (typeof item === "string" ? item : item);

    if (typeof imgValue === "string") {
      if (/^\d+$/.test(imgValue)) return EMPTY_IMG;
      return imgValue;
    }

    return imgValue?.url || EMPTY_IMG;
  };

  return (
    <section className="join-wrapper py-80 max-lg:py-40 relative overflow-hidden">
      <div className="container-fluid-lg">
        <div
          ref={joinAreaRef}
          className="flex flex-wrap items-center justify-center m-0 p-0 w-full gap-y-40 lg:h-screen relative"
        >
          <div className="w-full lg:max-w-640 lg:text-center relative">
            {(data?.title || data?.heading) && (
              <div className="title title-white mb-20">
                <h2>{safeParse(data?.title || data?.heading)}</h2>
              </div>
            )}
            {(data?.description || data?.short_description) && (
              <div className="content mb-40 lg:max-w-580 mx-auto">
                {safeParse(data?.description || data?.short_description)}
              </div>
            )}
            {(data?.cta_button || data?.button) && (
              <div>
                <Link
                  href={(data?.cta_button || data?.button).url}
                  aria-label={(data?.cta_button || data?.button).title}
                  className="btn lg:mx-auto"
                >
                  <span className="btn-txt">
                    {(data?.cta_button || data?.button).title}
                    <span
                      className="btn-txt-extra"
                      data-txt={(data?.cta_button || data?.button).title}
                    ></span>
                  </span>
                </Link>
              </div>
            )}
          </div>
          <div className="relative lg:absolute inset-0 w-full">
            <div className="hidden lg:block absolute inset-0">
              <div className="img-one absolute top-0 left-[18%]">
                <div
                  className="img rounded-10 overflow-hidden absolute z-1"
                  style={parallaxStyle(0.05, 0.05, scaleMd, {
                    width: "clamp(220px, 20vw, 320px)",
                    height: "clamp(150px, 13vw, 210px)",
                  })}
                >
                  <Image
                    src={getImg(0)}
                    className="size-full object-center"
                    width={1112}
                    height={690}
                    alt="event"
                    aria-label="Encircle Event"
                  />
                </div>
                <div
                  className="img rounded-10 overflow-hidden absolute top-[10vw] -left-[10vw] blur-sm opacity-40"
                  style={parallaxStyle(0.05, 0.05, scaleMd, {
                    width: "clamp(220px, 20vw, 320px)",
                    height: "clamp(150px, 13vw, 210px)",
                  })}
                >
                  <Image
                    src={getImg(0)}
                    className="size-full object-center"
                    width={1112}
                    height={690}
                    alt="event"
                    aria-label="Encircle Event"
                  />
                </div>
              </div>
              <div className="img-two absolute top-0 right-[2%]">
                <div
                  className="img rounded-10 overflow-hidden absolute -top-20 right-50 z-1"
                  style={parallaxStyle(-0.07, 0.07, scaleMd, {
                    width: "clamp(200px, 16vw, 260px)",
                    height: "clamp(200px, 16vw, 260px)",
                  })}
                >
                  <Image
                    src={getImg(1)}
                    className="size-full object-cover"
                    width={1112}
                    height={690}
                    alt="event"
                    aria-label="Encircle Event"
                  />
                </div>
                <div
                  className="img rounded-10 overflow-hidden absolute top-[3vw] -right-[8vw] blur-sm opacity-40"
                  style={parallaxStyle(-0.07, 0.07, scaleMd, {
                    width: "clamp(240px, 22vw, 320px)",
                    height: "clamp(240px, 22vw, 320px)",
                  })}
                >
                  <Image
                    src={getImg(1)}
                    className="size-full object-cover"
                    width={1112}
                    height={690}
                    alt="event"
                    aria-label="Encircle Event"
                  />
                </div>
              </div>
              <div className="img-three absolute bottom-60 left-[10%]">
                <div
                  className="img rounded-10 overflow-hidden absolute bottom-0 z-1"
                  style={parallaxStyle(0.04, -0.04, scaleSm, {
                    width: "clamp(220px, 20vw, 320px)",
                    height: "clamp(150px, 13vw, 210px)",
                  })}
                >
                  <Image
                    src={getImg(2)}
                    className="size-full object-cover"
                    width={1112}
                    height={690}
                    alt="event"
                    aria-label="Encircle Event"
                  />
                </div>
                <div
                  className="img rounded-10 overflow-hidden absolute -bottom-50 -left-[8vw] blur-sm opacity-40"
                  style={parallaxStyle(0.04, -0.04, scaleSm, {
                    width: "clamp(220px, 20vw, 320px)",
                    height: "clamp(150px, 13vw, 210px)",
                  })}
                >
                  <Image
                    src={getImg(2)}
                    className="size-full object-cover"
                    width={1112}
                    height={690}
                    alt="event"
                    aria-label="Encircle Event"
                  />
                </div>
              </div>
              <div className="img-four absolute -bottom-40 left-[48%]">
                <div
                  className="img rounded-10 overflow-hidden absolute bottom-0 left-0 z-1"
                  style={parallaxStyle(0.06, 0.06, scaleSm, {
                    width: "clamp(240px, 22vw, 320px)",
                    height: "clamp(200px, 18vw, 260px)",
                  })}
                >
                  <Image
                    src={getImg(3)}
                    className="size-full object-cover"
                    width={1112}
                    height={690}
                    alt="event"
                    aria-label="Encircle Event"
                  />
                </div>
              </div>
              <div className="img-five absolute top-1/2 -translate-1/2 right-[18%]">
                <div
                  className="img rounded-10 overflow-hidden absolute z-1"
                  style={parallaxStyle(-0.05, -0.05, scaleMd, {
                    width: "clamp(220px, 20vw, 320px)",
                    height: "clamp(140px, 12vw, 200px)",
                  })}
                >
                  <Image
                    src={getImg(4)}
                    className="size-full object-cover"
                    width={1112}
                    height={690}
                    alt="event"
                    title="Encircle Event"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 relative z-10 lg:hidden">
              {collage.slice(0, 4).map((item, index) => (
                <div key={index} className="relative overflow-hidden rounded-10 aspect-4/3">
                  <Image
                    src={getImg(index)}
                    alt="event"
                    title="Encircle Event"
                    fill
                    sizes="(max-width: 1024px) 50vw, 20vw"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
