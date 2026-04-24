"use client";
import React, { useRef, useState, useEffect, useLayoutEffect } from "react";
import { safeParse } from "@/utils/safeParse";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const lerp = (a, b, t) => a + (b - a) * t;

const ImageGridContent = ({ progress, startPx, endPx, items }) => {
  const y = lerp(startPx, endPx, progress);

  return (
    <div
      className="mx-auto flex max-w-[92rem] flex-col gap-80 px-20 max-lg:gap-40"
      style={{ transform: `translate3d(0, ${y}px, 0)`, willChange: "transform" }}
    >
      {items.map((item, index) => (
        <div
          key={index}
          className={`relative flex w-full ${
            index % 2 === 0 ? "justify-start" : "justify-end"
          } max-lg:justify-center`}
        >
          <div
            className={`flex flex-col ${
              index % 2 === 0
                ? "translate-x-[1.4rem] -rotate-[2.2deg]"
                : "-translate-x-[1.4rem] rotate-[2.2deg]"
            }`}
          >
            <div
              className={`
                                relative rounded-tl-10 rounded-tr-10 w-[min(32vw,26rem)]
                                aspect-square overflow-hidden bg-black/30
                                max-lg:translate-x-0 max-lg:rotate-0
                            `}
            >
              <img
                src={item.src}
                alt={`Work-Life Benefit ${index + 1}`}
                aria-label={item.title || `Work-Life Benefit ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="p-10 bg-black-800 rounded-bl-10 rounded-br-10 w-[min(32vw,26rem)]">
              <span className="frame-title font-normal italic text-body-1 leading-[1]">
                {item.title}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function OurPerksAndBenefits({ data }) {
  const perkItems =
    data?.perk_and_benefit_items?.map((item) => {
      const img = item.images || item.image;
      return {
        src: typeof img === "string" ? img : img?.url || "",
        title: item.image_caption_text || "",
      };
    }) || [];

  const sectionRef = useRef(null);
  const stickyRef = useRef(null);
  const trackRef = useRef(null);

  const [startPx, setStartPx] = useState(0);
  const [endPx, setEndPx] = useState(0);
  const [sectionVh, setSectionVh] = useState(Math.max(650, perkItems.length * 95));
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const update = () =>
      setIsDesktop(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;

      const vpH = window.innerHeight;
      const trackH = track.scrollHeight;
      const start = vpH * 0.18;

      const end = vpH * 0.85 - trackH;

      setStartPx(start);
      setEndPx(end);

      const neededPx = Math.abs(end - start) + vpH;
      const neededVh = Math.ceil((neededPx / vpH) * 100) + 100;
      setSectionVh(Math.max(650, neededVh));
    };

    const rafId = requestAnimationFrame(measure);

    const ro = new ResizeObserver(measure);
    if (trackRef.current) ro.observe(trackRef.current);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [perkItems.length]);

  const progress = useScrollProgress(sectionRef, { offset: ["start start", "end end"] });

  if (data?.hide_section === "yes") return null;

  const mainTitle =
    data?.main_title || "<span>Work-Life Harmony Starts Here</span> Discover Our Perks & Benefits";

  return (
    <div
      ref={sectionRef}
      className="why-join-wrapper relative max-lg:py-50"
      style={isDesktop ? { height: `${sectionVh}vh` } : undefined}
    >
      <div ref={stickyRef} className="lg:sticky lg:top-0 lg:h-screen overflow-hidden">
        <div className="container-fluid h-full relative">
          <div className="h-auto pointer-events-none lg:sticky lg:top-1/2 z-10">
            <div className="title-info max-w-850 mx-auto lg:text-center">
              <h2 className="text-white drop-shadow-lg">{safeParse(mainTitle)}</h2>
            </div>
          </div>

          {isDesktop ? (
            <div ref={trackRef} className="img-grid lg:absolute inset-0 z-20 pointer-events-none">
              <ImageGridContent
                progress={progress}
                startPx={startPx}
                endPx={endPx}
                items={perkItems}
              />
            </div>
          ) : (
            <div className="relative grid max-575:grid-cols-1 grid-cols-2 z-20 pointer-events-none gap-40 mt-40">
              {perkItems.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-12">
                  <img
                    src={item.src}
                    alt={`Work-Life Benefit ${idx + 1}`}
                    aria-label={item.title || `Work-Life Benefit ${idx + 1}`}
                    className="w-full relative rounded-10 aspect-square overflow-hidden object-cover"
                    loading="lazy"
                  />
                  <span className="frame-title font-normal italic first-letter:capitalize lowercase text-heading-6 leading-[1]">
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
