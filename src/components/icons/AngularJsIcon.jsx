"use client";

import React from "react";

export default function LogoAnimation({ size = 300, color = "currentColor" }) {
  return (
    <div>
      <svg
        className="icon-svg-enter mx-auto max-md:w-full"
        width={size}
        height={size}
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="logo-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="letter-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="12" floodColor={color} floodOpacity="0.35" />
          </filter>
        </defs>

        <path
          d="M398.87,25.1L46.1,149.25l55.72,462.18,297.43,163.45,298.93-165.68,55.72-462.17L398.87,25.1ZM666.78,587.13l-268.73,148.7-264.57-146.76-47.78-413.35,312.32-111.32,320.71,109.35-51.95,413.38Z"
          stroke={color}
          strokeWidth="6"
          fill="none"
          pathLength="1"
          className="icon-stroke-cycle"
        />

        <path
          d="M398.02,88.78l-218.05,485.22,81.35-1.5,43.73-109.37h195.47l47.85,110.9,77.85,1.42L398.02,88.78ZM333.7,398.37l64.95-154.02,73.57,154.02h-138.52Z"
          fill={color}
          filter="url(#letter-shadow)"
        />
      </svg>
    </div>
  );
}
