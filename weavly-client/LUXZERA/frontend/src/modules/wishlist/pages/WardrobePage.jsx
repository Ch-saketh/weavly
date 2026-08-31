"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles } from "lucide-react";
import ZeraCollection from "@/modules/products/components/ZeraCollection";

export default function WardrobePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5EFEB] font-sans pb-24 text-[#183B56] selection:bg-[#183B56] selection:text-white">

      {/* MASTER CONTAINER WITH GENEROUS EDGE MARGINS */}
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-12 sm:space-y-16">

        {/* ── 1. ARCHITECTURAL PAGE HERO HEADER MODULE ── */}
        <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-[#183B56]">
            
            {/* Left: Title & Manifesto */}
            <div className="md:col-span-8 p-6 sm:p-10 space-y-3">
              <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] font-bold text-[#5A7184]">
                <Sparkles size={11} className="text-[#183B56]" />
                <span>Wardrobe Curation</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#183B56] uppercase leading-tight">
                Zyra Collection
              </h1>
              <p className="text-xs sm:text-sm text-[#5A7184] max-w-2xl leading-relaxed font-normal pt-1">
                AI-powered bespoke fashion intelligence. Curated outfit combinations and garment selections tailored exclusively for your style identity, body proportions, and chosen occasion.
              </p>
            </div>

            {/* Right: Direct Action Button */}
            <div className="md:col-span-4 p-6 sm:p-10 flex flex-col items-start md:items-end justify-center">
              <button
                onClick={() => router.push("/market")}
                className="w-full md:w-auto px-8 py-4 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2 hover:scale-[1.01]"
              >
                <span>Shop All Products</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        </section>

        {/* ── 2. PURE ZYRA COLLECTION INTELLIGENCE SECTION ── */}
        <ZeraCollection />

      </main>

    </div>
  );
}
