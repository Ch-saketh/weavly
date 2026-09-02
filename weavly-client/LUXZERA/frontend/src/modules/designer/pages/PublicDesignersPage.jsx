"use client";

// src/modules/designer/pages/PublicDesignersPage.jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  ArrowRight,
  Palette,
  Scissors,
  ShieldCheck,
  ArrowUpRight,
  Award,
  BookOpen,
  UserPlus,
  CheckCircle2,
  Lock,
  Layers
} from "lucide-react";
import { getPublicDesigners } from "../services/designerService";

export default function PublicDesignersPage() {
  const router = useRouter();
  const [designers, setDesigners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSpec, setFilterSpec] = useState("all");

  useEffect(() => {
    getPublicDesigners()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // De-duplicate by designerId
          const seen = new Set();
          const unique = data.filter((d) => {
            const id = d.designerId || d.id;
            if (!id || seen.has(id)) return false;
            seen.add(id);
            return true;
          });
          setDesigners(unique);
        } else {
          setDesigners([]);
        }
      })
      .catch((err) => {
        console.warn("Notice: Designers directory is in founding curation phase:", err);
        setDesigners([]);
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
        <section className="border border-[#183B56] bg-white p-6 sm:p-10 md:p-12 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5EFEB] border border-[#183B56] text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56]">
                <Sparkles size={12} />
                <span>The Weavly Atelier Guild</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                Discover Independent <br />
                Fashion Creators &amp; Tailors.
              </h1>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-medium">
                Connect directly with verified custom designers, bespoke couturiers, and artisanal pattern-makers. Commission original 1-of-1 silhouettes handcrafted to your exact proportions.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <button
                onClick={() => router.push("/become-designer")}
                className="py-3.5 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Apply as Designer</span>
                <ArrowRight size={13} />
              </button>
              <button
                onClick={() => router.push("/creator-guide")}
                className="py-3.5 px-6 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center justify-center gap-2"
              >
                <span>Creator Handbook</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </section>

        {/* ── FOUNDING ATELIER ONBOARDING PHASE STATE (When no designers onboarded yet) ── */}
        {!loading && designers.length === 0 && (
          <div className="space-y-10">
            
            {/* Curation Announcement Banner */}
            <div className="border border-[#183B56] bg-[#183B56] text-white p-8 sm:p-12 shadow-sm rounded-2xl relative overflow-hidden">
              <div className="max-w-2xl space-y-4 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 text-[10px] font-bold tracking-wider uppercase text-[#38BDF8] rounded-full">
                  <Award size={13} />
                  <span>Founding Cohort Curation in Progress</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight leading-snug">
                  The Atelier is vetting its inaugural class of verified couturiers.
                </h2>
                <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed font-normal">
                  Weavly is currently onboarding independent fashion designers, master tailors, and luxury ateliers. Once creator portfolios complete our craft &amp; authenticity review, their bespoke lookbooks will debut here.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-white/90">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>100% Milestone Escrow</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Zero Upfront Platform Fees</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Global Patron Reach</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 3 Step Action Cards for Prospective Creators & Patrons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Apply to Join */}
              <div className="border border-[#183B56]/30 bg-white p-6 sm:p-8 rounded-xl shadow-xs space-y-4 flex flex-col justify-between hover:border-[#183B56] transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#183B56] text-white flex items-center justify-center font-bold">
                    <UserPlus size={18} />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
                    Apply as a Designer
                  </h3>
                  <p className="text-xs text-[#5A7184] leading-relaxed font-medium">
                    Submit your studio portfolio, garment sketches, and craftsmanship specialty. Join the founding cohort with zero upfront listing fees.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/become-designer")}
                  className="w-full py-3 px-4 bg-[#183B56] hover:bg-[#102A43] text-white text-[11px] font-bold uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>Start Application</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Card 2: Publishing Guide */}
              <div className="border border-[#183B56]/30 bg-white p-6 sm:p-8 rounded-xl shadow-xs space-y-4 flex flex-col justify-between hover:border-[#183B56] transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#183B56] text-white flex items-center justify-center font-bold">
                    <BookOpen size={18} />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
                    How to Publish Designs
                  </h3>
                  <p className="text-xs text-[#5A7184] leading-relaxed font-medium">
                    Explore our step-by-step blueprint on setting bespoke sizing, uploading high-res lookbooks, and receiving automated escrow payouts.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/how-to-publish")}
                  className="w-full py-3 px-4 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all border border-[#183B56] cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>View Publishing Guide</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Card 3: Custom Garment Commission */}
              <div className="border border-[#183B56]/30 bg-white p-6 sm:p-8 rounded-xl shadow-xs space-y-4 flex flex-col justify-between hover:border-[#183B56] transition-colors">
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-lg bg-[#183B56] text-white flex items-center justify-center font-bold">
                    <Scissors size={18} />
                  </div>
                  <h3 className="text-base font-bold uppercase tracking-tight text-[#183B56]">
                    Commission a Silhouette
                  </h3>
                  <p className="text-xs text-[#5A7184] leading-relaxed font-medium">
                    Have a specific garment in mind? Submit your bespoke concept and measurements directly to our master tailoring desk.
                  </p>
                </div>
                <button
                  onClick={() => router.push("/custom-design")}
                  className="w-full py-3 px-4 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all border border-[#183B56] cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>Submit Commission</span>
                  <ArrowRight size={13} />
                </button>
              </div>

            </div>

          </div>
        )}

        {/* ── REAL ONBOARDED DESIGNERS LIST (If creators exist in database) ── */}
        {!loading && filteredDesigners.length > 0 && (
          <div className="space-y-8">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDesigners.map((designer) => (
                <div
                  key={designer.designerId || designer.id}
                  onClick={() => router.push(`/designers/${designer.designerId || designer.id}`)}
                  className="border border-[#183B56] bg-white p-6 space-y-5 flex flex-col justify-between shadow-xs hover:bg-[#183B56]/[0.02] transition-colors cursor-pointer group"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 rounded-full border border-[#183B56] bg-[#DFE7ED] overflow-hidden shrink-0">
                          {designer.profileImageUrl ? (
                            <img
                              src={designer.profileImageUrl}
                              alt={designer.displayName || designer.brandName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#183B56] text-white flex items-center justify-center font-bold text-lg">
                              {(designer.displayName || designer.brandName || "D").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-bold text-base text-[#183B56] group-hover:underline">
                              {designer.displayName || designer.brandName}
                            </h3>
                            <ShieldCheck size={14} className="text-emerald-700" />
                          </div>
                          <p className="text-xs text-[#5A7184] font-medium">
                            {designer.brandName || "Verified Atelier"}
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-[#F5EFEB] border border-[#183B56] text-[#183B56]">
                        {designer.designerId || designer.id}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {designer.specialization && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#F5EFEB] border border-[#183B56] text-[#183B56] px-2.5 py-1">
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
                      <p className="text-xs text-[#5A7184] line-clamp-3 leading-relaxed font-medium">
                        {designer.bio}
                      </p>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#183B56]/20 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                    <span className="text-[#5A7184]">
                      {designer.publishedDesignsCount || 0} Lookbooks
                    </span>
                    <span className="text-[#183B56] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore Atelier</span>
                      <ArrowRight size={13} />
                    </span>
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
