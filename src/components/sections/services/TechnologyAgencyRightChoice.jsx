"use client";

import React, { useRef, useEffect, useState } from "react";
import { Reveal } from "@/components/common/Reveal";
import Image from "next/image";
import { safeParse } from "@/utils/safeParse";
import * as RiIcons from "react-icons/ri";
import * as FaIcons from "react-icons/fa";
import * as LuIcons from "react-icons/lu";
import * as HiIcons from "react-icons/hi";
import * as MdIcons from "react-icons/md";
import * as FcIcons from "react-icons/fc";
import * as GrIcons from "react-icons/gr";
import * as Io5Icons from "react-icons/io5";
import * as TbIcons from "react-icons/tb";
import * as SiIcons from "react-icons/si";
import * as BiIcons from "react-icons/bi";
import * as BsIcons from "react-icons/bs";
import * as fa6Icons from "react-icons/fa6";
import * as CgIcons from "react-icons/cg";
import * as FiIcons from "react-icons/fi";
import * as GiIcons from "react-icons/gi";
import * as VscIcons from "react-icons/vsc";
import * as PiIcons from "react-icons/pi";
function EllipseTrack({ rotate }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 542 540"
        className="impact-circle absolute w-500 md:w-620"
      >
        <circle
          cx="270.5"
          cy="270.5"
          r="261.5"
          stroke="currentColor"
          strokeDasharray="3 10"
          strokeLinecap="round"
        ></circle>
      </svg>
      <div
        className="impact-arrows absolute top-1/2 left-1/2"
        style={{ transform: `rotate(${rotate}deg)` }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 542 540"
          className="-translate-1/2 absolute w-500 md:w-620"
        >
          <path
            fill="currentColor"
            d="M6.768 261c.77-1.333 2.694-1.333 3.464 0l3.897 6.75c.77 1.333-.192 3-1.732 3H4.603c-1.54 0-2.502-1.667-1.732-3zM265.5 533.232c-1.333-.77-1.333-2.694 0-3.464l6.75-3.897c1.333-.77 3 .192 3 1.732v7.794c0 1.54-1.667 2.502-3 1.732zM535.232 272c-.77 1.333-2.694 1.333-3.464 0l-3.897-6.75c-.77-1.333.192-3 1.732-3h7.794c1.54 0 2.502 1.667 1.732 3zM276.5 6.768c1.333.77 1.333 2.694 0 3.464l-6.75 3.897c-1.333.77-3-.192-3-1.732V4.603c0-1.54 1.667-2.502 3-1.732z"
          ></path>
        </svg>
      </div>
    </div>
  );
}

function CardItem({ card, index, total, progress }) {
  const FADE = 0.08;
  const segSize = 1 / total;

  let opacity = 0;
  let yOffset = 0;

  if (index === 0) {
    const fadeOutStart = segSize - FADE;
    const fadeOutEnd = segSize;

    if (progress <= fadeOutStart) {
      opacity = 1;
    } else if (progress < fadeOutEnd) {
      opacity = 1 - (progress - fadeOutStart) / FADE;
    } else {
      opacity = 0;
    }

    if (progress > fadeOutStart) {
      const p = (progress - fadeOutStart) / FADE;
      yOffset = -30 * p;
    }
  } else if (index === total - 1) {
    const fadeInStart = index * segSize;
    const fadeInEnd = fadeInStart + FADE;

    if (progress < fadeInStart) {
      opacity = 0;
    } else if (progress < fadeInEnd) {
      opacity = (progress - fadeInStart) / FADE;
    } else {
      opacity = 1;
    }

    if (progress < fadeInEnd) {
      const p = Math.max(0, (progress - fadeInStart) / FADE);
      yOffset = 30 * (1 - p);
    }
  } else {
    const fadeInStart = index * segSize;
    const fadeInEnd = fadeInStart + FADE;
    const fadeOutStart = (index + 1) * segSize - FADE;
    const fadeOutEnd = (index + 1) * segSize;

    if (progress < fadeInStart) {
      opacity = 0;
      yOffset = 30;
    } else if (progress < fadeInEnd) {
      const p = (progress - fadeInStart) / FADE;
      opacity = p;
      yOffset = 30 * (1 - p);
    } else if (progress <= fadeOutStart) {
      opacity = 1;
      yOffset = 0;
    } else if (progress < fadeOutEnd) {
      const p = (progress - fadeOutStart) / FADE;
      opacity = 1 - p;
      yOffset = -30 * p;
    } else {
      opacity = 0;
      yOffset = -30;
    }
  }

  opacity = Math.max(0, Math.min(1, opacity));

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center text-center max-sm:px-20 px-6"
      style={{
        opacity,
        transform: `translateY(${yOffset}px) translateZ(0)`,
        willChange: "opacity, transform",
        pointerEvents: opacity > 0.5 ? "auto" : "none",
      }}
    >
      <div className="max-md:mb-20 mb-40 opacity-75">
        {(() => {
          const iconData = card?.icon;

          if (typeof iconData === "string") {
            const iconName = iconData.replace(/[<> /]/g, "");
            const iconSets = [
              RiIcons,
              FaIcons,
              LuIcons,
              HiIcons,
              MdIcons,
              FcIcons,
              GrIcons,
              Io5Icons,
              TbIcons,
              fa6Icons,
              BiIcons,
              BsIcons,
              SiIcons,
              CgIcons,
              FiIcons,
              GiIcons,
              VscIcons,
              PiIcons,
            ];
            let IconComponent = null;

            for (const set of iconSets) {
              if (set[iconName]) {
                IconComponent = set[iconName];
                break;
              }
            }

            if (IconComponent) {
              return <IconComponent className="text-white size-46" />;
            }
          }

          // Fallback to Image URL
          const iconSrc = typeof iconData === "string" ? iconData : iconData?.url;
          if (iconSrc) {
            return (
              <Image
                src={iconSrc}
                width={card?.icon?.width || 46}
                height={card?.icon?.height || 46}
                alt={card.title || `Icon ${index + 1}`}
              />
            );
          }
          return null;
        })()}
      </div>
      <div className="title title-white mb-20">
        <h2 className="h4">
          <span>{safeParse(card.title || "")}</span>
        </h2>
      </div>
      <div className="content">
        <div>{safeParse(card.descritption || "")}</div>
      </div>
    </div>
  );
}

const TechnologyAgencyRightChoice = ({ data }) => {
  const sectionRef = useRef(null);
  const cards = data?.circular_scroll_repeater || [];
  const total = cards.length;
  const [progress, setProgress] = useState(0);
  const [innerRot, setInnerRot] = useState(0);

  useEffect(() => {
    if (total === 0) return;

    let rafId = null;

    const handleScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const el = sectionRef.current;
        if (!el) return;

        const sectionTop = el.getBoundingClientRect().top + window.scrollY;
        const sectionHeight = el.offsetHeight - window.innerHeight;
        const scrolled = window.scrollY - sectionTop;
        const raw = Math.min(Math.max(scrolled / sectionHeight, 0), 1);

        setProgress(raw);
        setInnerRot(raw * 200);
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [total]);

  if (data?.hide_section === "yes") return null;
  if (total === 0) return null;

  return (
    <section
      ref={sectionRef}
      className={`why-wrapper relative py-80 max-lg:py-40 ${data?.extra_class || ""}`}
      id={data?.extra_id || undefined}
      style={{ height: `${total * 100 + 100}vh` }}
    >
      <div className="container-fluid-lg">
        <div className="flex flex-col items-center justify-center w-full lg:text-center">
          <div className="w-full lg:w-8/12">
            <Reveal className="title title-white mb-20">
              <h2>{safeParse(data?.title || "")}</h2>
            </Reveal>
            <Reveal delay={200} className="content">
              <div>{safeParse(data?.description || "")}</div>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-600 bg-gold/10 blur-3xl rounded-full z-1 pointer-events-none" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-70 sm:scale-100 transition-transform">
          <EllipseTrack rotate={innerRot} />
        </div>

        <div className="relative z-10 w-full max-w-xs sm:max-w-320 md:max-w-460 h-64 sm:h-360 md:h-300">
          {cards.map((card, i) => (
            <CardItem key={i} card={card} index={i} total={total} progress={progress} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TechnologyAgencyRightChoice;
