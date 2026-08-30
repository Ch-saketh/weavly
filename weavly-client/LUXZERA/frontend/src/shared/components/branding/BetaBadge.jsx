"use client";

import branding from "@/config/branding";

export default function BetaBadge({ onClick, allWhite = false, className = "" }) {
  if (!branding.isBeta) return null;

  return (
    <span
      role="button"
      tabIndex={0}
      onClick={(e) => {
        if (onClick) {
          e.stopPropagation();
          e.preventDefault();
          onClick();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.stopPropagation();
          e.preventDefault();
          onClick?.();
        }
      }}
      className={`inline-flex items-center justify-center text-[8px] font-bold uppercase tracking-[0.15em] leading-none px-1.5 py-0.5 border border-[#183B56] font-mono cursor-pointer select-none transition-all shadow-xs ${
        allWhite
          ? "bg-white text-[#183B56] hover:bg-[#F5EFEB]"
          : "bg-[#183B56] text-white hover:bg-[#102A43]"
      } ${className}`}
      title="Click for Beta Info"
    >
      {branding.betaBadgeText}
    </span>
  );
}
