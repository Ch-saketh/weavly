"use client";

import React from "react";

export default function LuxZeraLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <span className="font-extrabold tracking-tighter text-lg text-[#18181B]">
        LUX<span className="text-[#F07020]">ZERA</span>
      </span>
    </div>
  );
}
