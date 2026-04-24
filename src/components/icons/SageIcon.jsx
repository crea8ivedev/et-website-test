"use client";

import React from "react";

const SAGE_D =
  "M221,250h-65l-19.39-55.6c-7.98,19.18-13.06,37.38-19.61,55.6H52l-20-59.34,49.35-35.18-61.44-.54L0,96.78v-1.78s52.48-36.24,52.48-36.24l50.6,35.28-19.14-57.37L136.02,0h.95l51.95,36.69-19.1,57.34,50.56-35.29,52.59,36.77-20.07,59.43-61.73.51,49.66,35.24-19.84,59.31ZM187.67,154.16l-19.7-58.17-63.11.02-19.63,58.25,51.2,35.86,51.24-35.95Z";

export default function SageIcon({ size = 280, color = "currentColor", strokeWidth = 2 }) {
  return (
    <div
      style={{
        display: "block",
        lineHeight: 0,
        position: "relative",
        width: size,
        height: size,
      }}
    >
      <svg
        className="icon-svg-enter"
        width={size}
        height={size}
        viewBox="0 0 272.98 250"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={SAGE_D}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="icon-stroke-fill-cycle"
        />
      </svg>
    </div>
  );
}
