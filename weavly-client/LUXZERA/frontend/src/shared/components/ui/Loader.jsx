import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader({ size = "w-8 h-8", className = "", text = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${size} text-[#183B56] animate-spin`} />
      {text && (
        <span className="text-[11px] font-bold text-[#5A7184] tracking-[0.18em] uppercase">
          {text}
        </span>
      )}
    </div>
  );
}
