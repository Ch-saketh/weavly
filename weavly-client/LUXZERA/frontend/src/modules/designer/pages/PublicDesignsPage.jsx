"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Scissors, ArrowRight, Filter, ShieldCheck } from "lucide-react";
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
        setDesigns(data.content || []);
        setTotalElements(data.totalElements || 0);
      })
      .catch((err) => console.warn("Failed to load designs:", err))
      .finally(() => setLoading(false));
  }, [category, style, audience, page]);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1D1D1F] pb-28">
      {/* Header */}
      <section className="bg-gradient-to-b from-[#1D1D1F] via-[#242426] to-[#1D1D1F] text-white pt-28 pb-16 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F07020] text-xs font-semibold tracking-wider uppercase mb-5 backdrop-blur-md">
            <Sparkles size={13} /> Original Creator Creations
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight font-serif mb-4">
            Curated Designer Lookbook
          </h1>
          <p className="text-sm sm:text-base text-white/70 max-w-xl mx-auto font-light leading-relaxed">
            Browse original concepts handcrafted by independent designers. Select any creation to request custom sizing, color variations, or bespoke adjustments.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-10">
        {/* Filter Toolbar */}
        <div className="bg-white rounded-2xl border border-[#ECECEC] p-4 sm:p-6 shadow-sm mb-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ECECEC] pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#1D1D1F] uppercase tracking-wider">
              <Filter size={14} className="text-[#F07020]" /> Filter Creations
            </div>
            <div className="text-xs text-[#86868B]">
              Showing <span className="font-semibold text-[#1D1D1F]">{designs.length}</span> of {totalElements} creations
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            {/* Category */}
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] text-[#1D1D1F] outline-none capitalize"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>
                ))}
              </select>
            </div>

            {/* Style */}
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1.5">Design Style</label>
              <select
                value={style}
                onChange={(e) => { setStyle(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] text-[#1D1D1F] outline-none"
              >
                {STYLES.map((s) => (
                  <option key={s} value={s}>{s === "all" ? "All Styles" : s}</option>
                ))}
              </select>
            </div>

            {/* Audience */}
            <div>
              <label className="block font-medium text-[#6E6E73] mb-1.5">Audience</label>
              <select
                value={audience}
                onChange={(e) => { setAudience(e.target.value); setPage(0); }}
                className="w-full px-3 py-2 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] text-[#1D1D1F] outline-none"
              >
                {AUDIENCES.map((a) => (
                  <option key={a} value={a}>{a === "all" ? "All Audiences" : a}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden animate-pulse">
                <div className="aspect-[3/4] bg-[#E5E5E5]" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-[#E5E5E5] rounded w-3/4" />
                  <div className="h-3 bg-[#E5E5E5] rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Designs Grid */}
        {!loading && designs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {designs.map((design) => (
              <div
                key={design.designId}
                className="bg-white rounded-2xl border border-[#ECECEC] overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
              >
                <div
                  onClick={() => router.push(`/designs/${design.designId}`)}
                  className="cursor-pointer"
                >
                  <div className="aspect-[3/4] bg-[#F4F1EC] relative overflow-hidden">
                    <img
                      src={design.primaryImageUrl}
                      alt={design.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex flex-col gap-1">
                      <span className="text-[10px] font-medium bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-md capitalize">
                        {design.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-1 text-[11px] text-[#86868B] mb-1">
                      <span>{design.designerName || "Designer Atelier"}</span>
                      <ShieldCheck size={11} className="text-[#F07020]" />
                    </div>

                    <h3 className="font-semibold text-sm text-[#1D1D1F] group-hover:text-[#F07020] transition-colors line-clamp-1">
                      {design.title}
                    </h3>

                    <p className="text-xs text-[#6E6E73] line-clamp-2 mt-1 leading-relaxed">
                      {design.description || "Original handcrafted designer piece."}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-xs">
                      <span className="font-bold text-[#1D1D1F]">
                        {design.estimatedPrice ? `₹${design.estimatedPrice.toLocaleString()}` : "Price on request"}
                      </span>
                      <span className="text-[11px] text-[#86868B]">
                        {design.targetAudience}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <button
                    onClick={() => router.push(`/designs/${design.designId}`)}
                    className="w-full py-2 rounded-xl bg-[#1D1D1F] hover:bg-[#F07020] text-white text-xs font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <Scissors size={12} /> Customize This
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && designs.length === 0 && (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F4F1EC] text-[#8C827A] flex items-center justify-center mx-auto mb-4">
              <Scissors size={28} />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2 font-serif">
              No Published Designs Found
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed mb-6">
              No creations match the selected filters. Try changing your filters or browse verified designers.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => { setCategory("all"); setStyle("all"); setAudience("all"); }}
                className="px-5 py-2 rounded-full bg-[#FAFAF9] border border-[#ECECEC] text-xs font-medium hover:bg-[#F0F0F0]"
              >
                Clear Filters
              </button>
              <button
                onClick={() => router.push("/designers")}
                className="px-5 py-2 rounded-full bg-[#1D1D1F] text-white text-xs font-medium"
              >
                Browse Designers
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
