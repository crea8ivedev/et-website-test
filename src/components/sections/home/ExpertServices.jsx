"use client";
import React, { useRef, useState, useEffect } from "react";
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
import * as AiIcons from "react-icons/ai";

export default function ExpertServices({ data }) {
  const growthRef = useRef(null);
  const bubbleRef = useRef(null);
  const [bubbleSize, setBubbleSize] = useState(0);
  const growthBoundsRef = useRef({ width: 0, height: 0 });
  const bubbleStyle = { width: bubbleSize, height: bubbleSize, left: 0, top: 0 };

  useEffect(() => {
    const measure = () => {
      if (!growthRef.current) return;
      const { width, height } = growthRef.current.getBoundingClientRect();
      growthBoundsRef.current = { width, height };
      setBubbleSize(Math.min(width, height) * 0.18);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    let animationFrameId;
    let x = 0;
    let y = 0;
    let dx = 2;
    let dy = 2;

    const animate = () => {
      const { width, height } = growthBoundsRef.current;
      const el = bubbleRef.current;
      if (!width || !height || !bubbleSize || !el) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }

      const maxX = Math.max(width - bubbleSize, 0);
      const maxY = Math.max(height - bubbleSize, 0);

      x += dx;
      y += dy;

      if (x <= 0 || x >= maxX) {
        x = Math.max(0, Math.min(x, maxX));
        dx *= -1;
      }
      if (y <= 0 || y >= maxY) {
        y = Math.max(0, Math.min(y, maxY));
        dy *= -1;
      }

      // Write transform directly to DOM — skips React re-renders, same optimization
      // framer-motion's useMotionValue provided.
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [bubbleSize]);

  if (!data) return null;

  const heading = data?.heading || "";
  const description = data?.description || "";
  const serviceBlocks = data?.service_blocks || [];

  return (
    <section
      className={`growth-wrapper relative overflow-hidden py-80 max-lg:py-40 ${data?.extra_class ? ` ${data.extra_class}` : ""} in-view`}
      id={(data?.extra_id || "").replace(/^title=['"](.*)['"]$/, "$1")}
    >
      <div className="container-fluid">
        <div className="bg-black-700 rounded-10 py-30 xl:py-60 max-sm:px-15 px-25 xl:px-50 xl:pt-100 relative z-1">
          <div className="w-full xl:max-w-9/12 sm:text-center mx-auto">
            {heading && (
              <div className={`title title-white mb-20 mx-auto fade-up in-view`}>
                <h2>{safeParse(heading)}</h2>
              </div>
            )}
            {description && (
              <div className={`content mx-auto fade-up delay-01 in-view`}>
                <p>{safeParse(description)}</p>
              </div>
            )}
          </div>

          <div
            ref={growthRef}
            className="relative growth-list overflow-hidden mt-40 lg:mt-60 grid md:grid-cols-2 lg:grid-cols-3 gap-20"
          >
            <div
              ref={bubbleRef}
              style={bubbleStyle}
              className="absolute pointer-events-none will-change-transform z-0 opacity-50"
            >
              <div className="absolute rounded-full border-4 border-gold size-[12em]" />
              <div className="absolute rounded-full border-4 border-gold size-[12em] ml-10 mt-10" />
            </div>

            {serviceBlocks.map((item, index) => (
              <div
                key={index}
                className={`block relative overflow-hidden mx-auto bg-black/30 backdrop-blur-lg border border-solid border-black-600/60 rounded-10 p-25 xl:p-30 z-1 fade-up delay-0${index + 1} in-view`}
              >
                <div className={`icon mb-30 fade-in delay-0${index + 1} in-view`}>
                  {(() => {
                    const iconData = item.service_image;

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
                        AiIcons,
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
                          width={64}
                          height={64}
                          alt={item.service_image?.alt || item.service_title}
                          className="object-contain text-white"
                          style={{ filter: "brightness(0) invert(1)" }}
                        />
                      );
                    }
                    return null;
                  })()}
                </div>
                <div className={`title title-white mb-20 fade-up delay-0${index + 1} in-view`}>
                  <h3 className="h5">{item.service_title}</h3>
                </div>
                <div className={`content fade-up delay-0${index + 2} in-view`}>
                  <p>{item.service_description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
