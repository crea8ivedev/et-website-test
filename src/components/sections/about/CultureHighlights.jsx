"use client";
import React from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

const getYouTubeId = (url) => {
  if (!url) return "";
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
};

export default function CultureHighlights({ data }) {
  return (
    <section className="culture-wrapper py-80 max-lg:py-40 overflow-clip">
      <div className="container-fluid-lg">
        <div className="flex flex-col items-start justify-start w-full m-0 p-0 lg:gap-60">
          <div className="w-full lg:w-7/12">
            {data?.title && (
              <div className="title title-white">
                <h2>{safeParse(data.title)}</h2>
              </div>
            )}
          </div>
          {data?.culture_highlights?.map((item, index) => {
            const videoId = getYouTubeId(item.video_url || item.video);
            const imgObj = item.image;
            const imgSrc = typeof imgObj === "string" ? imgObj : imgObj?.url;
            const imgAlt = imgObj?.alt || item.heading || "Culture highlight";
            return (
              <div
                key={index}
                className="flex flex-wrap items-center sticky top-80 justify-center m-0 p-0 max-lg:py-20 w-full gap-40 bg-black-800"
              >
                <div className="w-full lg:flex-1">
                  {item.heading && (
                    <div className="title title-white mb-20">
                      <h3>{safeParse(item.heading)}</h3>
                    </div>
                  )}
                  {item.description && <div className="content">{safeParse(item.description)}</div>}
                </div>
                <div className="w-full lg:flex-1">
                  <div className="relative w-full aspect-video overflow-hidden rounded-10 bg-black-600">
                    {videoId ? (
                      <iframe
                        className="absolute inset-0 size-full"
                        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&loop=1&playlist=${videoId}&controls=0&rel=0&modestbranding=1`}
                        title="Encircle culture video"
                        frameBorder="0"
                        allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : imgSrc ? (
                      <Image
                        src={imgSrc}
                        alt={imgAlt}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
