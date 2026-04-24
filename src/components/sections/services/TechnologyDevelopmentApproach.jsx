"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Reveal } from "@/components/common/Reveal";
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
const TechnologyDevelopmentApproach = ({ data }) => {
  const [activeId, setActiveId] = useState(0);
  useEffect(() => {
    if (!data?.process_steps || data.process_steps.length === 0) return;

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * data.process_steps.length);
      setActiveId(randomIndex);
    }, 3000);

    return () => clearInterval(interval);
  }, [data?.process_steps]);

  if (data?.hide_section === "yes") return null;

  return (
    <section
      className={`approach-wrapper py-80 max-lg:py-40 relative overflow-hidden bg-center ${data?.extra_class || ""}`}
      id={data?.extra_id || undefined}
      style={{
        background:
          "radial-gradient(ellipse 65% 55% at 50% 50%, rgba(237, 168, 0, 0.25) 0%, rgba(26, 26, 26, 0.05) 55%, rgba(26, 26, 26, 0) 100%)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-8 bg-repeat z-1"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      <div className="container-fluid-lg">
        <div className="flex flex-wrap items-start w-full mb-60">
          <div className="w-full lg:max-w-6/12">
            <Reveal className="title title-white mb-20">
              <h2>{safeParse(data?.title || "")}</h2>
            </Reveal>
            <Reveal delay={200} className="content">
              <div>{safeParse(data?.description || "")}</div>
            </Reveal>
          </div>
        </div>

        {data?.process_steps && data.process_steps.length > 0 && (
          <div className="w-full max-sm:grid-cols-1 max-lg:grid-cols-2 grid-cols-3 grid gap-20">
            {data.process_steps.map((stick, index) => {
              const isActive = activeId === index;

              return (
                <div key={index} className="relative" onMouseEnter={() => setActiveId(index)}>
                  {isActive && <div className="rotating-border" />}

                  <div className="flex flex-col bg-black-800 backdrop-blur-md rounded-10 max-md:px-20 max-md:py-30 py-40 px-30 h-full">
                    <Reveal delay={200} className="max-md:mb-30 mb-60">
                      {(() => {
                        const iconData = stick?.process_icon;

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
                          ];
                          let IconComponent = null;

                          for (const set of iconSets) {
                            if (set[iconName]) {
                              IconComponent = set[iconName];
                              break;
                            }
                          }

                          if (IconComponent) {
                            return <IconComponent className="text-white size-38" />;
                          }
                        }

                        // Fallback to Image URL
                        const iconSrc = typeof iconData === "string" ? iconData : iconData?.url;
                        if (iconSrc) {
                          return (
                            <Image
                              src={iconSrc}
                              width={stick?.process_icon?.width || 38}
                              height={stick?.process_icon?.height || 38}
                              alt={stick.process_name || `Icon ${index + 1}`}
                            />
                          );
                        }
                        return null;
                      })()}
                    </Reveal>
                    <Reveal delay={300} className="title title-white mb-20">
                      <h3 className="h4">{stick.process_name}</h3>
                    </Reveal>
                    <Reveal delay={400} className="content">
                      <p>{stick.process_descritption}</p>
                    </Reveal>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default TechnologyDevelopmentApproach;
