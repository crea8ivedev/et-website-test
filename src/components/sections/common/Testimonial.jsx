"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";
import { RATING_STAR_ICON } from "@/constants";

const AUTOPLAY_DELAY = 4000;

const MAP_POSITIONS = {
  uk: { x: -5, y: -8, scale: 2 },
  swe: { x: 0, y: -2, scale: 1.8 },
  ca: { x: 25, y: 5, scale: 1 },
  aus: { x: -55, y: -20, scale: 1.6 },
};

const getMapPosition = (item) => {
  if (!item) return { x: -15, y: -8, scale: 1.5 };
  const countryKey = item.country_code?.toLowerCase();
  return MAP_POSITIONS[countryKey] || { x: -15, y: -8, scale: 1.5 };
};

export default function Testimonial({ data }) {
  const total = data?.testimonial?.length || 0;
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(null);
  const rafRef = useRef(null);
  const testimonialImage = data?.image || data?.img;
  const radius = 190;
  const circumference = 2.1 * Math.PI * radius;

  // Derived at render time — no state or effect needed
  const mapTransform = getMapPosition(data?.testimonial?.[activeIndex]);

  // Reset progress timer whenever activeIndex changes (ref mutation in effects is allowed)
  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [activeIndex]);

  useEffect(() => {
    if (total <= 1) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, AUTOPLAY_DELAY);
    return () => clearInterval(id);
  }, [total]);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const tick = () => {
      const elapsed = startTimeRef.current !== null ? Date.now() - startTimeRef.current : 0;
      setProgress(Math.min(elapsed / AUTOPLAY_DELAY, 1));
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (!data?.testimonial?.length) return null;

  return (
    <section
      className={`testimonial-section py-80 max-lg:py-40 relative overflow-hidden${data.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid-lg">
        <div className="w-3/12 max-lg:w-6/12 max-md:w-full mb-40">
          {data?.heading && (
            <div className="title title-white text-center">
              <h2>{safeParse(data.heading)}</h2>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between w-full gap-y-40 overflow-hidden max-md:flex-col">
          <div className="testimonial-small w-3/12 max-lg:w-6/12 max-md:w-full">
            <div className="flex flex-col text-center items-center justify-between w-full h-full gap-40">
              <div className="testimonial-global-map relative max-lg:size-[40vw] max-md:size-[50vw] size-[20vw] aspect-square">
                <svg
                  className="block size-full"
                  width="402"
                  height="402"
                  viewBox="0 0 402 402"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M201 392C306.486 392 392 306.486 392 201C392 95.5136 306.486 10 201 10C95.5136 10 10 95.5136 10 201C10 306.486 95.5136 392 201 392Z"
                    strokeOpacity="0.3"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeMiterlimit="10"
                  />
                  <path
                    d="M201 392C306.486 392 392 306.486 392 201C392 95.5136 306.486 10 201 10C95.5136 10 10 95.5136 10 201C10 306.486 95.5136 392 201 392Z"
                    stroke="#EDA800"
                    strokeWidth="1.5"
                    strokeMiterlimit="10"
                    fill="none"
                    className="origin-center"
                    style={{
                      strokeDasharray: circumference,
                      strokeDashoffset: circumference - circumference * progress,
                      transform: "rotate(90deg)",
                    }}
                  />
                </svg>
                <div className="testimonial-global-map-w m-auto rounded-full inset-[0.75em] absolute flex items-center justify-center overflow-hidden z-0">
                  {(typeof testimonialImage === "string"
                    ? testimonialImage
                    : testimonialImage?.url) && (
                    <Image
                      src={
                        typeof testimonialImage === "string"
                          ? testimonialImage
                          : testimonialImage.url
                      }
                      loading="lazy"
                      width={3030}
                      height={1998}
                      alt={testimonialImage?.alt || "Map Background"}
                      aria-label={testimonialImage?.alt || "Map Background"}
                      className="w-auto max-w-none h-full absolute z-0 opacity-100 duration-1000 ease-linear"
                      style={{
                        width: "auto",
                        transform: `translate(${mapTransform.x}%, ${mapTransform.y}%) scale(${mapTransform.scale || 1})`,
                      }}
                    />
                  )}

                  {data.testimonial.map((item, index) => {
                    const countryImage = item?.country_image || item?.country_img;
                    const countryImg =
                      typeof countryImage === "string" ? countryImage : countryImage?.url;
                    return countryImg ? (
                      <Image
                        key={index}
                        src={countryImg}
                        loading="lazy"
                        width={1010}
                        height={666}
                        alt={countryImage?.alt || item.country_code || "Country Map"}
                        aria-label={countryImage?.alt || item.country_code}
                        className={`w-auto max-w-none h-full absolute z-0 duration-1000 ease-linear ${
                          activeIndex === index ? "opacity-100" : "opacity-0"
                        }`}
                        style={{
                          width: "auto",
                          transform: `translate(${mapTransform.x}%, ${mapTransform.y}%) scale(${mapTransform.scale || 1})`,
                        }}
                      />
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>

          {data?.testimonial && (
            <div className="testimonial-large w-9/12 max-lg:w-6/12 max-md:w-full max-md:pl-0 pl-60">
              <div className="block h-full relative testimonial-slider">
                <div className="testimonial-slides-area pr-30">
                  {data.testimonial.map((item, index) => (
                    <div
                      key={index}
                      className={`testimonial-slide testimonial-item${index === activeIndex ? " active" : ""}`}
                      aria-hidden={index !== activeIndex}
                    >
                      {Number(item?.rating) > 0 && (
                        <div className="rating-stars-wrapper flex gap-5 mb-20">
                          {(() => {
                            const rating = Number(item.rating);
                            const fullStars = Math.floor(rating);
                            const emptyStars = 5 - fullStars - (rating % 1 !== 0 ? 1 : 0);
                            return (
                              <>
                                {Array.from({ length: fullStars }).map((_, i) => (
                                  <Image
                                    key={`full-${i}`}
                                    src={RATING_STAR_ICON}
                                    width={20}
                                    height={20}
                                    alt="full star"
                                    aria-label="Star"
                                  />
                                ))}
                                {Array.from({ length: emptyStars }).map((_, i) => (
                                  <Image
                                    key={`empty-${i}`}
                                    src={RATING_STAR_OUTLINE_ICON}
                                    width={20}
                                    height={20}
                                    alt="empty star"
                                    aria-label="Star"
                                  />
                                ))}
                              </>
                            );
                          })()}
                        </div>
                      )}
                      {item?.description && (
                        <div className="content review-content">
                          <p>{`"${item.description}"`}</p>
                        </div>
                      )}
                      {item?.name && (
                        <div className="reviewer-name mt-30 flex max-769:mt-20">
                          <span>{item.name}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div
                  className="swiper-pagination"
                  role="tablist"
                  aria-label="Testimonial navigation"
                >
                  {data.testimonial.map((_, idx) => (
                    <button
                      key={idx}
                      role="tab"
                      aria-selected={idx === activeIndex}
                      onClick={() => setActiveIndex(idx)}
                      className={`swiper-pagination-bullet${idx === activeIndex ? " swiper-pagination-bullet-active" : ""}`}
                      aria-label={`Go to testimonial ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
