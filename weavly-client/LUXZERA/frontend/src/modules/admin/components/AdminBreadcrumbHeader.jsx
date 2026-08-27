"use client";

import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, RefreshCw, Sparkles } from "lucide-react";

export default function AdminBreadcrumbHeader({ title = "Dashboard", category = "Overview", onRefresh, refreshLoading }) {
  const router = useRouter();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-[#E4E4E7] bg-white px-6 font-sans">
      <div className="flex items-center gap-2 text-xs text-[#71717A]">
        <button
          onClick={() => router.push("/admin/dashboard")}
          className="hover:text-[#18181B] transition-colors border-none bg-transparent cursor-pointer font-medium p-0"
        >
          {category}
        </button>
        <ChevronRight size={13} className="text-[#A1A1AA]" />
        <span className="font-semibold text-[#18181B]">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E4E4E7] text-xs font-semibold text-[#18181B] hover:border-[#18181B] transition-colors cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} className={refreshLoading ? "animate-spin text-[#F07020]" : ""} />
            <span>Refresh Queue</span>
          </button>
        )}
        <button
          onClick={() => router.push("/admin/products")}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#F07020] text-white text-xs font-bold transition-all cursor-pointer border-none shadow-sm"
        >
          <Sparkles size={13} />
          <span>Product Studio</span>
        </button>
      </div>
    </header>
  );
}
