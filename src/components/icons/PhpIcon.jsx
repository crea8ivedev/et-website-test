"use client";

import React from "react";

const RING_D =
  "M400,179.2C179.12,179.2,0,273.3,0,389.55s179.12,210.4,400,210.4,400-94.15,400-210.4-179.13-210.35-400-210.35ZM400,578.96c-214.25,0-379-90.28-379-189.41s164.87-189.35,379-189.35,379,90.23,379,189.35-164.87,189.41-379,189.41Z";

const D_D =
  "M307.13,318.07c-12-13.85-31.32-20.66-57.52-20.66h-87.4l-40.48,208.64h45.41l10.74-55.42c50.83,0,82.4,3.7,111.57-23.63,32.28-29.67,40.7-82.48,17.68-108.93ZM271.14,372.71c-9.77,50.1-44.24,44.92-86.67,44.92l16.95-87.31c11.75,0,22.52-.31,31.98-.05,28.37.8,44.61,6.81,37.74,42.44Z";

const R_D =
  "M468.07,450.39h-45.76c19.05-98.2,22.6-106.34,15.68-113.77-6.68-7.17-21.87-5.71-58.6-5.71l-23.29,119.48h-45.11l40.43-208.5h45.16l-10.74,55.38c38.95,0,75.06-2.85,92.48,13.23,18.3,16.82,9.55,38.37-10.25,139.89Z";

const P_D =
  "M661.96,318.07c-12-13.85-31.32-20.66-57.52-20.66h-87.45l-40.53,208.64h45.51l10.74-55.42c53.43,0,83,3.1,111.58-23.63,32.27-29.67,40.7-82.48,17.67-108.93ZM625.83,372.71c-9.9,50.82-45.37,44.92-86.67,44.92l16.94-87.31c11.82,0,22.66-.31,32.13-.05,28.41.8,44.46,6.81,37.6,42.44Z";

export default function PhpIcon({ size = 280, color = "currentColor", strokeWidth = 4 }) {
  const commonStroke = {
    fill: color,
    stroke: color,
    strokeWidth,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    pathLength: "1",
    className: "icon-stroke-fill-cycle",
  };

  return (
    <div
      style={{
        display: "block",
        lineHeight: 0,
        position: "relative",
        width: size,
        height: size,
      }}
      className="mx-auto"
    >
      <svg
        className="icon-svg-enter"
        width={size}
        height={size}
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={RING_D} {...commonStroke} />
        <path d={D_D} {...commonStroke} style={{ animationDelay: "0.2s" }} />
        <path d={R_D} {...commonStroke} style={{ animationDelay: "0.4s" }} />
        <path d={P_D} {...commonStroke} style={{ animationDelay: "0.6s" }} />
      </svg>
    </div>
  );
}
