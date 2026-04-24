"use client";
import React from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

export default function MeasurableImpact({ data }) {
  if (data?.hide_section === "yes") return null;

  return (
    <section className="measurable-impact white py-80 max-lg:py-40">
      <div className="container-fluid-md">
        <div className="bg-white rounded-10 py-80 max-xl:py-40 px-40 max-md:py-40 max-md:px-25">
          <div className="top-info">
            {data?.heading && (
              <div className="title-black title-black mb-20">
                <h2>{safeParse(data.heading)}</h2>
              </div>
            )}
            {data?.description && (
              <div className="content global-list">
                <div>{safeParse(data.description)}</div>
              </div>
            )}
          </div>
          <div className="pt-50 measurable-impact-info">
            <div className="grid max-xl:grid-cols-1 grid-cols-2 gap-40 xl:gap-x-60">
              {data?.impacts?.map((item, index) => (
                <div
                  key={index}
                  className="measurable-impact-info-inner grid md:grid-cols-2 gap-30 items-start"
                >
                  <div className="img">
                    {item?.image?.url ? (
                      <Image
                        src={item.image.url}
                        className="size-full object-cover rounded-10"
                        width={500}
                        height={600}
                        alt="industry"
                        aria-label={item.title || "Impact Image"}
                      />
                    ) : (
                      <div className="size-full bg-gray-100 rounded-10 aspect-[5/6]" />
                    )}
                  </div>
                  <div className="right-content">
                    <div className="approach-details global-list content">
                      <div className="title title-black mb-20">
                        <h3 className="h5">{item.title}</h3>
                      </div>
                      <ul className="grid gap-y-10">{safeParse(item.description)}</ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
