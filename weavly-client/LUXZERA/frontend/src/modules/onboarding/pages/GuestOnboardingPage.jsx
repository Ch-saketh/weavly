"use client";

// src/modules/onboarding/pages/GuestOnboardingPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// WEAVLY GUEST ONBOARDING & ATELIER LANDING PAGE
// • Signature Warm Stone (#F5EFEB) & Architectural Navy (#183B56) Theme
// • Art-directed editorial fashion composition inspired by reference
// • Zero sidebar clutter · Authentic Weavly branding & typography
// • Pure white background for Zyra mascot container with real-time eye tracking
// • Value-driven patron storytelling: What is Weavly, What is Zyra, 100% Escrow Fit
// ──────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Search, 
  ShoppingBag, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Layers, 
  Scissors, 
  Lock,
  ChevronRight,
  User
} from "lucide-react";
import AuthModal from "@/modules/auth/components/AuthModal";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Footer from "@/shared/components/layout/Footer";

// High quality studio photography matching reference aesthetic
const MODEL_MEN = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"; // Handsome portrait male
const MODEL_WOMEN = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"; // Female model in white collared shirt
const MODEL_BLAZER = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80"; // Female in tailored blazer & sunglasses

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
      {/* Subtle ambient glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 360,
          height: 360,
          background: "radial-gradient(ellipse at center, rgba(24,59,86,0.08) 0%, transparent 70%)",
          filter: "blur(24px)",
          pointerEvents: "none",
        }}
      />

      {/* Mascot Base Emblem */}
      <img
        src="/zera_clean.svg?v=2"
        alt="Zyra AI"
        style={{ width: 340, height: 340, objectFit: "contain", position: "relative", zIndex: 2, userSelect: "none" }}
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
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white flex flex-col">

      {/* ─── 1. TOP ARCHITECTURAL HEADER ─── */}
      <header className="w-full h-20 px-6 sm:px-12 md:px-16 border-b border-[#183B56]/15 bg-white sticky top-0 z-50 flex items-center justify-between shadow-2xs">
        <WeavlyLogo />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.15em] text-[#5A7184]">
          <a href="#discover" className="hover:text-[#183B56] transition-colors no-underline text-inherit">Discover</a>
          <a href="#meet-zyra" className="hover:text-[#183B56] transition-colors no-underline text-inherit">Meet Zyra</a>
          <a href="#why-weavly" className="hover:text-[#183B56] transition-colors no-underline text-inherit">Why Weavly</a>
          <a href="#escrow-vault" className="hover:text-[#183B56] transition-colors no-underline text-inherit">Escrow Guarantee</a>
          <a href="/creator-guide" className="hover:text-[#183B56] transition-colors no-underline text-inherit">For Creators</a>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => triggerAuth("login")}
            className="bg-[#F5EFEB] text-[#183B56] px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white active:scale-95 transition-all cursor-pointer border border-[#183B56]/20"
          >
            Sign In
          </button>
          <button
            onClick={handleStartOnboarding}
            className="bg-[#183B56] text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#102A43] active:scale-95 transition-all cursor-pointer border border-[#183B56] shadow-xs"
          >
            Build My Style
          </button>
        </div>
      </header>

      {/* ─── 2. UPPER HERO CANVAS (Warm Stone #F5EFEB) ─── */}
      <section id="discover" className="bg-[#F5EFEB] px-6 sm:px-12 md:px-16 py-12 lg:py-20 border-b border-[#183B56]/15 relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Architectural Arch with Men's Model */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-start space-y-4">
            <div className="relative">
              {/* Starburst Icon */}
              <div className="absolute -top-3 -left-5 text-[#183B56] text-2xl font-bold select-none opacity-80">
                ✺
              </div>

              {/* Arch Frame with Soft Slate Backdrop */}
              <div className="w-56 sm:w-64 md:w-72 aspect-[3/4] bg-[#DFE7ED] rounded-t-full overflow-hidden border border-[#183B56]/20 shadow-sm relative group cursor-pointer" onClick={handleStartOnboarding}>
                <img
                  src={MODEL_MEN}
                  alt="Sartorial Men's Look"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-3 left-3 bg-white/95 border border-[#183B56]/20 text-[9px] font-mono font-bold uppercase px-2.5 py-1 text-[#183B56]">
                  MEN · BESPOKE
                </div>
              </div>
            </div>

            <button
              onClick={handleStartOnboarding}
              className="inline-flex items-center gap-2 text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#183B56] hover:text-[#102A43] cursor-pointer bg-transparent border-none p-0"
            >
              <span>Explore Men's Edit</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Center Column: Grand Headline & Value Story */}
          <div className="lg:col-span-4 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 bg-white border border-[#183B56]/20 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#183B56] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#183B56] animate-pulse" />
              <span>AI 3D STYLIST &amp; BESPOKE ATELIER</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-extrabold uppercase tracking-tight text-[#183B56] leading-[0.92]">
              DISCOVER<br />
              THE NEW<br />
              COMFORT
            </h1>

            <p className="text-sm sm:text-base text-[#5A7184] font-medium leading-relaxed max-w-sm">
              Weavly connects patrons directly with independent couturiers—crafting made-to-measure garments tailored to your exact 3D silhouette.
            </p>

            <div className="pt-2">
              <button
                onClick={handleStartOnboarding}
                className="bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider px-8 py-4 border border-[#183B56] transition-all cursor-pointer shadow-sm flex items-center gap-3 mx-auto lg:mx-0"
              >
                <span>Calibrate My Profile</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Right Column: Female Model in Tailored White Shirt */}
          <div className="lg:col-span-4 flex flex-col items-center lg:items-end space-y-4">
            <div className="w-56 sm:w-64 md:w-72 aspect-[3/4] bg-[#DFE7ED] rounded-lg overflow-hidden border border-[#183B56]/20 shadow-sm relative group cursor-pointer" onClick={handleStartOnboarding}>
              <img
                src={MODEL_WOMEN}
                alt="Women's Sartorial Look"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-3 right-3 bg-white/95 border border-[#183B56]/20 text-[9px] font-mono font-bold uppercase px-2.5 py-1 text-[#183B56]">
                WOMEN · ATELIER
              </div>
            </div>

            <button
              onClick={handleStartOnboarding}
              className="inline-flex items-center gap-2 text-base sm:text-lg font-extrabold uppercase tracking-tight text-[#183B56] hover:text-[#102A43] cursor-pointer bg-transparent border-none p-0"
            >
              <span>Explore Women's Edit</span>
              <ArrowRight size={18} />
            </button>
          </div>

        </div>

        {/* Overlapping Central Emblem Badge */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-30 pointer-events-none">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white text-[#183B56] border-2 border-[#183B56] flex items-center justify-center shadow-md">
            <div className="text-center font-mono text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest leading-tight">
              ✦ WEAVLY ✦<br />
              ATELIER<br />
              ZYRA AI
            </div>
          </div>
        </div>
      </section>

      {/* ─── 3. LOWER HERO CANVAS (Architectural Navy #183B56) ─── */}
      <section className="bg-[#183B56] text-white px-6 sm:px-12 md:px-16 py-16 lg:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left: Circular Model Framing in Soft Slate */}
          <div className="lg:col-span-5 flex justify-center lg:justify-start">
            <div className="w-56 sm:w-64 md:w-72 h-56 sm:h-64 md:h-72 rounded-full bg-[#DFE7ED] p-2 overflow-hidden border-2 border-white/20 shadow-xl group cursor-pointer" onClick={handleStartOnboarding}>
              <div className="w-full h-full rounded-full overflow-hidden">
                <img
                  src={MODEL_BLAZER}
                  alt="Statement Bespoke Blazer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          {/* Right: "Dress like you're already famous" + Value Prop */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h2 className="text-4xl sm:text-6xl lg:text-[68px] font-extrabold tracking-tight text-white leading-[1.02] uppercase">
              Dress like you’re<br />
              already famous.
            </h2>
            <p className="text-sm sm:text-base text-[#DFE7ED] max-w-lg font-medium leading-relaxed">
              Skip generic fast fashion. Zyra AI indexes your exact measurements, favorite fabrics, and aesthetic palette so every piece feels like bespoke haute couture.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4">
              <button
                onClick={handleStartOnboarding}
                className="bg-white hover:bg-[#F5EFEB] text-[#183B56] text-xs sm:text-sm font-extrabold uppercase tracking-widest px-8 py-4 border-none cursor-pointer shadow-md transition-transform hover:scale-105"
              >
                BUILD MY STYLE NOW
              </button>
              <button
                onClick={() => triggerAuth("register")}
                className="bg-transparent hover:bg-white/10 text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest px-8 py-4 border border-white/40 cursor-pointer transition-colors"
              >
                Join Atelier Cohort
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 4. MEET ZYRA AI (Pure White Box Container with Interactive Mascot) ─── */}
      <section id="meet-zyra" className="bg-[#F5EFEB] px-6 sm:px-12 md:px-16 py-20 border-b border-[#183B56]/15">
        <div className="max-w-6xl mx-auto bg-white border border-[#183B56]/15 p-8 sm:p-14 shadow-xs">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Column: Pure White Box Container for SVG Mascot (No Color Leaks) */}
            <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 bg-white border border-[#183B56]/10 w-full min-h-[400px] relative overflow-hidden shadow-2xs">
              <span className="absolute top-4 left-4 bg-[#183B56] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-3 py-1">
                ZYRA 3D VECTOR AGENT
              </span>
              <ZeraInteractiveEyesMascot />
              <div className="text-center mt-3 space-y-0.5">
                <span className="text-xs font-bold uppercase text-[#183B56]">
                  Real-Time Stylist Intelligence
                </span>
                <p className="text-[11px] text-[#5A7184] font-medium">
                  Follows your gaze and calibrates bespoke 3D silhouettes.
                </p>
              </div>
            </div>

            {/* Right Column: Intelligent Fashion Narrative */}
            <div className="lg:w-1/2 space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#F5EFEB] border border-[#183B56]/15 px-3 py-1 inline-block">
                  WHAT IS ZYRA AI?
                </span>
                <h3 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#183B56]">
                  Curates Outfits.<br />Not Disconnected Clothes.
                </h3>
                <p className="text-sm text-[#5A7184] font-medium leading-relaxed">
                  Unlike traditional ecommerce that floods you with random products, Zyra analyzes your proportions, palette preferences, and lifestyle goals to assemble complete, wearable collections.
                </p>
              </div>

              {/* 4 Calibration Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "01. Silhouette Scan", desc: "Maps height, body type, and drape tolerances in under 2 minutes." },
                  { title: "02. Aesthetic Vectoring", desc: "Learns favorite color palettes, natural fibers, and wardrobe goals." },
                  { title: "03. Look Synthesis", desc: "Assembles coordinated capsules from verified couture ateliers." },
                  { title: "04. 100% Escrow Fit", desc: "Guarantees full satisfaction before funds are released to artisans." },
                ].map((step, i) => (
                  <div key={i} className="p-4 bg-[#F5EFEB] border border-[#183B56]/10 space-y-1">
                    <span className="text-xs font-bold uppercase text-[#183B56] block">{step.title}</span>
                    <p className="text-[11px] text-[#5A7184] font-medium leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={handleStartOnboarding}
                  className="bg-[#183B56] hover:bg-[#102A43] text-white px-8 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-3"
                >
                  <span>Start Free Calibration</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. WHY WEAVLY IS DIFFERENT (The 4 Core Value Pillars) ─── */}
      <section id="why-weavly" className="bg-white px-6 sm:px-12 md:px-16 py-20 border-b border-[#183B56]/15">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#F5EFEB] border border-[#183B56]/15 px-3 py-1 inline-block">
              THE WEAVLY ADVANTAGE
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#183B56]">
              Why Patrons Choose Weavly
            </h2>
            <p className="text-sm text-[#5A7184] font-medium leading-relaxed">
              We eliminated the frustrations of retail markups, ill-fitting clothes, and closet clutter by reinventing the fashion model.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                num: "01",
                title: "Personal Style Identity",
                desc: "Never browse endless generic stores again. Weavly calibrates recommendations based on what genuinely flatters you."
              },
              {
                num: "02",
                title: "Direct Designer Access",
                desc: "Connect directly with independent couture ateliers worldwide. Receive limited drops and bespoke commissions."
              },
              {
                num: "03",
                title: "100% Escrow Protection",
                desc: "Zero financial risk. Your payment stays locked in escrow vaults until your piece arrives and you confirm fit."
              },
              {
                num: "04",
                title: "Zero Fast-Fashion Waste",
                desc: "Every garment is made-to-measure or crafted in small limited-edition runs using authentic natural fibers."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-[#F5EFEB] border border-[#183B56]/15 flex flex-col justify-between min-h-[220px] shadow-2xs space-y-4">
                <span className="text-xs font-mono font-bold text-[#183B56] bg-white border border-[#183B56]/15 px-2.5 py-1 self-start">
                  PILLAR {item.num}
                </span>
                <div className="space-y-2">
                  <h4 className="text-base font-bold uppercase tracking-tight text-[#183B56]">{item.title}</h4>
                  <p className="text-xs text-[#5A7184] font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 6. 100% ESCROW FIT GUARANTEE (Patron & Creator Protection) ─── */}
      <section id="escrow-vault" className="bg-[#F5EFEB] px-6 sm:px-12 md:px-16 py-20 border-b border-[#183B56]/15">
        <div className="max-w-6xl mx-auto space-y-12">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-[#183B56]/15 pb-8">
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5A7184]">
                DUAL PATRON &amp; ATELIER SECURITY
              </span>
              <h3 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-tight text-[#183B56]">
                100% Escrow Fit Guarantee
              </h3>
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-[#183B56]/20 px-4 py-2 text-xs font-bold text-[#183B56]">
              <ShieldCheck size={16} />
              <span>72-Hour Fit Audit Window</span>
            </div>
          </div>

          {/* 3 Phases of Escrow Protection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { phase: "PHASE 01", title: "Commission & Vault Lock", desc: "When you commission a piece, funds are safely secured in Weavly Escrow Vaults. Artisans begin crafting." },
              { phase: "PHASE 02", title: "Delivery & 72h Fit Window", desc: "Your bespoke garment arrives in atelier luxury casing. You have 72 hours to try it on and inspect fit." },
              { phase: "PHASE 03", title: "Fit Confirmation & Settlement", desc: "Once you confirm the fit satisfies your tolerances, escrow funds are automatically released to the creator." },
            ].map((p, idx) => (
              <div key={idx} className="p-8 bg-white border border-[#183B56]/15 shadow-xs space-y-4 flex flex-col justify-between">
                <span className="text-[10px] font-mono font-bold text-[#183B56] bg-[#DFE7ED] px-2.5 py-1 inline-block self-start">
                  {p.phase}
                </span>
                <div className="space-y-2">
                  <h4 className="text-base font-bold uppercase text-[#183B56]">{p.title}</h4>
                  <p className="text-xs text-[#5A7184] font-medium leading-relaxed">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 7. FINAL ONBOARDING CTA ─── */}
      <section className="bg-[#183B56] text-white px-6 sm:px-12 py-16 text-center space-y-6">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight leading-tight">
            Ready to Discover Fashion<br />That Truly Fits You?
          </h2>
          <p className="text-sm sm:text-base text-[#DFE7ED] font-medium">
            Join the founding cohort of patrons and start your personal Zyra AI styling calibration.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleStartOnboarding}
              className="w-full sm:w-auto bg-white hover:bg-[#F5EFEB] text-[#183B56] text-xs sm:text-sm font-extrabold uppercase tracking-widest px-9 py-4 border-none cursor-pointer shadow-md transition-transform hover:scale-105"
            >
              Start Free Calibration
            </button>
            <button
              onClick={() => triggerAuth("login")}
              className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white text-xs sm:text-sm font-bold uppercase tracking-widest px-8 py-4 border border-white/40 cursor-pointer"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ─── 8. FOOTER ─── */}
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
