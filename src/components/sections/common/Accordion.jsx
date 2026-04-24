"use client";
import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import parse from "html-react-parser";

export default function AccordionProcess({ data }) {
  const words = Array.isArray(data?.right_heading_words)
    ? data.right_heading_words.map((w) => w.heading)
    : [];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setCurrentWord((p) => (p + 1) % words.length), 10000);
    return () => clearInterval(id);
  }, [words.length]);

  const cardRefs = useRef([]);
  const [cardHeight, setCardHeight] = useState(null);
  const accordion_items = data?.accordion_items;

  useLayoutEffect(() => {
    if (!accordion_items?.length) return;

    const measure = () => {
      const heights = cardRefs.current
        .map((node) => (node ? node.scrollHeight : 0))
        .filter(Boolean);
      if (heights.length) {
        setCardHeight(Math.max(...heights));
      }
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [accordion_items]);

  if (!data) return null;

  const { heading, left_heading, right_heading_words, description, heading_type } = data;

  return (
    <section
      className={`approach-wrapper py-80 max-lg:py-40 ${heading?.toLowerCase()?.includes("creative") ? "wearecreative-wrapper" : ""} ${data?.extra_class ? ` ${data.extra_class}` : ""} in-view`}
    >
      <div className="container-fluid-lg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-40 items-start">
          <div className="w-full lg:pr-40 lg:sticky lg:top-100">
            <div
              className={`title title-white mb-20 fade-up ${heading?.toLowerCase()?.includes("creative") ? "max-769:!text-35 max-575:!text-35" : ""} in-view`}
            >
              {heading_type === "style2" || left_heading || right_heading_words?.length > 0 ? (
                <div className="mb-20 relative overflow-hidden flex flex-wrap items-center">
                  <h2 className="mr-10 text-white">{left_heading}</h2>
                  <h2 className="inline-flex">
                    <span
                      className="relative inline-flex items-center justify-center overflow-hidden align-middle h-[1.25em] min-w-[6.5ch]"
                      style={{
                        WebkitMaskImage:
                          "linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)",
                        maskImage:
                          "linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)",
                      }}
                    >
                      <span
                        key={currentWord}
                        className="rotating-word absolute inset-0 flex text-transparent bg-clip-text bg-gradient-to-br from-white via-gold to-gold font-bold"
                      >
                        {words[currentWord]}
                      </span>
                    </span>
                  </h2>
                </div>
              ) : (
                <h2>{parse(heading || "")}</h2>
              )}
            </div>
            {description && (
              <div className={`content fade-up delay-01 in-view`}>
                <div>{parse(description || "")}</div>
              </div>
            )}
          </div>

          <div
            className="w-full flex flex-col gap-10"
            style={{
              "--stack-base": "clamp(20px, 7vw, 100px)",
              "--stack-step": "clamp(80px, 10vh, 120px)",
            }}
          >
            {Array.isArray(accordion_items) &&
              accordion_items.map((item, i) => {
                const topValue = `calc(var(--stack-base) + var(--stack-step) * ${i})`;
                return (
                  <div key={i} className="sticky" style={{ top: topValue }}>
                    <div
                      ref={(el) => (cardRefs.current[i] = el)}
                      className="flex items-stretch border border-black-500 bg-black-800 rounded-10"
                      style={{ height: cardHeight ? `${cardHeight}px` : `${cardHeight}px` }}
                    >
                      <div
                        className={`w-full max-md:max-w-50 max-w-100 flex-1 py-24 max-lg:px-20 px-40 opacity-60 fade-up delay-01 in-view`}
                      >
                        <span>{i + 1}</span>
                      </div>
                      <div className="flex flex-col justify-between gap-40 flex-1 py-24 max-lg:pr-20 pr-40 p-0">
                        <div className={`title title-white fade-up delay-01 in-view`}>
                          <h3>{item.heading}</h3>
                        </div>
                        <div className={`content fade-up delay-02 in-view`}>
                          <div>{parse(item.description || "")}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </section>
  );
}
