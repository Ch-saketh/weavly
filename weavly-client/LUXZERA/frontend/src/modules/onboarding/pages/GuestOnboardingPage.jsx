"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowRight, 
  ArrowUpRight, 
  Search, 
  Heart, 
  ShoppingBag, 
  SlidersHorizontal, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Lock
} from "lucide-react";
import AuthModal from "@/modules/auth/components/AuthModal";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Footer from "@/shared/components/layout/Footer";

// High quality studio photography matching reference image
const HERO_IMG_BACK = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80"; // Back view white tee
const HERO_IMG_CENTER = "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"; // Handsome portrait male
const HERO_IMG_RIGHT = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"; // Editorial model portrait

const PROD_SAGE = "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&q=80";
const PROD_MINT = "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80";
const PROD_WHITE = "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=800&q=80";
const PROD_LILAC = "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80";

const RACK_1 = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80"; // Hanging t-shirts
const RACK_2 = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=800&q=80"; // Hanging jackets
const RACK_3 = "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"; // Folded collection

const STORY_MODEL = "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80";

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

  // Fast & responsive lerp loop (lerp factor 0.35 for snappy tracking)
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
    <div className="relative flex items-center justify-center select-none" style={{ width: 380, height: 380 }}>
      {/* Ambient blue glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          height: 400,
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.15) 0%, transparent 70%)",
          filter: "blur(28px)",
          pointerEvents: "none",
        }}
      />

      {/* Mascot Base Emblem */}
      <img
        src="/zera_clean.svg?v=2"
        alt="Zyra AI"
        style={{ width: 380, height: 380, objectFit: "contain", position: "relative", zIndex: 2, userSelect: "none" }}
        draggable={false}
      />

      {/* Fast & Responsive Wide-Awake Face Container */}
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
        <div className="flex items-center gap-8 mb-1.5 opacity-90 transition-all duration-200">
          <div
            className="w-[24px] h-[3px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${-5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
          <div
            className="w-[24px] h-[3px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
        </div>

        {/* Wide Open Shiny Eyes */}
        <div className="relative flex items-center justify-center gap-6">
          {/* Left Eye */}
          <div className="w-[28px] h-[28px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[10px] h-[10px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[4px] h-[4px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>

          {/* Right Eye */}
          <div className="w-[28px] h-[28px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[10px] h-[10px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[4px] h-[4px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>
        </div>

        {/* Crisp Mouth */}
        <div className="mt-2 opacity-95 transition-all duration-150">
          {isMoving ? (
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="6" r="4.5" fill="#111827" />
            </svg>
          ) : (
            <svg width="26" height="12" viewBox="0 0 26 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 4 2 Q 13 10 22 2" stroke="#111827" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GuestOnboardingPage({ onOpenAuth }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState("register");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [selectedSize, setSelectedSize] = useState("M");

  const triggerAuth = (view = "register") => {
    if (onOpenAuth) {
      onOpenAuth(view);
    } else {
      setAuthInitialView(view);
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#E5EAE5] font-sans text-[#111827] selection:bg-[#111827] selection:text-white">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-reverse {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0%); }
        }
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 22s linear infinite;
        }
        .animate-marquee-reverse {
          display: flex;
          width: max-content;
          animation: marquee-reverse 22s linear infinite;
        }
      `}} />

      {/* ─── 0. TOP UTILITY BAR (From Reference Image) ─── */}
      <div className="w-full bg-[#E5EAE5] border-b border-[#D2D8D2] px-6 sm:px-12 py-2 flex items-center justify-between text-[11px] font-medium text-[#4B5563]">
        <div className="flex items-center gap-4">
          <a href="#" className="hover:text-black transition-colors" aria-label="Facebook">
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="#" className="hover:text-black transition-colors" aria-label="Instagram">
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="#" className="hover:text-black transition-colors" aria-label="Twitter">
            <svg width="13" height="13" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </a>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={() => triggerAuth("login")} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0">
            Sign In
          </button>
          <button onClick={() => triggerAuth("register")} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0">
            Join Us
          </button>
          <a href="/faq" className="hover:text-black transition-colors no-underline text-inherit">
            Help
          </a>
        </div>
      </div>

      {/* ─── 1. MAIN NAVBAR (From Reference Image) ─── */}
      <header className="w-full h-20 bg-[#E5EAE5] border-b border-[#D2D8D2] px-6 sm:px-12 flex items-center justify-between sticky top-0 z-50">
        <WeavlyLogo />

        <nav className="hidden md:flex items-center gap-8 text-[13px] font-bold uppercase tracking-wider text-[#111827]">
          <a href="#" className="text-black hover:opacity-75 transition-opacity no-underline">Home</a>
          <a href="#shop-the-edit" className="text-[#4B5563] hover:text-black transition-colors no-underline">Collections</a>
          <a href="#new-arrivals" className="text-[#4B5563] hover:text-black transition-colors no-underline">For Him</a>
          <a href="#new-arrivals" className="text-[#4B5563] hover:text-black transition-colors no-underline">For Her</a>
          <a href="#meet-zyra" className="text-[#4B5563] hover:text-black transition-colors no-underline">Zyra AI</a>
          <a href="/creator-guide" className="text-[#4B5563] hover:text-black transition-colors no-underline">Atelier</a>
        </nav>

        <div className="flex items-center gap-5 text-[#111827]">
          <button onClick={() => triggerAuth("login")} className="hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-0">
            <Search size={19} />
          </button>
          <button onClick={() => triggerAuth("login")} className="hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-0">
            <Heart size={19} />
          </button>
          <button onClick={() => triggerAuth("login")} className="hover:opacity-70 transition-opacity bg-transparent border-none cursor-pointer p-0">
            <ShoppingBag size={19} />
          </button>
        </div>
      </header>

      {/* ─── 2. HERO SECTION: "SEASON DROP 2026" (Exact Match to Reference Screenshot) ─── */}
      <section className="px-6 sm:px-12 pt-10 pb-16 max-w-7xl mx-auto">
        {/* Massive Headline */}
        <h1 className="text-6xl sm:text-8xl lg:text-[110px] font-extrabold uppercase tracking-tight text-[#111827] leading-[0.9] text-center mb-8 font-sans">
          SEASON DROP 2026
        </h1>

        {/* Sub-Header Bar with Arrow Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111827] block">
              FRESH DESIGNS.
            </span>
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#111827] block">
              BOLD LOOKS.
            </span>
          </div>
          <button
            onClick={() => triggerAuth("register")}
            className="w-10 h-10 bg-[#333E33] hover:bg-black text-white flex items-center justify-center transition-colors cursor-pointer border-none shadow-sm"
          >
            <ArrowUpRight size={20} />
          </button>
        </div>

        {/* 3-Editorial Photography Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Photo 1: Minimal Silhouette / Back View */}
          <div className="aspect-[3/4] bg-[#D6DCD6] overflow-hidden shadow-xs cursor-pointer group" onClick={() => triggerAuth("register")}>
            <img
              src={HERO_IMG_BACK}
              alt="Minimalist Tee Silhouette"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Photo 2: High-Fashion Center Portrait */}
          <div className="aspect-[3/4] bg-[#D6DCD6] overflow-hidden shadow-xs cursor-pointer group" onClick={() => triggerAuth("register")}>
            <img
              src={HERO_IMG_CENTER}
              alt="Season Lookbook Model"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Photo 3: Editorial Portrait with Caption */}
          <div className="flex flex-col space-y-4">
            <div className="aspect-[3/4] bg-[#D6DCD6] overflow-hidden shadow-xs cursor-pointer group" onClick={() => triggerAuth("register")}>
              <img
                src={HERO_IMG_RIGHT}
                alt="Newest Season Looks"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            </div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#4B5563] leading-relaxed">
              DISCOVER OUR NEWEST LOOKS FOR THE SEASON · BESPOKE COMMISSION &amp; MADE-TO-MEASURE
            </p>
          </div>
        </div>
      </section>

      {/* ─── 3. TILTED MARQUEE RIBBON TAPES (From Reference Screenshot) ─── */}
      <div className="relative py-12 overflow-hidden my-4">
        {/* Top Tilted White/Sage Ribbon */}
        <div className="w-[120%] -ml-[10%] bg-[#DCE2DC] text-[#111827] py-3.5 transform -rotate-1.5 shadow-sm border-y border-[#CCD4CC] flex whitespace-nowrap overflow-hidden text-sm sm:text-base font-extrabold uppercase tracking-widest">
          <div className="flex items-center gap-8 animate-marquee">
            <span>✱ LIMITED RELEASE</span>
            <span>✱ NEW SEASON DROP</span>
            <span>✱ 3D BESPOKE TAILORING</span>
            <span>✱ 100% ESCROW FIT</span>
            <span>✱ LIMITED RELEASE</span>
            <span>✱ NEW SEASON DROP</span>
            <span>✱ 3D BESPOKE TAILORING</span>
            <span>✱ 100% ESCROW FIT</span>
            <span>✱ LIMITED RELEASE</span>
            <span>✱ NEW SEASON DROP</span>
            <span>✱ 3D BESPOKE TAILORING</span>
            <span>✱ 100% ESCROW FIT</span>
          </div>
        </div>

        {/* Bottom Tilted Black Ribbon (Overlapping) */}
        <div className="w-[120%] -ml-[10%] bg-black text-white py-4 transform rotate-1.5 shadow-md flex whitespace-nowrap overflow-hidden text-sm sm:text-base font-extrabold uppercase tracking-widest mt-[-10px] relative z-10">
          <div className="flex items-center gap-8 animate-marquee-reverse">
            <span>✱ FRESH ARRIVALS</span>
            <span>✱ STEP INTO '26</span>
            <span>✱ LIMITED RELEASE</span>
            <span>✱ ZYRA 3D VECTOR FITTING</span>
            <span>✱ 100% ESCROW GUARANTEE</span>
            <span>✱ FRESH ARRIVALS</span>
            <span>✱ STEP INTO '26</span>
            <span>✱ LIMITED RELEASE</span>
            <span>✱ ZYRA 3D VECTOR FITTING</span>
            <span>✱ 100% ESCROW GUARANTEE</span>
          </div>
        </div>
      </div>

      {/* ─── 4. MEET ZYRA AI INTELLIGENCE (With Interactive Character Mascot) ─── */}
      <section id="meet-zyra" className="px-6 sm:px-12 py-20 max-w-7xl mx-auto">
        <div className="bg-white border border-[#D2D8D2] p-8 sm:p-14 shadow-sm">
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Left Column: Mascot with real-time eye tracking */}
            <div className="lg:w-1/2 flex flex-col items-center justify-center p-6 bg-[#E5EAE5] border border-[#D2D8D2] w-full min-h-[420px] relative overflow-hidden">
              <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">
                LIVE ZYRA AI AGENT
              </span>
              <ZeraInteractiveEyesMascot />
              <div className="text-center mt-4 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                  Zyra Virtual Atelier Engine
                </span>
                <p className="text-[11px] text-[#4B5563] font-medium">
                  Tracks your gaze and drafts bespoke silhouettes in real time.
                </p>
              </div>
            </div>

            {/* Right Column: AI Engine Value Prop & 4 Steps */}
            <div className="lg:w-1/2 space-y-8">
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#4B5563] bg-[#E5EAE5] px-3 py-1 inline-block">
                  AI Style Vectoring
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111827] leading-tight">
                  Curates Outfits.<br />Not Disconnected Clothes.
                </h2>
                <p className="text-sm text-[#4B5563] leading-relaxed font-medium">
                  Zyra analyzes your exact proportions, color harmony, and aesthetic priorities to generate synchronized bespoke capsules from verified couture ateliers.
                </p>
              </div>

              {/* 4 Steps Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { num: '01', title: 'Silhouette Scan', desc: 'Calibrate height, body shape, and fit tolerances.' },
                  { num: '02', title: 'Aesthetic Vectoring', desc: 'Maps fabrics, color tones, and wardrobe goals.' },
                  { num: '03', title: 'Capsule Synthesis', desc: 'Assembles matching garments from verified creators.' },
                  { num: '04', title: '100% Escrow Fit', desc: 'Funds released only after you try on and confirm fit.' },
                ].map((step) => (
                  <div key={step.num} className="p-4 bg-[#E5EAE5] border border-[#D2D8D2] space-y-1.5">
                    <span className="text-[10px] font-mono font-bold text-black bg-white px-2 py-0.5 inline-block">
                      STEP {step.num}
                    </span>
                    <h4 className="text-xs font-bold uppercase text-[#111827]">{step.title}</h4>
                    <p className="text-[11px] text-[#4B5563] leading-relaxed font-medium">{step.desc}</p>
                  </div>
                ))}
              </div>

              <div className="pt-2">
                <button
                  onClick={() => triggerAuth("register")}
                  className="bg-black hover:bg-neutral-800 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-3"
                >
                  <span>Start Free Zyra Calibration</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ─── 5. SHOP THE EDIT (Exact Match to Reference Screenshot) ─── */}
      <section id="shop-the-edit" className="px-6 sm:px-12 py-16 max-w-7xl mx-auto">
        
        {/* Section Headline */}
        <h2 className="text-5xl sm:text-7xl font-extrabold uppercase tracking-tight text-[#111827] mb-10">
          SHOP THE EDIT
        </h2>

        {/* 2-Column Split: Left Filters & Right Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Filter Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#D2D8D2]">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#111827]">
                <span>Filters</span>
                <SlidersHorizontal size={14} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B5563] cursor-pointer">
                SORT BY ⌵
              </span>
            </div>

            {/* Accordion 1: Category */}
            <div className="space-y-2 border-b border-[#D2D8D2] pb-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-[#111827] cursor-pointer">
                <span>CATEGORY</span>
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Accordion 2: Price */}
            <div className="space-y-2 border-b border-[#D2D8D2] pb-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-[#111827] cursor-pointer">
                <span>PRICE</span>
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Accordion 3: Size */}
            <div className="space-y-3 border-b border-[#D2D8D2] pb-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-[#111827]">
                <span>SIZE</span>
                <ChevronDown size={14} />
              </div>
              <div className="flex flex-wrap gap-2">
                {['XS', 'S', 'M', 'L', 'XL', 'BESPOKE'].map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase transition-all cursor-pointer ${
                      selectedSize === sz ? 'bg-black text-white' : 'bg-white text-[#111827] border border-[#D2D8D2] hover:bg-[#DCE2DC]'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion 4: Material */}
            <div className="space-y-2 border-b border-[#D2D8D2] pb-3">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-[#111827] cursor-pointer">
                <span>MATERIAL</span>
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Accordion 5: Brands / Ateliers (With Pills from screenshot) */}
            <div className="space-y-3 border-b border-[#D2D8D2] pb-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-[#111827]">
                <span>BRANDS</span>
                <ChevronDown size={14} />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['Nike', 'Puma', 'Raw', 'One Ummah', 'Easy', 'Weavly Atelier'].map((brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(brand)}
                    className={`px-2.5 py-1 text-[10px] font-medium transition-all rounded-xs cursor-pointer ${
                      selectedBrand === brand ? 'bg-black text-white font-bold' : 'bg-white text-[#4B5563] border border-[#D2D8D2] hover:bg-[#DCE2DC]'
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>

            {/* Accordion 6: Colour */}
            <div className="space-y-3 border-b border-[#D2D8D2] pb-4">
              <div className="flex items-center justify-between text-xs font-bold uppercase text-[#111827]">
                <span>COLOUR</span>
                <ChevronDown size={14} />
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#8E9F8E] border border-black/20 cursor-pointer" title="Sage" />
                <span className="w-5 h-5 rounded-full bg-[#FFFFFF] border border-black/20 cursor-pointer" title="White" />
                <span className="w-5 h-5 rounded-full bg-[#2B2B2B] border border-black/20 cursor-pointer" title="Charcoal" />
                <span className="w-5 h-5 rounded-full bg-[#D4C5B9] border border-black/20 cursor-pointer" title="Sand" />
                <span className="w-5 h-5 rounded-full bg-[#D8C7D8] border border-black/20 cursor-pointer" title="Lilac" />
              </div>
            </div>

            {/* Apply Filter Button */}
            <button
              onClick={() => triggerAuth("register")}
              className="w-full py-3 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center shadow-xs"
            >
              Apply Filter
            </button>

          </div>

          {/* Right Product Grid (3-Columns on Hangers matching screenshot) */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            
            {/* Product 1: CLOUDMARK */}
            <div className="bg-white p-4 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer group" onClick={() => triggerAuth("register")}>
              <div className="aspect-[4/5] bg-[#E5EAE5] overflow-hidden flex items-center justify-center relative">
                <img
                  src={PROD_SAGE}
                  alt="Cloudmark Tee"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold uppercase text-[#111827]">CLOUDMARK</div>
                <div className="text-xs text-[#4B5563] font-medium">₹2,480 / $260</div>
              </div>
            </div>

            {/* Product 2: NORTH FLARE */}
            <div className="bg-white p-4 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer group" onClick={() => triggerAuth("register")}>
              <div className="aspect-[4/5] bg-[#E5EAE5] overflow-hidden flex items-center justify-center relative">
                <img
                  src={PROD_MINT}
                  alt="North Flare Tee"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold uppercase text-[#111827]">NORTH FLARE</div>
                <div className="text-xs text-[#4B5563] font-medium">₹2,160 / $260</div>
              </div>
            </div>

            {/* Product 3: DUSKFRAME */}
            <div className="bg-white p-4 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer group" onClick={() => triggerAuth("register")}>
              <div className="aspect-[4/5] bg-[#E5EAE5] overflow-hidden flex items-center justify-center relative">
                <img
                  src={PROD_WHITE}
                  alt="Duskframe Tee"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold uppercase text-[#111827]">DUSKFRAME</div>
                <div className="text-xs text-[#4B5563] font-medium">₹2,900 / $260</div>
              </div>
            </div>

            {/* Product 4: RAWSHIFT */}
            <div className="bg-white p-4 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer group" onClick={() => triggerAuth("register")}>
              <div className="aspect-[4/5] bg-[#E5EAE5] overflow-hidden flex items-center justify-center relative">
                <img
                  src={PROD_LILAC}
                  alt="Rawshift Knit"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold uppercase text-[#111827]">RAWSHIFT</div>
                <div className="text-xs text-[#4B5563] font-medium">₹3,200 / $260</div>
              </div>
            </div>

            {/* Product 5: SARTORIAL FLANNEL */}
            <div className="bg-white p-4 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer group" onClick={() => triggerAuth("register")}>
              <div className="aspect-[4/5] bg-[#E5EAE5] overflow-hidden flex items-center justify-center relative">
                <img
                  src={RACK_2}
                  alt="Bespoke Coat"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold uppercase text-[#111827]">BESPOKE FLANNEL</div>
                <div className="text-xs text-[#4B5563] font-medium">₹4,850 / $380</div>
              </div>
            </div>

            {/* Product 6: URBAN TIDE CAPSULE */}
            <div className="bg-white p-4 shadow-xs flex flex-col justify-between space-y-3 cursor-pointer group" onClick={() => triggerAuth("register")}>
              <div className="aspect-[4/5] bg-[#E5EAE5] overflow-hidden flex items-center justify-center relative">
                <img
                  src={RACK_1}
                  alt="Urban Tide Rack"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-extrabold uppercase text-[#111827]">URBAN TIDE CAPSULE</div>
                <div className="text-xs text-[#4B5563] font-medium">₹5,400 / $420</div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ─── 6. NEW ARRIVALS (Asymmetric Editorial Layout from Reference Screenshot) ─── */}
      <section id="new-arrivals" className="px-6 sm:px-12 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left 8 Cols: Collage of Hanging Racks */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Shot 1: URBAN TIDE Hanger Rack */}
            <div className="bg-white p-4 shadow-xs space-y-3">
              <div className="aspect-[4/3] bg-[#E5EAE5] overflow-hidden">
                <img src={RACK_1} alt="Urban Tide Rack" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-extrabold uppercase text-[#111827]">URBAN TIDE</div>
                <button
                  onClick={() => triggerAuth("register")}
                  className="text-[11px] font-bold uppercase text-black hover:underline cursor-pointer bg-transparent border-none p-0"
                >
                  SHOP NOW →
                </button>
              </div>
            </div>

            {/* Shot 2: BESPOKE ATELIER JACKETS */}
            <div className="bg-white p-4 shadow-xs space-y-3">
              <div className="aspect-[4/3] bg-[#E5EAE5] overflow-hidden">
                <img src={RACK_2} alt="Atelier Jackets" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-extrabold uppercase text-[#111827]">ATELIER BESPOKE SUITS</div>
                <div className="text-xs text-[#4B5563] font-medium">₹6,200 / $260</div>
              </div>
            </div>

            {/* Shot 3: MULTI-COLOUR FOLDED RACK */}
            <div className="sm:col-span-2 bg-white p-4 shadow-xs space-y-3">
              <div className="aspect-[16/7] bg-[#E5EAE5] overflow-hidden">
                <img src={RACK_3} alt="Capsule Collection" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-extrabold uppercase text-[#111827]">HANDCRAFTED SEASON CAPSULES</div>
                  <div className="text-xs text-[#4B5563] font-medium">100% Guaranteed Escrow Fitting</div>
                </div>
                <button
                  onClick={() => triggerAuth("register")}
                  className="px-4 py-2 bg-black text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                >
                  Explore Drop
                </button>
              </div>
            </div>

          </div>

          {/* Right 4 Cols: Massive Bold Condensed "NEW ARRIVALS" Title */}
          <div className="lg:col-span-4 flex flex-col justify-center items-start lg:items-end text-left lg:text-right space-y-6">
            <h2 className="text-6xl sm:text-7xl lg:text-[88px] font-extrabold uppercase tracking-tight text-[#111827] leading-[0.88]">
              NEW<br />ARRIVALS
            </h2>
            <p className="text-xs sm:text-sm text-[#4B5563] font-medium max-w-xs leading-relaxed">
              Every drop is created in limited runs by independent couturiers and tailored to your Zyra 3D profile.
            </p>
            <button
              onClick={() => triggerAuth("register")}
              className="bg-black hover:bg-neutral-800 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer shadow-sm"
            >
              View Full Catalog
            </button>
          </div>

        </div>
      </section>

      {/* ─── 7. STYLE STORIES (Exact Match to Reference Screenshot) ─── */}
      <section className="px-6 sm:px-12 py-16 max-w-7xl mx-auto">
        
        {/* Header with See More link */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-[#D2D8D2]">
          <h2 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111827]">
            STYLE STORIES
          </h2>
          <a
            href="/creator-guide"
            className="text-xs sm:text-sm font-bold uppercase text-[#111827] hover:underline flex items-center gap-1 no-underline"
          >
            <span>See more</span>
            <span>→</span>
          </a>
        </div>

        {/* Big Editorial Banner Container (From Reference Screenshot) */}
        <div className="bg-black text-white grid grid-cols-1 lg:grid-cols-12 shadow-md overflow-hidden">
          
          {/* Left Text Column */}
          <div className="lg:col-span-8 p-8 sm:p-14 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#9CA3AF] bg-neutral-900 border border-neutral-700 px-3 py-1 inline-block">
                ATELIER JOURNAL · ISSUE #04
              </span>
              <h3 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-white leading-tight">
                WHAT'S AHEAD IN MODERN STREETWEAR &amp; BESPOKE ATELIER
              </h3>
              <p className="text-sm sm:text-base text-[#9CA3AF] font-medium leading-relaxed max-w-xl">
                Insider notes on future fashion movements, 3D silhouette calibration, zero-waste cutting, and how independent designers are bypassing retail markups.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-4">
              <button
                onClick={() => triggerAuth("register")}
                className="bg-white text-black hover:bg-neutral-200 px-7 py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none font-sans"
              >
                Read Full Story
              </button>
              <a
                href="/how-to-become-creator"
                className="text-xs font-bold uppercase text-white hover:underline flex items-center gap-1 no-underline"
              >
                <span>For Designers</span>
                <span>→</span>
              </a>
            </div>
          </div>

          {/* Right Editorial Model Photo */}
          <div className="lg:col-span-4 aspect-[4/5] lg:aspect-auto overflow-hidden bg-neutral-900">
            <img
              src={STORY_MODEL}
              alt="Style Story Editorial"
              className="w-full h-full object-cover"
            />
          </div>

        </div>

      </section>

      {/* ─── 8. 100% ESCROW FIT VAULT (Patron & Creator Protection) ─── */}
      <section className="px-6 sm:px-12 py-16 max-w-7xl mx-auto border-t border-[#D2D8D2]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 border border-[#D2D8D2] shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold bg-[#E5EAE5] px-2.5 py-1 text-black inline-block">
              GUARANTEE 01
            </span>
            <h4 className="text-sm font-extrabold uppercase text-[#111827]">100% Escrow Protection</h4>
            <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
              Payment is held safely in escrow vaults until your piece is delivered and inspected for fit.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#D2D8D2] shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold bg-[#E5EAE5] px-2.5 py-1 text-black inline-block">
              GUARANTEE 02
            </span>
            <h4 className="text-sm font-extrabold uppercase text-[#111827]">Verified Couturiers</h4>
            <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
              Every designer is vetted for fabric authenticity, stitch precision, and ethical production.
            </p>
          </div>

          <div className="bg-white p-8 border border-[#D2D8D2] shadow-xs space-y-3">
            <span className="text-[10px] font-mono font-bold bg-[#E5EAE5] px-2.5 py-1 text-black inline-block">
              GUARANTEE 03
            </span>
            <h4 className="text-sm font-extrabold uppercase text-[#111827]">Zero Subscription Fees</h4>
            <p className="text-xs text-[#4B5563] font-medium leading-relaxed">
              Patrons browse freely; creators publish lookbooks without listing fees or subscriptions.
            </p>
          </div>
        </div>
      </section>

      {/* ─── 9. FOOTER ─── */}
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
