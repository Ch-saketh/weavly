"use client";

import branding from "@/config/branding";

export default function BetaBadge({ onClick, className = "" }) {
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
      className={`inline-flex items-center justify-center text-[8px] font-bold uppercase tracking-[0.15em] leading-none text-white bg-[#F07020] hover:bg-black px-1.5 py-1 rounded-[4px] font-mono cursor-pointer select-none transition-colors shadow-xs ${className}`}
      title="Click for Beta Info"
    >
      {branding.betaBadgeText}
    </span>

  );
}
