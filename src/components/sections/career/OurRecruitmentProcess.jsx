"use client";
import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, useMemo } from "react";
import Image from "next/image";

import { safeParse } from "@/utils/safeParse";
import { RECRUITMENT_STEP_ICON } from "@/constants";
import { useScrollProgress } from "@/hooks/useScrollProgress";

// Binary-search the sampled path for the pair of samples that bracket `t`,
// then linearly interpolate to get a sub-sample (x, y). Cheaper than the
// former useTransform multi-key mapping; same resulting curve.
function samplePath(ballPath, t) {
  const { progress, x, y } = ballPath;
  if (progress.length === 0) return { x: 0, y: 0 };
  if (t <= progress[0]) return { x: x[0], y: y[0] };
  if (t >= progress[progress.length - 1]) {
    const last = progress.length - 1;
    return { x: x[last], y: y[last] };
  }
  // linear scan — progress is monotonic and short (~180 entries) so this
  // is cheap enough and avoids the bookkeeping of a binary search here.
  for (let i = 1; i < progress.length; i++) {
    if (progress[i] >= t) {
      const span = progress[i] - progress[i - 1];
      const local = span === 0 ? 0 : (t - progress[i - 1]) / span;
      return {
        x: x[i - 1] + (x[i] - x[i - 1]) * local,
        y: y[i - 1] + (y[i] - y[i - 1]) * local,
      };
    }
  }
  return { x: x[0], y: y[0] };
}

export default function OurRecruitmentProcess({ data }) {
  const { heading = "", sub_heading = "", description = "", process_steps = [] } = data || {};

  const processSectionRef = useRef(null);
  const processTrackRef = useRef(null);
  const processIconRefs = useRef([]);
  const mobileViewportRef = useRef(null);
  const mobileTrackRef = useRef(null);

  const [ballPath, setBallPath] = useState({ progress: [0, 1], x: [0, 0], y: [0, 0] });
  const [curvePathD, setCurvePathD] = useState("");
  const [hasBallPath, setHasBallPath] = useState(false);
  // On mobile the active step is driven by the auto-rotate interval; on
  // desktop it's derived from scroll progress below. `mobileActiveStep` is
  // ignored when !isMobile.
  const [mobileActiveStep, setMobileActiveStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileX, setMobileX] = useState(0);
  const [mobileStepWidth, setMobileStepWidth] = useState(0);
  const [mobileGap, setMobileGap] = useState(0);

  const processProgress = useScrollProgress(processSectionRef, {
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const updateIsMobile = () => {
      if (typeof window === "undefined") return;
      setIsMobile(window.innerWidth < 1024);
    };
    updateIsMobile();
    window.addEventListener("resize", updateIsMobile);
    return () => window.removeEventListener("resize", updateIsMobile);
  }, []);

  // Desktop step derives from scroll progress; no state needed.
  const desktopActiveStep = useMemo(() => {
    if (process_steps.length === 0) return 0;
    const lastStep = process_steps.length - 1;
    return Math.min(lastStep, Math.max(0, Math.round(processProgress * lastStep)));
  }, [processProgress, process_steps.length]);
  const activeProcessStep = isMobile ? mobileActiveStep : desktopActiveStep;

  const { x: ballX, y: ballY } = samplePath(ballPath, processProgress);
  const ballYAligned = ballY - 78;

  useLayoutEffect(() => {
    const measure = () => {
      const track = mobileTrackRef.current;
      const viewport = mobileViewportRef.current;
      if (!track || !viewport) return;
      const kids = Array.from(track.children);
      if (!kids.length) return;

      const style = window.getComputedStyle(track);
      const gapPx = parseFloat(style.columnGap || style.gap || "0") || 0;
      setMobileGap(gapPx);

      const width = kids[0].getBoundingClientRect().width;
      setMobileStepWidth(width);

      const step = width + gapPx;
      const maxDrag = Math.max(0, step * (kids.length - 1));
      setMobileX((prev) => Math.min(0, Math.max(-maxDrag, prev)));
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [process_steps.length]);

  useLayoutEffect(() => {
    const cubicPoint = (p0, p1, p2, p3, t) => {
      const inv = 1 - t;
      return {
        x:
          inv * inv * inv * p0.x +
          3 * inv * inv * t * p1.x +
          3 * inv * t * t * p2.x +
          t * t * t * p3.x,
        y:
          inv * inv * inv * p0.y +
          3 * inv * inv * t * p1.y +
          3 * inv * t * t * p2.y +
          t * t * t * p3.y,
      };
    };

    const updateBallPath = () => {
      const track = processTrackRef.current;
      const icons = processIconRefs.current.filter(Boolean);
      if (!track || icons.length < 2) return;

      const trackRect = track.getBoundingClientRect();
      const centers = icons.map((icon) => {
        const rect = icon.getBoundingClientRect();
        return {
          x: rect.left - trackRect.left + rect.width / 2,
          y: rect.top - trackRect.top + rect.height * 0.78,
        };
      });

      const segmentCount = centers.length - 1;
      const curve = Math.min(260, Math.max(130, trackRect.height * 0.58));
      let pathD = `M ${centers[0].x} ${centers[0].y}`;
      const sampledPoints = [];

      for (let i = 0; i < segmentCount; i++) {
        const from = centers[i];
        const to = centers[i + 1];
        const dx = to.x - from.x;
        const segmentCurve = curve * (i === 1 || i === 2 ? 1.24 : 1.08);
        const arch = -segmentCurve;
        const cp1 = { x: from.x + dx * 0.28, y: from.y + arch };
        const cp2 = { x: from.x + dx * 0.72, y: to.y + arch };

        pathD += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${to.x} ${to.y}`;

        const samplesPerSegment = 36;
        for (let s = 0; s <= samplesPerSegment; s++) {
          if (i > 0 && s === 0) continue;
          sampledPoints.push(cubicPoint(from, cp1, cp2, to, s / samplesPerSegment));
        }
      }

      const total = Math.max(sampledPoints.length - 1, 1);
      const progress = sampledPoints.map((_, idx) => idx / total);
      const x = sampledPoints.map((p) => p.x);
      const y = sampledPoints.map((p) => p.y);

      setCurvePathD(pathD);
      setBallPath({ progress, x, y });
      setHasBallPath(true);
    };

    let rafId = requestAnimationFrame(updateBallPath);
    window.addEventListener("resize", updateBallPath);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updateBallPath);
    };
  }, [process_steps.length]);

  const snapToStep = useCallback(
    (index) => {
      const fallbackWidth = mobileTrackRef.current?.children?.[0]?.clientWidth || 0;
      const stepWidth = mobileStepWidth || fallbackWidth || 1;
      const step = stepWidth + mobileGap;
      const clamped = Math.max(0, Math.min(process_steps.length - 1, index));
      setMobileX(-clamped * step);
      setMobileActiveStep(clamped);
    },
    [mobileGap, mobileStepWidth, process_steps.length]
  );

  useEffect(() => {
    if (!isMobile) return;
    const id = setInterval(() => {
      snapToStep((activeProcessStep + 1) % process_steps.length);
    }, 4000);
    return () => clearInterval(id);
  }, [activeProcessStep, isMobile, snapToStep, process_steps.length]);

  const activeStep = process_steps[activeProcessStep];

  return (
    <section
      ref={processSectionRef}
      className={`process-wrapper py-80 max-lg:py-40 mt-0 ${data?.extra_class || ""}`}
      id={data?.extra_id || ""}
    >
      <div className="container-fluid h-full">
        <div className="top-info lg:text-center flex flex-wrap lg:justify-center lg:max-w-1000 mx-auto">
          <div className="title title-white">{heading && <h2>{safeParse(heading || "")}</h2>}</div>
          {sub_heading && (
            <div className="subheading mt-20">
              <h5>{sub_heading}</h5>
            </div>
          )}
          {description && (
            <div className="content lg:w-12/12 mx-auto mt-20">
              <div>{safeParse(description)}</div>
            </div>
          )}
        </div>
      </div>
      {process_steps.length > 0 && (
        <div className="relative h-[320vh] max-lg:h-auto">
          <div className="hidden lg:block sticky top-0 h-screen">
            <div className="container-fluid h-full">
              <div className="process-container max-lg:h-auto h-screen flex flex-col justify-between pt-60 items-center">
                <div className="process-content text-center max-w-[58rem] my-auto">
                  <div className="content-inner w-8/12 mx-auto">
                    {/* Crossfade on key change — mount a fresh node per active
                        step so the CSS `recruitment-step-fade` animation
                        replays. Replaces framer-motion AnimatePresence. */}
                    <div key={activeStep?.title} className="recruitment-step-fade">
                      <div className="icon flex justify-center mb-16">
                        <lord-icon
                          src={activeStep?.icon_url}
                          trigger="loop"
                          delay="1000"
                          colors="primary:#ffffff,secondary:#ffffff"
                          style={{ width: "72px", height: "72px" }}
                        />
                      </div>
                      <h5>{activeStep?.title}</h5>
                      <div className="content pt-10">
                        <div>{safeParse(activeStep?.description || "")}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  ref={processTrackRef}
                  className="max-lg:hidden flex flex-nowrap items-center justify-center gap-x-100 relative"
                >
                  <svg
                    className="pointer-events-none absolute inset-0 z-10 overflow-visible opacity-0"
                    width="100%"
                    height="100%"
                    preserveAspectRatio="none"
                  >
                    {curvePathD ? (
                      <path
                        d={curvePathD}
                        fill="none"
                        stroke="rgba(255,255,255,0.8)"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    ) : null}
                  </svg>

                  <div
                    className="ball absolute left-0 top-0 z-20 h-[60px] w-[60px] aspect-square overflow-hidden rounded-full -translate-x-1/2 -translate-y-1/2"
                    style={{
                      transform: `translate3d(${ballX}px, ${ballYAligned}px, 0)`,
                      opacity: hasBallPath ? 1 : 0,
                      willChange: "transform",
                    }}
                  >
                    <span className="absolute inset-0 block rounded-full bg-gradient-to-br from-[#ffe6a0] via-[#e8a800] to-[#8d6500] shadow-[0_12px_28px_rgba(232,168,0,0.5),inset_0_-8px_14px_rgba(0,0,0,0.28)]" />
                    <span className="absolute left-[10%] top-[5%] h-22 w-22 rounded-full bg-white blur-sm" />
                    <span className="absolute right-[20%] bottom-[-5%] h-6 w-32 rounded-full bg-black blur-sm" />
                  </div>

                  {process_steps.map((_, index) => (
                    <div
                      key={`process-icon-${index + 1}`}
                      ref={(el) => {
                        processIconRefs.current[index] = el;
                      }}
                      className="icon"
                    >
                      <Image
                        src={RECRUITMENT_STEP_ICON}
                        width="198"
                        height="135"
                        alt={`Step ${index + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:hidden mt-40">
            <div className="container-fluid">
              <div ref={mobileViewportRef} className="overflow-hidden">
                <div
                  ref={mobileTrackRef}
                  className="flex gap-12"
                  style={{
                    transform: `translate3d(${mobileX}px, 0, 0)`,
                    transition: "transform 0.55s cubic-bezier(0.04, 0.62, 0.23, 0.98)",
                    willChange: "transform",
                  }}
                >
                  {process_steps.map((step, index) => (
                    <div key={step.title} className="flex-shrink-0 w-full max-w-[90vw] text-left">
                      <div className="flex justify-start mb-14">
                        <lord-icon
                          src={step.icon_url}
                          trigger="loop"
                          delay="1000"
                          colors="primary:#ffffff,secondary:#ffffff"
                          style={{ width: "64px", height: "64px" }}
                        />
                      </div>
                      <h5 className="mb-10">{step.title}</h5>
                      <div className="text-black-50">{safeParse(step.description || "")}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-center gap-8 py-10 px-20 rounded-full bg-black-700 w-fit border border-black-500 mt-40">
                {process_steps.map((_, idx) => (
                  <button
                    key={idx}
                    aria-label={`Step ${idx + 1}`}
                    onClick={() => snapToStep(idx)}
                    className={`size-6 rounded-full transition ${activeProcessStep === idx ? "bg-gold" : "bg-white/20"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
