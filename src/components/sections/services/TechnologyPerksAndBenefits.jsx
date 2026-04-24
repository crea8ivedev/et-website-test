"use client";

import React from "react";
import Link from "next/link";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";

const clampDelay = (v) => Math.min(500, Math.max(0, v));

const TechnologyPerksAndBenefits = ({ data }) => {
  if (data?.hide_section === "yes") return null;

  return (
    <section
      className={`benefits-wrapper py-80 max-lg:py-40 ${data?.extra_class || ""}`}
      id={data?.extra_id || undefined}
    >
      <div className="container-fluid-lg">
        <div className="flex flex-wrap max-lg:gap-40 gap-80">
          <div className="left-content lg:flex-1">
            <div className="relative lg:sticky lg:top-100">
              {data?.heading && (
                <Reveal className="title title-white mb-20">
                  <h2>{safeParse(data.heading || "")}</h2>
                </Reveal>
              )}

              {data?.description && (
                <Reveal delay={200} className="content mb-40">
                  <div>{safeParse(data.description || "")}</div>
                </Reveal>
              )}

              {data?.cta_button && data.cta_button.url && (
                <Reveal delay={300}>
                  <Link
                    href={data.cta_button.url}
                    aria-label={data.cta_button.title}
                    className="btn"
                    target={data.cta_button.target || "_self"}
                  >
                    <span className="btn-txt">
                      {data.cta_button.title}
                      <span className="btn-txt-extra" data-txt={data.cta_button.title}></span>
                    </span>
                  </Link>
                </Reveal>
              )}
            </div>
          </div>

          <div className="right-content lg:flex-1 relative">
            {data?.benefits_blocks && data.benefits_blocks.length > 0 && (
              <div className="flex flex-col gap-40">
                {data.benefits_blocks.map((item, idx) => (
                  <div key={idx} className="right-block flex max-md:gap-20 gap-40 relative">
                    <div className="flex items-center justify-self-center flex-col gap-5">
                      <span>{String(idx + 1).padStart(2, "0")}</span>
                      <div className="grid grid-cols-1 h-full relative">
                        <div className="absolute mr-[50%] -translate-x-1/2 h-full w-1 bg-linear-180 to-black-400 from-black-800"></div>
                      </div>
                    </div>

                    <div className="right-info">
                      <Reveal
                        delay={clampDelay(200 + idx * 100)}
                        className="title title-white mb-20"
                      >
                        <h3 className="h5">{item.heading}</h3>
                      </Reveal>
                      <Reveal delay={clampDelay(300 + idx * 100)} className="content">
                        <p>{item.description}</p>
                      </Reveal>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TechnologyPerksAndBenefits;
