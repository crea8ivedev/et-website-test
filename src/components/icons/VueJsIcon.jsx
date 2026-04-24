"use client";

import React from "react";

const OUTER_V_D = "M3.316 3L12 18l8.684-15H23L12 22 1 3h2.316z";
const INNER_V_D = "M7.658 3L12 10.5 16.342 3h2.316L12 14.5 5.342 3h2.316z";

export default function VueJsIcon({ size = 250, color = "currentColor", strokeWidth = 0.3 }) {
  const common = {
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
        position: "relative",
        width: size,
        height: size,
        lineHeight: 0,
      }}
      className="mx-auto"
    >
      <svg
        className="icon-svg-enter"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={OUTER_V_D} {...common} />
        <path d={INNER_V_D} {...common} style={{ animationDelay: "0.3s" }} />
      </svg>
    </div>
  );
}
