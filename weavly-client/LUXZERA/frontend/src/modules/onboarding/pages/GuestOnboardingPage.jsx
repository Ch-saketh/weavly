"use client";

// src/modules/onboarding/pages/GuestOnboardingPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// WEAVLY EDITORIAL ONBOARDING & ATELIER PORTAL
// • Authentic high-fashion magazine layout inspired by reference (URBEX design)
// • Asymmetrical split canvas: Warm Editorial Paper Left + Deep Obsidian Right
// • Monumental typography, behind-the-scenes studio photography, lookbook collage
// • Interactive Zyra 3D Stylist with live eye-tracking + 100% Escrow Fit Guarantee
// • Zero mentions of "AI" — pure bespoke luxury couture narrative
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  ArrowUpRight,
  ArrowLeft,
  Search, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Scissors, 
  Layers, 
  Lock,
  ChevronRight,
  User
} from "lucide-react";
import AuthModal from "@/modules/auth/components/AuthModal";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Footer from "@/shared/components/layout/Footer";

// High-resolution photography matching the reference aesthetic
const STUDIO_HERO = "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1400&q=85"; // Studio photoshoot in progress
const ATELIER_SEWING = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80"; // Artisan workshop table

// Left Grid: 8 Editorial Lookbook Cards (Row 1 & 2)
const LOOKBOOK_ROW1 = [
  { id: "look-1", title: "ELEGANT SILK DRESS", code: "BESPOKE · COMMISSION", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80" },
  { id: "look-2", title: "SLEEK SERENITY LINEN", code: "MADE-TO-MEASURE", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80" },
  { id: "look-3", title: "LUXURY CASHMERE OVERCOAT", code: "ATELIER EDITION", img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=600&q=80" },
  { id: "look-4", title: "SHEARLING AVIATOR COAT", code: "LIMITED DROP", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80" },
];

const LOOKBOOK_ROW2 = [
  { id: "look-5", title: "MICRO CHECKERED SHIRT", code: "SARTORIAL FIT", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&q=80" },
  { id: "look-6", title: "PINSTRIPE SUIT ENSEMBLE", code: "HAND-TAILORED", img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" },
  { id: "look-7", title: "PREMIUM ORGANIC COTTON", code: "STUDIO CAPSULE", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&q=80" },
  { id: "look-8", title: "CHAMBRAY SARTORIAL SHIRT", code: "BESPOKE DRAPE", img: "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=600&q=80" },
];

// Right Column: Capsule swatches
const SUMMER_SWATCHES = [
  { title: "TROPICAL DRESS", img: "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=400&q=80" },
  { title: "MONOCHROME LINEN", img: "https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400&q=80" },
  { title: "NAUTICAL SHIRT", img: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80" },
  { title: "PLEATED SCARF", img: "https://images.unsplash.com/photo-1520975954732-35dd22299614?w=400&q=80" },
];

// Right Column: Minimalist Sub-Cards
const MINIMALIST_CARDS = [
  { title: "MONOCHROME OAT SUIT", img: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&q=80" },
  { title: "CORDUROY BROWN SET", img: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&q=80" },
  { title: "CASUAL BLEND PANTS", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80" },
  { title: "MODERN SUIT ENSEMBLE", img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80" },
];

// Right Column: Streetwear Sub-Cards
const STREETWEAR_CARDS = [
  { title: "HEAVYWEIGHT FLEECE", img: "https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?w=400&q=80" },
  { title: "STUDIO TRENCH", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80" },
  { title: "OVERSIZED DENIM", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80" },
  { title: "TECHNICAL VEST", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80" },
];

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
    <div className="relative flex items-center justify-center select-none" style={{ width: 280, height: 280 }}>
      {/* Mascot Base Emblem */}
      <img
        src="/zera_clean.svg?v=2"
        alt="Zyra Stylist"
        style={{ width: 270, height: 270, objectFit: "contain", position: "relative", zIndex: 2, userSelect: "none" }}
        draggable={false}
      />

      {/* Responsive Eyes & Mouth Container */}
      <div
        className="absolute z-10 flex flex-col items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
        style={{
          top: "48%",
          left: "52%",
          transform: `translate(calc(-50% + ${smoothPos.x * 16}px), calc(-50% + ${smoothPos.y * 16}px))`,
          willChange: "transform",
        }}
      >
        {/* Eyebrows */}
        <div className="flex items-center gap-6 mb-1 opacity-90 transition-all duration-200">
          <div
            className="w-[18px] h-[2.5px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${-5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
          <div
            className="w-[18px] h-[2.5px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
        </div>

        {/* Pupils */}
        <div className="relative flex items-center justify-center gap-4">
          <div className="w-[22px] h-[22px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[7px] h-[7px] rounded-full bg-white absolute top-0.5 left-0.5 shadow-sm" />
            <div className="w-[3px] h-[3px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>

          <div className="w-[22px] h-[22px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[7px] h-[7px] rounded-full bg-white absolute top-0.5 left-0.5 shadow-sm" />
            <div className="w-[3px] h-[3px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>
        </div>

        {/* Mouth */}
        <div className="mt-1.5 opacity-95 transition-all duration-150">
          {isMoving ? (
            <svg width="18" height="9" viewBox="0 0 18 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="9" cy="4.5" r="3.5" fill="#111827" />
            </svg>
          ) : (
            <svg width="20" height="9" viewBox="0 0 20 9" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 3 2 Q 10 7 17 2" stroke="#111827" strokeWidth="2.2" strokeLinecap="round" fill="none" />
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
    <div className="min-h-screen bg-[#F0ECE1] text-[#111827] font-sans antialiased selection:bg-black selection:text-white flex flex-col">

      {/* ─── 1. TOP EDITORIAL NAVIGATION HEADER (Exact Reference Bar) ─── */}
      <header className="w-full bg-[#E5E0D4] border-b border-black/15 sticky top-0 z-50">
        <div className="w-full px-6 sm:px-10 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-6 cursor-pointer" onClick={() => router.push("/")}>
            <span className="font-extrabold text-xl tracking-tighter uppercase font-mono text-black">
              WEAVLY
            </span>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-extrabold uppercase tracking-[0.2em] text-[#111827]">
            <a href="#discover" className="hover:opacity-60 transition-opacity no-underline text-inherit">Shop</a>
            <a href="#discover" className="hover:opacity-60 transition-opacity no-underline text-inherit">Discover</a>
            <a href="#atelier-manifesto" className="hover:opacity-60 transition-opacity no-underline text-inherit">Journal</a>
            <a href="#meet-zyra" className="hover:opacity-60 transition-opacity no-underline text-inherit">Zyra Stylist</a>
            <a href="/creator-guide" className="hover:opacity-60 transition-opacity no-underline text-inherit">About</a>
          </nav>

          {/* Right Action Icons & Register Button */}
          <div className="flex items-center gap-5">
            <button 
              onClick={() => triggerAuth("login")}
              className="hover:opacity-60 transition-opacity bg-transparent border-none cursor-pointer p-0 text-[#111827]"
              title="Search"
            >
              <Search size={16} />
            </button>
            <button 
              onClick={() => triggerAuth("login")}
              className="hover:opacity-60 transition-opacity bg-transparent border-none cursor-pointer p-0 text-[#111827]"
              title="Bag"
            >
              <ShoppingBag size={16} />
            </button>
            <button
              onClick={handleStartOnboarding}
              className="bg-black hover:bg-neutral-800 text-white text-[10px] font-extrabold uppercase tracking-[0.2em] px-5 py-2.5 border-none cursor-pointer transition-colors shadow-xs"
            >
              REGISTER
            </button>
          </div>

        </div>
      </header>

      {/* ─── 2. MAIN ASYMMETRICAL SPLIT CONTAINER (Exact Reference Structure) ─── */}
      <main className="w-full grid grid-cols-1 lg:grid-cols-12 flex-1">
        
        {/* ═══════════════════════════════════════════════════════════════════
            LEFT MAJOR COLUMN: WARM EDITORIAL CANVAS (7 Cols on Desktop)
            ═══════════════════════════════════════════════════════════════════ */}
        <div className="lg:col-span-7 bg-[#F0ECE1] border-r border-black/15 flex flex-col">
          
          {/* Top Behind-The-Scenes Studio Photoshoot */}
          <div className="w-full aspect-[16/10] sm:aspect-[16/9] bg-[#E0DAD0] overflow-hidden relative border-b border-black/15 group">
            <img
              src={STUDIO_HERO}
              alt="Weavly Couture Photoshoot Studio"
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            />
            <div className="absolute top-4 left-4 bg-black text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1">
              STUDIO 01 · LIVE TAILORING
            </div>
          </div>

          {/* Monumental Headline: WEAVLY ← (Exact Typography from Reference) */}
          <div className="px-6 sm:px-10 py-10 border-b border-black/15 space-y-3 bg-[#F0ECE1]">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#111827]">
              <span>WE CREATE LANGUAGES FOR YOU</span>
              <span>EST. 2026</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <h1 className="text-6xl sm:text-8xl md:text-[108px] font-extrabold uppercase tracking-tighter text-black leading-none">
                WEAVLY
              </h1>
              <div className="text-5xl sm:text-7xl md:text-[96px] font-extrabold text-black select-none cursor-pointer hover:translate-x-2 transition-transform" onClick={handleStartOnboarding}>
                ←
              </div>
            </div>
          </div>

          {/* 8-Card High-Fashion Lookbook Collage (2 Rows of 4 Cards) */}
          <div className="p-6 sm:p-8 space-y-6 flex-1">
            
            {/* Row 1: 4 Editorial Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {LOOKBOOK_ROW1.map((item) => (
                <div 
                  key={item.id}
                  onClick={handleStartOnboarding}
                  className="space-y-2 cursor-pointer group"
                >
                  <div className="aspect-[3/4] bg-[#E0DAD0] overflow-hidden relative">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-tight text-black leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[9px] font-mono text-[#5A7184] font-semibold uppercase">
                      {item.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Row 2: 4 Sartorial Menswear & Tailoring Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
              {LOOKBOOK_ROW2.map((item) => (
                <div 
                  key={item.id}
                  onClick={handleStartOnboarding}
                  className="space-y-2 cursor-pointer group"
                >
                  <div className="aspect-[3/4] bg-[#E0DAD0] overflow-hidden relative">
                    <img 
                      src={item.img} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[10px] font-bold uppercase tracking-tight text-black leading-tight">
                      {item.title}
                    </p>
                    <p className="text-[9px] font-mono text-[#5A7184] font-semibold uppercase">
                      {item.code}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Left Column Bottom Banner */}
          <div className="p-6 sm:px-10 border-t border-black/15 bg-[#E5E0D4] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5 text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-black block">
                3D Silhouette Calibration
              </span>
              <p className="text-[11px] text-[#5A7184] font-medium">
                Personalized fit without measuring tapes or clinical numbers.
              </p>
            </div>
            <button
              onClick={handleStartOnboarding}
              className="bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-6 py-3 border-none cursor-pointer whitespace-nowrap shadow-xs"
            >
              Build My Style Profile →
            </button>
          </div>

        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            RIGHT COLUMN: OBSIDIAN ATELIER PANE (5 Cols on Desktop)
            ═══════════════════════════════════════════════════════════════════ */}
        <div id="atelier-manifesto" className="lg:col-span-5 bg-[#111827] text-white p-6 sm:p-10 space-y-12 flex flex-col justify-between">
          
          {/* Top Manifesto Headline & Workshop Photo */}
          <div className="space-y-6">
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-white leading-snug">
              WEAVLY IS MORE THAN FASHION, IT’S A BESPOKE LIFESTYLE EMBODYING 3D SILHOUETTE HARMONY AND SELF-EXPRESSION. WITH PIECES CRAFTED BY INDEPENDENT COUTURIERS.
            </h2>

            {/* Atelier Workshop Table Image */}
            <div className="aspect-[16/9] bg-neutral-800 overflow-hidden relative border border-white/15">
              <img
                src={ATELIER_SEWING}
                alt="Artisans tailoring at Weavly Atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 text-[8px] font-mono text-white/90 uppercase tracking-widest">
                VERIFIED INDEPENDENT COUTURIERS
              </div>
            </div>

            <p className="text-xs text-white/75 font-normal leading-relaxed">
              We create bespoke garments that empower diverse bodies and eliminate fast-fashion waste. Weavly garments are crafted on-demand from pure mulberry silk, organic linens, and heavy wools.
            </p>
          </div>

          {/* Section: SUMMER COLLECTION CAPSULES */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
              SUMMER ATELIER CAPSULES
            </h3>

            {/* 4 Swatch Columns */}
            <div className="grid grid-cols-4 gap-2.5">
              {SUMMER_SWATCHES.map((sw, i) => (
                <div key={i} className="space-y-1.5 cursor-pointer group" onClick={handleStartOnboarding}>
                  <div className="aspect-[3/4] bg-neutral-800 overflow-hidden border border-white/10">
                    <img src={sw.img} alt={sw.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-[8px] font-mono font-bold text-white/80 uppercase truncate">
                    {sw.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: MINIMALIST ELEGANCE SPOTLIGHT */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
                MINIMALIST ELEGANCE
              </h3>
              <div 
                onClick={handleStartOnboarding}
                className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              >
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {MINIMALIST_CARDS.map((card, i) => (
                <div key={i} className="space-y-1.5 cursor-pointer group" onClick={handleStartOnboarding}>
                  <div className="aspect-[3/4] bg-neutral-800 overflow-hidden border border-white/10">
                    <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-[8px] font-mono font-bold text-white/80 uppercase truncate">
                    {card.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: URBAN STREETWEAR SPOTLIGHT */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold uppercase tracking-widest text-white">
                URBAN STREETWEAR
              </h3>
              <div 
                onClick={handleStartOnboarding}
                className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
              >
                <ArrowUpRight size={14} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5">
              {STREETWEAR_CARDS.map((card, i) => (
                <div key={i} className="space-y-1.5 cursor-pointer group" onClick={handleStartOnboarding}>
                  <div className="aspect-[3/4] bg-neutral-800 overflow-hidden border border-white/10">
                    <img src={card.img} alt={card.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>
                  <p className="text-[8px] font-mono font-bold text-white/80 uppercase truncate">
                    {card.title}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: ZYRA 3D VIRTUAL STYLIST STAGE (Pure White Box for Clean Display) */}
          <div id="meet-zyra" className="bg-white text-black p-6 space-y-4 border border-white/20">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#5A7184]">
                  3D VIRTUAL STYLIST
                </span>
                <h4 className="text-sm font-extrabold uppercase tracking-tight text-black">
                  MEET ZYRA
                </h4>
              </div>
              <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 uppercase">
                LIVE GAZE TRACKING
              </span>
            </div>

            {/* Mascot Centered */}
            <div className="flex items-center justify-center py-2">
              <ZeraInteractiveEyesMascot />
            </div>

            <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed">
              Zyra maps your proportions, favorite color palettes, and lifestyle priorities to assemble cohesive made-to-measure collections.
            </p>

            <button
              onClick={handleStartOnboarding}
              className="w-full bg-black hover:bg-neutral-800 text-white py-3 text-xs font-bold uppercase tracking-widest cursor-pointer transition-colors"
            >
              Start Free Calibration →
            </button>
          </div>

          {/* Section: 100% ESCROW FIT GUARANTEE */}
          <div className="p-6 bg-neutral-900 border border-white/15 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-400" />
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-white">
                100% Escrow Fit Guarantee
              </h4>
            </div>
            <p className="text-[11px] text-white/70 leading-relaxed font-normal">
              When you commission a piece, funds are safely secured in Weavly Escrow Vaults. Artisans receive funds only after you receive the garment and confirm fit within 72 hours.
            </p>
          </div>

        </div>

      </main>

      {/* ─── 3. FOOTER ─── */}
      <Footer 
        requireAuth={true}
        onRequireAuth={() => triggerAuth("login")}
        onShopNow={() => triggerAuth("login")}
      />

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
