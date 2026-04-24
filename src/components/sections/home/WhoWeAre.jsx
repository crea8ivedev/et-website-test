"use client";
import React, { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

function Counter({ value, duration = 2, start }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!start) return;
    const el = ref.current;
    if (!el) return;

    const target = Number(value) || 0;
    const durationMs = duration * 1000;
    const formatter = new Intl.NumberFormat("en-US");
    const t0 = performance.now();
    let raf;

    const tick = (now) => {
      const t = Math.min(1, (now - t0) / durationMs);
      // ease-out cubic — matches the settle feel of the previous spring
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = formatter.format(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [start, value, duration]);

  return <span ref={ref}>0</span>;
}

export default function WhoWeAre({ data }) {
  const counterRef = useRef(null);
  const popupVideoRef = useRef(null);
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [isSectionInView, setIsSectionInView] = useState(false);

  useEffect(() => {
    const el = counterRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsSectionInView(true);
          obs.disconnect();
        }
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const imageRaw = data.image || data.image_file;
  const videoRaw = data.videos || data.video || data.video_file;
  const videoSrc = typeof videoRaw === "string" ? videoRaw : videoRaw?.url;
  const imageSrc = typeof imageRaw === "string" ? imageRaw : imageRaw?.url;
  const hasVideo = !!videoSrc;

  const closeVideoPopup = () => setIsVideoPopupOpen(false);

  useEffect(() => {
    if (!isVideoPopupOpen) return;

    const html = document.documentElement;
    const body = document.body;
    const previousOverflow = html.style.overflow;
    const previousCursor = body.style.cursor;
    html.style.overflow = "hidden";
    body.style.cursor = "auto";

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        closeVideoPopup();
      }
    };
    window.addEventListener("keydown", handleEscape);

    return () => {
      html.style.overflow = previousOverflow;
      body.style.cursor = previousCursor;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isVideoPopupOpen]);

  useEffect(() => {
    if (isVideoPopupOpen) {
      const popupVideo = popupVideoRef.current;
      if (popupVideo) {
        popupVideo.currentTime = 0;
        popupVideo.muted = false;
        void popupVideo.play().catch(() => {});
      }
      return;
    }

    popupVideoRef.current?.pause();
  }, [isVideoPopupOpen]);

  return (
    <>
      <section
        ref={counterRef}
        className={`who-we-are-wrapper relative py-80 max-lg:py-40 overflow-hidden ${data.extra_class ? ` ${data.extra_class}` : ""}`}
        id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
      >
        <div className="container-fluid-md">
          <div className="flex flex-wrap gap-40 xl:gap-x-80 justify-center items-center m-0 p-0 relative w-full">
            <div className="absolute -right-50 max-lg:bottom-0 lg:-top-30 size-450 bg-gold/10 blur-xl rounded-full rotate-15"></div>
            <div className="w-full lg:flex-1">
              {data?.heading && (
                <div className="title title-white mb-40">
                  <h1 className="h2">{safeParse(data.heading)}</h1>
                </div>
              )}
              <div className="flex flex-wrap lg:items-stretch md:justify-center gap-y-30 pb-30">
                {data?.year_number && data?.year_text && (
                  <div className="w-full lg:w-[16vw] lg:pr-20 text-center">
                    <span className="count text-gold text-[15vw] leading-[1] font-heading font-bold">
                      <Counter value={data.year_number} start={isSectionInView} />
                    </span>
                    {data?.year_text && <p>{data.year_text}</p>}
                  </div>
                )}
                {data?.short_description && (
                  <div className="w-full lg:flex-1 lg:pl-20 lg:border-l lg:border-gray/20">
                    <div className="content">{safeParse(data.short_description)}</div>
                  </div>
                )}
              </div>
              {data?.stats_info && (
                <div className="grid max-sm:grid-cols-2 grid-cols-3 w-full text-center rounded-10 border border-gray/20">
                  {data.stats_info.map(
                    (item, index) =>
                      item?.number &&
                      item?.text && (
                        <div
                          className="w-full max-sm:col-span-2 p-20 max-sm:border-b sm:border-r border-gray/20 place-content-center"
                          key={index}
                        >
                          <span className="count max-sm:text-[6vw] text-[3vw] leading-[1] font-heading font-bold mb-10 block">
                            <Counter value={item.number} start={isSectionInView} />+
                          </span>
                          {item?.text && <p>{item.text}</p>}
                        </div>
                      )
                  )}
                </div>
              )}
            </div>
            <div className="w-full lg:flex-1">
              <div className="img relative">
                {imageSrc && (
                  <Image
                    src={imageSrc}
                    className="size-full aspect-video rounded-10 object-cover"
                    width={500}
                    height={501}
                    alt={data.image?.alt || "Who We Are Image"}
                    aria-label={data.image?.alt || "Who We Are"}
                    loading="lazy"
                  />
                )}
                {hasVideo && (
                  <button
                    type="button"
                    className="absolute inset-0 z-10 cursor-pointer"
                    aria-label="Play video"
                    onClick={() => setIsVideoPopupOpen(true)}
                  >
                    <span className="absolute bottom-15 right-15 flex h-[52px] w-[52px] items-center justify-center rounded-full bg-black-800/65 backdrop-blur-md border border-white/50 transition-transform duration-300 hover:scale-110">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path d="M8 6v12l10-6-10-6z" fill="#F6B100" />
                      </svg>
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {isVideoPopupOpen && hasVideo && (
        <div
          className="fixed inset-0 z-999999 bg-black-800/70 backdrop-blur-md px-20 py-20 flex items-center justify-center cursor-auto"
          onClick={closeVideoPopup}
          aria-hidden="true"
        >
          <div
            className="relative w-full max-w-[1200px] rounded-10 overflow-hidden border border-white/20 bg-black cursor-auto"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Who We Are Video Popup"
          >
            <button
              type="button"
              onClick={closeVideoPopup}
              className="absolute top-15 right-15 z-10 size-40 rounded-full bg-black-800/70 border border-white/50 text-white flex items-center justify-center cursor-pointer"
              aria-label="Close video popup"
              title="Close"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>

            <video
              ref={popupVideoRef}
              className="w-full aspect-video object-cover cursor-auto"
              controls
              autoPlay
              playsInline
              preload="none"
            >
              <source src={videoSrc} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </>
  );
}
