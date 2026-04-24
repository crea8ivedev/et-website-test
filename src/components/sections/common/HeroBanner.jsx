"use client";
import React, { useState } from "react";
import Link from "next/link";
import RadialMarquee from "@/components/sections/common/RadialMarquee";
import TechnologyLogoMarqueeRows from "@/components/sections/services/TechnologyLogoMarqueeRows";

export default function HeroBanner({ data }) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <>
      <section
        className={`banner-wrapper max-lg:pb-50 pb-60 pt-118 relative z-1${
          data?.extra_class ? ` ${data.extra_class}` : ""
        }`}
        id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
      >
        <div className="banner-content px-20 max-lg:mt-0 mt-40">
          <div className="title flex flex-col max-lg:gap-0 gap-20 items-center justify-center mx-auto text-center relative">
            <div className="inline-block text-white relative">
              <h1 className="flex flex-col items-center">
                <div className="flex items-center justify-center hero-h1-line hero-h1-line--1">
                  WE CRAFT
                  <lord-icon
                    src="https://cdn.lordicon.com/jgeruqwm.json"
                    trigger="loop"
                    state="loop-rotate"
                    colors="primary:#eda800,secondary:#f4dc9c"
                    className="w-80 h-80 max-1025:size-60 max-575:size-40"
                  ></lord-icon>
                  CUSTOM WEB
                </div>
                <div className="flex items-center justify-center hero-h1-line hero-h1-line--2">
                  EXPERIENCES THAT DRIVE
                </div>
                <div className="flex items-center justify-center hero-h1-line hero-h1-line--3">
                  YOUR BUSINESS
                  <lord-icon
                    src="https://cdn.lordicon.com/sqqsmbzs.json"
                    trigger="loop"
                    colors="primary:#eda800,secondary:#f4dc9c"
                    className="w-80 h-80 max-1025:size-60 max-575:size-40"
                  ></lord-icon>
                  GROWTH.
                </div>
              </h1>
            </div>
          </div>
        </div>

        {data?.button && (
          <Link
            href={data.button.url || "#"}
            target={data.button.target || "_self"}
            aria-label={data.button.title}
            className="mt-40 btn mx-auto"
          >
            <span className="btn-txt">
              {data.button.title}
              <span className="btn-txt-extra" data-txt={data.button.title}></span>
            </span>
          </Link>
        )}

        {/* {data?.video_grid && (
          <div className="banner-marquee-row overflow-hidden mt-40">
            <RadialMarquee data={data} />
          </div>
        )} */}

        <div className="technology-marquee-wrapper py-15 relative z-1 mt-auto w-full">
          <div className="group w-full lg:max-w-9/12 min-1500:max-w-7/12 mx-auto relative overflow-hidden">
            <div className={`hero-icon-marquee${isPaused ? " is-paused" : ""}`}>
              <TechnologyLogoMarqueeRows
                copies={[0, 1]}
                rowClassName="flex items-center gap-65 pr-65"
                isCopyAriaHidden={(_copy, copyIndex) => copyIndex === 1}
                linkClassName="hero-icon-link"
                onItemMouseEnter={() => setIsPaused(true)}
                onItemMouseLeave={() => setIsPaused(false)}
                getImagePriority={(itemIndex, _copy, copyIndex) => copyIndex === 0 && itemIndex < 3}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
