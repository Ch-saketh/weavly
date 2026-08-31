"use client";

import React from "react";

/**
 * Weavly Architectural Loom Loader
 * A luxury blueprint-themed loader with precision geometric rings and weaving pulsation.
 */
export default function Loader({
  size = "md",
  className = "",
  text = "",
  fullscreen = false,
}) {
  const sizeConfig = {
    xs: { dim: 24, stroke: 1.5, textClass: "text-[9px]" },
    sm: { dim: 32, stroke: 1.8, textClass: "text-[10px]" },
    md: { dim: 44, stroke: 2.2, textClass: "text-[11px]" },
    lg: { dim: 64, stroke: 2.5, textClass: "text-[12px]" },
    xl: { dim: 80, stroke: 3, textClass: "text-[13px]" },
  };

  const currentSize = sizeConfig[size] || sizeConfig.md;

  const loaderElement = (
    <div className={`inline-flex flex-col items-center justify-center gap-3.5 select-none ${className}`}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width: currentSize.dim, height: currentSize.dim }}
      >
        <svg
          className="w-full h-full animate-spin"
          style={{ animationDuration: "2.4s", animationTimingFunction: "linear" }}
          viewBox="0 0 50 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Blueprint Dashed Guide Ring */}
          <circle
            cx="25"
            cy="25"
            r="22"
            stroke="#183B56"
            strokeWidth="1"
            strokeDasharray="2.5 3.5"
            strokeOpacity="0.35"
          />

          {/* Primary Precision Weave Arc */}
          <circle
            cx="25"
            cy="25"
            r="17"
            stroke="#183B56"
            strokeWidth={currentSize.stroke}
            strokeDasharray="45 60"
            strokeLinecap="round"
          />

          {/* Secondary Counter-Sweep Arc */}
          <circle
            cx="25"
            cy="25"
            r="11"
            stroke="#183B56"
            strokeWidth={currentSize.stroke}
            strokeDasharray="20 40"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
        </svg>

        {/* Center Blueprint Loom Diamond Pivot */}
        <div className="absolute w-1.5 h-1.5 bg-[#183B56] rotate-45 animate-pulse" />
      </div>

      {text && (
        <div className="flex items-center gap-2">
          <span className={`font-mono font-bold tracking-[0.25em] text-[#183B56] uppercase ${currentSize.textClass}`}>
            {text}
          </span>
          <span className="inline-flex gap-0.5">
            <span className="w-1 h-1 rounded-full bg-[#183B56] animate-ping" style={{ animationDuration: "1.2s" }} />
          </span>
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F5EFEB]/90 backdrop-blur-sm p-4">
        {loaderElement}
      </div>
    );
  }

  return loaderElement;
}
