"use client";
import React from "react";

const SvgAnimation = () => {
  return (
    <div>
      <svg
        className="icon-svg-enter mx-auto max-md:w-full"
        width="300"
        height="300"
        viewBox="0 0 800 800"
        fill="none"
      >
        <path
          d="M590.44,213.33c-48.4-49.37-115.84-80-190.44-80-119.4,0-220.48,78.48-254.46,186.67l334.46,334.46c100.03-31.42,174.67-120.2,185.35-227.79h-185.35"
          stroke="white"
          strokeWidth="4"
          fill="transparent"
          pathLength="1"
          className="icon-stroke-cycle"
          style={{ animationDuration: "3s" }}
        />
        <line
          x1="133.33"
          y1="453.33"
          x2="346.67"
          y2="666.67"
          stroke="white"
          strokeWidth="4"
          pathLength="1"
          className="icon-stroke-cycle"
          style={{ animationDuration: "3s", animationDelay: "0.2s" }}
        />
        <circle
          cx="400"
          cy="400"
          r="373.33"
          stroke="white"
          strokeWidth="4"
          fill="transparent"
          pathLength="1"
          className="icon-stroke-cycle"
          style={{ animationDuration: "3s", animationDelay: "0.4s" }}
        />
      </svg>
    </div>
  );
};

export default SvgAnimation;
