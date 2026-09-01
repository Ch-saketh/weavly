"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, MapPin, ArrowRight, Palette, Scissors, ShieldCheck, ArrowUpRight } from "lucide-react";
import { getPublicDesigners } from "../services/designerService";

const NEUTRAL_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY CREATOR%3C/text%3E%3C/svg%3E";

const FALLBACK_CREATORS = [
  {
    designerId: "DES-8812",
    displayName: "Elena Rostova",
    brandName: "Maison Rostova",
    location: "Milan • Paris",
    specialization: "Haute Couture & Sculpted Bodices",
    bio: "Specializing in architectural eveningwear, hand-pleated silk faille, and bespoke corsetry drafted to precise silhouette scans.",
    publishedDesignsCount: 18,
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    previewImageUrls: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80",
    ],
  },
  {
    designerId: "DES-9041",
    displayName: "Julian Mercer",
    brandName: "Mercer & Co. Sartorial",
    location: "London • Savile Row",
    specialization: "Bespoke Suiting & Tweed",
    bio: "Master tailor with 15 years crafting full-canvas single and double-breasted suits using English and Scottish heritage wools.",
    publishedDesignsCount: 24,
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    previewImageUrls: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=400&q=80",
    ],
  },
  {
    designerId: "DES-7120",
    displayName: "Aria Vance",
    brandName: "Studio Vance",
    location: "Tokyo • Kyoto",
    specialization: "Minimalist Drapes & Raw Indigo Linen",
    bio: "Blending contemporary Japanese deconstructivism with natural-dyed textiles, asymmetrical silhouettes, and fluid drape.",
    publishedDesignsCount: 15,
    profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    previewImageUrls: [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=400&q=80",
    ],
  },
  {
    designerId: "DES-6533",
    displayName: "Mateo Silva",
    brandName: "Silva Atelier",
    location: "Madrid • Florence",
    specialization: "Artisanal Leather & Outerwear",
    bio: "Vegetable-tanned full-grain leather jackets, custom moto outerwear, and handcrafted leather accessories tailored to order.",
    publishedDesignsCount: 12,
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    previewImageUrls: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=400&q=80",
    ],
  },
];

export default function PublicDesignersPage() {
  const router = useRouter();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSpec, setFilterSpec] = useState("all");

  useEffect(() => {
    getPublicDesigners()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setDesigners(data);
        } else {
          setDesigners(FALLBACK_CREATORS);
        }
      })
      .catch((err) => {
        console.warn("Failed to load designers:", err);
        setDesigners(FALLBACK_CREATORS);
      })
      .finally(() => setLoading(false));
  }, []);

  const specializations = ["all", ...new Set(designers.map((d) => d.specialization).filter(Boolean))];

  const filteredDesigners = filterSpec === "all"
    ? designers
    : designers.filter((d) => d.specialization?.toLowerCase() === filterSpec.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-10 sm:space-y-14">

        {/* ── EDITORIAL ATELIER HEADER ── */}
        <section className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-10 md:p-12 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#183B56] text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56]">
                <Sparkles size={12} />
                <span>The Weavly Atelier Guild</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                Discover Independent <br />
                Fashion Creators & Tailors.
              </h1>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-normal">
                Connect directly with verified custom designers, bespoke couturiers, and artisanal pattern-makers. Commission original 1-of-1 silhouettes handcrafted to your exact proportions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push("/become-designer")}
                className="py-3.5 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Join as a Designer</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => router.push("/designer-studio")}
                className="py-3.5 px-6 bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span>Studio Overview</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* ── FILTER TABS ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#183B56]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setFilterSpec(spec)}
                className={`py-2 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  filterSpec === spec
                    ? "bg-[#183B56] text-white border border-[#183B56]"
                    : "bg-transparent text-[#183B56] border border-[#183B56]/30 hover:border-[#183B56]"
                }`}
              >
                {spec === "all" ? "All Specializations" : spec}
              </button>
            ))}
          </div>

          <div className="text-xs font-bold text-[#5A7184] uppercase tracking-wider">
            {filteredDesigners.length} {filteredDesigners.length === 1 ? "Creator" : "Creators"} Active
          </div>
        </div>

        {/* ── DESIGNER CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredDesigners.map((designer) => (
            <div
              key={designer.designerId}
              onClick={() => router.push(`/designer-studio`)}
              className="border border-[#183B56] bg-[#F5EFEB] p-6 space-y-5 flex flex-col justify-between shadow-xs hover:bg-[#183B56]/[0.02] transition-colors cursor-pointer group"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-14 h-14 rounded-full border border-[#183B56] bg-white overflow-hidden shrink-0">
                      <img
                        src={designer.profileImageUrl || NEUTRAL_FALLBACK_IMAGE}
                        alt={designer.displayName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-base text-[#183B56] group-hover:underline">
                          {designer.displayName}
                        </h3>
                        <ShieldCheck size={14} className="text-[#183B56]" />
                      </div>
                      <p className="text-xs text-[#5A7184] font-medium">
                        {designer.brandName || "Independent Studio"}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-white border border-[#183B56] text-[#183B56]">
                    {designer.designerId}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {designer.specialization && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white border border-[#183B56] text-[#183B56] px-2.5 py-1">
                      <Scissors size={11} /> {designer.specialization}
                    </span>
                  )}
                  {designer.location && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5A7184] bg-white border border-[#183B56]/30 px-2 py-1">
                      <MapPin size={11} /> {designer.location}
                    </span>
                  )}
                </div>

                {designer.bio && (
                  <p className="text-xs text-[#5A7184] line-clamp-3 leading-relaxed">
                    {designer.bio}
                  </p>
                )}

                {designer.previewImageUrls && designer.previewImageUrls.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {designer.previewImageUrls.map((img, i) => (
                      <div key={i} className="aspect-[3/3.8] bg-[#DFE7ED] border border-[#183B56] overflow-hidden p-2">
                        <img src={img} alt="Creation preview" className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-[#183B56] flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-[#5A7184]">
                  {designer.publishedDesignsCount || 12} Archival Patterns
                </span>
                <span className="text-[#183B56] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Explore Atelier</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
