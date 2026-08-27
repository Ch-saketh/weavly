import * as React from "react";

const badgeVariants = {
  default: "bg-[#18181B] text-white hover:bg-[#27272A]",
  secondary: "bg-[#F4F4F5] text-[#18181B] border border-[#E4E4E7]",
  outline: "text-[#18181B] border border-[#E4E4E7]",
  brand: "bg-[#F07020]/10 text-[#F07020] border border-[#F07020]/20",
  success: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  destructive: "bg-red-50 text-red-700 border border-red-200",
};

function Badge({ className = "", variant = "default", ...props }) {
  const variantClass = badgeVariants[variant] || badgeVariants.default;
  return (
    <div
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${variantClass} ${className}`}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
