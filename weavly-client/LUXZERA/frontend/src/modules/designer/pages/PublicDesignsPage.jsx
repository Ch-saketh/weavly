"use client";

// src/modules/designer/pages/PublicDesignsPage.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Scissors,
  ArrowRight,
  Filter,
  ShieldCheck,
  ArrowUpRight,
  Palette,
  BookOpen,
  CheckCircle2,
  PlusCircle
} from "lucide-react";
import { getPublicDesigns } from "../services/designerService";

const CATEGORIES = ["all", "dresses", "suits", "couture", "outerwear", "bridal", "tops", "traditional"];
const STYLES = ["all", "Contemporary", "Minimalist", "Traditional", "Avant-Garde", "Bohemian"];
const AUDIENCES = ["all", "Women", "Men", "Unisex"];

export default function PublicDesignsPage() {
  const router = useRouter();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalElements, setTotalElements] = useState(0);

  const [category, setCategory] = useState("all");
  const [style, setStyle] = useState("all");
  const [audience, setAudience] = useState("all");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    getPublicDesigns({ category, style, audience, page, size: 24 })
      .then((data) => {
        if (data?.content && Array.isArray(data.content) && data.content.length > 0) {
          // De-duplicate by designId
          const seen = new Set();
          const unique = data.content.filter((item) => {
            const id = item.designId || item.id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          setDesigns(unique);
          setTotalElements(data.totalElements || unique.length);
        } else {
          setDesigns([]);
          setTotalElements(0);
        }
      })
      .catch((err) => {
        console.warn("Notice: Designs directory is in founding curation phase:", err);
        setDesigns([]);
        setTotalElements(0);
      })
      .finally(() => setLoading(false));
  }, [category, style, audience, page]);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-10 sm:space-y-14">

        {/* ── ATELIER HEADER ── */}
        <section className="border border-[#183B56] bg-white p-6 sm:p-10 md:p-12 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5EFEB] border border-[#183B56] text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56]">
                <Scissors size={12} />
                <span>Original Creator Creations &amp; Lookbooks</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                Curated Designer Lookbooks.
              </h1>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-medium">
                Browse original silhouettes handcrafted by independent couturiers. Select any creation to commission custom sizing, fabric variations, or bespoke alterations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => router.push("/how-to-publish")}
                className="py-3.5 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Publish a Design</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => router.push("/custom-design")}
                className="py-3.5 px-6 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span>Commission Brief</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* ── FOUNDING COHORT LOOKBOOK PREVIEW STATE (When no published designs yet) ── */}
        {!loading && designs.length === 0 && (
          <div className="space-y-10">
            
            {/* Curation Announcement Banner */}
            <div className="border border-[#183B56] bg-[#183B56] text-white p-8 sm:p-12 shadow-sm rounded-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-[10px] font-bold tracking-wider uppercase text-[#38BDF8] rounded-full">
                  <BookOpen size={13} />
                  <span>Lookbooks Opening for Founding Creators</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-snug">
                  Original artisan lookbooks are currently in studio production.
                </h2>
                <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed font-normal">
                  Approved couturiers are currently drafting their inaugural collection pieces. Are you a verified designer or aspiring atelier? Publish your garment lookbook today and reach patrons worldwide.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Instant Zyra AI Style Indexing</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Custom Measurement Integration</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>100% Escrow Protection</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Action Pathways */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="border border-[#183B56]/30 bg-white p-6 sm:p-8 rounded-xl shadow-xs space-y-4 flex flex-col justify-between hover:border-[#183B56] transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#183B56] text-white flex items-center justify-center font-bold">
                    <PlusCircle size={18} />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
                    Publish Your Design
                  </h3>
                  <p className="text-xs text-[#5A7184] leading-relaxed font-medium">
                    Approved designers can upload sketches, high-res renders, fabric weights, and bespoke size options directly to the catalog.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/how-to-publish")}
                  className="w-full py-3 px-4 bg-[#183B56] hover:bg-[#102A43] text-white text-[11px] font-bold uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>Publishing Guide</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="border border-[#183B56]/30 bg-white p-6 sm:p-8 rounded-xl shadow-xs space-y-4 flex flex-col justify-between hover:border-[#183B56] transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#183B56] text-white flex items-center justify-center font-bold">
                    <Scissors size={18} />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
                    Commission 1-of-1 Garment
                  </h3>
                  <p className="text-xs text-[#5A7184] leading-relaxed font-medium">
                    Submit your custom brief and precise measurements directly to our master tailoring desk for a bespoke commission.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/custom-design")}
                  className="w-full py-3 px-4 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all border border-[#183B56] cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>Start Commission</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="border border-[#183B56]/30 bg-white p-6 sm:p-8 rounded-xl shadow-xs space-y-4 flex flex-col justify-between hover:border-[#183B56] transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#183B56] text-white flex items-center justify-center font-bold">
                    <Palette size={18} />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
                    Become a Verified Creator
                  </h3>
                  <p className="text-xs text-[#5A7184] leading-relaxed font-medium">
                    Join our premier atelier network. Showcase your handcrafted fashion collections with zero upfront listing fees.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/become-designer")}
                  className="w-full py-3 px-4 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all border border-[#183B56] cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>Join Atelier Guild</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ── REAL ONBOARDED DESIGNS LIST (If designs exist in database) ── */}
        {!loading && designs.length > 0 && (
          <div className="space-y-8">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#183B56]">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-2 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                      category === cat
                        ? "bg-[#183B56] text-white border border-[#183B56]"
                        : "bg-transparent text-[#183B56] border border-[#183B56]/30 hover:border-[#183B56]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="text-xs font-bold text-[#5A7184] uppercase tracking-wider">
                {designs.length} {designs.length === 1 ? "Design" : "Designs"} Active
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {designs.map((design) => (
                <div
                  key={design.designId || design.id}
                  onClick={() => router.push(`/designs/${design.designId || design.id}`)}
                  className="border border-[#183B56] bg-white p-5 space-y-4 flex flex-col justify-between shadow-xs hover:bg-[#183B56]/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="aspect-[3/4] bg-[#DFE7ED] border border-[#183B56] overflow-hidden p-3 relative flex items-center justify-center">
                    {design.primaryImageUrl ? (
                      <img
                        src={design.primaryImageUrl}
                        alt={design.title}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="text-center p-4">
                        <Palette size={24} className="mx-auto text-[#5A7184] mb-2" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#183B56]">Artisan Silhouette</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-[#F5EFEB] border border-[#183B56] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#183B56]">
                      {design.category || "Couture"}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider">
                      {design.designerName || "Verified Atelier"}
                    </p>
                    <h3 className="font-bold text-sm text-[#183B56] group-hover:underline truncate">
                      {design.title}
                    </h3>
                    {design.estimatedPrice && (
                      <p className="text-xs font-bold text-[#183B56] pt-1">
                        ₹{Number(design.estimatedPrice).toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
