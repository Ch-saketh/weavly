"use client";

// src/modules/onboarding/pages/GuestOnboardingPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// WEAVLY GUEST ONBOARDING & ATELIER LANDING
// • Art-directed editorial fashion design language inspired by reference
// • Signature Lime Green, Sunny Yellow, Electric Blue & Crisp Ink color blocking
// • Asymmetrical organic geometry, circular badges, and vertical accent typography
// • Interactive Zyra AI agent with real-time responsive cursor eye-tracking
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Check 
} from "lucide-react";
import AuthModal from "@/modules/auth/components/AuthModal";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Footer from "@/shared/components/layout/Footer";

// High quality studio photography matching reference image
const MODEL_MEN = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"; // Smiling male model in white
const MODEL_WOMEN = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"; // Female model in white collared shirt
const MODEL_BLAZER = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80"; // Female in yellow blazer & sunglasses

const LOOK_1 = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80";
const LOOK_2 = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80";
const LOOK_3 = "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80";

function ZeraInteractiveEyesMascot() {
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let idleTimer = null;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setTargetPos({ x, y });

      setIsMoving(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsMoving(false);
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  useEffect(() => {
    let animationFrameId;
    let currentX = smoothPos.x;
    let currentY = smoothPos.y;

    const updatePosition = () => {
      currentX += (targetPos.x - currentX) * 0.35;
      currentY += (targetPos.y - currentY) * 0.35;
      setSmoothPos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetPos]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 360, height: 360 }}>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 380,
          height: 380,
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.18) 0%, transparent 70%)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      <img
        src="/zera_clean.svg?v=2"
        alt="Zyra AI"
        style={{ width: 360, height: 360, objectFit: "contain", position: "relative", zIndex: 2, userSelect: "none" }}
        draggable={false}
      />

      <div
        className="absolute z-10 flex flex-col items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
        style={{
          top: "48%",
          left: "52%",
          transform: `translate(calc(-50% + ${smoothPos.x * 20}px), calc(-50% + ${smoothPos.y * 20}px))`,
          willChange: "transform",
        }}
      >
        <div className="flex items-center gap-7 mb-1.5 opacity-90 transition-all duration-200">
          <div
            className="w-[22px] h-[3px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${-5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
          <div
            className="w-[22px] h-[3px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
        </div>

        <div className="relative flex items-center justify-center gap-5">
          <div className="w-[26px] h-[26px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[9px] h-[9px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[3.5px] h-[3.5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>

          <div className="w-[26px] h-[26px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[9px] h-[9px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[3.5px] h-[3.5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>
        </div>

        <div className="mt-2 opacity-95 transition-all duration-150">
          {isMoving ? (
            <svg width="22" height="11" viewBox="0 0 22 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="5.5" r="4" fill="#111827" />
            </svg>
          ) : (
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 4 2 Q 12 9 20 2" stroke="#111827" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GuestOnboardingPage({ onOpenAuth }) {
  const router = useRouter();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState("register");

  const triggerAuth = (view = "register") => {
    if (onOpenAuth) {
      onOpenAuth(view);
    } else {
      setAuthInitialView(view);
      setAuthModalOpen(true);
    }
  };

  const handleStartOnboarding = () => {
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[#A8E635] text-[#111827] font-sans selection:bg-black selection:text-white flex flex-col">

      {/* ─── MAIN ASYMMETRICAL LAYOUT CONTAINER WITH LEFT VERTICAL RAIL ─── */}
      <div className="flex flex-1 w-full min-h-screen">
        
        {/* ─── LEFT VERTICAL STRIP (Matching Reference Image) ─── */}
        <aside className="w-16 sm:w-20 md:w-24 bg-[#A8E635] border-r border-black/15 flex flex-col justify-between items-center py-6 select-none shrink-0 z-20">
          {/* Logo Badge Icon */}
          <div 
            onClick={() => triggerAuth("register")}
            className="w-11 h-11 rounded-full bg-black text-white flex items-center justify-center font-extrabold text-sm cursor-pointer shadow-sm hover:scale-105 transition-transform"
          >
            W
          </div>

          {/* Rotated Vertical Typography */}
          <div className="flex-1 flex items-center justify-center my-12">
            <span 
              className="text-xs sm:text-sm font-extrabold uppercase tracking-[0.3em] text-[#111827] whitespace-nowrap"
              style={{ transform: "rotate(-90deg)" }}
            >
              NEW FASHION TREND · 2026
            </span>
          </div>

          {/* Bottom Sparkle Indicator */}
          <div className="w-3 h-3 rounded-full bg-black/80 animate-ping" />
        </aside>

        {/* ─── RIGHT MAIN CANVAS (Two-Tone Green & Electric Blue Layout) ─── */}
        <div className="flex-1 flex flex-col min-w-0">

          {/* ── 1. TOP NAV ON GREEN BACKGROUND ── */}
          <header className="h-20 px-6 sm:px-12 flex items-center justify-between border-b border-black/10 bg-[#A8E635]">
            
            {/* Left: Instagram Handle */}
            <div className="flex items-center gap-3">
              <span className="text-xs sm:text-sm font-bold text-[#111827]">Instagram</span>
              <div className="w-8 h-[1.5px] bg-black/40" />
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24" className="text-[#111827] cursor-pointer">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </div>

            {/* Center: Clean Minimal Navigation */}
            <nav className="hidden md:flex items-center gap-8 text-xs sm:text-sm font-bold text-[#111827]">
              <a href="#discover" className="hover:opacity-75 transition-opacity no-underline text-inherit">Shop</a>
              <a href="#collections" className="hover:opacity-75 transition-opacity no-underline text-inherit">Collection</a>
              <a href="/creator-guide" className="hover:opacity-75 transition-opacity no-underline text-inherit">Atelier</a>
              <a href="#meet-zyra" className="hover:opacity-75 transition-opacity no-underline text-inherit">Zyra AI</a>
            </nav>

            {/* Right: Search, Cart & Auth Actions */}
            <div className="flex items-center gap-5">
              <button 
                onClick={() => triggerAuth("login")}
                className="hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-0 text-[#111827]"
              >
                <Search size={18} />
              </button>
              <button 
                onClick={() => triggerAuth("login")}
                className="hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-0 text-[#111827]"
              >
                <ShoppingBag size={18} />
              </button>
              <button
                onClick={() => triggerAuth("login")}
                className="hidden sm:inline-block bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-4 py-2 border-none cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </header>

          {/* ── 2. UPPER HERO CANVAS (Green Background) ── */}
          <section id="discover" className="bg-[#A8E635] px-6 sm:px-12 py-10 lg:py-16 relative">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
              
              {/* Left Column: Yellow Arch Circle with Male Model + Men Link */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-4">
                <div className="relative">
                  {/* Starburst Accent */}
                  <div className="absolute -top-4 -left-6 text-black text-2xl font-bold select-none">
                    ✺
                  </div>

                  {/* Yellow Arch Framing */}
                  <div className="w-56 sm:w-64 md:w-72 aspect-[3/4] bg-[#FFDE00] rounded-t-full overflow-hidden border-2 border-black/20 shadow-md relative group">
                    <img
                      src={MODEL_MEN}
                      alt="Men's Fashion Look"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>

                {/* Men's Action Link */}
                <button
                  onClick={handleStartOnboarding}
                  className="inline-flex items-center gap-2 text-xl font-bold text-[#111827] hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  <span>Men</span>
                  <ArrowRight size={20} />
                </button>
              </div>

              {/* Center Column: Massive Headline */}
              <div className="lg:col-span-4 text-center lg:text-left space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-extrabold uppercase tracking-tight text-[#111827] leading-[0.94]">
                  Discover<br />
                  the new<br />
                  comfort
                </h1>
                <p className="text-xs sm:text-sm text-black/75 font-medium max-w-xs leading-relaxed">
                  Weavly combines bespoke craftsmanship and 3D silhouette calibration for clothing that fits you effortlessly.
                </p>
              </div>

              {/* Right Column: Female Model in White Shirt + Women Link */}
              <div className="lg:col-span-4 flex flex-col items-center lg:items-end space-y-4">
                <div className="w-56 sm:w-64 md:w-72 aspect-[3/4] overflow-hidden relative group">
                  <img
                    src={MODEL_WOMEN}
                    alt="Women's Fashion Look"
                    className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-700"
                  />
                </div>

                {/* Women's Action Link */}
                <button
                  onClick={handleStartOnboarding}
                  className="inline-flex items-center gap-2 text-xl font-bold text-[#111827] hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  <span>Women</span>
                  <ArrowRight size={20} />
                </button>
              </div>

            </div>

            {/* Overlapping Central Rotating Badge */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-none">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white text-black border-2 border-black flex items-center justify-center shadow-xl">
                <div className="text-center font-mono text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest leading-tight">
                  ✦ FASHION ✦<br />
                  ATELIER<br />
                  WEAVLY
                </div>
              </div>
            </div>

          </section>

          {/* ── 3. BOTTOM HERO CANVAS (Electric Blue Background) ── */}
          <section className="bg-[#2563EB] text-white px-6 sm:px-12 py-16 lg:py-24 relative overflow-hidden">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-6xl mx-auto">
              
              {/* Left Column: Lime Green Circle Frame with Yellow Blazer Model */}
              <div className="lg:col-span-5 flex justify-center lg:justify-start">
                <div className="w-56 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 rounded-full bg-[#A8E635] p-2 overflow-hidden border-2 border-black/20 shadow-xl group">
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                      src={MODEL_BLAZER}
                      alt="Statement Fashion Silhouette"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: "Dress like you're already famous" + CTA */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <h2 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white leading-[1.02]">
                  Dress like you’re<br />
                  already famous
                </h2>
                <p className="text-sm sm:text-base text-blue-100 max-w-md font-medium leading-relaxed">
                  Start your 2-minute personal styling calibration and unlock bespoke creator commissions with guaranteed escrow fitting.
                </p>

                <div className="pt-2">
                  <button
                    onClick={handleStartOnboarding}
                    className="bg-black hover:bg-neutral-900 text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest px-8 py-4 border-none cursor-pointer shadow-lg transition-transform hover:scale-105"
                  >
                    BUILD MY STYLE
                  </button>
                </div>
              </div>

            </div>

          </section>

          {/* ── 4. MEET ZYRA AI SECTION (Interactive Mascot & 3D Intelligence) ── */}
          <section id="meet-zyra" className="bg-[#E5EAE5] px-6 sm:px-12 py-20 border-t border-black/15">
            <div className="max-w-6xl mx-auto bg-white border border-[#D2D8D2] p-8 sm:p-14 shadow-sm">
              
              <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                
                {/* Left: Interactive Blue Star Mascot with Eye Tracking */}
                <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 bg-[#A8E635] border border-black/10 w-full min-h-[420px] relative overflow-hidden shadow-inner">
                  <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1">
                    ZYRA 3D VECTOR AGENT
                  </span>
                  <ZeraInteractiveEyesMascot />
                  <div className="text-center mt-3 space-y-0.5">
                    <span className="text-xs font-bold uppercase text-[#111827]">
                      Real-Time Stylist Intelligence
                    </span>
                    <p className="text-[11px] text-black/70 font-medium">
                      Tracks your gaze and calibrates bespoke silhouettes.
                    </p>
                  </div>
                </div>

                {/* Right: AI Stylist Benefits */}
                <div className="lg:w-1/2 space-y-6">
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#4B5563] bg-[#E5EAE5] px-3 py-1 inline-block">
                      INTELLIGENT FASHION
                    </span>
                    <h3 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111827]">
                      Curates Outfits.<br />Not Disconnected Clothes.
                    </h3>
                    <p className="text-sm text-[#4B5563] font-medium leading-relaxed">
                      Zyra maps your proportions, favorite color palettes, and lifestyle priorities to assemble cohesive made-to-measure collections.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { title: "01. Silhouette Scan", desc: "Maps your height, size & drape preferences." },
                      { title: "02. Aesthetic Vectoring", desc: "Calibrates favorite fabrics & color palettes." },
                      { title: "03. Look Synthesis", desc: "Curates matching capsules from top couturiers." },
                      { title: "04. 100% Escrow Fit", desc: "Funds held securely until your piece arrives and fits." },
                    ].map((step, i) => (
                      <div key={i} className="p-3.5 bg-[#E5EAE5] border border-[#D2D8D2] space-y-1">
                        <span className="text-xs font-bold uppercase text-black block">{step.title}</span>
                        <p className="text-[11px] text-[#4B5563] font-medium">{step.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleStartOnboarding}
                      className="bg-black hover:bg-neutral-800 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-3"
                    >
                      <span>Start Free Calibration</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </section>

          {/* ── 5. CURATED ATELIER EDIT & 100% ESCROW PROTECTION ── */}
          <section id="collections" className="bg-[#E5EAE5] px-6 sm:px-12 py-16 border-t border-black/15">
            <div className="max-w-6xl mx-auto space-y-10">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D2D8D2] pb-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#4B5563]">
                    ATELIER CAPSULES
                  </span>
                  <h3 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#111827]">
                    Curated Style Drops
                  </h3>
                </div>
                <button
                  onClick={() => triggerAuth("register")}
                  className="bg-black text-white hover:bg-neutral-800 px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer border-none self-start sm:self-auto"
                >
                  Join Cohort
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: "Architectural Tailoring", image: LOOK_1, tag: "Haute Couture" },
                  { title: "Elevated Urban Street", image: LOOK_2, tag: "Streetwear" },
                  { title: "Sartorial Silk & Flannel", image: LOOK_3, tag: "Quiet Luxury" },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white border border-[#D2D8D2] p-4 space-y-3 shadow-xs">
                    <div className="aspect-[4/5] bg-[#E5EAE5] overflow-hidden relative group cursor-pointer" onClick={handleStartOnboarding}>
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-mono font-bold px-2 py-0.5 uppercase">
                        {item.tag}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold uppercase text-[#111827]">{item.title}</span>
                      <span className="text-xs font-bold text-black">🔒 Locked</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* 3 Escrow Protection Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                <div className="p-6 bg-white border border-[#D2D8D2] space-y-2">
                  <span className="text-[10px] font-mono font-bold bg-[#A8E635] text-black px-2 py-0.5 inline-block">
                    GUARANTEE 01
                  </span>
                  <h4 className="text-xs font-extrabold uppercase text-[#111827]">100% Escrow Vault</h4>
                  <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed">
                    Artisans receive funds only after you receive the garment and confirm fit.
                  </p>
                </div>

                <div className="p-6 bg-white border border-[#D2D8D2] space-y-2">
                  <span className="text-[10px] font-mono font-bold bg-[#A8E635] text-black px-2 py-0.5 inline-block">
                    GUARANTEE 02
                  </span>
                  <h4 className="text-xs font-extrabold uppercase text-[#111827]">Verified Couturiers</h4>
                  <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed">
                    Every designer is audited for fabric authenticity and stitch precision.
                  </p>
                </div>

                <div className="p-6 bg-white border border-[#D2D8D2] space-y-2">
                  <span className="text-[10px] font-mono font-bold bg-[#A8E635] text-black px-2 py-0.5 inline-block">
                    GUARANTEE 03
                  </span>
                  <h4 className="text-xs font-extrabold uppercase text-[#111827]">Zero Listing Fees</h4>
                  <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed">
                    Independent designers publish lookbooks freely without subscription gates.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* ── 6. FOOTER ── */}
          <Footer 
            requireAuth={true}
            onRequireAuth={() => triggerAuth("login")}
            onShopNow={() => triggerAuth("login")}
          />

        </div>

      </div>

      {/* Auth Modal */}
      {!onOpenAuth && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialView={authInitialView}
        />
      )}
    </div>
  );
}
