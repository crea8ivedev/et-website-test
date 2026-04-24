"use client";

import React from "react";

const GlobalLoader = () => {
  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black-800">
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          border: "4px solid rgba(237,168,0,0.2)",
          borderTopColor: "#EDA800",
          animation: "et-spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes et-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default GlobalLoader;
