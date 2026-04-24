import React from "react";
import Image from "next/image";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";

export default function BenefitsPartnering({ data, title }) {
  if (!data) return null;

  const heading = data?.heading || "";
  const description = data?.description || "";
  const ctaButton = data?.cta_button || {};
  const benefitsBlocks = data?.benefits_blocks || [];

  return (
    <section
      className={`benefits-wrapper white pt-80 max-lg:pt-40 ${data?.extra_class ? ` ${data.extra_class}` : ""}`}
      id={data?.extra_id || ""}
    >
      <div className="container-fluid">
        <div className="bg-white benefits-wrapper-info relative rounded-10 shadow-sm">
          <div className="flex flex-col py-30 xl:py-60 px-25 xl:px-50 relative z-9">
            <div className="left-content w-full">
              <div className="flex flex-wrap items-end justify-between gap-40 w-full">
                <div className="title-info lg:max-w-[calc(100%_-_217px)]">
                  {heading && (
                    <div className={`title title-black mb-20 max-w-840 fade-up in-view`}>
                      <h2>{safeParse(heading)}</h2>
                    </div>
                  )}
                  {description && (
                    <div className={`content xl:max-w-10/12 fade-up delay-01 in-view`}>
                      <div>{safeParse(description)}</div>
                    </div>
                  )}
                </div>
                {ctaButton?.url && (
                  <Link
                    href={ctaButton.url}
                    target={ctaButton.target || "_self"}
                    aria-label={ctaButton.title || "Inquire now"}
                    className={`btn btn-black fade-up delay-01 in-view`}
                  >
                    <span className="btn-txt">
                      {ctaButton.title}
                      <span className="btn-txt-extra" data-txt={ctaButton.title}></span>
                    </span>
                  </Link>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-stretch gap-y-40 pt-40 lg:pt-60">
              <div className="lg:w-7/12 w-full">
                <div className="right-content text-black-800 grid sm:grid-cols-2 gap-x-10 xl:gap-x-20 gap-y-20">
                  {benefitsBlocks.map((item, index) => (
                    <div key={index} className="accordion-item">
                      <div className="flex flex-wrap gap-x-10">
                        <div className={`fade-up delay-01 in-view`}>
                          <Image
                            src={"/icons/ui/ring.png"}
                            width={30}
                            height={30}
                            alt={"icon"}
                            className="max-xl:size-20 object-contain"
                          />
                        </div>
                        <div className="right-info w-[calc(100%_-_30px)] xl:w-[calc(100%_-_50px)]">
                          <div className={`fade-up delay-01 in-view`}>
                            <h3 className="h6">{item.heading}</h3>
                          </div>
                          {item.description && (
                            <div className={`content mt-10 fade-up delay-02 in-view`}>
                              <div>{safeParse(item.description)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="max-lg:hidden lg:w-5/12 w-full lg:pl-60">
                <div className={`img sticky top-120 fade-in delay-03 in-view`}>
                  <Image
                    src="/images/sections/benefits-partnering/benifitspartneringsidebar.jpg"
                    className="w-630 object-cover rounded-10"
                    width={630}
                    height={750}
                    alt="Benefits of Partnering"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
