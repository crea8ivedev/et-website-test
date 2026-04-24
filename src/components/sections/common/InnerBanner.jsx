"use client";
import React, { useRef, useId, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";

const SingleETShapeVideo = ({ src, poster }) => {
  const clipId = useId().replace(/:/g, "");
  const videoElRef = useRef(null);

  useEffect(() => {
    const el = videoElRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.play().catch(() => {});
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div className="relative w-full max-w-full aspect-[2/1] inner-banner-video-reveal">
      <svg className="absolute size-0" aria-hidden="true" focusable="false">
        <defs>
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <rect x="0" y="0" width="0.14" height="1" />
            <rect x="0" y="0" width="0.42" height="0.26" />
            <rect x="0" y="0.37" width="0.34" height="0.26" />
            <rect x="0" y="0.74" width="0.42" height="0.26" />
            <rect x="0.46" y="0" width="0.54" height="0.26" />
            <rect x="0.66" y="0.26" width="0.16" height="0.74" />
          </clipPath>
        </defs>
      </svg>
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `url(#${clipId})` }}>
        <video
          ref={videoElRef}
          src={src}
          muted
          loop
          playsInline
          preload="none"
          poster={poster ? poster : ""}
          className="w-full h-full object-cover"
          style={{ transform: "scale(1.5)" }}
          aria-label="Web development video"
        />
      </div>
    </div>
  );
};

export default function InnerBanner({ data, title }) {
  return (
    <section
      className={`inner-banner-wrapper max-lg:pb-50 pb-80 pt-148 relative overflow-hidden ${data.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid-lg">
        <div className="flex flex-wrap items-center justify-between max-xl:gap-30 lg:pt-50">
          {data?.breadcrumbs && (
            <ul className="flex flex-wrap items-center p-0 xl:mb-20 relative gap-10 w-full fade-up">
              <li>
                <Link
                  role="link"
                  aria-label="You can click on this icon to navigate to the home page."
                  aria-expanded="false"
                  aria-current="page"
                  href="/"
                >
                  <Image
                    src="/icons/ui/ring.png"
                    width="20"
                    height="20"
                    alt="encircle technologies"
                    aria-label="Encircle Technologies"
                    className="img-fluid"
                  />
                </Link>
              </li>
              {data.breadcrumbs.map((item, index) => (
                <React.Fragment key={index}>
                  <li>/</li>
                  {item?.title?.url === "#" || !item?.title?.url ? (
                    <li>
                      <span>{item?.title?.title ? safeParse(item.title.title) : ""}</span>
                    </li>
                  ) : (
                    <li>
                      <Link
                        href={item?.title?.url}
                        className="duration-300 ease-linear hover:text-gold"
                        role="link"
                        aria-label={`You can click on this to navigate to the ${item?.title?.title?.toLowerCase()} page.`}
                        aria-expanded="false"
                        aria-current="page"
                      >
                        {item?.title?.title}
                      </Link>
                    </li>
                  )}
                </React.Fragment>
              ))}
            </ul>
          )}
          <div className="w-full">
            <div className="flex flex-wrap items-stretch gap-y-40 w-full">
              <div className="services-banner w-full lg:pr-40 lg:max-w-7/12">
                {data?.heading && (
                  <div className="title title-white text-white mb-20 capitalize">
                    <h1 className="inner-banner-heading">{safeParse(data.heading)}</h1>
                  </div>
                )}
                {data?.short_description && (
                  <div className="content mb-40 max-639:mb-20">
                    <div className="inner-banner-desc">{safeParse(data.short_description)}</div>
                  </div>
                )}

                <div className="flex flex-wrap gap-30 max-575:gap-20 575:items-center">
                  {data?.button && (
                    <div className="fade-up">
                      <Link href={data.button.url} className="btn" aria-label={data.button.title}>
                        <span className="btn-txt">
                          {data.button.title}
                          <span className="btn-txt-extra" data-txt={data.button.title}></span>
                        </span>
                      </Link>
                    </div>
                  )}
                  {data?.services_button && (
                    <div className="fade-up">
                      <Link
                        href={data.services_button.url}
                        className="btn"
                        aria-label={data.services_button.title}
                      >
                        <span className="btn-txt">
                          {data.services_button.title}
                          <span
                            className="btn-txt-extra"
                            data-txt={data.services_button.title}
                          ></span>
                        </span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
              <div className="services-img-grid w-full lg:pl-40 lg:max-w-5/12 relative">
                <SingleETShapeVideo
                  src="/videos/inner-banner-video.mp4"
                  poster={
                    typeof data.poster_image === "string"
                      ? data.poster_image
                      : data.poster_image?.url || ""
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
