"use client";
import React from "react";
import { safeParse } from "@/utils/safeParse";

export default function KeyPainPoints({ data }) {
  if (data?.hide_section === "yes") return null;
  const totalItems = data?.points?.length || 1;

  const dynamicWidth = `calc(69.8vw / ${totalItems})`;
  return (
    <section className="key-points py-80 max-lg:py-40">
      <div className="container-fluid-lg">
        <div className="flex flex-wrap items-center justify-center m-0 mb-40 p-0 w-full">
          <div className="w-full lg:w-10/12 xl:w-8/12">
            {data?.main_heading && (
              <div className="title title-white text-center">
                <h2>{safeParse(data.main_heading)}</h2>
              </div>
            )}
          </div>
        </div>
        <div className="key-points-info flex flex-wrap max-1199:flex-col items-center">
          <div className="circle w-[17vw] h-[17vw] max-1199:w-250 max-1199:h-250 bg-black-700 rounded-full flex items-center justify-center border-6 border-solid border-black-800 relative z-9">
            {data?.heading && (
              <div className="title title-white text-center">
                <h2 className="h5">{safeParse(data.heading)}</h2>
              </div>
            )}
          </div>
          <div className="key-bx-grid flex flex-wrap -ml-40 max-1199:ml-0 max-1199:-mt-20 max-1199:justify-center">
            {data?.points?.map((item, index) => (
              <div
                key={index}
                className="key-bx max-sm:sticky max-sm:top-30 relative max-1199:!w-1/4 max-991:!w-1/2 max-575:!w-full"
                style={{ width: dynamicWidth }}
              >
                <div className="content sm w-full">
                  <p>{item.title}</p>
                </div>
                <div className="bottom-icon absolute -bottom-10 left-1/2 -translate-x-1/2 flex flex-wrap">
                  <svg
                    width="40"
                    height="30"
                    viewBox="0 0 40 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19.5 0L0 30H39.5V20L19.5 0Z" fill="#1A1A1A" />
                  </svg>
                  {(index === 1 || index === 4) && (
                    <svg
                      width="40"
                      height="30"
                      viewBox="0 0 40 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="max-1366:hidden"
                    >
                      <path d="M19.5 0L0 30H39.5V20L19.5 0Z" fill="#1A1A1A" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        {data?.description && (
          <div className="text-left w-full mt-20">
            <div className="content global-list white lg">{safeParse(data.description)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
