"use client";

import React from "react";

export default function BLogoAnimation({ size = 300, color = "currentColor" }) {
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
          <filter id="b-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0" stdDeviation="10" floodColor={color} floodOpacity="0.3" />
          </filter>
        </defs>

        <path
          d="M790.67,1.77l-298.43,297.67h48.8c76.03,0,121,47.83,121,100,0,41.17-27.73,71.33-57.4,84.7-4.77,1.93-4.77,8.63.47,10.53,34.43,13.4,58.83,49.33,58.83,91.4,0,59.33-39.67,106.73-116.67,106.73h-211.4c-3.33,0-6.23-2.87-6.23-5.73v-225.4L2.07,788c-4.33,4.33-1.43,11.97,4.77,11.97h787.7c2.89-.04,5.23-2.37,5.27-5.27V6.07c1.43-5.27-5.27-8.13-9.1-4.33l-.03.03Z"
          fill={color}
          stroke={color}
          strokeWidth="1"
          pathLength="1"
          className="icon-stroke-fill-cycle"
        />

        <path
          d="M421.5,455.43h100.9c28.7,0,46.87-15.8,46.87-41.17,0-23.9-18.17-41.13-46.87-41.13h-100.9c-3.33,0-6.23,2.87-6.23,5.73v70.83c.5,3.33,2.87,5.73,6.23,5.73Z"
          fill={color}
          filter="url(#b-shadow)"
        />

        <path
          d="M421.5,618.63h104.27c32.03,0,51.17-16.27,51.17-45,0-24.87-18.17-45-51.17-45h-104.27c-3.33,0-6.23,2.9-6.23,5.77v78c.5,3.83,2.87,6.23,6.23,6.23Z"
          fill={color}
          filter="url(#b-shadow)"
        />
      </svg>
    </div>
  );
}
