"use client";

import React from "react";

const SHIELD_D =
  "M705,196.67L428.33,40c-17.95-8.43-38.72-8.43-56.67,0L95,196.67c-17.31,9.99-28.07,28.35-28.33,48.33v310c.26,19.98,11.03,38.34,28.33,48.33l73.33,41.67c19.16,11.32,41.09,17.09,63.33,16.67,51.67,0,81.67-31.67,81.67-85v-305c0-4.6-3.73-8.33-8.33-8.33h-35c-4.6,0-8.33,3.73-8.33,8.33v305c0,25-25,48.33-65,28.33l-76.67-43.33c-2.1-1.57-3.33-4.04-3.33-6.67V245c.11-3.08,1.29-6.02,3.33-8.33L395,81.67h10l275,155c2.04,2.31,3.22,5.25,3.33,8.33v310c0,2.62-1.23,5.09-3.33,6.67l-275,155c-3.09,1.79-6.91,1.79-10,0l-70-40c-1.9-1.7-4.77-1.7-6.67,0l-41.67,18.33c-5,1.67-11.67,3.33,1.67,11.67l93.33,51.67c17.2,11.28,39.46,11.28,56.67,0l276.67-155c17.31-9.99,28.07-28.35,28.33-48.33V245c-.26-19.98-11.03-38.34-28.33-48.33Z";

const S_D =
  "M485,505c-73.33,0-88.33-16.67-95-51.67,0-3.68-2.98-6.67-6.67-6.67h-36.67c-3.68,0-6.67,2.98-6.67,6.67,0,45,25,100,145,100,86.67,0,136.67-33.33,136.67-91.67s-40-75-125-85-93.33-16.67-93.33-36.67,6.67-36.67,70-36.67,78.33,11.67,86.67,48.33c.8,3.94,4.31,6.75,8.33,6.67h35l6.67-3.33c1.22-1.37,1.82-3.18,1.67-5-5-65-50-95-138.33-95s-125,33.33-125,86.67,46.67,75,121.67,83.33,98.33,20,98.33,38.33-25,41.67-83.33,41.67Z";

export default function NodeLogoDrawFill({ size = 250, color = "currentColor", strokeWidth = 5 }) {
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
      >
        <path
          d={SHIELD_D}
          fill={color}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength="1"
          className="icon-stroke-fill-cycle"
        />
        <path
          d={S_D}
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
