"use client";
import React, { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";
import digitalSuccessImages from "@/data/digitalSuccessImages.json";

export default function AchieveDigitalSuccess({ data }) {
  const images = digitalSuccessImages;

  const repeatedRow1 = useMemo(() => {
    const row = images.slice(0, Math.ceil(images.length / 2));
    return [...row, ...row, ...row];
  }, [images]);

  const repeatedRow2 = useMemo(() => {
    const row = images.slice(Math.ceil(images.length / 2));
    return [...row, ...row, ...row];
  }, [images]);

  if (!data) return null;

  const heading = data?.heading || "";
  const description = data?.description || "";
  const button = data?.cta_button || null;

  const col1Images = images.slice(0, 3);
  const col3Images = images.slice(3, 6);

  return (
    <section
      className={`industries-wrapper flex flex-col justify-center lg:h-[80dvh] relative max-lg:overflow-hidden max-lg:py-50 ${data?.extra_class ? ` ${data.extra_class}` : ""}`}
      id={data?.extra_id || ""}
    >
      <div className="absolute top-1/2 left-1/2 -translate-1/2 w-[calc(100%_-_120px)]">
        <div className="max-lg:hidden grid grid-cols-3 gap-80">
          <div className="card-block">
            <div className="flex flex-col gap-40">
              {col1Images.map((img, idx) => (
                <Reveal key={idx} delay={idx * 100}>
                  <Image
                    src={
                      typeof img === "string"
                        ? img
                        : img.image_gallery || img.image?.url || img?.url
                    }
                    className={`w-[15.5dvw] h-full object-cover rounded-10 outline-2 outline-black-600 outline-offset-4 ${idx === 1 ? "mr-auto" : "mx-auto"}`}
                    width={1112}
                    height={690}
                    alt={(typeof img === "object" ? img.image?.alt || img?.alt : "") || "industry"}
                  />
                </Reveal>
              ))}
            </div>
          </div>

          <div className="card-block"></div>

          <div className="card-block">
            <div className="flex flex-col gap-40">
              {col3Images.map((img, idx) => (
                <Reveal key={idx} delay={idx * 100}>
                  <Image
                    src={
                      typeof img === "string"
                        ? img
                        : img.image_gallery || img.image?.url || img?.url
                    }
                    className={`w-[15.5dvw] h-full object-cover rounded-10 outline-2 outline-black-600 outline-offset-4 ${idx === 1 ? "ml-auto" : "mx-auto"}`}
                    width={1112}
                    height={690}
                    alt={(typeof img === "object" ? img.image?.alt || img?.alt : "") || "industry"}
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container-fluid-xl">
        <div className="absolute top-1/2 left-1/2 -translate-1/2 size-4/12 rounded-full bg-gradient-to-br from-gold via-black-500 to-black-800 blur-[80px] -z-1 opacity-50" />
        <div className="flex flex-col items-center justify-center w-full gap-y-40 m-0 p-0 relative z-1">
          <div className="w-full lg:w-7/12">
            <div className="flex flex-col sm:items-center justify-center w-full sm:text-center">
              {heading && (
                <Reveal className="title title-white mb-20">
                  <h2>{safeParse(heading)}</h2>
                </Reveal>
              )}
              {description && (
                <Reveal className="content mb-40" delay={100}>
                  <p>{safeParse(description)}</p>
                </Reveal>
              )}
              {button && button.url && (
                <Link
                  href={button.url}
                  aria-label={button.title || "Contact Us Today!"}
                  className="btn btn-white"
                  target={button.target || ""}
                >
                  <span className="btn-txt">
                    {button.title || "Contact Us Today!"}
                    <span
                      className="btn-txt-extra"
                      data-txt={button.title || "Contact Us Today!"}
                    ></span>
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:hidden max-lg:mt-40">
        <div className="digital-success-marquee overflow-hidden">
          <div className="digital-success-marquee-track flex gap-20 mb-20 will-change-transform">
            {repeatedRow1.map((img, i) => (
              <div key={i} className="aspect-video w-full max-w-160 flex-none">
                <Image
                  src={
                    typeof img === "string" ? img : img.image_gallery || img.image?.url || img?.url
                  }
                  className="w-full h-full object-cover rounded-10"
                  width={1112}
                  height={690}
                  sizes="16vw"
                  alt={(typeof img === "object" ? img.image?.alt || img?.alt : "") || "industry"}
                  aria-label={
                    (typeof img === "object" ? img.image?.alt || img?.alt : "") || "industry"
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <div className="digital-success-marquee overflow-hidden">
          <div className="digital-success-marquee-track-reverse flex gap-20 mt-20 will-change-transform">
            {repeatedRow2.map((img, i) => (
              <div key={i} className="aspect-video w-full max-w-160 flex-none">
                <Image
                  src={
                    typeof img === "string" ? img : img.image_gallery || img.image?.url || img?.url
                  }
                  className="w-full h-full object-cover rounded-10"
                  width={1112}
                  height={690}
                  sizes="16vw"
                  alt={(typeof img === "object" ? img.image?.alt || img?.alt : "") || "industry"}
                  aria-label={
                    (typeof img === "object" ? img.image?.alt || img?.alt : "") || "industry"
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
