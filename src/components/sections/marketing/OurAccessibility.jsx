"use client";
import React from "react";
import { safeParse } from "@/utils/safeParse";

export default function OurAccessibility({ data }) {
  if (data?.hide_section === "yes") return null;

  return (
    <section className="approach-section py-80 max-lg:py-40">
      <div className="container-fluid-lg">
        <div className="flex flex-wrap w-full">
          <div className="top-info md:text-center max-w-1000 mx-auto">
            {data?.heading && (
              <div className="title title-white pb-10">
                <h2>{safeParse(data.heading)}</h2>
              </div>
            )}
            {data?.sub_heading && <i>{data.sub_heading}</i>}
            {data?.description && (
              <div className="content pt-10">
                <div>{safeParse(data.description)}</div>
              </div>
            )}
          </div>

          <div className="approach-info pt-50 w-full">
            <div className="flex flex-wrap justify-center max-lg:divide-x-0 max-lg:divide-y divide-x divide-black-500/60 gap-y-0 gap-x-20">
              {data?.approaches?.map((item, index) => (
                <div
                  key={index}
                  className="approach-details global-list max-lg:first:pt-0 max-lg:last:pb-0 max-lg:py-30 lg:p-20 pl-0 last:pr-0 w-full lg:flex-3/12"
                >
                  <div className="title title-white mb-20">
                    <h3 className="h5">{item.title}</h3>
                  </div>
                  <div className="content grid gap-y-10">{safeParse(item.description)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
