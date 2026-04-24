"use client";

import React from "react";

const PATH_D =
  "M28.86.5l-9.21,18h-8.65l3.85-7.46h-.17C11.5,15.17,6.76,17.88,0,18.5v-7.36s4.32-.26,6.87-2.93H0V.5h7.72v6.35h.17S11.04.5,11.04.5h5.84v6.31h.17s3.27-6.31,3.27-6.31h8.54Z";

export default function LogoDrawFill({ width = 280, color = "currentColor", strokeWidth = 0.2 }) {
  const height = Math.round(width * (19 / 28.86));

  return (
    <div
      className="mx-auto"
      style={{
        display: "block",
        lineHeight: 0,
        position: "relative",
        width,
        height,
      }}
    >
      <svg
        className="icon-svg-enter"
        width={width}
        height={height}
        viewBox="0 0 28.86 19"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d={PATH_D}
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
