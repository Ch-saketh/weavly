"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, MapPin, ExternalLink, ArrowRight, Palette, Scissors, ShieldCheck } from "lucide-react";
import { getPublicDesigners } from "../services/designerService";

export default function PublicDesignersPage() {
  const router = useRouter();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSpec, setFilterSpec] = useState("all");

  useEffect(() => {
    getPublicDesigners()
      .then((data) => setDesigners(data || []))
      .catch((err) => console.warn("Failed to load designers:", err))
      .finally(() => setLoading(false));
  }, []);

  const specializations = ["all", ...new Set(designers.map((d) => d.specialization).filter(Boolean))];

  const filteredDesigners = filterSpec === "all"
    ? designers
    : designers.filter((d) => d.specialization?.toLowerCase() === filterSpec.toLowerCase());

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#1D1D1F] pb-24">
      {/* Editorial Header */}
      <section className="bg-gradient-to-b from-[#1D1D1F] via-[#242426] to-[#1D1D1F] text-white pt-28 pb-20 px-6 sm:px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#F07020_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-[#F07020] text-xs font-semibold tracking-wider uppercase mb-6 backdrop-blur-md">
            <Sparkles size={13} /> The Weavly Atelier Network
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-5 font-serif">
            Discover Independent Fashion Creators
          </h1>
          <p className="text-base sm:text-lg text-white/70 max-w-2xl mx-auto font-light leading-relaxed">
            Connect directly with verified custom designers, bespoke tailors, and luxury couturiers. Commission original garments handcrafted to your exact silhouette.
          </p>

          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => router.push("/become-designer")}
              className="px-6 py-3 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white font-medium text-sm transition-all shadow-lg shadow-[#F07020]/25 flex items-center gap-2"
            >
              Become a Verified Designer <ArrowRight size={15} />
            </button>
            <button
              onClick={() => router.push("/custom-design")}
              className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-all backdrop-blur-md"
            >
              Request Custom Garment
            </button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-12">
        {/* Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 border-b border-[#ECECEC]">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {specializations.map((spec) => (
              <button
                key={spec}
                onClick={() => setFilterSpec(spec)}
                className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all whitespace-nowrap ${
                  filterSpec === spec
                    ? "bg-[#1D1D1F] text-white shadow-sm"
                    : "bg-[#F0F0F0] text-[#6E6E73] hover:bg-[#E4E4E7]"
                }`}
              >
                {spec === "all" ? "All Specializations" : spec}
              </button>
            ))}
          </div>

          <div className="text-xs text-[#86868B] font-medium">
            {filteredDesigners.length} {filteredDesigners.length === 1 ? "Creator" : "Creators"} Available
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-6 border border-[#ECECEC] animate-pulse space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#E5E5E5]" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-[#E5E5E5] rounded w-3/4" />
                    <div className="h-3 bg-[#E5E5E5] rounded w-1/2" />
                  </div>
                </div>
                <div className="h-20 bg-[#E5E5E5] rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Real Designer Cards */}
        {!loading && filteredDesigners.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 pt-10">
            {filteredDesigners.map((designer) => (
              <div
                key={designer.designerId}
                onClick={() => router.push(`/designers/${designer.designerId}`)}
                className="bg-white rounded-2xl border border-[#ECECEC] hover:border-[#1D1D1F]/30 p-6 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-full bg-[#FAFAF9] border border-[#ECECEC] overflow-hidden shrink-0 flex items-center justify-center text-lg font-bold text-[#1D1D1F]">
                        {designer.profileImageUrl ? (
                          <img
                            src={designer.profileImageUrl}
                            alt={designer.displayName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{(designer.displayName || "D")[0]}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-base text-[#1D1D1F] group-hover:text-[#F07020] transition-colors">
                            {designer.displayName}
                          </h3>
                          <ShieldCheck size={14} className="text-[#F07020]" />
                        </div>
                        <p className="text-xs text-[#86868B] font-normal mt-0.5">
                          {designer.brandName || "Independent Studio"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 bg-[#F4F1EC] text-[#8C827A] rounded-md">
                      {designer.designerId}
                    </span>
                  </div>

                  {/* Specialization & Location Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    {designer.specialization && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[#F07020]/10 text-[#F07020] px-2.5 py-1 rounded-md">
                        <Scissors size={11} /> {designer.specialization}
                      </span>
                    )}
                    {designer.location && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#86868B] bg-[#FAFAF9] px-2 py-1 rounded-md border border-[#ECECEC]">
                        <MapPin size={11} /> {designer.location}
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {designer.bio && (
                    <p className="text-xs text-[#52525B] line-clamp-3 leading-relaxed mb-5">
                      {designer.bio}
                    </p>
                  )}

                  {/* Lookbook preview thumbs */}
                  {designer.previewImageUrls && designer.previewImageUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mb-5">
                      {designer.previewImageUrls.map((img, i) => (
                        <div key={i} className="aspect-square rounded-lg overflow-hidden bg-[#F4F1EC] border border-[#ECECEC]">
                          <img src={img} alt="Creation preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom CTA */}
                <div className="pt-4 border-t border-[#ECECEC] flex items-center justify-between text-xs font-medium">
                  <span className="text-[#86868B]">
                    {designer.publishedDesignsCount} {designer.publishedDesignsCount === 1 ? "Creation" : "Creations"}
                  </span>
                  <span className="text-[#F07020] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    View Atelier <ArrowRight size={13} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Clean Empty State */}
        {!loading && filteredDesigners.length === 0 && (
          <div className="py-24 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-[#F4F1EC] text-[#8C827A] flex items-center justify-center mx-auto mb-4">
              <Palette size={28} />
            </div>
            <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2 font-serif">
              No Designers Registered Yet
            </h3>
            <p className="text-xs text-[#86868B] leading-relaxed mb-6">
              Be among the first independent designers to launch your atelier on Weavly.
            </p>
            <button
              onClick={() => router.push("/become-designer")}
              className="px-6 py-2.5 rounded-full bg-[#1D1D1F] hover:bg-[#2C2C2E] text-white text-xs font-medium transition-all"
            >
              Apply as a Designer
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
