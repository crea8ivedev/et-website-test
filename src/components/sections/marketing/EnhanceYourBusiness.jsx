"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";
import { CIRCLE_SVG } from "@/constants";

const CIRCUMFERENCE = 2075;

export default function EnhanceYourBusiness({ data }) {
  const safeData = data ?? {};
  const { heading = "", description = "", cta_button = null } = safeData;

  const videoItems = safeData.videos?.length
    ? safeData.videos
    : safeData.video
      ? [safeData.video]
      : [];

  const firstVideo = videoItems[0] ?? null;
  const videoSrc = firstVideo?.video_url || firstVideo?.video_file?.url || firstVideo?.url || "";

  if (!data) return null;

  return (
    <section
      className={`textMedia-wrapper py-80 max-lg:py-40 in-view ${safeData?.extra_class || ""}`}
      id={safeData?.extra_id || ""}
    >
      <div className="container-fluid-lg">
        <div className="flex flex-wrap items-start justify-start w-full m-0 max-lg:gap-60">
          <div className="w-full lg:flex-1 lg:pr-60 flex flex-col relative">
            {heading && (
              <div className={`title title-white mb-20 fade-up in-view`}>
                <h2>{safeParse(heading || "")}</h2>
              </div>
            )}
            {description && (
              <div className={`content mb-40 fade-up delay-01 in-view`}>
                <div>{safeParse(description)}</div>
              </div>
            )}
            {cta_button?.title && (
              <Link href={cta_button.url || "#"} className={`btn fade-up delay-01 in-view`}>
                <span className="btn-txt">
                  {cta_button.title}
                  <span className="btn-txt-extra" data-txt={cta_button.title} />
                </span>
              </Link>
            )}
          </div>

          <div className="w-full lg:flex-1 aspect-square lg:max-h-500 max-lg:mx-auto lg:ml-auto flex relative justify-center items-center">
            <div className="absolute flex w-full h-full lg:max-w-500 items-center justify-center fade-in">
              <div className="absolute w-full h-full z-0">
                <Image
                  src={CIRCLE_SVG}
                  width={680}
                  height={680}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 680 680"
                  fill="none"
                  className="flex w-full h-full relative z-1"
                >
                  <circle
                    cx="339.902"
                    cy="339.902"
                    r="329.902"
                    fill="none"
                    stroke="var(--color-black-800, #1a1a1a)"
                    strokeWidth="22"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    className="stroke-erase-ring built-with__progress-bar stroke-black-800"
                    transform="matrix(0,-1,1,0,0,679.80402)"
                    style={{ transformOrigin: "0px 0px" }}
                  />
                </svg>
              </div>
              <div className="flex items-center justify-center aspect-[1.6] relative -rotate-8 w-full max-md:mx-20 md:w-[40em]">
                {videoSrc ? (
                  <div className="absolute inset-0 w-full h-full overflow-hidden rounded-10">
                    <video
                      muted
                      loop
                      autoPlay
                      playsInline
                      src={videoSrc}
                      className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
