"use client";

import branding from "@/config/branding";
import BetaBadge from "./BetaBadge";

/**
 * Centralized Brand Logo component.
 * Displays 'Weavly' rendered in the official Mochiy Pop One brand font.
 */
export default function Brand({
  size = "md",
  showBeta = false,
  light = false,
  allWhite = false,
  onBetaClick,
  className = "",
}) {
  const textSizeClass =
    size === "sm"
      ? "text-[16px] sm:text-[17px]"
      : size === "lg"
      ? "text-[24px] sm:text-[27px]"
      : size === "xl"
      ? "text-[32px] sm:text-[36px]"
      : "text-[19px] sm:text-[21px]"; // md default

  const textColorClass = allWhite || light ? "text-[#FFFFFF]" : "text-[#111111]";

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      <span
        style={{ fontFamily: "'Mochiy Pop One', cursive, sans-serif" }}
        className={`${textSizeClass} ${textColorClass} tracking-tight leading-none transition-colors duration-200`}
      >
        {branding.name}
      </span>

      {showBeta && <BetaBadge onClick={onBetaClick} />}
    </div>
  );
}
