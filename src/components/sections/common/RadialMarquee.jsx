"use client";
import { useState } from "react";
import { useRef } from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

export default function RadialMarquee({ data }) {
  const [isPaused, setIsPaused] = useState(false);
  const videoRefs = useRef([]);

  const handleVideoEnter = (event) => {
    const videoEl = event.currentTarget;
    videoRefs.current.forEach((video) => {
      if (video && video !== videoEl) {
        video.pause();
      }
    });
    void videoEl.play();
    setIsPaused(true);
  };

  const handleVideoLeave = (event) => {
    const videoEl = event.currentTarget;
    videoEl.pause();
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
  };
  return (
    <div className="banner-marquee">
      <div className="banner-marquee-half-circle">
        <div className="banner-marquee-circle">
          <div className={`banner-marquee-collection ${isPaused ? "is-paused" : ""}`}>
            <div className="banner-marquee-list">
              {(() => {
                const base = data.video_grid || [];
                const originalLen = base.length;
                return [...base, ...base, ...base].map((item, i) => ({
                  item,
                  i,
                  // Only the first copy loads actual video; clones show poster/image only
                  isVideoCopy: i < originalLen,
                  originalLen,
                }));
              })().map(({ item, i, isVideoCopy }) => (
                <div
                  key={i}
                  className="banner-marquee-item absolute max-sm:w-[15em] w-[20em]"
                  style={{
                    transform: `translateY(calc((500% * -1) + 50%)) rotate(${i * 20}deg)`,
                  }}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={handleMouseLeave}
                >
                  {(() => {
                    const videoRaw = item.video || item.video_file;
                    const imageRaw = item.image || item.image_file;
                    const videoSrc = typeof videoRaw === "string" ? videoRaw : videoRaw?.url;
                    const imageSrc = typeof imageRaw === "string" ? imageRaw : imageRaw?.url;
                    const showVideo = videoSrc && isVideoCopy;
                    const posterUrl = imageSrc
                      ? `/_next/image?url=${encodeURIComponent(imageSrc)}&w=640&q=75`
                      : null;
                    return (
                      <div className="marquee-card">
                        <div className="marquess-card-inner">
                          <div className="img">
                            <div className={`c-before ${videoSrc ? "video" : "image"}`}></div>
                            {!showVideo ? (
                              (imageSrc || posterUrl) && (
                                <Image
                                  src={imageSrc || posterUrl}
                                  width={600}
                                  height={360}
                                  alt={item.image?.alt || "Marquee Image"}
                                  className="absolute inset-0 w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <video
                                src={videoSrc}
                                autoPlay
                                loop
                                muted
                                playsInline
                                preload="metadata"
                                {...(posterUrl && { poster: posterUrl })}
                                className="absolute inset-0 w-full h-full object-cover"
                                ref={(el) => {
                                  videoRefs.current[i] = el;
                                }}
                                onMouseEnter={handleVideoEnter}
                                onMouseLeave={handleVideoLeave}
                              />
                            )}
                          </div>
                          {item?.title && (
                            <div className="card-info">
                              <p className="radial-marquee__card-p">{safeParse(item.title)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
