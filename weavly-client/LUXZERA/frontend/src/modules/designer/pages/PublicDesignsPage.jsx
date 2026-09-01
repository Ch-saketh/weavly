"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Scissors, ArrowRight, Filter, ShieldCheck, ArrowUpRight } from "lucide-react";
import { getPublicDesigns } from "../services/designerService";

const CATEGORIES = ["all", "dresses", "suits", "couture", "outerwear", "bridal", "tops", "traditional"];
const STYLES = ["all", "Contemporary", "Minimalist", "Traditional", "Avant-Garde", "Bohemian"];
const AUDIENCES = ["all", "Women", "Men", "Unisex"];

const FALLBACK_DESIGNS = [
  {
    designId: "DSG-101",
    title: "Architectural Silk Faille Evening Gown",
    designerName: "Elena Rostova",
    category: "couture",
    targetAudience: "Women",
    estimatedPrice: 18500,
    description: "Sculpted bodice with hand-pleated silk faille and structured geometric draping.",
    primaryImageUrl: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
  },
  {
    designId: "DSG-102",
    title: "Bespoke English Tweed Double-Breasted Blazer",
    designerName: "Julian Mercer",
    category: "suits",
    targetAudience: "Men",
    estimatedPrice: 22000,
    description: "Full canvas bespoke blazer cut from Yorkshire heritage wool with horn buttons.",
    primaryImageUrl: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
  },
  {
    designId: "DSG-103",
    title: "Raw Indigo Asymmetrical Linen Tunic",
    designerName: "Aria Vance",
    category: "tops",
    targetAudience: "Women",
    estimatedPrice: 12800,
    description: "Natural-dyed Japanese raw linen with fluid asymmetrical drape and hand-stitched seams.",
    primaryImageUrl: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80",
  },
  {
    designId: "DSG-104",
    title: "Artisanal Veg-Tanned Leather Moto Jacket",
    designerName: "Mateo Silva",
    category: "outerwear",
    targetAudience: "Men",
    estimatedPrice: 26500,
    description: "Hand-burnished full-grain Italian leather with custom brass hardware and cupro lining.",
    primaryImageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
  },
  {
    designId: "DSG-105",
    title: "Pleated Organza High-Collar Blouse",
    designerName: "Elena Rostova",
    category: "tops",
    targetAudience: "Women",
    estimatedPrice: 14200,
    description: "Delicate silk organza with accordion pleats and French cuff detailing.",
    primaryImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
  },
  {
    designId: "DSG-106",
    title: "Pleated Savile Row Wool Trousers",
    designerName: "Julian Mercer",
    category: "suits",
    targetAudience: "Men",
    estimatedPrice: 13500,
    description: "Double forward pleats with side adjusters in heavy English flannel.",
    primaryImageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
  },
];

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
        if (data?.content && data.content.length > 0) {
          setDesigns(data.content);
          setTotalElements(data.totalElements || data.content.length);
        } else {
          setDesigns(FALLBACK_DESIGNS);
          setTotalElements(FALLBACK_DESIGNS.length);
        }
      })
      .catch((err) => {
        console.warn("Failed to load designs:", err);
        setDesigns(FALLBACK_DESIGNS);
        setTotalElements(FALLBACK_DESIGNS.length);
      })
      .finally(() => setLoading(false));
  }, [category, style, audience, page]);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-10 sm:space-y-14">

        {/* ── ATELIER HEADER ── */}
        <section className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-10 md:p-12 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#183B56] text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56]">
                <Scissors size={12} />
                <span>Original Creator Creations & Lookbooks</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                Curated Designer Lookbook.
              </h1>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-normal">
                Browse original silhouettes handcrafted by independent couturiers. Select any creation to commission custom sizing, fabric variations, or bespoke alterations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/custom-design")}
                className="py-3.5 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Request Custom Brief</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => router.push("/designers")}
                className="py-3.5 px-6 bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span>Meet Creators</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* ── FILTER TOOLBAR ── */}
        <div className="border border-[#183B56] bg-[#F5EFEB] p-4 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#183B56]/30 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#183B56] uppercase tracking-wider">
              <Filter size={14} /> Filter Atelier Creations
            </div>
            <div className="text-xs font-bold text-[#5A7184]">
              Showing <span className="text-[#183B56]">{designs.length}</span> of {totalElements} creations
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[#183B56] mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-[#183B56] bg-white text-[#183B56] text-xs font-medium outline-none capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#183B56] mb-1">Design Style</label>
              <select
                value={style}
                onChange={(e) => { setStyle(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-[#183B56] bg-white text-[#183B56] text-xs font-medium outline-none"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All Styles" : s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[#183B56] mb-1">Audience</label>
              <select
                value={audience}
                onChange={(e) => { setAudience(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 border border-[#183B56] bg-white text-[#183B56] text-xs font-medium outline-none"
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>{a === "all" ? "All Audiences" : a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ── DESIGNS GRID ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map((design) => (
            <div
              key={design.designId}
              onClick={() => router.push(`/custom-design`)}
              className="border border-[#183B56] bg-[#F5EFEB] flex flex-col justify-between shadow-xs hover:bg-[#183B56]/[0.02] transition-colors cursor-pointer group"
            >
              <div>
                <div className="aspect-[3/3.8] bg-[#DFE7ED] border-b border-[#183B56] relative overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={design.primaryImageUrl}
                    alt={design.title}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white border border-[#183B56] px-2 py-0.5 text-[10px] font-bold text-[#183B56] uppercase">
                    {design.category}
                  </div>
                  <div className="absolute top-2.5 right-2.5 bg-white border border-[#183B56] px-2 py-0.5 text-[10px] font-bold text-[#183B56] uppercase">
                    {design.targetAudience}
                  </div>
                </div>

                <div className="p-5 space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#5A7184] uppercase tracking-wider">
                    <span>{design.designerName || "Weavly Couturier"}</span>
                    <ShieldCheck size={13} className="text-[#183B56]" />
                  </div>

                  <h3 className="font-bold text-sm sm:text-base text-[#183B56] group-hover:underline line-clamp-1">
                    {design.title}
                  </h3>

                  <p className="text-xs text-[#5A7184] line-clamp-2 leading-relaxed font-normal">
                    {design.description || "Original handcrafted atelier piece."}
                  </p>
                </div>
              </div>

              <div className="p-5 pt-0 space-y-3">
                <div className="flex items-center justify-between pt-3 border-t border-[#183B56]/20 text-xs">
                  <span className="text-[10px] font-bold text-[#5A7184] uppercase">Commission Rate</span>
                  <span className="font-bold text-sm text-[#183B56]">
                    {design.estimatedPrice ? `₹${Number(design.estimatedPrice).toLocaleString("en-IN")}` : "Custom Quote"}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/custom-design`);
                  }}
                  className="w-full py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer flex items-center justify-center gap-1.5 transition-all shadow-xs"
                >
                  <Scissors size={12} />
                  <span>Customize This Silhouette</span>
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
