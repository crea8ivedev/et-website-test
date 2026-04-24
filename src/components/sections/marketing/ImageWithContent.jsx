"use client";
import React from "react";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";

export default function ImageWithContent({ data }) {
  if (data?.hide_section === "yes") return null;

  return (
    <section className="common-contant py-80 max-lg:py-40">
      <div className="container-fluid-lg">
        <div className="flex flex-wrap items-center gap-y-40">
          <div className="lg:w-7/12 lg:pr-50 xl:pr-100">
            <div className="left-content">
              {data?.heading && (
                <div className="title title-white">
                  <h3>{safeParse(data.heading)}</h3>
                </div>
              )}
              {data?.description && (
                <div className="content global-list pt-25">{safeParse(data.description)}</div>
              )}
            </div>
          </div>
          <div className="lg:w-5/12 w-full">
            <div className="img">
              {data?.image?.url ? (
                <Image
                  src={data.image.url}
                  className="w-630 object-cover rounded-10"
                  width={500}
                  height={600}
                  alt={data.image.alt || "industry"}
                  aria-label={data.image.alt || "industry"}
                />
              ) : (
                <div className="w-630 h-[600px] bg-gray-900 rounded-10" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
