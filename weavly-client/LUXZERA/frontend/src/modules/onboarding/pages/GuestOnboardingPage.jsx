"use client";

// src/modules/onboarding/pages/GuestOnboardingPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// WEAVLY GUEST LANDING & ONBOARDING PORTAL
// • Apple-grade minimalist luxury design system & refined typography
// • Fluid glassmorphic navigation, generous whitespace & immaculate hierarchy
// • Interactive Zyra 3D Stylist mascot with real-time cursor tracking
// • Value-driven narrative: Bespoke Couture, 100% Escrow Fit, No Fast-Fashion Waste
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  ArrowUpRight,
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Layers, 
  Scissors, 
  Lock,
  ChevronRight,
  User,
  Sliders,
  Compass,
  Check
} from "lucide-react";
import AuthModal from "@/modules/auth/components/AuthModal";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Footer from "@/shared/components/layout/Footer";

// High-fidelity editorial imagery
const MODEL_MEN = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1000&q=85";
const MODEL_WOMEN = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000&q=85";
const MODEL_BLAZER = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=1000&q=85";
const FABRIC_DETAIL = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80";

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

  // Snappy responsive lerp loop (0.35 factor)
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
    <div className="relative flex items-center justify-center select-none" style={{ width: 340, height: 340 }}>
      {/* Ambient soft glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 380,
          height: 380,
          background: "radial-gradient(ellipse at center, rgba(24,59,86,0.06) 0%, transparent 70%)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      {/* Mascot Base Emblem */}
      <img
        src="/zera_clean.svg?v=2"
        alt="Zyra Stylist"
        style={{ width: 330, height: 330, objectFit: "contain", position: "relative", zIndex: 2, userSelect: "none" }}
        draggable={false}
      />

      {/* Fast & Responsive Face Container */}
      <div
        className="absolute z-10 flex flex-col items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
        style={{
          top: "48%",
          left: "52%",
          transform: `translate(calc(-50% + ${smoothPos.x * 20}px), calc(-50% + ${smoothPos.y * 20}px))`,
          willChange: "transform",
        }}
      >
        {/* Raised Happy Eyebrows */}
        <div className="flex items-center gap-7 mb-1.5 opacity-90 transition-all duration-200">
          <div
            className="w-[22px] h-[3px] bg-[#183B56] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${-5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
          <div
            className="w-[22px] h-[3px] bg-[#183B56] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
        </div>

        {/* Shiny Eyes */}
        <div className="relative flex items-center justify-center gap-5">
          <div className="w-[26px] h-[26px] rounded-full bg-[#183B56] relative shadow-md overflow-hidden">
            <div className="w-[9px] h-[9px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[3.5px] h-[3.5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>

          <div className="w-[26px] h-[26px] rounded-full bg-[#183B56] relative shadow-md overflow-hidden">
            <div className="w-[9px] h-[9px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[3.5px] h-[3.5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>
        </div>

        {/* Crisp Mouth */}
        <div className="mt-2 opacity-95 transition-all duration-150">
          {isMoving ? (
            <svg width="22" height="11" viewBox="0 0 22 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="5.5" r="4" fill="#183B56" />
            </svg>
          ) : (
            <svg width="24" height="11" viewBox="0 0 24 11" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 4 2 Q 12 9 20 2" stroke="#183B56" strokeWidth="2.4" strokeLinecap="round" fill="none" />
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
    <div className="min-h-screen bg-[#FBF9F6] text-[#183B56] font-sans antialiased selection:bg-[#183B56] selection:text-white flex flex-col">

      {/* ─── 1. APPLE-GRADE FROSTED GLASS NAVIGATION ─── */}
      <header className="sticky top-0 z-50 w-full bg-white/85 backdrop-blur-xl border-b border-[#183B56]/10 transition-all duration-200">
        <div className="max-w-7xl mx-auto h-20 px-6 sm:px-10 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div className="cursor-pointer" onClick={() => router.push("/")}>
            <WeavlyLogo />
          </div>

          {/* Center Apple-Style Pill Nav */}
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium tracking-wide text-[#5A7184]">
            <a href="#discover" className="hover:text-[#183B56] transition-colors no-underline text-inherit">Discover</a>
            <a href="#meet-zyra" className="hover:text-[#183B56] transition-colors no-underline text-inherit">Meet Zyra</a>
            <a href="#the-difference" className="hover:text-[#183B56] transition-colors no-underline text-inherit">The Difference</a>
            <a href="#escrow-guarantee" className="hover:text-[#183B56] transition-colors no-underline text-inherit">Escrow Guarantee</a>
            <a href="/creator-guide" className="hover:text-[#183B56] transition-colors no-underline text-inherit">For Ateliers</a>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => triggerAuth("login")}
              className="text-xs font-semibold text-[#183B56] px-4 py-2.5 rounded-full hover:bg-[#F5EFEB] transition-all cursor-pointer border border-transparent"
            >
              Sign In
            </button>
            <button
              onClick={handleStartOnboarding}
              className="bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-semibold px-5 py-2.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md active:scale-98 flex items-center gap-2"
            >
              <span>Build My Style</span>
              <ArrowRight size={13} />
            </button>
          </div>

        </div>
      </header>

      {/* ─── 2. HERO: APPLE-STYLE EDITORIAL SHOWCASE ─── */}
      <section id="discover" className="relative px-6 sm:px-10 lg:px-16 pt-12 pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        
        {/* Subtle background ambient gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-[#ECE5DC]/40 via-[#FBF9F6] to-transparent pointer-events-none -z-10 rounded-full blur-3xl opacity-70" />

        <div className="max-w-6xl mx-auto space-y-16">
          
          {/* Header Typography Group */}
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-white/90 border border-[#183B56]/15 rounded-full px-4 py-1.5 shadow-xs backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-[#183B56] animate-pulse" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-[#183B56]">
                BESPOKE ATELIER · 3D VIRTUAL STYLIST
              </span>
            </div>

            {/* Monumental Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-extrabold tracking-tight text-[#183B56] leading-[1.02]">
              Discover fashion<br />
              <span className="font-serif italic font-normal text-[#183B56]/90">tailored to your silhouette.</span>
            </h1>

            {/* Sub-paragraph */}
            <p className="text-base sm:text-lg text-[#5A7184] font-normal leading-relaxed max-w-2xl mx-auto">
              Weavly connects discerning patrons with independent couturiers worldwide. Zyra calibrates your personal 3D proportions for garments that fit impeccably.
            </p>

            {/* Main Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleStartOnboarding}
                className="w-full sm:w-auto bg-[#183B56] hover:bg-[#102A43] text-white text-sm font-semibold px-8 py-4 rounded-full transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg active:scale-98 flex items-center justify-center gap-2.5"
              >
                <span>Calibrate My Profile</span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => triggerAuth("register")}
                className="w-full sm:w-auto bg-white hover:bg-[#F5EFEB] text-[#183B56] text-sm font-semibold px-7 py-4 rounded-full border border-[#183B56]/20 transition-all cursor-pointer shadow-xs active:scale-98"
              >
                Join Atelier Cohort
              </button>
            </div>

          </div>

          {/* ─── DUAL EDITORIAL MUSE CARDS (MEN & WOMEN BESPOKE EDITS) ─── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 pt-4">
            
            {/* Left Card: Men's Sartorial Edit */}
            <div 
              onClick={handleStartOnboarding}
              className="group relative bg-white rounded-3xl overflow-hidden border border-[#183B56]/12 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-[#ECE5DC] relative">
                <img
                  src={MODEL_MEN}
                  alt="Men's Bespoke Edit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                
                {/* Top Glass Badge */}
                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md border border-white/40 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full text-[#183B56] shadow-xs">
                  Sartorial Tailoring
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Men's Atelier</h3>
                    <p className="text-xs text-white/80 font-medium mt-0.5">Heavyweight wools, relaxed linen &amp; structured blazers</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-[#183B56] flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card: Women's Haute Couture Edit */}
            <div 
              onClick={handleStartOnboarding}
              className="group relative bg-white rounded-3xl overflow-hidden border border-[#183B56]/12 shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer flex flex-col"
            >
              <div className="aspect-[4/5] sm:aspect-[3/4] overflow-hidden bg-[#ECE5DC] relative">
                <img
                  src={MODEL_WOMEN}
                  alt="Women's Couture Edit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
                
                {/* Top Glass Badge */}
                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md border border-white/40 text-[10px] font-semibold uppercase tracking-wider px-3 py-1.5 rounded-full text-[#183B56] shadow-xs">
                  Haute Couture
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">Women's Atelier</h3>
                    <p className="text-xs text-white/80 font-medium mt-0.5">Mulberry silks, draped evening wear &amp; clean-cut outerwear</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white text-[#183B56] flex items-center justify-center shadow-md group-hover:translate-x-1 transition-transform">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Trust Guarantees Bar */}
          <div className="pt-4 border-t border-[#183B56]/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { title: "3D Silhouette Scan", subtitle: "Zero clinical measuring tape" },
              { title: "100% Escrow Fit", subtitle: "72-hour confirmation window" },
              { title: "Direct Ateliers", subtitle: "Zero retail markup waste" },
              { title: "Capsule Synergy", subtitle: "Cohesive wardrobe matching" },
            ].map((stat, i) => (
              <div key={i} className="space-y-1">
                <p className="text-sm font-bold text-[#183B56] tracking-tight">{stat.title}</p>
                <p className="text-xs text-[#5A7184] font-medium">{stat.subtitle}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 3. MEET ZYRA: APPLE KEYNOTE STAGE ─── */}
      <section id="meet-zyra" className="bg-white py-24 lg:py-32 border-y border-[#183B56]/10 relative">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 space-y-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left: Clean White Stage Container for Zyra Mascot */}
            <div className="lg:col-span-6 bg-[#FBF9F6] border border-[#183B56]/10 rounded-3xl p-8 sm:p-12 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
              <div className="absolute top-6 left-6 inline-flex items-center gap-2 bg-white border border-[#183B56]/15 rounded-full px-3 py-1 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-[#183B56]">
                  LIVE GAZE TRACKING
                </span>
              </div>

              <div className="my-4">
                <ZeraInteractiveEyesMascot />
              </div>

              {/* Real-time Status Card */}
              <div className="w-full bg-white border border-[#183B56]/10 rounded-2xl p-4 shadow-xs flex items-center justify-between mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#183B56]/10 text-[#183B56] flex items-center justify-center font-bold text-xs">
                    ✦
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#183B56]">Zyra 3D Virtual Stylist</p>
                    <p className="text-[11px] text-[#5A7184]">Calibrates proportions &amp; color harmonies</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                  Active
                </span>
              </div>
            </div>

            {/* Right: Narrative Storytelling */}
            <div className="lg:col-span-6 space-y-8">
              
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#F5EFEB] rounded-full px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#183B56]">
                  WHAT IS ZYRA?
                </div>
                <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#183B56] leading-[1.08]">
                  Outfits with purpose.<br />
                  <span className="font-serif italic font-normal text-[#183B56]/90">Not disconnected items.</span>
                </h2>
                <p className="text-sm sm:text-base text-[#5A7184] font-normal leading-relaxed">
                  Traditional shopping pushes individual garments that clutter your closet. Zyra learns your exact shoulder width, drape preferences, and signature color palette to curate coordinated bespoke capsules.
                </p>
              </div>

              {/* 4 Value Pillars List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "Silhouette Mapping", desc: "Learns how you like garments to fall—from structured to relaxed." },
                  { title: "Palette Resonance", desc: "Harmonizes textures and shades with your natural undertone." },
                  { title: "Occasion Capsules", desc: "Assembles complete outfits for formal, work & weekend events." },
                  { title: "Escrow Guarantee", desc: "Protects your payment until your piece is verified in person." },
                ].map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-[#FBF9F6] border border-[#183B56]/8 space-y-1">
                    <p className="text-xs font-bold uppercase tracking-wide text-[#183B56]">{item.title}</p>
                    <p className="text-xs text-[#5A7184] leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartOnboarding}
                  className="bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-semibold px-8 py-3.5 rounded-full transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <span>Start Free Styling Calibration</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── 4. THE WEAVLY DIFFERENCE: APPLE BENTO GRID ─── */}
      <section id="the-difference" className="py-24 lg:py-32 px-6 sm:px-10 lg:px-16 max-w-7xl mx-auto space-y-16">
        
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5A7184] bg-white border border-[#183B56]/15 px-3.5 py-1 rounded-full shadow-2xs">
            THE WEAVLY PARADIGM
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#183B56]">
            Why Patrons Choose Weavly
          </h2>
          <p className="text-sm sm:text-base text-[#5A7184] font-normal leading-relaxed">
            We redesigned the fashion ecosystem to empower independent ateliers while giving patrons garments that fit effortlessly.
          </p>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: 100% Escrow Protection */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#183B56]/10 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#F5EFEB] text-[#183B56] flex items-center justify-center font-bold">
              <ShieldCheck size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-[#183B56]">100% Escrow Vault</h3>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed">
                Your payment is held safely in escrow. Couturiers receive funds only after your piece arrives and you confirm fit within a 72-hour window.
              </p>
            </div>
            <div className="pt-2 border-t border-[#183B56]/8 flex items-center text-xs font-semibold text-[#183B56]">
              <span>Zero financial risk</span>
            </div>
          </div>

          {/* Card 2: Direct Atelier Connection */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#183B56]/10 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#F5EFEB] text-[#183B56] flex items-center justify-center font-bold">
              <Scissors size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-[#183B56]">Direct Atelier Access</h3>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed">
                Commission custom pieces directly from master tailors and independent designers in Milan, Paris, Tokyo, and Mumbai without retail middleman markups.
              </p>
            </div>
            <div className="pt-2 border-t border-[#183B56]/8 flex items-center text-xs font-semibold text-[#183B56]">
              <span>Verified couturier network</span>
            </div>
          </div>

          {/* Card 3: Sustainable Made-To-Measure */}
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-[#183B56]/10 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-[#F5EFEB] text-[#183B56] flex items-center justify-center font-bold">
              <Layers size={24} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight text-[#183B56]">Zero Fast-Fashion Waste</h3>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed">
                Garments are crafted on-demand using premium natural textiles like raw linen, mulberry silk, and high-gauge wools designed to last for decades.
              </p>
            </div>
            <div className="pt-2 border-t border-[#183B56]/8 flex items-center text-xs font-semibold text-[#183B56]">
              <span>Authentic natural fibers</span>
            </div>
          </div>

        </div>

      </section>

      {/* ─── 5. ESCROW GUARANTEE: APPLE-STYLE 3-STAGE TIMELINE ─── */}
      <section id="escrow-guarantee" className="bg-[#ECE5DC]/40 py-24 lg:py-32 border-y border-[#183B56]/10">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 space-y-16">
          
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#5A7184] bg-white border border-[#183B56]/15 px-3.5 py-1 rounded-full shadow-2xs">
              GUARANTEED FIT PROTOCOL
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-[#183B56]">
              How Escrow Protects You
            </h2>
            <p className="text-sm sm:text-base text-[#5A7184] font-normal leading-relaxed">
              Every made-to-measure commission follows a transparent 3-stage escrow pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Vault Lock on Commission",
                desc: "When you place a custom order, payment is secured in Weavly Escrow Vaults. The couturier receives confirmation and begins tailoring."
              },
              {
                step: "02",
                title: "Atelier Casing & Delivery",
                desc: "Your bespoke piece is finished, quality-audited, and dispatched in luxury protective packaging with continuous tracking."
              },
              {
                step: "03",
                title: "72-Hour Fit Confirmation",
                desc: "Try on your garment at home. Once you confirm the fit satisfies your tolerances, funds are released to the designer."
              }
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-3xl p-8 border border-[#183B56]/10 shadow-xs space-y-4 relative flex flex-col justify-between">
                <span className="text-xs font-mono font-bold text-[#183B56] bg-[#ECE5DC] px-3 py-1 rounded-full self-start">
                  STAGE {item.step}
                </span>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-[#183B56] tracking-tight">{item.title}</h4>
                  <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-normal">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 6. GRAND FINALE: APPLE-TIER DARK CANVAS BANNER ─── */}
      <section className="bg-[#183B56] text-white py-24 lg:py-32 px-6 sm:px-10 relative overflow-hidden">
        
        {/* Subtle radial sheen */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 backdrop-blur-md">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-white/90">
              FOUNDING COHORT · BESPOKE ATELIER
            </span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Dress like you’re<br />
            <span className="font-serif italic font-normal text-white/90">already famous.</span>
          </h2>

          <p className="text-base sm:text-lg text-white/80 font-normal leading-relaxed max-w-xl mx-auto">
            Experience the future of made-to-measure fashion. Begin your 2-minute Zyra styling calibration today.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartOnboarding}
              className="w-full sm:w-auto bg-white hover:bg-[#F5EFEB] text-[#183B56] text-sm font-semibold px-9 py-4 rounded-full transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl active:scale-98 flex items-center justify-center gap-2"
            >
              <span>Build My Style Profile</span>
              <ArrowRight size={15} />
            </button>
            <button
              onClick={() => triggerAuth("login")}
              className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white text-sm font-semibold px-8 py-4 rounded-full border border-white/30 transition-all cursor-pointer active:scale-98"
            >
              Sign In
            </button>
          </div>

        </div>
      </section>

      {/* ─── 7. FOOTER ─── */}
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
