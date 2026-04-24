"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";

const ContentBlock = ({ data, index, handleSetVisibility, isLast }) => {
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          handleSetVisibility(index);
        }
      },
      { rootMargin: "-50% 0% -50% 0%", threshold: 0 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [index, handleSetVisibility]);

  return (
    <div
      ref={ref}
      className={`flex flex-col justify-center py-0 ${isLast ? "h-screen" : "h-screen"}`}
    >
      <h2 className="h5 mb-25 text-gold">{String(index + 1).padStart(2, "0")}</h2>
      <h3 className="h2 mb-15 text-white">{data?.title}</h3>
      <p className="text-sm md:text-base max-w-md text-gray-300">{data?.description}</p>
    </div>
  );
};

export default function InnovationWorkflow({ data, title }) {
  const slides = data?.workflow_slides || [];
  const [activeId, setActiveId] = useState(0);
  const [direction, setDirection] = useState(1);
  const handleSetVisibility = useCallback((id) => {
    setActiveId((prev) => {
      if (id === prev) return prev;
      setDirection(id > prev ? 1 : -1);
      return id;
    });
  }, []);

  const activeSlide = slides[activeId];

  if (!data || !slides.length) return null;

  return (
    <section
      className={`innovation-wrapper relative pt-80 max-lg:py-50${data?.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid-lg">
        <div className="w-full max-lg:mb-40 mb-60">
          <div className="lg:w-8/12 w-full mx-auto lg:text-center">
            {data?.heading && (
              <div className={`title title-white fade-up in-view`}>
                <Reveal as="h2">{safeParse(data.heading)}</Reveal>
              </div>
            )}
          </div>
        </div>
        <div className="innovation-animate-wrapper flex flex-col lg:flex-row gap-40">
          <div className="hidden lg:block w-full lg:w-1/2">
            {slides.map((item, index) => (
              <ContentBlock
                key={index}
                data={item}
                index={index}
                handleSetVisibility={handleSetVisibility}
                isLast={index === slides.length - 1}
              />
            ))}
          </div>

          <div className="hidden lg:block w-1/2 sticky top-0 h-screen py-80">
            <div className="relative w-full h-full rounded-3xl overflow-hidden bg-black-800 shadow-2xl">
              <div
                key={activeId}
                data-direction={direction}
                className="innovation-slide absolute inset-0"
              >
                {(() => {
                  const slideImg =
                    typeof activeSlide.image === "string"
                      ? activeSlide.image
                      : activeSlide.image?.url ||
                        (typeof activeSlide.images === "string"
                          ? activeSlide.images
                          : activeSlide.images?.url);

                  if (slideImg) {
                    const imgObj = activeSlide.image || activeSlide.images;
                    return (
                      <Image
                        src={slideImg}
                        alt={imgObj?.alt || activeSlide.title || "workflow image"}
                        aria-label={imgObj?.alt || activeSlide.title || "workflow image"}
                        width={imgObj?.width || 2000}
                        height={imgObj?.height || 2000}
                        className="size-full object-cover"
                      />
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          <div className="lg:hidden w-full grid grid-cols-1 gap-30">
            {slides.map((item, index) => (
              <div
                key={index}
                className="relative w-full aspect-4/3 rounded-10 overflow-hidden bg-black-800 shadow-xl"
              >
                {(() => {
                  const slideImg =
                    typeof item.image === "string"
                      ? item.image
                      : item.image?.url ||
                        (typeof item.images === "string" ? item.images : item.images?.url);

                  if (slideImg) {
                    const imgObj = item.image || item.images;
                    return (
                      <Image
                        src={slideImg}
                        alt={imgObj?.alt || item.title || "workflow image"}
                        aria-label={imgObj?.alt || item.title || "workflow image"}
                        width={imgObj?.width || 1200}
                        height={imgObj?.height || 1200}
                        className="size-full object-cover"
                      />
                    );
                  }
                  return null;
                })()}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 max-991:via-black/50 via-65% to-transparent p-20">
                  <p className="text-white text-lg font-semibold">{item.title}</p>
                  <p className="text-white/70 text-sm mt-6">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
