"use client";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import DOMPurify from "isomorphic-dompurify";
import parse, { domToReact } from "html-react-parser";

// Helper to handle the gold spans in CMS HTML
const parseOptions = {
  replace: (domNode) => {
    if (domNode.name === "span") {
      return <span>{domToReact(domNode.children, parseOptions)}</span>;
    }
    if (domNode.name === "ul") {
      return <ul className="flex flex-col gap-15">{domToReact(domNode.children, parseOptions)}</ul>;
    }
  },
};

const FilledRatingStar = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.296 2.58281L11.616 5.24456C11.796 5.61506 12.276 5.97056 12.681 6.03806L15.0727 6.43931C16.6027 6.69656 16.9627 7.81556 15.8602 8.91956L14.0002 10.7946C13.6852 11.1118 13.5127 11.7246 13.6102 12.1633L14.1427 14.4846C14.5627 16.3221 13.5952 17.0323 11.9827 16.0723L9.74024 14.7336C9.33524 14.4921 8.66774 14.4921 8.25524 14.7336L6.01424 16.0723C4.40924 17.0323 3.43424 16.3138 3.85424 14.4846L4.38674 12.1633C4.48424 11.7246 4.31174 11.1118 3.99674 10.7946L2.13674 8.91956C1.04249 7.81481 1.39499 6.69656 2.92424 6.43931L5.31674 6.03806C5.71424 5.97056 6.19424 5.61506 6.37424 5.24456L7.69424 2.58281C8.41424 1.13906 9.58424 1.13906 10.2967 2.58281"
      fill="#EDA800"
    />
  </svg>
);

const UnfilledRatingStar = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M10.296 2.58281L11.616 5.24456C11.796 5.61506 12.276 5.97056 12.681 6.03806L15.0727 6.43931C16.6027 6.69656 16.9627 7.81556 15.8602 8.91956L14.0002 10.7946C13.6852 11.1118 13.5127 11.7246 13.6102 12.1633L14.1427 14.4846C14.5627 16.3221 13.5952 17.0323 11.9827 16.0723L9.74024 14.7336C9.33524 14.4921 8.66774 14.4921 8.25524 14.7336L6.01424 16.0723C4.40924 17.0323 3.43424 16.3138 3.85424 14.4846L4.38674 12.1633C4.48424 11.7246 4.31174 11.1118 3.99674 10.7946L2.13674 8.91956C1.04249 7.81481 1.39499 6.69656 2.92424 6.43931L5.31674 6.03806C5.71424 5.97056 6.19424 5.61506 6.37424 5.24456L7.69424 2.58281C8.41424 1.13906 9.58424 1.13906 10.2967 2.58281"
      stroke="#4F4F4F"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function FeedbackSlider({ feedbackSection }) {
  const containerRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const idx = Math.round(container.scrollLeft / container.offsetWidth);
      setActiveIdx(idx);
    };
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (idx) => {
    const container = containerRef.current;
    if (!container) return;
    container.scrollTo({ left: idx * container.offsetWidth, behavior: "smooth" });
  };

  return (
    <div className="case-study-feedback-swiper">
      <div ref={containerRef} className="feedback-snap-track">
        {feedbackSection.map((fb, idx) => (
          <div key={idx} className="feedback-snap-slide">
            <div className="card flex flex-col gap-22 rounded-10">
              <div className="content">
                <p>{fb.post}</p>
              </div>
              <div className="text-36 max-1500:text-28 content max-w-1000 max-sm:text-2xl">
                {parse(DOMPurify.sanitize(fb.feedback || ""))}
              </div>
              <div className="rating flex gap-10 items-center">
                <div className="content">
                  <p>Rated: {fb.rating}/5</p>
                </div>
                <ul className="flex gap-5 items-center">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <li key={starIndex}>
                      {starIndex < parseInt(fb.rating) ? (
                        <FilledRatingStar />
                      ) : (
                        <UnfilledRatingStar />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>
      {feedbackSection.length > 1 && (
        <div className="feedback-pagination mt-30" role="tablist" aria-label="Feedback navigation">
          {feedbackSection.map((_, idx) => (
            <button
              key={idx}
              role="tab"
              aria-selected={idx === activeIdx}
              onClick={() => scrollTo(idx)}
              className={`swiper-pagination-bullet${idx === activeIdx ? " swiper-pagination-bullet-active" : ""}`}
              aria-label={`Feedback ${idx + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClientCaseStudySingle({ data }) {
  if (!data?.acf?.case_study_content) return null;
  const content = data.acf.case_study_content;

  // Find sections by layout name
  const innerBanner = content.find((i) => i.acf_fc_layout === "inner_banner") || {};
  const imageWithContentSections = content.filter((i) => i.acf_fc_layout === "image_with_content");
  const visionSection = imageWithContentSections[0] || {};
  const challengeSection = imageWithContentSections[1] || imageWithContentSections[0] || {};
  const painPointsSection = content.find((i) => i.acf_fc_layout === "key_pain_points") || {};
  const approachSection = content.find((i) => i.acf_fc_layout === "our_accessibility") || {};
  const impactSection = content.find((i) => i.acf_fc_layout === "the_measurable_impact") || {};
  const feedbackSection = content.filter((i) => i.acf_fc_layout === "client_feedback") || [];
  const industriesSection = content.find((i) => i.acf_fc_layout === "industries_weve_helped") || {};
  const takeawaySection = content.find((i) => i.acf_fc_layout === "final_takeaway") || {};

  return (
    <>
      {/* 1. Inner Banner Section */}
      <section className={`bg-black-800 pt-148 ${innerBanner.extra_class || ""}`}>
        <div className="container-fluid-lg">
          <div className="rounded-10">
            <ul className="flex flex-wrap items-center p-0 relative gap-10 w-full mb-20">
              <li>
                <Image
                  src={"/icons/ui/ring.png"}
                  width="20"
                  height="20"
                  alt="encircle technologies"
                  aria-label="Encircle Technologies"
                  className="img-fluid"
                />
              </li>
              {Array.isArray(innerBanner.breadcrumbs) &&
                innerBanner.breadcrumbs.map((crumb, idx) => (
                  <React.Fragment key={idx}>
                    <li>/</li>
                    <li className={idx === innerBanner.breadcrumbs.length - 1 ? "" : ""}>
                      {crumb.title?.url && crumb.title?.url !== "#" ? (
                        <Link
                          href={crumb.title.url}
                          className="duration-300 ease-linear hover:text-gold"
                        >
                          {crumb.title.title}
                        </Link>
                      ) : (
                        <span className="opacity-65 text-capitalize">{crumb.title?.title}</span>
                      )}
                    </li>
                  </React.Fragment>
                ))}
            </ul>

            <div className="title title-white mb-15 max-w-1050">
              <h1 className="">
                {parse(DOMPurify.sanitize(innerBanner.heading || ""), parseOptions)}
              </h1>
            </div>

            <div className="content mb-60 max-lg:mb-30 short-desc">
              <p>{parse(DOMPurify.sanitize(innerBanner.short_description || ""))}</p>
            </div>

            <div className="category-list">
              {Array.isArray(innerBanner.categorization) &&
                innerBanner.categorization.map((cat, idx) => (
                  <div key={idx}>
                    <div className="title title-white mb-5">
                      <h2 className="h6">
                        <span>{cat.title}</span>
                      </h2>
                    </div>
                    <div className="content">
                      <p className="!mb-0">{cat.detail}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Video/Vision Section */}
      <section
        className={`product-vision-section pt-100 max-lg:pt-40 ${visionSection.extra_class || ""}`}
      >
        <div className="container-fluid-lg">
          <div className="flex items-start justify-between gap-20 max-md:flex-col border-b border-[#4f4f4f] pb-100 max-lg:pb-40">
            <div>
              <div className="title title-white mb-22">
                <h2 className="">
                  {parse(
                    DOMPurify.sanitize(visionSection.heading || "Product Vision"),
                    parseOptions
                  )}
                </h2>
              </div>
              <div className="content">
                {parse(DOMPurify.sanitize(visionSection.description || ""), parseOptions)}
              </div>
            </div>
            <div className="">
              {(typeof visionSection.image === "string"
                ? visionSection.image
                : visionSection.image?.url) && (
                <Image
                  src={
                    typeof visionSection.image === "string"
                      ? visionSection.image
                      : visionSection.image?.url
                  }
                  width={90}
                  height={90}
                  alt={visionSection.image?.alt || "Vision section illustration"}
                  className="w-auto h-auto"
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Challenge Section */}
      <section
        className={`challange-section pt-100 max-lg:pt-40 ${challengeSection.extra_class || ""}`}
      >
        <div className="container-fluid-lg">
          <div className="border-b border-[#4f4f4f] pb-100 max-lg:pb-40">
            <div className="border border-gold p-40 max-lg:p-20 flex max-lg:flex-col items-stretch justify-between gap-30 rounded-10 bg-[#232323]">
              <div className="flex-1 flex flex-col gap-22">
                <div className="title title-bold title-white">
                  <h3>{parse(DOMPurify.sanitize(challengeSection.heading || ""), parseOptions)}</h3>
                </div>
                {challengeSection.sub_heading && (
                  <div className="title title-bold title-white mb-10">
                    <h4>{parse(DOMPurify.sanitize(challengeSection.sub_heading), parseOptions)}</h4>
                  </div>
                )}
                <div className="content">
                  {parse(DOMPurify.sanitize(challengeSection.description || ""), parseOptions)}
                </div>
              </div>
              {challengeSection.image && (
                <div className="shrink-0 max-lg:w-full lg:w-300">
                  <div className="rounded-10">
                    <Image
                      src={
                        typeof challengeSection.image === "string"
                          ? challengeSection.image
                          : challengeSection.image.url
                      }
                      width={220}
                      height={160}
                      alt="Challenge section illustration"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 4. Key Pain Points Section */}
      <section
        className={`key-point-section pt-100 max-lg:pt-40 ${painPointsSection.extra_class || ""}`}
      >
        <div className="container-fluid-lg">
          <div className="title title-white title-bold mb-22 text-capitalize">
            <h2>{parse(DOMPurify.sanitize(painPointsSection.heading || ""), parseOptions)}</h2>
          </div>
          {Array.isArray(painPointsSection.points) &&
            painPointsSection.points.some(
              (p) => p.points_title || p.title || p.point_title || p.label
            ) && (
              <div className="grid grid-cols-4 gap-22 max-xl:grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 mb-60 max-lg:mb-30">
                {painPointsSection.points
                  .filter((p) => p.points_title || p.title || p.point_title || p.label)
                  .map((point, idx) => (
                    <div
                      key={idx}
                      className="card border border-[#4f4f4f] rounded-lg p-16 flex items-center gap-10"
                    >
                      <Image src="/icons/ui/polygon-icon.svg" width={18} height={18} alt="" />
                      <div className="content">
                        <p className="!mb-0">
                          {point.points_title ||
                            point.title ||
                            point.point_title ||
                            point.label ||
                            ""}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          {painPointsSection.challenges_faced_heading ||
          painPointsSection.main_heading ||
          painPointsSection.description ? (
            <div className="flex flex-col gap-22 border-b border-[#4f4f4f] pb-100 max-lg:pb-40">
              {painPointsSection.challenges_faced_heading || painPointsSection.main_heading ? (
                <div className="title title-white title-bold">
                  <h2>
                    {parse(
                      DOMPurify.sanitize(
                        painPointsSection.challenges_faced_heading ||
                          painPointsSection.main_heading ||
                          ""
                      ),
                      parseOptions
                    )}
                  </h2>
                </div>
              ) : null}
              {painPointsSection.description ? (
                <div className="content global-list">
                  {parse(DOMPurify.sanitize(painPointsSection.description || ""), parseOptions)}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      {/* 5. Approach Section */}
      <section
        className={`approach-section pt-100 max-lg:pt-40 ${approachSection.extra_class || ""}`}
      >
        <div className="container-fluid-lg">
          <div className="border-b border-[#4f4f4f] pb-100 max-lg:pb-40">
            <div className="white relative overflow-hidden rounded-10 bg-white p-40 max-lg:p-20">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(20,20,20,0.2) 1px, transparent 0)",
                  backgroundSize: "6px 6px",
                }}
              />

              <div className="relative flex flex-col gap-40 max-lg:gap-30">
                <div className="flex flex-col gap-22">
                  <div className="title title-black title-bold">
                    <h2>
                      {parse(DOMPurify.sanitize(approachSection.heading || ""), parseOptions)}
                    </h2>
                  </div>

                  <div className="title title-black title-bold">
                    <h3>{approachSection.sub_heading}</h3>
                  </div>

                  {approachSection.the_solution && (
                    <div className="title title-black title-bold solution-title">
                      <h6>{approachSection.the_solution}</h6>
                    </div>
                  )}

                  <div className="text-black-600 flex flex-col gap-22">
                    {parse(DOMPurify.sanitize(approachSection.description || ""), {
                      replace: (node) => {
                        if (node.name === "h3") {
                          return (
                            <div className="title title-black title-bold mb-0 solution-title">
                              <h3>
                                <span className="!text-gold">&lt; </span>
                                {domToReact(node.children)}
                                <span className="!text-gold"> &gt;</span>
                              </h3>
                            </div>
                          );
                        }
                      },
                    })}
                  </div>
                </div>

                <div className="grid max-xl:grid-cols-1 xl:grid-cols-3 gap-60 max-lg:gap-30">
                  {Array.isArray(approachSection.approaches) &&
                    approachSection.approaches.map((app, idx) => (
                      <div
                        key={idx}
                        className="border-t border-black-100 pt-40 max-lg:pt-20 flex flex-col gap-24"
                      >
                        <div className="flex items-center gap-8">
                          <Image
                            src={
                              idx === 0
                                ? "/icons/ui/square-icon.svg"
                                : idx === 1
                                  ? "/icons/ui/left-polygon-icon.svg"
                                  : "/icons/ui/yellow-star.svg"
                            }
                            width={18}
                            height={18}
                            alt=""
                          />
                          <div className="title title-black title-bold mb-0">
                            <h4 className="h6">{app.title}</h4>
                          </div>
                        </div>
                        <div className="text-black-600 content global-list">
                          {parse(DOMPurify.sanitize(app.description || ""))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Results Section */}
      <section className={`result-section pt-100 max-lg:pt-40 ${impactSection.extra_class || ""}`}>
        <div className="container-fluid-lg">
          <div className="border-b border-[#4f4f4f] pb-100 max-lg:pb-40">
            <div className="bg-[#232323] p-40 rounded-10 max-639:p-20">
              <div className="title title-white title-bold">
                <h2>{parse(DOMPurify.sanitize(impactSection.heading || ""), parseOptions)}</h2>
              </div>
              {impactSection.sub_heading && (
                <div className="title title-white title-bold mt-22 sub-head">
                  <h3>{parse(DOMPurify.sanitize(impactSection.sub_heading), parseOptions)}</h3>
                </div>
              )}
              <div className="content mt-22 border-b border-[#4f4f4f] pb-40">
                {parse(DOMPurify.sanitize(impactSection.description || ""))}
              </div>
              <div className="mt-40">
                {Array.isArray(impactSection.impacts) &&
                  impactSection.impacts.map((impact, idx) => {
                    const allResultValues = Array.isArray(impact.results)
                      ? impact.results.flatMap((res) => {
                          const detailsFields = Object.entries(res || {})
                            .filter(
                              ([key, value]) => /^result_details(?:_\d+)?$/.test(key) && value
                            )
                            .sort(([a], [b]) => {
                              const getOrder = (field) => {
                                const match = field.match(/^result_details(?:_(\d+))?$/);
                                return match?.[1] ? Number(match[1]) : 1;
                              };
                              return getOrder(a) - getOrder(b);
                            })
                            .map(([, value]) => value);

                          if (detailsFields.length) return detailsFields;

                          const fallbackValue =
                            res?.result_description ||
                            res?.description ||
                            res?.result ||
                            res?.details ||
                            "";

                          return fallbackValue ? [fallbackValue] : [];
                        })
                      : [];

                    return (
                      <div
                        key={idx}
                        className={
                          idx === 0
                            ? "pb-60 max-lg:pb-30 border-b border-[#4f4f4f]"
                            : "pt-60 max-lg:pt-30"
                        }
                      >
                        <div className="title title-white title-bold">
                          <h3 className="h4">
                            {parse(DOMPurify.sanitize(impact.title || ""), parseOptions)}
                          </h3>
                        </div>
                        <div className="mt-24 grid max-lg:grid-cols-1 lg:grid-cols-3 lg:items-center gap-y-20">
                          {allResultValues.map((resultValue, rIdx) => {
                            const columnIndex = rIdx % 3;
                            const rowStartIndex = Math.floor(rIdx / 3) * 3;
                            const itemsInRow = Math.min(3, allResultValues.length - rowStartIndex);

                            let columnClasses = "";

                            if (itemsInRow === 1) {
                              columnClasses = "lg:pr-24";
                            } else if (itemsInRow === 2) {
                              columnClasses =
                                columnIndex === 0
                                  ? "lg:pr-24 lg:border-r lg:border-[#4f4f4f]"
                                  : "lg:pl-24";
                            } else {
                              columnClasses =
                                columnIndex === 0
                                  ? "lg:pr-24"
                                  : columnIndex === 1
                                    ? "lg:px-24 lg:border-l lg:border-r lg:border-[#4f4f4f]"
                                    : "lg:pl-24";
                            }

                            return (
                              <div
                                key={rIdx}
                                className={`flex items-center gap-10 ${columnClasses}`}
                              >
                                {parse(DOMPurify.sanitize(resultValue), {
                                  replace: (node) => {
                                    if (node.name === "span") {
                                      return (
                                        <div className="title title-white title-bold">
                                          <h3 className="mb-0">
                                            <span className="text-gold!">
                                              {domToReact(node.children)}
                                            </span>
                                          </h3>
                                        </div>
                                      );
                                    }
                                  },
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Client Feedback Section */}
      <section className="pt-100 max-lg:pt-40 feedback-section">
        <div className="container-fluid-lg">
          <div className="title title-white title-bold">
            <h2>
              {parse(
                DOMPurify.sanitize(
                  feedbackSection[0]?.heading ||
                    'Client <span className="text-gold!">Feedback</span>'
                ),
                parseOptions
              )}
            </h2>
          </div>
          <div className="mt-22 border-b border-[#4f4f4f] pb-100 max-lg:pb-40">
            <FeedbackSlider feedbackSection={feedbackSection} />
          </div>
        </div>
      </section>

      {/* 8. Industry Section */}
      <section className={`pt-100 max-lg:pt-40 ${industriesSection.extra_class || ""}`}>
        <div className="overflow-hidden">
          <div className="industry-marquee-track" aria-hidden="true">
            {[
              ...(Array.isArray(industriesSection.industries) ? industriesSection.industries : []),
              ...(Array.isArray(industriesSection.industries) ? industriesSection.industries : []),
            ].map((item, index) => (
              <div key={index} className="industry-marquee-item">
                <div className="content px-22 py-10 border border-[#4f4f4f] rounded-full bg-black-900/20 whitespace-nowrap">
                  <p className="!mb-0">
                    {item.icon && <span className="mr-5">{item.icon}</span>}
                    {item.title}
                    {item.description && <span className="ml-5">({item.description})</span>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container-fluid-lg">
          <div className="border-b border-[#4f4f4f] pb-100 max-lg:pb-40"></div>
        </div>
      </section>

      {/* 9. Final Takeaway Section */}
      <section
        className={`pt-100 max-lg:pt-40 pb-100 max-lg:pb-40 takeaway-section ${takeawaySection.extra_class || ""}`}
      >
        <div className="container-fluid-lg">
          <div className="flex items-start max-lg:flex-col gap-60 max-lg:gap-30">
            <div className="card w-1/2 max-lg:w-full bg-[#232323] border border-[#4f4f4f] rounded-10 p-40 max-lg:p-20 flex flex-col gap-22">
              <div className="title title-white title-bold">
                <h2>{parse(DOMPurify.sanitize(takeawaySection.heading || ""), parseOptions)}</h2>
              </div>
              <div className="title title-bold title-white">
                <h3>
                  {parse(DOMPurify.sanitize(takeawaySection.sub_heading || ""), parseOptions)}
                </h3>
              </div>
              <div className="content">
                {parse(DOMPurify.sanitize(takeawaySection.description || ""))}
              </div>
            </div>
            <div className="card w-1/2 max-lg:w-full bg-[#232323] border border-[#4f4f4f] rounded-10 p-40 max-lg:p-20 flex flex-col gap-22">
              {takeawaySection.key_learnings_description && (
                <div className="title title-white title-bold">
                  <h3>
                    {parse(
                      DOMPurify.sanitize(takeawaySection.key_learnings_description),
                      parseOptions
                    )}
                  </h3>
                </div>
              )}
              <div className="content global-list">
                {parse(DOMPurify.sanitize(takeawaySection.key_learnings || ""), parseOptions)}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
