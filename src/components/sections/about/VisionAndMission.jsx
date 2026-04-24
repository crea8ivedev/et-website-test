"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

const VisionAndMission = ({ data }) => {
  const words = data?.right_heading_words?.map((w) => w.word) || ["Simple", "Creative", "Powerful"];
  const [currentWord, setCurrentWord] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const id = setInterval(() => setCurrentWord((p) => (p + 1) % words.length), 10000);
    return () => clearInterval(id);
  }, [words.length]);

  if (!data) return null;

  const {
    left_heading,
    right_heading_words,
    image,
    img,
    short_description,
    vision_and_mission_content,
    extra_id,
    extra_class,
  } = data;
  const media = image || img;
  const mediaSrc = typeof media === "string" ? media : media?.url || "";
  const isVideoLike = typeof media?.mime_type === "string" && media.mime_type.startsWith("video/");
  const isGifLike =
    typeof media?.mime_type === "string"
      ? media.mime_type === "image/gif"
      : /\.gif($|\?)/i.test(mediaSrc);

  return (
    <section
      id={extra_id}
      className={`wearepowerful-wrapper relative py-80 max-lg:py-40 overflow-hidden ${extra_class || ""}`}
    >
      <div className="container-fluid-lg">
        <div className="lg:text-center mb-40">
          <div className="mb-20 relative overflow-hidden flex flex-wrap items-center lg:justify-center">
            <h2 className="mr-10">{left_heading}</h2>
            <h2 className="inline-flex">
              <span
                className="relative inline-flex items-center justify-center overflow-hidden align-middle h-[1.25em] min-w-[6.5ch]"
                style={{
                  WebkitMaskImage:
                    "linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)",
                  maskImage:
                    "linear-gradient(to bottom, transparent 0%, #000 28%, #000 72%, transparent 100%)",
                }}
              >
                <span
                  key={currentWord}
                  className="rotating-word absolute inset-0 flex text-transparent bg-clip-text bg-gradient-to-br from-white via-gold to-gold font-bold"
                >
                  {words[currentWord]}
                </span>
              </span>
            </h2>
          </div>
          <div className="content">{safeParse(short_description || "")}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-30 lg:gap-80 mt-0 lg:mt-60">
          <div className="left-side-img flex justify-center items-center max-lg:order-2">
            {mediaSrc &&
              (isVideoLike ? (
                <video
                  src={mediaSrc}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  className="inset-0 size-full object-cover rounded-10"
                  aria-label={media?.alt || "Vision and Mission"}
                />
              ) : isGifLike ? (
                <img
                  src={mediaSrc}
                  alt={media?.alt || "Vision and Mission"}
                  aria-label={media?.alt || "Vision and Mission"}
                  className="inset-0 size-full object-cover rounded-10"
                />
              ) : (
                <Image
                  src={mediaSrc}
                  width={550}
                  height={450}
                  alt={media?.alt || "Vision and Mission"}
                  aria-label={media?.alt || "Vision and Mission"}
                  className="inset-0 size-full object-cover rounded-10"
                />
              ))}
          </div>
          <div className="right-side-content flex flex-col justify-center items-center gap-30 lg:gap-60 max-lg:order-1">
            {vision_and_mission_content?.map((item, index) => (
              <div key={index} className="w-full">
                <div className="sm:mb-20 mb-10">
                  <h3 className="max-575:!text-28">{item.word}</h3>
                </div>
                <div className="content">{safeParse(item.description || "")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionAndMission;
