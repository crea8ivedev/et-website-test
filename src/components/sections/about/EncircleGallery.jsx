"use client";
import React, { useRef } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";
import { useScrollProgress } from "@/hooks/useScrollProgress";

const lerp = (a, b, t) => a + (b - a) * t;

export default function EncircleGallery({ data }) {
  const scrollableRef = useRef(null);
  const progress = useScrollProgress(scrollableRef, { offset: ["start 80%", "end end"] });

  const EVENT_COLUMNS = Array.from({ length: 5 }, () => []);
  const galleryData = data?.encircle_event_gallery || data?.gallery;
  if (galleryData) {
    galleryData.forEach((item, i) => {
      const imgValue = item?.gallery_image;

      let imgSrc = "";
      if (typeof imgValue === "string") {
        imgSrc = imgValue;
      } else if (imgValue && typeof imgValue === "object") {
        imgSrc = imgValue.url || "";
      }

      if (imgSrc && imgSrc !== "null" && !/^\d+$/.test(imgSrc)) {
        EVENT_COLUMNS[i % 5].push(imgSrc);
      }
    });
  }

  const colStyle = (yStart, opacityStart) => ({
    transform: `translate3d(0, ${lerp(yStart, 0, progress)}px, 0)`,
    opacity: lerp(opacityStart, 1, progress),
    willChange: "transform, opacity",
  });

  return (
    <section
      ref={scrollableRef}
      className="event-wrapper max-lg:pt-50 pt-80 relative overflow-hidden"
    >
      <div className="container-fluid-lg">
        <div className="flex flex-wrap items-start justify-start w-full m-0 p-0">
          <div className="w-full lg:w-8/12">
            {(data?.title || data?.heading) && (
              <div className="title title-white mb-20">
                <h2>{safeParse(data?.title || data?.heading)}</h2>
              </div>
            )}
            {data?.description || (
              <div className="content mb-40">
                {safeParse(data.description || data.short_description)}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="event-scrollable relative">
        <div className="event-body w-full relative grid max-lg:grid-cols-2 grid-cols-5 max-lg:gap-5 gap-10">
          {EVENT_COLUMNS.map((column, colIndex) => {
            const hideOnMobile = colIndex >= 2 ? "max-lg:hidden" : "";

            let style;
            if (colIndex === 2) {
              style = colStyle(100, 0.5);
            } else if (colIndex === 0 || colIndex === 4) {
              style = colStyle(380, 0.2);
            } else {
              style = colStyle(240, 0.4);
            }

            return (
              <div
                key={colIndex}
                className={`flex flex-col max-lg:gap-5 gap-10 ${hideOnMobile}`}
                style={style}
              >
                {column.map((src, imgIndex) => (
                  <div
                    key={imgIndex}
                    className="relative overflow-hidden rounded-10 aspect-[16/10]"
                  >
                    <Image
                      src={src}
                      alt="event"
                      aria-label="Encircle Event Gallery"
                      fill
                      sizes="(max-width: 1024px) 100vw, 20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
