"use client";
import React, { useRef, useState, useEffect } from "react";
import { safeParse } from "@/utils/safeParse";
import DynamicIcon from "@/components/icons/DynamicIcon";

export default function ExpertServices({ data }) {
  const growthRef = useRef(null);
  const bubbleRef = useRef(null);
  const [bubbleSize, setBubbleSize] = useState(0);
  const growthBoundsRef = useRef({ width: 0, height: 0 });
  const bubbleStyle = { width: bubbleSize, height: bubbleSize, left: 0, top: 0 };

  useEffect(() => {
    const measure = () => {
      if (!growthRef.current) return;
      const { width, height } = growthRef.current.getBoundingClientRect();
      growthBoundsRef.current = { width, height };
      setBubbleSize(Math.min(width, height) * 0.18);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let animationFrameId;
    let x = 0;
    let y = 0;
    let dx = 2;
    let dy = 2;

    const animate = () => {
      const { width, height } = growthBoundsRef.current;
      const el = bubbleRef.current;
      if (!width || !height || !bubbleSize || !el) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const maxX = Math.max(width - bubbleSize, 0);
      const maxY = Math.max(height - bubbleSize, 0);

      x += dx;
      y += dy;

      if (x <= 0 || x >= maxX) {
        x = Math.max(0, Math.min(x, maxX));
        dx *= -1;
      }
      if (y <= 0 || y >= maxY) {
        y = Math.max(0, Math.min(y, maxY));
        dy *= -1;
      }

      // Write transform directly to DOM — skips React re-renders, same optimization
      // framer-motion's useMotionValue provided.
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bubbleSize]);

  if (!data) return null;

  const heading = data?.heading || "";
  const description = data?.description || "";
  const serviceBlocks = data?.service_blocks || [];

  return (
    <section
      className={`growth-wrapper relative overflow-hidden py-80 max-lg:py-40 ${data?.extra_class ? ` ${data.extra_class}` : ""} in-view`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid">
        <div className="bg-black-700 rounded-10 py-30 xl:py-60 max-sm:px-15 px-25 xl:px-50 xl:pt-100 relative z-1">
          <div className="w-full xl:max-w-9/12 sm:text-center mx-auto">
            {heading && (
              <div className={`title title-white mb-20 mx-auto fade-up in-view`}>
                <h2>{safeParse(heading)}</h2>
              </div>
            )}
            {description && (
              <div className={`content mx-auto fade-up delay-01 in-view`}>
                <p>{safeParse(description)}</p>
              </div>
            )}
          </div>

          <div
            ref={growthRef}
            className="relative growth-list overflow-hidden mt-40 lg:mt-60 grid md:grid-cols-2 lg:grid-cols-3 gap-20"
          >
            <div
              ref={bubbleRef}
              style={bubbleStyle}
              className="absolute pointer-events-none will-change-transform z-0 opacity-50"
            >
              <div className="absolute rounded-full border-4 border-gold size-[12em]" />
              <div className="absolute rounded-full border-4 border-gold size-[12em] ml-10 mt-10" />
            </div>

            {serviceBlocks.map((item, index) => (
              <div
                key={index}
                className={`block relative overflow-hidden mx-auto bg-black/30 backdrop-blur-lg border border-solid border-black-600/60 rounded-10 p-25 xl:p-30 z-1 fade-up delay-0${index + 1} in-view`}
              >
                <div className={`icon mb-30 fade-in delay-0${index + 1} in-view`}>
                  <DynamicIcon
                    name={typeof item.service_image === "string" ? item.service_image : null}
                    className="text-white size-46"
                    fallbackSrc={typeof item.service_image === "string" ? item.service_image : item.service_image?.url}
                    fallbackAlt={item.service_image?.alt || item.service_title}
                    fallbackWidth={64}
                    fallbackHeight={64}
                    fallbackStyle={{ filter: "brightness(0) invert(1)" }}
                  />
                </div>
                <div className={`title title-white mb-20 fade-up delay-0${index + 1} in-view`}>
                  <h3 className="h5">{item.service_title}</h3>
                </div>
                <div className={`content fade-up delay-0${index + 2} in-view`}>
                  <p>{item.service_description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
