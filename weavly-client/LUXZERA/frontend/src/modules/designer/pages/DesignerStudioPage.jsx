"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Scissors,
  Palette,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Camera,
  Layers,
  CheckCircle2,
  Lock,
  Eye,
  FileText,
  UserCheck,
  Send,
  X,
} from "lucide-react";
import { useDesignerAuth } from "../store/useDesignerAuth";
import { getPublicDesigners } from "../services/designerService";

const NEUTRAL_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY STUDIO%3C/text%3E%3C/svg%3E";

const CURATED_ATELIER_DESIGNERS = [
  {
    designerId: "DES-8812",
    displayName: "Elena Rostova",
    brandName: "Maison Rostova",
    location: "Milan • Paris",
    specialization: "Haute Couture & Sculpted Bodices",
    bio: "Specializing in architectural eveningwear, hand-pleated silk faille, and bespoke corsetry drafted to precise silhouette scans.",
    experienceYears: 12,
    rating: "4.95",
    commissionsCount: 38,
    profileImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    lookbook: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80",
    ],
    startingPrice: "₹16,500",
  },
  {
    designerId: "DES-9041",
    displayName: "Julian Mercer",
    brandName: "Mercer & Co. Sartorial",
    location: "London • Savile Row",
    specialization: "Bespoke Suiting & Tweed Overcoats",
    bio: "Master tailor with 15 years crafting full-canvas single and double-breasted suits using English and Scottish heritage wools.",
    experienceYears: 15,
    rating: "5.0",
    commissionsCount: 52,
    profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
    lookbook: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80",
    ],
    startingPrice: "₹18,999",
  },
  {
    designerId: "DES-7120",
    displayName: "Aria Vance",
    brandName: "Studio Vance",
    location: "Tokyo • Kyoto",
    specialization: "Minimalist Drapes & Raw Indigo Linen",
    bio: "Blending contemporary Japanese deconstructivism with natural-dyed textiles, asymmetrical silhouettes, and fluid drape.",
    experienceYears: 9,
    rating: "4.92",
    commissionsCount: 29,
    profileImageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
    lookbook: [
      "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    ],
    startingPrice: "₹12,400",
  },
  {
    designerId: "DES-6533",
    displayName: "Mateo Silva",
    brandName: "Silva Atelier",
    location: "Madrid • Florence",
    specialization: "Artisanal Leather & Structural Outerwear",
    bio: "Vegetable-tanned full-grain leather jackets, custom moto outerwear, and handcrafted leather accessories tailored to order.",
    experienceYears: 11,
    rating: "4.88",
    commissionsCount: 24,
    profileImageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    lookbook: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80",
      "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=600&q=80",
    ],
    startingPrice: "₹24,500",
  },
];

export default function DesignerStudioPage() {
  const router = useRouter();
  const { designer, isDesignerAuthenticated } = useDesignerAuth();

  const [selectedDesigner, setSelectedDesigner] = useState(null);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [commissionForm, setCommissionForm] = useState({
    garmentType: "Bespoke Suit",
    targetAudience: "Men",
    preferredFabric: "English Wool",
    budget: "₹20,000",
    notes: "",
  });
  const [commissionSubmitted, setCommissionSubmitted] = useState(false);

  const handleOpenCommission = (designerTarget) => {
    setSelectedDesigner(designerTarget || CURATED_ATELIER_DESIGNERS[0]);
    setIsCommissionModalOpen(true);
    setCommissionSubmitted(false);
  };

  const handleSendCommission = (e) => {
    e.preventDefault();
    setCommissionSubmitted(true);
    setTimeout(() => {
      setIsCommissionModalOpen(false);
      setCommissionSubmitted(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      {/* ── MASTER CONTAINER ── */}
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* ════════════════════════════════════════════════════════════
            1. HERO: ATELIER ARCHITECTURAL INTRO
        ════════════════════════════════════════════════════════════ */}
        <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
            
            {/* LEFT: Overview & Purpose (lg:col-span-7) */}
            <div className="lg:col-span-7 p-6 sm:p-10 md:p-12 flex flex-col justify-between space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#183B56] text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56]">
                  <Scissors size={12} />
                  <span>Weavly Designer Studio • The Digital Atelier</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.06]">
                  Where Haute Couture <br />
                  Meets Silhouette Intelligence.
                </h1>

                <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed max-w-xl font-normal pt-1">
                  The Weavly Designer Studio is a curated network of master tailors, luxury couturiers, and independent fashion pattern-makers. Commission one-of-a-kind bespoke garments tailored precisely to your silhouette, drape preferences, and undertones.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => handleOpenCommission(null)}
                  className="py-3.5 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer shadow-xs flex items-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Sparkles size={14} />
                  <span>Request Custom Commission</span>
                  <ArrowRight size={13} />
                </button>

                {isDesignerAuthenticated ? (
                  <button
                    onClick={() => router.push("/designer/dashboard")}
                    className="py-3.5 px-6 bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span>Enter Designer Dashboard</span>
                    <ArrowRight size={13} />
                  </button>
                ) : (
                  <button
                    onClick={() => router.push("/become-designer")}
                    className="py-3.5 px-6 bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center gap-2"
                  >
                    <span>Join as a Designer</span>
                    <span>↗</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#183B56]/30 text-center sm:text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#183B56]">100%</div>
                  <div className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider">Bespoke Fit</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#183B56]">Verified</div>
                  <div className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider">Master Couturiers</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-[#183B56]">Protected</div>
                  <div className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider">Milestone Escrow</div>
                </div>
              </div>
            </div>

            {/* RIGHT: Visual Couture Showcase (lg:col-span-5) */}
            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-center bg-[#F5EFEB]">
              <div className="w-full aspect-[3/3.7] bg-[#DFE7ED] border border-[#183B56] relative overflow-hidden flex items-center justify-center p-6 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=80"
                  alt="Weavly Designer Atelier"
                  className="w-full h-full object-cover mix-blend-multiply"
                />
                <div className="absolute top-3 left-3 bg-white/95 border border-[#183B56] px-2.5 py-1 text-[10px] font-bold text-[#183B56]">
                  [ATELIER DRAFT #042]
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 border border-[#183B56] px-2.5 py-1 text-[10px] font-bold text-[#183B56]">
                  Zyra 3D Drape Integrated
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            2. WHAT IS DESIGNER STUDIO? (THE 4 ATELIER PILLARS)
        ════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="border-b border-[#183B56] pb-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#183B56] tracking-tight uppercase">
              What is Designer Studio?
            </h2>
            <p className="text-xs text-[#5A7184] mt-0.5">
              An architectural framework empowering direct collaboration between clients and independent fashion houses.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Pillar 1 */}
            <div className="border border-[#183B56] bg-[#F5EFEB] p-6 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-full border border-[#183B56] bg-white flex items-center justify-center text-[#183B56]">
                  <Scissors size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#183B56] uppercase tracking-wide">
                  1. 1-of-1 Bespoke Tailoring
                </h3>
                <p className="text-xs text-[#5A7184] leading-relaxed">
                  Collaborate directly with designers to draft custom eveningwear, tailored blazers, and artisanal streetwear crafted exclusively for you.
                </p>
              </div>
              <div className="text-[10px] font-mono font-bold text-[#183B56]/70 pt-2 border-t border-[#183B56]/20">
                ZERO MASS PRODUCTION
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="border border-[#183B56] bg-[#F5EFEB] p-6 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-full border border-[#183B56] bg-white flex items-center justify-center text-[#183B56]">
                  <Camera size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#183B56] uppercase tracking-wide">
                  2. Zyra Silhouette Integration
                </h3>
                <p className="text-xs text-[#5A7184] leading-relaxed">
                  Your morphology, undertone spectrum, and fit parameters sync directly to the couturier’s drafting board for seamless drape accuracy.
                </p>
              </div>
              <div className="text-[10px] font-mono font-bold text-[#183B56]/70 pt-2 border-t border-[#183B56]/20">
                PROPORTION HARMONY
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="border border-[#183B56] bg-[#F5EFEB] p-6 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-full border border-[#183B56] bg-white flex items-center justify-center text-[#183B56]">
                  <Layers size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#183B56] uppercase tracking-wide">
                  3. Verified Luxury Textiles
                </h3>
                <p className="text-xs text-[#5A7184] leading-relaxed">
                  Every garment utilizes documented high-grade materials—from Scottish tweed and Mulberry silk to natural-dyed raw linens and vegetable-tanned leathers.
                </p>
              </div>
              <div className="text-[10px] font-mono font-bold text-[#183B56]/70 pt-2 border-t border-[#183B56]/20">
                TRACEABLE SOURCING
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="border border-[#183B56] bg-[#F5EFEB] p-6 space-y-3 flex flex-col justify-between shadow-xs">
              <div className="space-y-2.5">
                <div className="w-9 h-9 rounded-full border border-[#183B56] bg-white flex items-center justify-center text-[#183B56]">
                  <Lock size={16} />
                </div>
                <h3 className="text-sm font-bold text-[#183B56] uppercase tracking-wide">
                  4. Milestone Escrow Protection
                </h3>
                <p className="text-xs text-[#5A7184] leading-relaxed">
                  Funds are held securely and released upon approved milestones: sketch signoff, fabric cutting, fitting verification, and doorstep delivery.
                </p>
              </div>
              <div className="text-[10px] font-mono font-bold text-[#183B56]/70 pt-2 border-t border-[#183B56]/20">
                SAFEGUARDED ATELIER
              </div>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. FEATURED ATELIER DESIGNERS & LOOKBOOKS
        ════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#183B56] pb-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#183B56] tracking-tight uppercase">
                Featured Atelier Couturiers
              </h2>
              <p className="text-xs text-[#5A7184] mt-0.5">
                Connect directly with verified independent master creators.
              </p>
            </div>
            <button
              onClick={() => router.push("/designers")}
              className="text-xs font-semibold text-[#183B56] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
            >
              <span>Explore All Creators</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {CURATED_ATELIER_DESIGNERS.map((d) => (
              <div
                key={d.designerId}
                className="border border-[#183B56] bg-[#F5EFEB] p-6 space-y-5 flex flex-col justify-between shadow-xs hover:bg-[#183B56]/[0.02] transition-colors"
              >
                <div className="space-y-4">
                  {/* Top Profile Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-14 h-14 rounded-full border border-[#183B56] bg-white overflow-hidden shrink-0">
                        <img
                          src={d.profileImageUrl}
                          alt={d.displayName}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-base text-[#183B56]">
                            {d.displayName}
                          </h3>
                          <ShieldCheck size={14} className="text-[#183B56]" />
                        </div>
                        <p className="text-xs text-[#5A7184] font-medium">
                          {d.brandName} • {d.location}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-[#183B56]">From {d.startingPrice}</div>
                      <div className="text-[10px] text-[#5A7184] font-semibold">★ {d.rating} ({d.commissionsCount})</div>
                    </div>
                  </div>

                  {/* Specialization & Bio */}
                  <div className="inline-block px-2.5 py-1 bg-white border border-[#183B56] text-[10px] font-bold uppercase tracking-wider text-[#183B56]">
                    {d.specialization}
                  </div>

                  <p className="text-xs text-[#5A7184] leading-relaxed line-clamp-2">
                    {d.bio}
                  </p>

                  {/* Lookbook Thumbnails */}
                  <div className="grid grid-cols-3 gap-2">
                    {d.lookbook.map((img, idx) => (
                      <div
                        key={idx}
                        className="aspect-[3/3.8] bg-[#DFE7ED] border border-[#183B56] overflow-hidden p-2"
                      >
                        <img
                          src={img}
                          alt="Lookbook"
                          className="w-full h-full object-contain mix-blend-multiply hover:scale-105 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-[#183B56] flex items-center justify-between gap-3">
                  <button
                    onClick={() => router.push(`/designs`)}
                    className="py-2.5 px-4 bg-transparent border border-[#183B56] text-[#183B56] hover:bg-[#183B56]/5 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1"
                  >
                    <span>View Lookbook</span>
                    <span>→</span>
                  </button>

                  <button
                    onClick={() => handleOpenCommission(d)}
                    className="py-2.5 px-5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <Scissors size={12} />
                    <span>Request Commission</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. HOW IT WORKS: STEP-BY-STEP BESPOKE COMMISSIONING
        ════════════════════════════════════════════════════════════ */}
        <section className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-10 shadow-xs space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#183B56] uppercase tracking-tight">
              How Bespoke Commissioning Works
            </h2>
            <p className="text-xs text-[#5A7184]">
              From digital concept to artisanal delivery in 4 transparent stages.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border border-[#183B56] bg-white p-5 space-y-2">
              <div className="text-xs font-bold text-[#183B56] font-mono">01 // STEP</div>
              <h4 className="text-sm font-bold text-[#183B56]">Submit Brief & Moodboard</h4>
              <p className="text-xs text-[#5A7184] leading-relaxed">
                Describe your desired piece, select silhouette preferences, or upload inspiration photos.
              </p>
            </div>

            <div className="border border-[#183B56] bg-white p-5 space-y-2">
              <div className="text-xs font-bold text-[#183B56] font-mono">02 // STEP</div>
              <h4 className="text-sm font-bold text-[#183B56]">Zyra Silhouette Scan</h4>
              <p className="text-xs text-[#5A7184] leading-relaxed">
                Your body measurements and undertones ensure the pattern is cut for your exact proportions.
              </p>
            </div>

            <div className="border border-[#183B56] bg-white p-5 space-y-2">
              <div className="text-xs font-bold text-[#183B56] font-mono">03 // STEP</div>
              <h4 className="text-sm font-bold text-[#183B56]">Patterning & Tailoring</h4>
              <p className="text-xs text-[#5A7184] leading-relaxed">
                Designer sources verified textiles and updates you with progress photos throughout the cut and sew.
              </p>
            </div>

            <div className="border border-[#183B56] bg-white p-5 space-y-2">
              <div className="text-xs font-bold text-[#183B56] font-mono">04 // STEP</div>
              <h4 className="text-sm font-bold text-[#183B56]">Doorstep Delivery</h4>
              <p className="text-xs text-[#5A7184] leading-relaxed">
                Your 1-of-1 bespoke garment arrives packaged in archival garment bags with a fit guarantee.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── INTERACTIVE COMMISSION REQUEST MODAL ── */}
      {isCommissionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#183B56]/50 backdrop-blur-xs">
          <div className="bg-[#F5EFEB] border border-[#183B56] w-full max-w-lg p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setIsCommissionModalOpen(false)}
              className="absolute top-4 right-4 text-[#183B56] hover:opacity-75 cursor-pointer border-none bg-transparent"
            >
              <X size={18} />
            </button>

            {commissionSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <CheckCircle2 size={36} className="text-[#2E7D32] mx-auto" />
                <h3 className="text-xl font-bold text-[#183B56]">Commission Inquiry Dispatched</h3>
                <p className="text-xs text-[#5A7184] max-w-sm mx-auto">
                  Your custom design brief has been sent to {selectedDesigner?.displayName || "the atelier"}. The designer will review your specifications and contact you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendCommission} className="space-y-4">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                    Atelier Commission Brief
                  </div>
                  <h3 className="text-xl font-bold text-[#183B56]">
                    Request Custom Piece {selectedDesigner ? `with ${selectedDesigner.displayName}` : ""}
                  </h3>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Garment Silhouette
                    </label>
                    <select
                      value={commissionForm.garmentType}
                      onChange={(e) => setCommissionForm({ ...commissionForm, garmentType: e.target.value })}
                      className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-bold text-[#183B56] outline-none"
                    >
                      <option value="Bespoke Suit">Bespoke 2-Piece / 3-Piece Suit</option>
                      <option value="Haute Couture Gown">Haute Couture Gown / Evening Dress</option>
                      <option value="Tailored Blazer">Tailored Single/Double Breasted Blazer</option>
                      <option value="Bespoke Shirt">Bespoke Oxford / Linen Shirt</option>
                      <option value="Artisanal Leather Outerwear">Artisanal Leather Jacket / Coat</option>
                      <option value="Contemporary Draped Silhouette">Contemporary Draped Silhouette</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Audience
                      </label>
                      <select
                        value={commissionForm.targetAudience}
                        onChange={(e) => setCommissionForm({ ...commissionForm, targetAudience: e.target.value })}
                        className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-bold text-[#183B56] outline-none"
                      >
                        <option value="Women">Women</option>
                        <option value="Men">Men</option>
                        <option value="Unisex">Unisex</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Estimated Budget
                      </label>
                      <select
                        value={commissionForm.budget}
                        onChange={(e) => setCommissionForm({ ...commissionForm, budget: e.target.value })}
                        className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-bold text-[#183B56] outline-none"
                      >
                        <option value="₹10,000 - ₹15,000">₹10,000 - ₹15,000</option>
                        <option value="₹15,000 - ₹25,000">₹15,000 - ₹25,000</option>
                        <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                        <option value="₹50,000+">₹50,000+ (High Couture)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Fabric & Drape Preferences
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Mulberry silk, Italian wool, Raw linen..."
                      value={commissionForm.preferredFabric}
                      onChange={(e) => setCommissionForm({ ...commissionForm, preferredFabric: e.target.value })}
                      className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Design Notes & Occasion
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe the occasion, color palette, or specific silhouette requirements..."
                      value={commissionForm.notes}
                      onChange={(e) => setCommissionForm({ ...commissionForm, notes: e.target.value })}
                      className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer flex items-center justify-center gap-2 transition-all shadow-xs"
                  >
                    <Send size={13} />
                    <span>Send Commission Brief to Atelier</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
