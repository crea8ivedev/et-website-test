"use client";
import React, { useState, useEffect, useRef } from "react";
import { safeParse } from "@/utils/safeParse";
import { Reveal } from "@/components/common/Reveal";

const InlineCounter = ({
  from = 0,
  to,
  duration = 2.8,
  suffix = "",
  useCommas = false,
  className = "",
  style = {},
  start,
}) => {
  const [count, setCount] = useState(from);
  const rafRef = useRef(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (!start || hasRun.current) return;
    hasRun.current = true;
    let beganAt = null;
    const step = (ts) => {
      if (!beganAt) beganAt = ts;
      const p = ts - beganAt;
      const progress = Math.min(p / (duration * 1000), 1);
      setCount(from + (to - from) * progress);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(to);
        cancelAnimationFrame(rafRef.current);
      }
    };
    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [to, from, duration, start]);

  const display = useCommas ? Math.round(count).toLocaleString("en-US") : Math.round(count);
  return (
    <div className={className} style={style}>
      {display}
      {suffix}
    </div>
  );
};

const ExperienceSection = ({ data }) => {
  const countersRef = useRef(null);
  const [countersInView, setCountersInView] = useState(false);

  useEffect(() => {
    const node = countersRef.current;
    if (!node) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCountersInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  if (!data) return null;

  const {
    heading,
    short_description,
    achievement_blocks,
    achievement_counters,
    extra_id,
    extra_class,
  } = data;

  const lordIcons = [
    "https://cdn.lordicon.com/ebvizisb.json",
    "https://cdn.lordicon.com/zhiiqoue.json",
    "https://cdn.lordicon.com/ebvizisb.json",
  ];

  return (
    <section
      id={extra_id}
      className={`common-contant-wrapper py-80 max-lg:py-40 ${extra_class || ""}`}
    >
      <div className="container-fluid-lg mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 max-lg:gap-40 max-lg:mb-40 lg:grid-cols-4 justify-between items-stretch gap-0 lg:divide-x divide-solid divide-black-700">
          <div className="w-full sm:col-span-2 lg:col-span-2 lg:pr-60 lg:pb-60">
            <div className="title title-white mb-20">
              <Reveal as="h2">{safeParse(heading || "")}</Reveal>
            </div>
            <div className="content">
              <Reveal delay={200}>{safeParse(short_description || "")}</Reveal>
            </div>
          </div>

          {achievement_blocks?.map((block, index) => (
            <div
              key={index}
              className={`w-full lg:col-span-1 ${index === 0 ? "lg:px-30" : "lg:pl-30"}`}
            >
              <div className="flex flex-col items-center justify-center text-center w-full gap-40 h-full">
                <div className="block relative w-100 h-70">
                  <div className="ico mx-auto flex items-center justify-center bg-linear-to-br from-black-300 to-black-600 size-70 rounded-full outline-2 max-639:outline-1 outline-offset-4 outline-dashed outline-black-500">
                    <lord-icon
                      src={lordIcons[index] || lordIcons[0]}
                      trigger="loop"
                      state="loop-cycle"
                      colors="primary:#ffffff,secondary:#ffffff"
                      style={{ width: "40px", height: "40px" }}
                    />
                  </div>
                  <div className="size-60 text-body-2 font-bold flex justify-center items-center bg-linear-to-br from-black-300 to-black-600 rounded-full absolute -top-15 -left-15">
                    {block.count_text}
                  </div>
                </div>
                <div>
                  <div className="title title-white mb-20">
                    <h3 className="!text-body-2">{block.block_title}</h3>
                  </div>
                  <div className="content sm">{safeParse(block.block_description || "")}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div
          ref={countersRef}
          className="grid grid-cols-2 lg:grid-cols-4 max-w-full mx-auto border-t border-black-700"
        >
          {achievement_counters?.map((counter, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center justify-start text-center py-40 px-10 md:px-16 lg:px-20 lg:border-r max-1024:border-1 border-black-700 lg:last:border-r-0"
            >
              <InlineCounter
                from={0}
                to={parseInt(counter.count_text) || 0}
                duration={2.8}
                suffix={counter.symbol_sign}
                start={countersInView}
                useCommas
                className="block text-white font-bold tracking-tight mb-10"
                style={{ fontSize: "clamp(2rem, 5vw, 4rem)", lineHeight: 1 }}
              />
              <div
                className="text-white/40 font-normal tracking-wide"
                style={{ fontSize: "0.8rem", letterSpacing: "0.05em" }}
              >
                {counter.counter_short_description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExperienceSection;
