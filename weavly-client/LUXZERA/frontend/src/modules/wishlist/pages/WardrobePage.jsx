"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import ZeraCollection from "@/modules/products/components/ZeraCollection";

export default function WardrobePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans pb-24 text-[#1D1D1F]">

      {/* ── PAGE HERO HEADER ── */}
      <div className="border-b border-[#ECECEC] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="h-6 px-3 rounded-full bg-[#1D1D1F] text-white text-[11px] font-semibold tracking-wider flex items-center gap-1.5 shadow-2xs">
                  <Sparkles size={11} className="text-[#F07020]" />
                  AI RECOMMENDATION ENGINE
                </span>
                <span className="text-xs text-[#71717A] font-medium">Bespoke Curation</span>
              </div>
              <h1 className="text-[32px] md:text-[48px] font-bold text-[#1D1D1F] tracking-tight uppercase">
                Zyra Collection
              </h1>
              <p className="text-[14px] text-[#71717A] max-w-2xl leading-relaxed font-normal">
                AI-powered bespoke fashion intelligence. Curated Top 10 outfit combinations and garment selections tailored exclusively for your style identity, body proportions, and chosen occasion.
              </p>
            </div>
            <button
              onClick={() => router.push("/market")}
              className="border border-[#1D1D1F] hover:bg-[#1D1D1F] hover:text-white text-[#1D1D1F] text-[12px] font-semibold uppercase tracking-[0.2em] px-6 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer shrink-0"
            >
              Shop All Products <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* ── PURE ZYRA COLLECTION INTELLIGENCE SECTION ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ZeraCollection />
      </div>

    </div>
  );
}
