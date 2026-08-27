"use client";

import branding from "@/config/branding";
import BetaBadge from "./BetaBadge";

/**
 * Centralized Brand Logo component.
 * Displays /weavly.png as the official navbar and brand logo.
 */
export default function Brand({
  size = "md",
  showBeta = false,
  light = false,
  allWhite = false,
  onBetaClick,
  className = "",
  useTextOnly = false,
}) {
  const heightClass =
    size === "sm"
      ? "h-7 sm:h-8 md:h-[34px]"
      : size === "lg"
      ? "h-12 sm:h-14 md:h-16"
      : size === "xl"
      ? "h-16 sm:h-20 md:h-24"
      : "h-9 sm:h-10 md:h-[40px]"; // md: refined, balanced, elegant size (40px)



  const textSizeClass =
    size === "sm"
      ? "text-[16px]"
      : size === "lg"
      ? "text-[24px]"
      : size === "xl"
      ? "text-[32px]"
      : "text-[20px]";

  return (
    <div className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      {!useTextOnly ? (
        <img
          src="/weavly.png?v=3"
          alt={branding.name}
          loading="eager"
          decoding="async"
          className={`${heightClass} w-auto object-contain object-left shrink-0 ${
            allWhite || light
              ? "brightness-0 invert"
              : "drop-shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          } transition-all duration-200`}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            const sibling = e.currentTarget.nextElementSibling;
            if (sibling) sibling.style.display = "flex";
          }}
        />

      ) : null}



      <div
        className={`${textSizeClass} font-satoshi font-black tracking-tight leading-none ${!useTextOnly ? "hidden" : "flex"} items-center`}
      >
        <span className={allWhite ? "text-[#FFFFFF]" : "text-[#111A33]"}>
          {branding.prefix}
        </span>
        <span className={allWhite || light ? "text-[#FFFFFF]" : "text-[#C8702A]"}>
          {branding.suffix}
        </span>
      </div>

      {showBeta && <BetaBadge onClick={onBetaClick} />}
    </div>
  );
}
