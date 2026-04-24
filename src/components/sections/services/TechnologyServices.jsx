"use client";
import React from "react";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";
import DynamicIcon from "@/components/icons/DynamicIcon";

export default function TechnologyServices({ data, title }) {
  if (!data) return null;
  const { title: secTitle, description, services } = data;

  const half = Math.ceil((services?.length || 0) / 2);
  const leftServices = services?.slice(0, half) || [];
  const rightServices = (services?.slice(half) || []).reverse();

  const getLeftClasses = (index) => {
    if (index === 0) return "lg:max-w-[calc(100%_-_60px)]";
    if (index === 1) return "lg:max-w-[calc(100%_-_60px)] mx-auto";
    if (index === 2) return "lg:max-w-[calc(100%_-_60px)] ml-auto";
    return "";
  };

  const getRightClasses = (index) => {
    if (index === 0) return "lg:max-w-[calc(100%_-_60px)] ml-auto";
    if (index === 1) return "lg:max-w-[calc(100%_-_60px)] mx-auto";
    if (index === 2) return "lg:max-w-[calc(100%_-_60px)]";
    return "";
  };

  const renderServiceBlock = (service, classes) => (
    <div
      key={service.service_name}
      className={`growth-block max-lg:sticky max-lg:top-40 relative overflow-hidden bg-black-700 border border-black-400 max-sm:rounded-32 rounded-full shadow-[inset_0_0_40px_rgb(102,102,102),inset_0_0_10px_rgb(163,163,163)] ${classes}`}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-10 bg-repeat"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
      <div className="flex max-sm:flex-col sm:items-center py-28 px-20 md:p-28 gap-30 relative min-h-175">
        <Reveal direction="none" delay={300} className="ico size-64 p-10 bg-black-600 rounded-full">
          <DynamicIcon
            name={typeof service.service_icon === "string" ? service.service_icon : null}
            className="text-white w-full h-full"
            fallbackSrc={typeof service.service_icon === "string" ? service.service_icon : service.service_icon?.url}
            fallbackAlt={service.service_name}
            fallbackWidth={64}
            fallbackHeight={64}
          />
        </Reveal>
        <Reveal delay={400} className="cta sm:max-w-[calc(100%_-_94px)]">
          <div className="title title-white mb-10 min-h-48">
            <h3 className="h6">{service.service_name}</h3>
          </div>
          <div className="content">
            <p>{service.service_descritption || service.service_description}</p>
          </div>
        </Reveal>
      </div>
    </div>
  );

  return (
    <section className="growth-wrapper py-80 max-lg:py-40">
      <div className="container-fluid-md">
        <div className="flex flex-wrap items-center justify-center w-full m-0 p-0">
          <div className="w-full lg:w-6/12 lg:text-center">
            <Reveal className="title title-white mb-20">
              <h2 className="sec-title">{safeParse(secTitle || "")}</h2>
            </Reveal>
            <Reveal delay={200} className="content">
              <div>{safeParse(description)}</div>
            </Reveal>
          </div>
        </div>
        <div className="flex flex-wrap items-stretch gap-y-30 max-lg:mt-40 mt-60">
          <div className="w-full lg:w-1/2 lg:px-20">
            <div className="grid gap-30 h-full">
              {leftServices.map((service, index) =>
                renderServiceBlock(service, getLeftClasses(index))
              )}
            </div>
          </div>
          <div className="w-full lg:w-1/2 lg:px-20">
            <div className="grid gap-30 h-full">
              {rightServices.map((service, index) =>
                renderServiceBlock(service, getRightClasses(index))
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
