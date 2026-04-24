"use client";
import { Fragment, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";

export default function ServiceList({ data, title }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section
      className={`services-wrapper relative py-80 max-lg:py-40 ${data.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="flex flex-wrap items-stretch justify-center w-full m-0 p-0 h-full">
        <div className="w-full max-lg:hidden lg:w-5/12">
          <div className="sticky top-0 w-full h-screen lg:pl-22 lg:py-22">
            <div className="relative top-0 size-full rounded-10 overflow-hidden">
              {data.services.map((service, index) => {
                const videoRaw = service.videos || service.video || service.video_file;
                const imageRaw = service.image || service.image_file;
                const videoSrc = typeof videoRaw === "string" ? videoRaw : videoRaw?.url;
                const imageSrc = typeof imageRaw === "string" ? imageRaw : imageRaw?.url;
                const isActive = index === activeIndex;

                return (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                      isActive ? "opacity-100" : "opacity-0 pointer-events-none"
                    }`}
                    aria-hidden={!isActive}
                  >
                    {videoSrc ? (
                      <video
                        src={videoSrc}
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover"
                        poster={
                          imageSrc
                            ? `/_next/image?url=${encodeURIComponent(imageSrc)}&w=1200&q=75`
                            : ""
                        }
                      />
                    ) : imageSrc ? (
                      <Image
                        src={imageSrc}
                        className="w-full h-screen object-cover"
                        width={1070}
                        height={664}
                        alt={service.image?.alt || service.heading?.title || "Service Image"}
                        aria-label={service.image?.alt || service.heading?.title}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full lg:w-7/12">
          <div className="flex flex-col px-[4vw] pb-[3vw] h-full overflow-y-auto lg:py-12">
            {data?.heading && (
              <div className="text-left mb-40">
                <h2>{safeParse(data.heading)}</h2>
              </div>
            )}
            {data?.services && (
              <div className="services-content-item-wrapper">
                {data.services.map((service, serviceIndex) => (
                  <div
                    key={serviceIndex}
                    onMouseEnter={() => setActiveIndex(serviceIndex)}
                    className="services-content-item group border-0 border-t border-white/15 max-lg:pt-[1.5rem] max-lg:pb-[2rem] pt-[3rem] pb-[3.5rem] cursor-pointer"
                  >
                    {service?.heading &&
                      (service.heading.url === "#" ? (
                        <div className="title title-white duration-300 ease-linear group-hover:text-gold">
                          <span>{service.heading.title}</span>
                        </div>
                      ) : (
                        <Link
                          href={service.heading.url}
                          aria-label={service.heading.title}
                          className="title title-white duration-300 ease-linear group-hover:text-gold"
                        >
                          <span>{service.heading.title}</span>
                        </Link>
                      ))}
                    {service?.platforms && (
                      <div className="overflow-hidden">
                        <div className="services-content-wrapper mt-10">
                          <div className="tag-wrapper">
                            <div className="flex gap-x-10 gap-y-8 flex-wrap items-center max-575:flex-col max-575:items-start">
                              {service.platforms.map((items, tagIndex) => (
                                <Fragment key={tagIndex}>
                                  {items?.platforms_name.url === "#" ? (
                                    <div className="block text-body-4 duration-300 ease-linear group-hover:opacity-100 opacity-30 hover:text-gold hover:opacity-100 capitalize max-575:w-full max-575:flex max-575:items-center max-575:gap-8 max-575:whitespace-nowrap">
                                      <span className="hidden max-575:inline-block">•</span>
                                      <span>{items.platforms_name.title}</span>
                                    </div>
                                  ) : (
                                    <Link
                                      href={items.platforms_name.url}
                                      aria-label={items.platforms_name.title}
                                      className="block text-body-4 duration-300 ease-linear group-hover:opacity-100 opacity-30 max-575:opacity-70 hover:text-gold hover:opacity-100 capitalize max-575:w-full max-575:flex max-575:items-center max-575:gap-8 max-575:whitespace-nowrap"
                                    >
                                      <span className="hidden max-575:inline-block">•</span>
                                      <span>{items.platforms_name.title}</span>
                                    </Link>
                                  )}
                                  {tagIndex < service.platforms.length - 1 && (
                                    <span className="opacity-30 duration-300 ease-linear group-hover:opacity-100 max-575:hidden">
                                      •
                                    </span>
                                  )}
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
