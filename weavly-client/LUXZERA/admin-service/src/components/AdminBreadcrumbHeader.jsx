"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminBreadcrumbHeader({ title = "Dashboard", category = "Overview", onRefresh, refreshLoading }) {
  const router = useRouter();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[#ECECEC] bg-white px-8 font-sans">
      <div className="flex items-center gap-2 text-xs text-[#71717A]">
        <button
          onClick={() => router.push("/dashboard")}
          className="hover:text-[#18181B] transition-colors border-none bg-transparent cursor-pointer font-medium p-0"
        >
          {category}
        </button>
        <ChevronRight size={13} className="text-[#9B9B9B]" />
        <span className="font-bold text-[#18181B]">{title}</span>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw size={13} className={`mr-1.5 ${refreshLoading ? "animate-spin text-[#F07020]" : ""}`} />
            <span>Refresh Queue</span>
          </Button>
        )}
        <Button variant="default" size="sm" onClick={() => router.push("/products")}>
          <Sparkles size={13} className="mr-1.5" />
          <span>Product Studio</span>
        </Button>
      </div>
    </header>
  );
}
