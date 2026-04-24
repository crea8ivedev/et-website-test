"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { safeParse } from "@/utils/safeParse";

const TIMELINE_ACTIVE_COLOR = "#EDA800";

const MilestonesSection = ({ data }) => {
  const { title, description, milestone_items = [], extra_id, extra_class } = data || {};

  const timelineStageRef = useRef(null);
  const timelineArcRef = useRef(null);
  const timelineContentRef = useRef(null);
  const mobileListRef = useRef(null);
  const mobileBtnRefs = useRef({});

  const [activeYear, setActiveYear] = useState(milestone_items[0]?.milestone_year || "");
  const activeCard =
    milestone_items.find((c) => c.milestone_year === activeYear) || milestone_items[0];

  const [timelineLayout, setTimelineLayout] = useState({
    arcW: 0,
    arcH: 0,
    arcLeft: 0,
    arcTop: 0,
    contentTop: 0,
  });
  const [timelineReady, setTimelineReady] = useState(false);

  useEffect(() => {
    const stageEl = timelineStageRef.current;
    const arcEl = timelineArcRef.current;
    const contentEl = timelineContentRef.current;
    if (!stageEl || !arcEl || !contentEl) return;

    const measure = () => {
      const stageRect = stageEl.getBoundingClientRect();
      const arcRect = arcEl.getBoundingClientRect();
      const contentRect = contentEl.getBoundingClientRect();

      setTimelineLayout((prev) => {
        const next = {
          arcW: arcRect.width,
          arcH: arcRect.height,
          arcLeft: arcRect.left - stageRect.left,
          arcTop: arcRect.top - stageRect.top,
          contentTop: contentRect.top - stageRect.top,
        };
        const same =
          prev.arcW === next.arcW &&
          prev.arcH === next.arcH &&
          prev.arcLeft === next.arcLeft &&
          prev.arcTop === next.arcTop &&
          prev.contentTop === next.contentTop;
        return same ? prev : next;
      });
      setTimelineReady(true);
    };

    const raf = requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(stageEl);
    ro.observe(arcEl);
    ro.observe(contentEl);
    window.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  const timelineArc = useMemo(() => {
    const W = timelineLayout.arcW;
    const H = timelineLayout.arcH;
    const count = milestone_items.length;
    if (!W || !H || count === 0) return { pathD: "", points: [], apexPoint: null };

    const clamp = (min, v, max) => Math.min(max, Math.max(min, v));
    const toRad = (deg) => (deg * Math.PI) / 180;

    const centerX = W / 2;
    const centerY = H * 1.12;

    const paddingX = clamp(20, W * 0.03, 48);
    const radius = centerX - paddingX;

    const startDeg = 168;
    const endDeg = 12;

    const labelOffset = clamp(32, Math.min(W, H) * 0.11, 48);

    const points = milestone_items.map((_card, idx) => {
      const t = count === 1 ? 0.5 : idx / (count - 1);
      const angleDeg = startDeg - t * (startDeg - endDeg);
      const angle = toRad(angleDeg);

      const x = centerX + radius * Math.cos(angle);
      const y = centerY - radius * Math.sin(angle);

      const labelR = radius + labelOffset;
      const labelX = centerX + labelR * Math.cos(angle);
      const labelY = centerY - labelR * Math.sin(angle);

      const rotate = clamp(-80, -(angleDeg - 90), 80);

      return { x, y, labelX, labelY, rotate };
    });

    const samples = 360;
    let d = "";
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const angleDeg = startDeg - t * (startDeg - endDeg);
      const angle = toRad(angleDeg);
      const px = centerX + radius * Math.cos(angle);
      const py = centerY - radius * Math.sin(angle);
      d += `${i === 0 ? "M" : "L"} ${px.toFixed(2)} ${py.toFixed(2)} `;
    }

    const apexPoint = { x: centerX, y: centerY - radius };

    return { pathD: d.trim(), points, apexPoint };
  }, [timelineLayout.arcW, timelineLayout.arcH, milestone_items]);

  const activeTimelineIdx = useMemo(() => {
    const idx = milestone_items.findIndex((c) => c.milestone_year === activeYear);
    return idx === -1 ? 0 : idx;
  }, [activeYear, milestone_items]);

  const arcRotation = useMemo(() => {
    const count = milestone_items.length;
    if (count <= 1) return 0;
    const t = activeTimelineIdx / (count - 1);
    return 78 - t * 156;
  }, [activeTimelineIdx, milestone_items.length]);

  const apexInStage = useMemo(() => {
    if (!timelineArc.apexPoint) return null;
    return {
      x: timelineLayout.arcLeft + timelineArc.apexPoint.x,
      y: timelineLayout.arcTop + timelineArc.apexPoint.y,
    };
  }, [timelineArc.apexPoint, timelineLayout.arcLeft, timelineLayout.arcTop]);

  const activeTimelineLine = useMemo(() => {
    if (!apexInStage) return null;
    const top = apexInStage.y + 15;
    const bottom = timelineLayout.contentTop - 20;
    const height = Math.max(0, bottom - top);
    return { x: apexInStage.x, top, height };
  }, [apexInStage, timelineLayout.contentTop]);

  if (!data) return null;

  return (
    <section
      id={extra_id}
      className={`interactive-wrapper relative overflow-hidden my-80 max-lg:my-50 ${extra_class || ""}`}
    >
      <div className="container-fluid mx-auto px-20 lg:px-16">
        <div className="flex flex-wrap items-center justify-center m-0 p-0 w-full">
          <div className="w-full lg:max-w-680 lg:text-center">
            <div className="title title-white mb-20">
              <h2>{safeParse(title || "")}</h2>
            </div>
            <div className="content">{safeParse(description || "")}</div>
          </div>
        </div>

        <div
          ref={timelineStageRef}
          className="relative mx-auto max-lg:mt-40 mt-70 flex flex-col justify-end lg:aspect-[16/6]"
        >
          <div className="mob-timeline lg:hidden max-w-full mx-auto pb-30">
            <div
              ref={mobileListRef}
              className="flex gap-10 overflow-x-auto scrollbar-hide py-10 px-6"
            >
              {milestone_items.map((card) => {
                const isActive = activeYear === card.milestone_year;
                return (
                  <button
                    key={card.milestone_year}
                    type="button"
                    ref={(el) => (mobileBtnRefs.current[card.milestone_year] = el)}
                    onClick={() => {
                      setActiveYear(card.milestone_year);
                      const container = mobileListRef.current;
                      const btn = mobileBtnRefs.current[card.milestone_year];
                      if (container && btn) {
                        const containerRect = container.getBoundingClientRect();
                        const btnRect = btn.getBoundingClientRect();
                        const offset =
                          btnRect.left -
                          containerRect.left -
                          (containerRect.width / 2 - btnRect.width / 2);
                        container.scrollTo({
                          left: container.scrollLeft + offset,
                          behavior: "smooth",
                        });
                      }
                    }}
                    className="relative whitespace-nowrap rounded-full border px-[18px] py-10 font-semibold tracking-tight transition-transform duration-150 active:scale-[0.98]"
                    style={{
                      borderColor: isActive ? TIMELINE_ACTIVE_COLOR : "rgba(255,255,255,0.25)",
                      color: isActive ? TIMELINE_ACTIVE_COLOR : "rgba(255,255,255,0.85)",
                    }}
                    aria-pressed={isActive}
                  >
                    {card.milestone_year}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="desk-timeline hidden lg:block absolute inset-0 h-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-250 after:bg-linear-to-b after:from-black-800/0 after:to-black-800 after:to-80%">
            <div
              ref={timelineArcRef}
              className="relative mx-auto w-full overflow-visible"
              style={{ maxWidth: 1200, aspectRatio: "16 / 7.5" }}
            >
              <div
                className="absolute inset-0 overflow-visible"
                style={{
                  transformOrigin: "50% 113%",
                  transform: `rotate(${arcRotation}deg)`,
                  transition: "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                {timelineReady && timelineArc.pathD && (
                  <svg
                    className="absolute inset-0 w-full h-full overflow-visible"
                    viewBox={`0 0 ${timelineLayout.arcW} ${timelineLayout.arcH}`}
                    preserveAspectRatio="none"
                  >
                    <path
                      d={timelineArc.pathD}
                      fill="none"
                      stroke="rgba(255,255,255,0.28)"
                      strokeWidth="1.5"
                      strokeDasharray="2 9"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {timelineReady &&
                  timelineArc.points.map((p, idx) => {
                    const card = milestone_items[idx];
                    const isActive = activeYear === card.milestone_year;
                    return (
                      <div
                        key={card.milestone_year}
                        className="absolute"
                        style={{
                          left: p.x,
                          top: p.y,
                          transform: "translate(-50%, -50%)",
                          zIndex: 20,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveYear(card.milestone_year)}
                          className="relative bg-transparent border-0 p-0 cursor-pointer overflow-visible focus:outline-none transition-transform duration-200 hover:scale-[1.15] active:scale-90"
                          style={{ width: 56, height: 56 }}
                        >
                          <div
                            className="absolute"
                            style={{
                              left: "50%",
                              top: "50%",
                              transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
                              zIndex: 10,
                            }}
                          >
                            <span
                              className="block font-medium capitalize leading-none whitespace-nowrap"
                              style={{
                                fontSize: "clamp(1.2rem, 3.2vw, 2.015rem)",
                                letterSpacing: "-0.03em",
                                textAlign: "center",
                                color: isActive ? TIMELINE_ACTIVE_COLOR : "rgba(255,255,255,0.82)",
                              }}
                            >
                              {card.milestone_year}
                            </span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>

            {activeTimelineLine && activeTimelineLine.height > 4 && (
              <div
                className="absolute pointer-events-none"
                style={{
                  width: 2,
                  zIndex: 5,
                  transform: "translateX(-50%)",
                  left: activeTimelineLine.x,
                  top: activeTimelineLine.top,
                  height: activeTimelineLine.height,
                  opacity: 1,
                  transition:
                    "left 0.5s cubic-bezier(0.22, 1, 0.36, 1), top 0.5s cubic-bezier(0.22, 1, 0.36, 1), height 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `repeating-linear-gradient(to bottom, ${TIMELINE_ACTIVE_COLOR} 0px, ${TIMELINE_ACTIVE_COLOR} 4px, transparent 4px, transparent 12px)`,
                  }}
                />
              </div>
            )}
          </div>

          <div
            ref={timelineContentRef}
            className="relative z-10 mx-auto lg:max-w-680 lg:text-center"
          >
            <div key={activeYear} className="mx-auto milestone-card-enter">
              <div className="title title-white mb-20">
                <h3 className="h5">
                  <span>{activeCard.milestone_title}</span>
                </h3>
              </div>
              <div className="content">{safeParse(activeCard.milestone_description || "")}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilestonesSection;
