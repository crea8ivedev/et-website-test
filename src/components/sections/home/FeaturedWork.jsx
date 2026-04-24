"use client";
import React, { useRef, useState, useLayoutEffect, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

function AutoPlayVideo({ src, poster, className }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
        } else {
          el.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={videoRef}
      crossOrigin="anonymous"
      muted
      loop
      playsInline
      preload="none"
      poster={poster}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}

export default function FeaturedWork({ data }) {
  const showcaseSectionRef = useRef(null);
  const titleRef = useRef(null);
  const caseRef = useRef(null);
  const cardsWrapperRef = useRef(null);
  const [titleWidth, setTitleWidth] = useState(0);
  const [vw, setVw] = useState(0);
  const [scrollHeight, setScrollHeight] = useState(0);

  useLayoutEffect(() => {
    const update = () => {
      setVw(window.innerWidth);
      if (titleRef.current) {
        setTitleWidth(titleRef.current.offsetWidth);
      }
      if (cardsWrapperRef.current) {
        const cardsHeight = cardsWrapperRef.current.scrollHeight;
        const vh = window.innerHeight;
        const dynamicScroll = cardsHeight - vh + vh * 1;
        setScrollHeight(dynamicScroll);
      }
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Vanilla scroll-tied transforms — replaces framer-motion useScroll/useTransform.
  // Writes transforms directly to DOM inside rAF, so React never re-renders on scroll.
  useEffect(() => {
    const section = showcaseSectionRef.current;
    if (!section) return;

    let raf = null;

    const update = () => {
      raf = null;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;

      // Mirrors useScroll offset ["start start", "end end"]:
      //   progress = 0 when rect.top === 0, progress = 1 when rect.bottom === vh.
      const caseStart = 0;
      const caseEnd = vh - rect.height;
      const caseProgress =
        caseEnd !== caseStart
          ? Math.max(0, Math.min(1, (caseStart - rect.top) / (caseStart - caseEnd)))
          : 0;

      if (caseRef.current) {
        const y = window.innerWidth >= 1024 ? -caseProgress * scrollHeight : 0;
        caseRef.current.style.transform = `translate3d(0, ${y}px, 0)`;
      }

      // Mirrors useScroll offset ["start 80%", "95% 95%"]:
      //   start = rect.top at 80% of viewport, end = rect.top + rect.height*0.95 at 95% of viewport.
      const titleStart = vh * 0.8;
      const titleEnd = vh * 0.95 - rect.height * 0.95;
      const titleProgress =
        titleEnd !== titleStart
          ? Math.max(0, Math.min(1, (titleStart - rect.top) / (titleStart - titleEnd)))
          : 0;

      if (titleRef.current) {
        // Lerp from vw → -titleWidth (right side off-screen → left side off-screen).
        const x = vw + (-titleWidth - vw) * titleProgress;
        titleRef.current.style.transform = `translate3d(${x}px, 0, 0)`;
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [scrollHeight, titleWidth, vw]);

  return (
    <section
      ref={showcaseSectionRef}
      className={`work-wrapper relative py-80 max-lg:py-40${data.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
      style={{ height: vw >= 1024 ? `${scrollHeight}px` : "auto" }}
    >
      <div className="absolute -left-[25vw] top-[50vh] w-[50vw] h-[50vw] bg-gold/10 blur-3xl rounded-full rotate-17 z-1"></div>
      <div className="lg:sticky lg:top-0 lg:h-screen overflow-hidden z-1">
        <div className="container-fluid h-full flex flex-col justify-start gap-80">
          {data?.heading && (
            <div
              ref={titleRef}
              className="title title-white capitalize font-semibold !opacity-10 fade-up will-change-transform"
            >
              <h2>{data.heading}</h2>
            </div>
          )}
          {data?.featured_work_info && (
            <div
              ref={caseRef}
              className="case lg:absolute lg:top-1/2 left-0 w-full h-full will-change-transform"
            >
              <div
                ref={cardsWrapperRef}
                className="flex flex-col items-center justify-center max-lg:gap-40 gap-60 w-full"
              >
                {data.featured_work_info.map((item, index) => (
                  <div
                    className={`w-full md:w-1/2 xl:w-2/5 lg:px-22 flex-1 flex flex-col gap-26 p-0 ${index % 2 === 0 ? "self-start" : "self-end"}`}
                    key={index}
                  >
                    <Link href={item.link?.url || item.link || "#"}>
                      <div className="flex flex-col relative min-w-0 wrap-break-word rounded-10 p-0">
                        {(() => {
                          const videoRaw = item.videos || item.video || item.video_file;
                          const imageRaw = item.image || item.image_file;
                          const videoSrc = typeof videoRaw === "string" ? videoRaw : videoRaw?.url;
                          const imageSrc = typeof imageRaw === "string" ? imageRaw : imageRaw?.url;

                          if (videoSrc) {
                            return (
                              <div className="relative w-full h-0 pb-[100%] overflow-hidden rounded-10 fade-in">
                                <AutoPlayVideo
                                  src={videoSrc}
                                  poster={
                                    imageSrc
                                      ? `/_next/image?url=${encodeURIComponent(imageSrc)}&w=800&q=75`
                                      : ""
                                  }
                                  className="absolute inset-0 flex items-center justify-center size-full object-cover"
                                />
                              </div>
                            );
                          } else if (imageSrc) {
                            return (
                              <div className="relative w-full h-0 pb-[100%] overflow-hidden rounded-10 fade-in">
                                <Image
                                  src={imageSrc}
                                  alt={item.title || "Featured Work Image"}
                                  fill
                                  sizes="(max-width: 768px) 100vw, 50vw"
                                  className="object-cover"
                                  loading="lazy"
                                />
                              </div>
                            );
                          }
                          return null;
                        })()}
                        <div className="absolute flex flex-col gap-20 max-sm:left-20 max-sm:top-20 left-[2.5dvw] top-[4dvh]">
                          {item.title && (
                            <div className={`title title-white capitalize fade-up delay-01`}>
                              <h3 className="h5">{item.title}</h3>
                            </div>
                          )}
                          {item.list_grid && (
                            <ul className="tag flex flex-wrap list-none gap-[0.25rem] p-0 fade-up delay-01">
                              {item.list_grid.map(
                                (list_item, grid_index) =>
                                  list_item.title && (
                                    <li className="flex items-start" key={grid_index}>
                                      <span
                                        className={`inline-flex align-top items-center max-w-full max-lg:text-body-5 rounded-10 min-h-[1.5rem] min-w-[1.5rem] px-[0.625rem] py-[0.375rem] border border-white text-white`}
                                      >
                                        <span>{list_item.title}</span>
                                      </span>
                                    </li>
                                  )
                              )}
                            </ul>
                          )}
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {data?.button && (
        <div className="lg:absolute lg:bottom-100 lg:left-1/2 lg:-translate-x-1/2 w-full flex justify-center mt-40 z-1">
          <Link
            href={data.button.url}
            aria-label={data.button.title}
            className="btn fade-up delay-01"
          >
            <span className="btn-txt">
              {data.button.title}
              <span className="btn-txt-extra" data-txt={data.button.title}></span>
            </span>
          </Link>
        </div>
      )}
    </section>
  );
}
