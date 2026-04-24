"use client";
import React, { useRef } from "react";
import { safeParse } from "@/utils/safeParse";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const defaultIcons = [
  <svg
    key={0}
    className="max-sm:size-40 text-white"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <line x1="3" y1="9" x2="21" y2="9" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>,
  <svg
    key={1}
    className="max-sm:size-40 text-white"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>,
  <svg
    key={2}
    className="max-sm:size-40 text-white"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>,
  <svg
    key={3}
    className="max-sm:size-40 text-white"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>,
  <svg
    key={4}
    className="max-sm:size-40 text-white"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6" />
    <path d="M21.5 8A10 10 0 0 0 3.5 10" />
    <path d="M2.5 16a10 10 0 0 0 18-2" />
    <path d="M2.5 22v-6h6" />
  </svg>,
  <svg
    key={5}
    className="max-sm:size-40 text-white"
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <circle cx="7" cy="7" r="0.5" />
  </svg>,
];

export default function WhyChooseEncircle({ data, title }) {
  const targetRef = useRef(null);
  const hScrollWrapRef = useRef(null);
  const progress = useScrollProgress(targetRef, { offset: ["start start", "end end"] });

  const [vw, setVw] = React.useState(0);
  const [hViewport, setHViewport] = React.useState(0);

  React.useLayoutEffect(() => {
    const updateVw = () => setVw(window.innerWidth);
    updateVw();
    window.addEventListener("resize", updateVw);
    return () => window.removeEventListener("resize", updateVw);
  }, []);

  const cardWidth = React.useMemo(() => {
    if (!vw) return 520;
    if (vw >= 1024) return 520;
    if (vw >= 768) return vw;
    return vw * 0.9;
  }, [vw]);

  const blockSlider = data?.block_slider || [];

  const gap = 30;
  const totalCards = blockSlider.length || 6;

  React.useLayoutEffect(() => {
    const measure = () => {
      const wrapWidth = hScrollWrapRef.current?.clientWidth;
      setHViewport(wrapWidth || vw || 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [vw]);

  const viewportWidth = hViewport || vw || 1920;
  const listWidth = totalCards * cardWidth + (totalCards - 1) * gap;
  const totalMove = Math.max(listWidth - viewportWidth, 0);
  const x = -totalMove * progress;

  if (!data) return null;

  const heading = data?.heading || "";
  const description = data?.description || "";

  return (
    <section
      ref={targetRef}
      className={`why-choose-wrapper relative ${data?.extra_class ? ` ${data.extra_class}` : ""} in-view`}
      id={data?.extra_id || ""}
    >
      <div className="h-[600vh]">
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
          <div className="container-fluid">
            <div className="top-content max-w-1100 mx-auto sm:text-center">
              {heading && (
                <div className={`title title-white mb-20 fade-up in-view`}>
                  <h2>{safeParse(heading)}</h2>
                </div>
              )}
              {description && (
                <div className={`content fade-up delay-01 in-view`}>
                  <div>{safeParse(description)}</div>
                </div>
              )}
            </div>
            <div ref={hScrollWrapRef} className="flex items-center pt-40 lg:pt-50">
              <div
                className="flex gap-x-[30px]"
                style={{
                  transform: `translate3d(${x}px, 0, 0)`,
                  willChange: "transform",
                }}
              >
                {blockSlider.map((card, index) => (
                  <div
                    key={index}
                    style={{ width: `${cardWidth}px` }}
                    className="relative overflow-hidden flex-shrink-0 list-bx max-sm:p-25 p-40 border border-black-200/0 rounded-2xl max-lg:h-auto h-350 flex flex-col justify-center transition-colors group"
                  >
                    <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-black-50/60 from-20% via-black-500/40 via-40% to-80% to-black-900 pointer-events-none -z-2" />
                    <div className="blur-[6px] bg-black-700/80 absolute inset-0 rounded-2xl -z-1" />

                    <div className={`max-sm:mb-20 mb-40 fade-up delay-01 text-gold in-view`}>
                      {card.icon ? safeParse(card.icon) : defaultIcons[index] || defaultIcons[0]}
                    </div>

                    <div className={`title title-white mb-20 fade-up delay-02 in-view`}>
                      <h3 className="h4">{card.heading}</h3>
                    </div>

                    <div className={`content fade-up delay-03 in-view`}>
                      <div>{safeParse(card.description)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
