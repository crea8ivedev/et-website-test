"use client";

import React from "react";

const PATH_1 =
  "M19.24,5.634 C17.733,4.118 15.289,4.118 13.782,5.634 L7.641,11.811 C7.264,12.189 7.264,12.804 7.641,13.183 C8.018,13.562 8.629,13.562 9.006,13.183 L15.146,7.007 C15.899,6.248 17.122,6.248 17.875,7.007 C18.629,7.764 18.629,8.994 17.875,9.752 L11.853,15.809 C12.606,16.567 13.828,16.567 14.582,15.809 L19.24,11.124 C20.747,9.608 20.747,7.15 19.24,5.634";

const PATH_2 =
  "M17.193,7.693 C16.816,7.314 16.205,7.314 15.828,7.693 L9.688,13.869 C8.934,14.628 7.712,14.628 6.959,13.869 C6.582,13.49 5.971,13.49 5.594,13.869 C5.217,14.248 5.217,14.863 5.594,15.241 C7.101,16.758 9.545,16.758 11.053,15.241 L17.193,9.065 C17.57,8.687 17.57,8.071 17.193,7.693";

const PATH_3 =
  "M15.146,1.516 C13.639,0 11.195,0 9.688,1.516 L3.547,7.693 C3.171,8.071 3.171,8.687 3.547,9.065 C3.924,9.444 4.535,9.444 4.912,9.065 L11.053,2.889 C11.806,2.13 13.028,2.13 13.781,2.889 C14.158,3.268 14.769,3.268 15.146,2.889 C15.523,2.51 15.523,1.895 15.146,1.516";

const PATH_4 =
  "M13.099,3.575 C12.722,3.196 12.111,3.196 11.735,3.575 L5.594,9.752 C4.84,10.509 3.619,10.509 2.865,9.752 C2.111,8.994 2.111,7.764 2.865,7.006 L8.888,0.948 C8.134,0.19 6.912,0.19 6.158,0.948 L1.5,5.634 C-0.007,7.15 -0.007,9.608 1.5,11.124 C3.008,12.641 5.451,12.641 6.959,11.124 L13.099,4.948 C13.476,4.569 13.476,3.954 13.099,3.575";

export default function SquareSpaceIcon({ size = 280, color = "currentColor", strokeWidth = 0.2 }) {
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
        lineHeight: 0,
        position: "relative",
        width: size,
        height: size,
      }}
      className="mx-auto"
    >
      <svg
        className="icon-svg-enter"
        width={size}
        height={size}
        viewBox="-0.5 -0.5 21 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={PATH_1} {...common} />
        <path d={PATH_2} {...common} style={{ animationDelay: "0.15s" }} />
        <path d={PATH_3} {...common} style={{ animationDelay: "0.3s" }} />
        <path d={PATH_4} {...common} style={{ animationDelay: "0.45s" }} />
      </svg>
    </div>
  );
}
