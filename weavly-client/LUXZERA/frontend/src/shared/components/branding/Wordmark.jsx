"use client";

import branding from "@/config/branding";

export default function Wordmark({ allWhite = false, className = "" }) {
  return (
    <span
      style={{
        fontFamily: "'Mochiy Pop One', cursive, sans-serif",
        fontSize: "clamp(3.5rem, 16vw, 420px)",
      }}
      className={`tracking-tight text-center leading-[0.85] block select-none w-full ${className}`}
    >
      <span className={allWhite ? "text-[#FFFFFF]" : "text-[#1D1D1F]"}>{branding.name}</span>
    </span>
  );
}
