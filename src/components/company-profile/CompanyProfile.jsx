"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import Link from "next/link";

const stripHtml = (html = "") => html.replace(/<[^>]*>?/gm, "").trim();
const normalizeTabs = (data) => {
  const tabs =
    data?.acf?.page_content?.[0]?.tabs ||
    data?.data?.acf?.page_content?.[0]?.tabs ||
    data?.page_content?.[0]?.tabs ||
    data?.tabs ||
    [];

  return Array.isArray(tabs) ? tabs : [];
};

const parseIndexList = (tab) => {
  if (!tab?.content) return [];
  const listItems = [...tab.content.matchAll(/<li[^>]*>(.*?)<\/li>/gis)].map((m) =>
    stripHtml(m[1])
  );
  return listItems.filter(Boolean);
};

const normalizeIndexLabel = (value = "") =>
  value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/^\s*\d+[\).\-\s]*/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getMediaUrl = (media, mediaCache = {}) => {
  if (!media) return null;

  const numericId =
    typeof media === "number"
      ? media
      : typeof media === "string" && /^\d+$/.test(media)
        ? parseInt(media, 10)
        : null;

  if (numericId) {
    return mediaCache[numericId] || null;
  }

  if (typeof media === "string") {
    if (media.startsWith("http") || media.startsWith("/") || media.includes("/")) {
      return media;
    }
    return null;
  }

  if (typeof media === "object") {
    const url =
      media.url ||
      media.source_url ||
      media.guid?.rendered ||
      media.large ||
      media.medium ||
      media.thumbnail;

    if (typeof url === "string") return url;

    if (media.sizes) {
      const sizeUrl = media.sizes.large || media.sizes.medium || media.sizes.thumbnail;
      if (typeof sizeUrl === "string") return sizeUrl;
    }

    if (media.id && mediaCache[media.id]) return mediaCache[media.id];
  }

  return null;
};

function ArrowIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8L22 12L18 16" />
      <path d="M2 12H22" />
    </svg>
  );
}

function AnimatedCount({ value, isActive }) {
  const ref = useRef(null);
  const numericValue = parseInt(value.replace(/\D/g, ""), 10) || 0;
  const suffix = value.replace(/[0-9]/g, "");

  useEffect(() => {
    if (!isActive || !ref.current) return;

    // easeOut cubic (matches framer-motion's default "easeOut" curve closely
    // enough for a number count-up).
    const duration = 2000;
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);
    let rafId = null;
    let startTs = null;

    const step = (ts) => {
      if (startTs === null) startTs = ts;
      const t = Math.min(1, (ts - startTs) / duration);
      const latest = easeOut(t) * numericValue;
      if (ref.current) {
        ref.current.textContent = Math.floor(latest) + suffix;
      }
      if (t < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isActive, numericValue, suffix]);

  return (
    <h3 ref={ref} className="h2 count percent">
      0{suffix}
    </h3>
  );
}

function ServiceCard({ service }) {
  return (
    <div className="card">
      <div className="title title-black">
        <h3 className="h5">⦿ {service.title}</h3>
      </div>
      <div className="content">
        <p>{service.body}</p>
      </div>
      <div className="btn-custom mt-auto">
        <Link
          href={service.href}
          target={service.target || "_blank"}
          rel="noreferrer"
          className="btn-link"
        >
          View More <ArrowIcon />
        </Link>
      </div>
    </div>
  );
}

export default function CompanyProfile({ data }) {
  const articleRef = useRef(null);
  const slideContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [mediaCache, setMediaCache] = useState({});
  const tabs = useMemo(() => normalizeTabs(data), [data]);
  const slideIds = useMemo(() => tabs.map((_, idx) => `counter${idx + 1}`), [tabs]);

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const indexItems = useMemo(() => {
    const indexTab = tabs.find((tab) => stripHtml(tab.heading || "").toLowerCase() === "index");
    if (!indexTab) return [];

    const parsedList = parseIndexList(indexTab);

    if (parsedList.length) {
      return parsedList.map((label) => {
        const normalizedLabel = normalizeIndexLabel(label);
        const matchIdx = tabs.findIndex((t) => {
          const normalizedHeading = normalizeIndexLabel(stripHtml(t.heading || ""));
          if (!normalizedHeading) return false;
          return (
            normalizedHeading === normalizedLabel ||
            normalizedHeading.includes(normalizedLabel) ||
            normalizedLabel.includes(normalizedHeading)
          );
        });

        const aliasIdx =
          matchIdx >= 0
            ? matchIdx
            : tabs.findIndex((t) => {
                const headingStr = normalizeIndexLabel(stripHtml(t.heading || ""));
                if (
                  normalizedLabel.includes("mission") ||
                  normalizedLabel.includes("vision") ||
                  normalizedLabel.includes("vission")
                ) {
                  return (
                    t.tab_style === "vision_mission" ||
                    headingStr.includes("mission") ||
                    headingStr.includes("vision") ||
                    headingStr.includes("vission")
                  );
                }
                if (normalizedLabel.includes("contact")) {
                  return (
                    t.tab_style === "thank_you" ||
                    headingStr.includes("contact") ||
                    headingStr.includes("thank")
                  );
                }
                return false;
              });

        return {
          label,
          targetId: aliasIdx >= 0 ? `counter${aliasIdx + 1}` : "counter1",
        };
      });
    }

    return tabs
      .map((t, idx) => ({
        label: stripHtml(t.heading || `Slide ${idx + 1}`),
        targetId: `counter${idx + 1}`,
        idx,
      }))
      .filter((item) => item.idx > 1);
  }, [tabs]);

  const isBeginning = activeIndex === 0;
  const isEnd = activeIndex === tabs.length - 1;
  const activeCounter = slideIds[activeIndex] || "counter1";

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("light", "company-profile-mode");
    body.classList.add("company-profile-mode");
    return () => {
      html.classList.remove("company-profile-mode", "light");
      body.classList.remove("company-profile-mode");
    };
  }, []);

  useEffect(() => {
    const apiBase = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!apiBase) return;

    const numericIds = new Set();
    const extractId = (val) => {
      if (!val) return null;
      if (typeof val === "number") return val;
      if (typeof val === "string" && /^\d+$/.test(val)) return parseInt(val, 10);
      return val?.id ? parseInt(val.id, 10) : null;
    };

    tabs.forEach((tab) => {
      const logoId = extractId(tab.logo);
      if (logoId) numericIds.add(logoId);
      (tab.content_grid || []).forEach((i) => {
        const id = extractId(i?.icons || i?.icon);
        if (id) numericIds.add(id);
      });
    });

    const idsToFetch = [...numericIds].filter((id) => id && !mediaCache[id]);
    if (!idsToFetch.length) return;

    Promise.all(
      idsToFetch.map((id) =>
        fetch(`${apiBase}/wp-json/wp/v2/media/${id}`)
          .then((r) => r.json())
          .catch(() => null)
      )
    ).then((results) => {
      const next = {};
      results.forEach((r) => {
        if (r?.source_url) next[r.id] = r.source_url;
      });
      if (Object.keys(next).length) setMediaCache((prev) => ({ ...prev, ...next }));
    });
  }, [tabs, mediaCache]);

  useEffect(() => {
    const slideId = slideIds[activeIndex];
    if (articleRef.current && slideId) {
      slideIds.forEach((id) => articleRef.current.classList.remove(id));
      articleRef.current.classList.add(slideId);
    }
  }, [activeIndex, slideIds]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        setActiveIndex((prev) => Math.min(prev + 1, tabs.length - 1));
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [tabs.length]);

  useEffect(() => {
    const el = slideContainerRef.current;
    if (!el) return;

    let startX = null;
    let startY = null;

    const onPointerDown = (e) => {
      startX = e.clientX;
      startY = e.clientY;
    };

    const onPointerUp = (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = null;
      startY = null;
      // ignore if more vertical than horizontal (user scrolling content)
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (Math.abs(dx) < 50) return;
      if (dx < 0) {
        setActiveIndex((prev) => Math.min(prev + 1, tabs.length - 1));
      } else {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointerup", onPointerUp);
    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointerup", onPointerUp);
    };
  }, [tabs.length]);

  const handleIndexClick = (event, targetId) => {
    event.preventDefault();
    const idx = slideIds.indexOf(targetId);
    if (idx !== -1) setActiveIndex(idx);
  };

  const renderContentGrid = (items = [], tabStyle) => {
    const isIconGrid = tabStyle === "icon_grid";
    if (isIconGrid) {
      return (
        <div className="grid-card grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-20 w-full mb-40 last:mb-0">
          {items.map((item, i) => {
            const iconUrl = getMediaUrl(item?.icons || item?.icon, mediaCache);
            return (
              <div key={i} className="card">
                {iconUrl && (
                  <div className="company-profile-card-icon">
                    <Image src={iconUrl} width={32} height={32} alt="icon" className="invert" />
                  </div>
                )}
                <div className="title title-black">
                  <h5
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item?.heading || "") }}
                  />
                </div>
                <div className="content">
                  <p>{item?.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return items.map((item, i) => (
      <div key={i}>
        <div className="title title-black mb-20">
          <h3
            className="h4"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`⦿ ${item.heading || ""}`) }}
          />
        </div>
        <div className="content mb-40">
          <p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(item.description || "") }} />
        </div>
      </div>
    ));
  };

  if (!tabs.length) return null;

  return (
    <div className="company-profile-page relative z-1">
      <section className="company-profile-slider-wrapper white flex flex-col justify-center min-h-screen">
        <button
          type="button"
          className="company-profile-prev"
          onClick={() => setActiveIndex((prev) => Math.max(prev - 1, 0))}
          disabled={isBeginning}
          aria-label="Prev"
        />
        <button
          type="button"
          className="company-profile-next"
          onClick={() => setActiveIndex((prev) => Math.min(prev + 1, tabs.length - 1))}
          disabled={isEnd}
          aria-label="Next"
        />
        <div className="company-profile-sheet">
          <article ref={articleRef} className={`company-profile-article ${activeCounter}`}>
            <div
              className="company-profile-pagination profileslide py-15"
              role="tablist"
              aria-label="Profile navigation"
            >
              {tabs.map((_, idx) => (
                <button
                  key={idx}
                  role="tab"
                  aria-selected={idx === activeIndex}
                  onClick={() => setActiveIndex(idx)}
                  className={`swiper-pagination-bullet${idx === activeIndex ? " swiper-pagination-bullet-active" : ""}${idx < activeIndex ? " previous-slide" : ""}`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
            <div
              ref={slideContainerRef}
              className="profileslide h-[calc(100%-33px)] w-full z-1 relative"
            >
              {tabs.map((tab, idx) => {
                const slideId = `counter${idx + 1}`;
                const baseProfile = `profile profile${idx + 1} flex flex-col items-center justify-start gap-40 py-40`;
                const headingText = stripHtml(tab.heading || "");

                const renderSlideBody = () => {
                  switch (tab.tab_style) {
                    case "logo":
                      return (
                        <div className="profile profile1 flex flex-col items-center justify-center gap-40">
                          <div
                            className="img company-profile-cover-logo"
                            style={{ background: "transparent", boxShadow: "none" }}
                          >
                            {getMediaUrl(tab.logo, mediaCache) && (
                              <Image
                                src={getMediaUrl(tab.logo, mediaCache)}
                                width={520}
                                height={248}
                                alt="Logo"
                              />
                            )}
                          </div>
                          <div className="title title-black text-center lg:ml-60">
                            <h2
                              dangerouslySetInnerHTML={{
                                __html: DOMPurify.sanitize(
                                  tab.heading || "Company <span>Profile</span>"
                                ),
                              }}
                            />
                          </div>
                        </div>
                      );

                    case "content":
                      return (
                        <div className={`${baseProfile} profile3`}>
                          <div className="w-full lg:w-9/12">
                            <div className="title title-black mb-20">
                              <h2
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.heading || ""),
                                }}
                              />
                            </div>
                            {headingText.toLowerCase() === "index" ? (
                              <ol type="1">
                                {indexItems.map((item, idx) => (
                                  <li key={`${item.targetId}-${idx}`}>
                                    <a
                                      href={`#${item.targetId}`}
                                      className="slide-link"
                                      onClick={(e) => handleIndexClick(e, item.targetId)}
                                    >
                                      {item.label}
                                    </a>
                                  </li>
                                ))}
                              </ol>
                            ) : (
                              <>
                                {tab.content && (
                                  <div
                                    className="content mb-40"
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(tab.content),
                                    }}
                                  />
                                )}
                                {renderContentGrid(tab.content_grid || [], "content")}
                                {tab.bottom_content && (
                                  <div
                                    className="content mt-40 mb-40 last:mb-0"
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(tab.bottom_content),
                                    }}
                                  />
                                )}
                              </>
                            )}
                            <div className="btn-custom mt-20">
                              <Link href="/" aria-label="back to home" className={`btn btn-black`}>
                                <span className="btn-txt">
                                  Back To Home
                                  <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );

                    case "content_grid":
                    case "icon_grid":
                    case "vision_mission":
                      const isVM = tab.tab_style === "vision_mission" || slideId === "counter6";
                      return (
                        <div className={baseProfile}>
                          <div className="w-full lg:w-9/12">
                            <div className="title title-black mb-20">
                              <h2
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.heading || ""),
                                }}
                              />
                            </div>
                            {tab.content && (
                              <div
                                className="content mb-40 last:mb-0"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.content),
                                }}
                              />
                            )}
                            {isVM ? (
                              <div className="grid-card grid grid-cols-2 max-sm:grid-cols-1 gap-40 w-full mb-40 last:mb-0">
                                {(tab.content_grid || []).map((it, i) => (
                                  <div key={i} className="card">
                                    <div className="title title-black">
                                      <h4
                                        dangerouslySetInnerHTML={{
                                          __html: DOMPurify.sanitize(it.heading || ""),
                                        }}
                                      />
                                    </div>
                                    <div className="content">
                                      <p>{it.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              renderContentGrid(tab.content_grid || [], tab.tab_style)
                            )}
                            {tab.bottom_description && (
                              <div
                                className="content mb-40 last:mb-0"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.bottom_description),
                                }}
                              />
                            )}
                            <div className="btn-custom mt-20">
                              <Link href="/" aria-label="back to home" className={`btn btn-black`}>
                                <span className="btn-txt">
                                  Back To Home
                                  <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );

                    case "services":
                      return (
                        <div className={baseProfile}>
                          <div className="w-full lg:w-9/12">
                            <div className="title title-black mb-40">
                              <h2
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(
                                    tab.heading || "Our <span>Services</span>"
                                  ),
                                }}
                              />
                            </div>
                            <div className="grid-card grid grid-cols-2 max-sm:grid-cols-1 gap-40 w-full mb-40">
                              {(tab.service_list || []).map((s, i) => (
                                <ServiceCard
                                  key={i}
                                  service={{
                                    title: s.heading,
                                    body: s.description,
                                    href: s.button?.url || s.buton?.url || "#",
                                  }}
                                />
                              ))}
                            </div>
                            <div className="btn-custom mt-20">
                              <Link href="/" aria-label="back to home" className={`btn btn-black`}>
                                <span className="btn-txt">
                                  Back To Home
                                  <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );

                    case "work":
                      return (
                        <div className={baseProfile}>
                          <div className="w-full lg:w-9/12">
                            <div className="title title-black mb-20 last:mb-0">
                              <h2
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.heading || ""),
                                }}
                              />
                            </div>
                            {tab.content && (
                              <div
                                className="content mb-40 last:mb-0"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.content),
                                }}
                              />
                            )}
                            {tab.button?.url && (
                              <div className="btn-custom mb-40 last:mb-0">
                                <Link href={tab.button.url} target="_blank" className="btn-link">
                                  {tab.button.title || "View Work"}{" "}
                                  <div className="position-relative">
                                    <span className="circle">
                                      <ArrowIcon />
                                    </span>
                                  </div>
                                </Link>
                              </div>
                            )}
                            <div className="btn-custom mt-20">
                              <Link href="/" aria-label="back to home" className={`btn btn-black`}>
                                <span className="btn-txt">
                                  Back To Home
                                  <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );

                    case "clients":
                      return (
                        <div className={baseProfile}>
                          <div className="w-full lg:w-9/12">
                            <div className="title title-black mb-20 last:mb-0">
                              <h2
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.heading || ""),
                                }}
                              />
                            </div>
                            {tab.content && (
                              <div
                                className="content mb-40 last:mb-0"
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.content),
                                }}
                              />
                            )}
                            <div className="grid-card grid grid-cols-3 max-md:grid-cols-2 max-sm:grid-cols-1 gap-30 w-full mb-40 last:mb-0">
                              {(tab.content_grid || []).map((stat, i) => (
                                <div key={i} className="card">
                                  <div className="title title-black">
                                    <AnimatedCount
                                      value={stat?.heading || ""}
                                      isActive={activeCounter === slideId}
                                    />
                                  </div>
                                  <div className="content">
                                    <p>{stat?.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="btn-custom mt-20">
                              <Link href="/" aria-label="back to home" className={`btn btn-black`}>
                                <span className="btn-txt">
                                  Back To Home
                                  <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );

                    case "testimonials":
                      return (
                        <div className={baseProfile}>
                          <div className="w-full lg:w-9/12">
                            <div className="title title-black mb-40 last:mb-0">
                              <h2
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.heading || ""),
                                }}
                              />
                            </div>
                            <div className="grid-card grid grid-cols-2 max-sm:grid-cols-1 gap-40 w-full mb-40 last:mb-0">
                              {(tab.testimonials || []).map((t, i) => (
                                <div key={i} className="card">
                                  <div className="content">
                                    <p className="mb-20">
                                      <span>&quot;</span>
                                      {t.testimonial}
                                      <span>&quot;</span>
                                    </p>
                                    <p>
                                      - <span className="text-gold font-bold">{t.name}</span>
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="btn-custom mt-20">
                              <Link href="/" aria-label="back to home" className={`btn btn-black`}>
                                <span className="btn-txt">
                                  Back To Home
                                  <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );

                    case "goals":
                      return (
                        <div className={baseProfile}>
                          <div className="w-full lg:w-9/12">
                            <div className="title title-black mb-40">
                              <h2
                                dangerouslySetInnerHTML={{
                                  __html: DOMPurify.sanitize(tab.heading || ""),
                                }}
                              />
                            </div>
                            <div className="grid-card grid grid-cols-2 max-sm:grid-cols-1 gap-40 w-full mb-40 last:mb-0">
                              {(tab.content_grid || []).map((goal, i) => (
                                <div key={i} className="card">
                                  <div className="title title-black">
                                    <h5
                                      dangerouslySetInnerHTML={{
                                        __html: DOMPurify.sanitize(goal.heading || ""),
                                      }}
                                    />
                                  </div>
                                  <div className="content">
                                    <p>{goal.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="btn-custom mt-20">
                              <Link href="/" aria-label="back to home" className={`btn btn-black`}>
                                <span className="btn-txt">
                                  Back To Home
                                  <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                </span>
                              </Link>
                            </div>
                          </div>
                        </div>
                      );

                    case "thank_you":
                      return (
                        <div className={`${baseProfile} h-full`}>
                          <div className="w-full lg:w-7/12 h-full">
                            <div className="flex flex-col items-start justify-between gap-40 m-0 p-0 size-full">
                              <div className="tp">
                                {tab.content && (
                                  <div
                                    className="content mb-40 last:mb-0"
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(tab.content),
                                    }}
                                  />
                                )}
                                <div className="title mb-40 last:mb-0">
                                  <h1
                                    className="display"
                                    dangerouslySetInnerHTML={{
                                      __html: DOMPurify.sanitize(tab.heading || ""),
                                    }}
                                  />
                                </div>
                              </div>

                              <div className="ofc-det">
                                <div className="flex flex-wrap items-start justify-start gap-40 w-full">
                                  <div className="title title-black mb-20 last:mb-0">
                                    {tab.bottom_content && (
                                      <div
                                        dangerouslySetInnerHTML={{
                                          __html: DOMPurify.sanitize(tab.bottom_content),
                                        }}
                                      />
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="btn-custom mt-20">
                                <Link
                                  href="/"
                                  aria-label="back to home"
                                  className={`btn btn-black`}
                                >
                                  <span className="btn-txt">
                                    Back To Home
                                    <span className="btn-txt-extra" data-txt="Back to Home"></span>
                                  </span>
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      );

                    default:
                      return null;
                  }
                };

                return (
                  <div
                    key={slideId}
                    id={slideId}
                    data-counter={slideId}
                    className={`profile-slide${idx === activeIndex ? " active" : ""}`}
                    aria-hidden={idx !== activeIndex}
                  >
                    <div className="container-fluid-md h-full max-575:ps-30!">
                      {renderSlideBody()}
                    </div>
                  </div>
                );
              })}
            </div>
          </article>
        </div>
      </section>
    </div>
  );
}
