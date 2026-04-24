"use client";

import React from "react";

export default function IsoCubeAnimation({ size = 300, color = "currentColor" }) {
  return (
    <svg
      className="icon-svg-enter mx-auto"
      width={size}
      height={size}
      viewBox="0 0 800 800"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <defs>
        <filter id="cube-glow" x="-25%" y="-25%" width="150%" height="150%">
          <feGaussianBlur stdDeviation="20" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id="face-shadow" x="-8%" y="-8%" width="116%" height="116%">
          <feDropShadow dx="0" dy="0" stdDeviation="8" floodColor={color} floodOpacity="0.25" />
        </filter>
      </defs>

      <path
        d="M185.95,27.55c.84,0,1.67.23,2.43.67l142.41,81.93c.09.07.2.18.36.32l.33.31.37.26.23.17c.21.29.47.64.79,1.01.05.11.09.24.14.36l.06.21.12.29.26.65c.06.24.09.48.09.7v317.45l10.49-6.04,118.9-68.42,3.51-2.02v-160.13c0-.28.02-.56.07-.83.13-.3.29-.7.43-1.18.03-.07.05-.15.08-.21.17-.21.36-.46.55-.76.09-.12.17-.23.25-.35l.55-.35.24-.24c.15-.12.28-.23.39-.32l142.49-82.03.03-.02.03-.02c.69-.41,1.54-.63,2.38-.63s1.68.23,2.42.66l.03.02.03.02,142.35,81.95s.06.05.09.07c.21.17.51.4.88.66.12.1.24.19.35.27.17.23.37.51.62.81l.14.17h.01c.02.05.03.1.05.15l.26,1.04.33.5c.05.27.08.53.08.78v162.83c0,1.76-.91,3.33-2.43,4.21l-.05.03-.04.03-136.65,78.69-3.51,2.02v160.08c0,1.67-.84,3.19-2.26,4.12l-.18.11-285.32,164.21c-.16.08-.33.15-.47.19h-.04s-.04.02-.04.02l-.07.02-.46.13-.44.19-.23.1c-.23.04-.49.07-.73.07-.3,0-.59-.03-.88-.1l-45.03-25.72.38.38-242.22-139.44c-1.57-.92-2.51-2.51-2.51-4.25V114.6c0-.25.03-.51.09-.78.15-.3.32-.7.47-1.17v-.03s.02-.03.02-.03c.06-.19.12-.36.19-.54h0s.2-.28.2-.28l.4-.54.29-.21.22-.16.21-.17c.15-.13.3-.25.44-.38.08-.07.16-.14.23-.2L183.51,28.22l.03-.02.03-.02c.69-.41,1.54-.63,2.38-.63h0Z"
        fill={color}
        stroke={color}
        pathLength="1"
        className="icon-stroke-fill-cycle"
      />
      <path
        d="M328.57,589.62l-118.62-67.17,261.33-150.48,118.8,68.4-261.51,149.25h0Z"
        fill={color}
        stroke={color}
        filter="url(#face-shadow)"
        pathLength="1"
        className="icon-stroke-fill-cycle"
        style={{ animationDelay: "0.3s" }}
      />
    </svg>
  );
}
