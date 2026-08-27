"use client";

import branding from "@/config/branding";

export default function Wordmark({ allWhite = false, className = "" }) {
  return (
    <span
      className={`font-sans font-black uppercase tracking-tighter text-center leading-[0.75] block select-none w-full scale-x-[1.10] transform origin-center ${className}`}
      style={{ fontSize: "clamp(5rem, 20.8vw, 470px)" }}
    >
      {allWhite ? (
        <span className="text-[#FFFFFF]">{branding.name}</span>
      ) : (
        <>
          <span className="text-[#F07020]">{branding.prefix}</span>
          <span className="text-[#1D1D1F]">{branding.suffix}</span>
        </>
      )}
    </span>
  );
}
