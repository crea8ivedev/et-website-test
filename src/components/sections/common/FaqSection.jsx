"use client";
import React from "react";
import { safeParse } from "@/utils/safeParse";
import FAQAccordion from "@/components/sections/common/FaqAccordion";

export default function FaqSection({ data, title }) {
  if (!data) return null;

  const heading = data?.heading || "Frequently Asked Questions";
  const faqData = data?.faqs || data?.faq || [];

  return (
    <section
      className={`faq-wrapper py-80 max-lg:py-40 in-view ${data?.extra_class ? ` ${data.extra_class}` : ""}`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid-xl">
        <div className="flex flex-wrap items-start justify-center max-lg:gap-10 gap-60 m-0 mx-auto p-0 w-full">
          <div className="w-full lg:flex-1">
            {heading && (
              <div className="title title-white fade-up in-view">
                <h2>{safeParse(heading)}</h2>
              </div>
            )}
          </div>
          <div className="w-full lg:flex-2">
            <FAQAccordion data={faqData} />
          </div>
        </div>
      </div>
    </section>
  );
}
