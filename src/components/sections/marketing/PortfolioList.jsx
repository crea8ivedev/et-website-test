"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Reveal } from "@/components/common/Reveal";

export default function PortfolioList({ data }) {
  const [visibleCount, setVisibleCount] = useState(6);

  if (!data || !data.portfolio_grid) return null;

  const { portfolio_grid, extra_class, extra_id } = data;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 4);
  };

  const visibleProjects = portfolio_grid.slice(0, visibleCount);

  const getMediaUrl = (media) => {
    if (!media) return "";
    if (typeof media === "string") return media;
    return media.url || media.sourceUrl || "";
  };

  const getPosterImage = (media) => {
    if (!media) return null;
    if (typeof media === "string") return { src: media, alt: "" };

    return {
      src:
        media.sizes?.large ||
        media.sizes?.medium_large ||
        media.sizes?.medium ||
        media.sizes?.thumbnail ||
        media.url ||
        "",
      alt: media.alt || media.alt_text || media.title || "",
    };
  };

  return (
    <section
      className={`work-wrapper relative py-80 max-lg:py-40 ${extra_class ? ` ${extra_class}` : ""}`}
      id={extra_id ? extra_id : undefined}
    >
      <div className="container-fluid">
        <div className="flex flex-col items-center justify-center max-lg:gap-y-40 gap-60 w-full mb-60">
          <>
            {visibleProjects.map((item, index) => {
              const isEven = index % 2 === 0;
              const alignmentClass = isEven ? "mr-auto" : "ml-auto";
              const textColorClass = isEven ? "text-white" : "text-white";
              const borderColorClass = isEven ? "border-white" : "border-black-600";
              const videoSrc = getMediaUrl(item.video || item.video_url);
              const posterImage = getPosterImage(item.poster_images || item.poster_image);

              return (
                <Reveal
                  key={index}
                  delay={Math.min(500, (index % 6) * 100)}
                  className={`w-full md:w-6/12 lg:w-5/12 lg:px-25 p-0 ${alignmentClass}`}
                >
                  <Link
                    href={item.link?.url || "#"}
                    target={item.link?.target || "_self"}
                    aria-label={`View details for ${item.heading || "this project"}`}
                  >
                    <div className="flex flex-col relative min-w-0 wrap-break-word rounded-10 group">
                      <div className="relative flex-1 flex flex-col gap-26 p-0">
                        <div className="relative w-full aspect-square overflow-hidden rounded-10">
                          {videoSrc ? (
                            <video
                              crossOrigin="anonymous"
                              muted
                              autoPlay
                              loop
                              playsInline
                              poster={posterImage?.src || undefined}
                              className="absolute inset-0 flex items-center justify-center w-full h-full object-cover"
                            >
                              <source src={videoSrc} type="video/mp4" />
                            </video>
                          ) : (
                            posterImage?.src && (
                              <Image
                                src={posterImage.src}
                                width={800}
                                height={800}
                                alt={posterImage.alt || item.heading || "Portfolio item"}
                                aria-label={posterImage.alt || item.heading || "Portfolio item"}
                                className="absolute inset-0 flex items-center justify-center w-full h-full object-cover"
                              />
                            )
                          )}
                        </div>
                        <div className="absolute inset-0 p-20 lg:p-40 flex flex-col gap-20">
                          {item.heading && (
                            <h3 className={`${textColorClass} capitalize`}>{item.heading}</h3>
                          )}
                          {item.list_grid && item.list_grid.length > 0 && (
                            <ul className="flex flex-wrap list-none gap-[0.25rem] p-0">
                              {item.list_grid.map((tag, tagIndex) => (
                                <li key={tagIndex} className="flex items-start">
                                  <span
                                    className={`inline-flex align-top items-center max-w-full leading-[1.2] rounded-10 ${textColorClass} min-h-[1.5rem] min-w-[1.5rem] px-[0.625rem] py-[0.375rem] border ${borderColorClass}`}
                                  >
                                    {tag.title}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                </Reveal>
              );
            })}
          </>
        </div>

        {visibleCount < portfolio_grid.length && (
          <div className="flex justify-center mt-40">
            <button onClick={handleLoadMore} className="btn" aria-label="Load more portfolio items">
              <span className="btn-txt">
                Load More
                <span className="btn-txt-extra" data-txt="Load More"></span>
              </span>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
