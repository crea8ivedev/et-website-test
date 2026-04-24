"use client";

import React from "react";

const CIRCLE_D =
  "M400,75c-179.49,0-325,145.51-325,325s145.51,325,325,325c67.66,0,130.44-20.64,182.46-56.01l-282.46-340.14v233.64c0,20.71-16.79,37.5-37.5,37.5s-37.5-16.79-37.5-37.5V225c0-15.8,9.9-29.9,24.76-35.27,14.86-5.37,31.49-.84,41.59,11.31l373.69,450c13.07,15.74,11.11,39.06-4.41,52.39-69.99,60.17-161.11,96.57-260.63,96.57C179.09,800,0,620.91,0,400S179.09,0,400,0s400,179.09,400,400c0,38.21-5.37,75.24-15.42,110.33-4.9,17.12-10.91,33.76-17.95,49.86-8.3,18.98-30.41,27.62-49.39,19.33-18.98-8.3-27.63-30.41-19.33-49.39,5.71-13.06,10.59-26.56,14.57-40.45,8.14-28.44,12.52-58.52,12.52-89.68,0-179.49-145.5-325-325-325Z";

const BAR_D =
  "M525,187.5c20.71,0,37.5,16.79,37.5,37.5v150c0,20.71-16.79,37.5-37.5,37.5s-37.5-16.79-37.5-37.5v-150c0-20.71,16.79-37.5,37.5-37.5Z";

export default function KaliDrawAnimation({ size = 250, color = "currentColor", strokeWidth = 6 }) {
  return (
    <div
      className="mx-auto"
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
        viewBox="0 0 800 800"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "relative" }}
      >
        <path
          d={CIRCLE_D}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="icon-stroke-fill-cycle"
        />
        <path
          d={BAR_D}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="icon-stroke-fill-cycle"
          style={{ animationDelay: "0.3s" }}
        />
      </svg>
    </div>
  );
}
