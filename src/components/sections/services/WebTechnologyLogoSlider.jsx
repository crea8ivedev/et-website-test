"use client";
import React, { useState } from "react";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";
import TechnologyLogoMarqueeRows from "@/components/sections/services/TechnologyLogoMarqueeRows";

export default function WebTechnologyLogoSlider({ data, title }) {
  const [activeIndex, setActiveIndex] = useState(null);

  if (!data) return null;

  const heading = data?.heading || "";
  const ctaButton = data?.cta_button || {};
  return (
    <section
      className={`technologies pt-80 max-lg:pt-40 ${data?.extra_class ? ` ${data.extra_class}` : ""} in-view`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid">
        <div className="top-info max-sm:text-left text-center flex flex-wrap justify-between max-w-800 mx-auto mb-40">
          {heading && (
            <div className={`title title-white mb-30 fade-up in-view`}>
              <h2>{safeParse(heading)}</h2>
            </div>
          )}
          {ctaButton?.url && (
            <Link
              href={ctaButton.url}
              target={ctaButton.target || "_self"}
              aria-label={ctaButton.title || "Let's talk"}
              className={`btn sm:mx-auto fade-up delay-01 in-view`}
            >
              <span className="btn-txt">
                {ctaButton.title}
                <span className="btn-txt-extra" data-txt={ctaButton.title}></span>
              </span>
            </Link>
          )}
        </div>
      </div>
      <div className="technology-marquee-wrapper py-15 relative z-1 mt-auto w-full">
        <div
          className={`logo-marquee-pause group w-full xl:max-w-9/12 min-1500:max-w-7/12 mx-auto relative overflow-hidden fade-up delay-02 in-view`}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <div
            className="logo-marquee-track flex w-max gap-65 transform-gpu"
            style={{ "--logo-marquee-duration": "60s" }}
          >
            <TechnologyLogoMarqueeRows
              copies={["a", "b"]}
              rowClassName="flex items-center gap-65"
              isCopyAriaHidden={(_copy, copyIndex) => copyIndex === 1}
              includeTitle
              linkClassName="hero-icon-link"
              getItemLinkClassName={(itemIndex) => (activeIndex === itemIndex ? "active" : "")}
              onItemMouseEnter={(itemIndex) => setActiveIndex(itemIndex)}
              onItemMouseLeave={() => setActiveIndex(null)}
              imageClassName="object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
