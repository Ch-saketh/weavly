import React from "react";

export default function Loader({ size = "w-10 h-10", className = "", text = "" }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <img
        src="/logo.png"
        alt="Loading..."
        className={`${size} object-contain animate-spin`}
        style={{ animationDuration: '1.2s' }}
      />
      {text && (
        <span className="text-[12px] font-semibold text-[#71717A] tracking-wider uppercase">
          {text}
        </span>
      )}
    </div>
  );
}
