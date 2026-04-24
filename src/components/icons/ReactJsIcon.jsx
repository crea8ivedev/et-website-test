"use client";

import React from "react";

const ReactJsIcon = () => {
  return (
    <div>
      <svg
        className="icon-svg-enter mx-auto max-md:w-full"
        width="300"
        height="300"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <ellipse
          cx="50"
          cy="50"
          rx="48"
          ry="11"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          pathLength="1"
          className="icon-stroke-cycle"
        />
        <ellipse
          cx="50"
          cy="50"
          rx="48"
          ry="11"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          transform="rotate(60 50 50)"
          pathLength="1"
          className="icon-stroke-cycle"
          style={{ animationDelay: "0.1s" }}
        />
        <ellipse
          cx="50"
          cy="50"
          rx="48"
          ry="11"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          transform="rotate(120 50 50)"
          pathLength="1"
          className="icon-stroke-cycle"
          style={{ animationDelay: "0.2s" }}
        />
        <circle
          cx="50"
          cy="50"
          r="4"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="icon-pulse-cycle"
        />
      </svg>
    </div>
  );
};

export default ReactJsIcon;
