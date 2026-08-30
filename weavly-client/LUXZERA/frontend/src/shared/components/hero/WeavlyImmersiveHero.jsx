"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Sparkles, Compass, ShieldCheck } from "lucide-react";

export default function WeavlyImmersiveHero({ onShopNow, onOpenAuth }) {
  const router = useRouter();
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });

  // Handle smooth mouse parallax movement
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      setMousePos({ x, y });
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
    };
  }, []);

  // Responsive lerp animation for buttery-smooth character parallax
  useEffect(() => {
    let animationFrameId;
    let currentX = smoothPos.x;
    let currentY = smoothPos.y;

    const animate = () => {
      currentX += (mousePos.x - currentX) * 0.06;
      currentY += (mousePos.y - currentY) * 0.06;
      setSmoothPos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-[620px] sm:min-h-[680px] lg:min-h-[760px] bg-[#000000] text-white overflow-hidden flex flex-col justify-between select-none border-b border-[#1F1F23]"
    >
      {/* ═══ 1. BACKGROUND GRADIENTS & SUBTLE CHARCOAL BLOOMS ═══ */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 95% 65% at 50% 20%, #18181B 0%, #0D0D0E 45%, #000000 85%)",
        }}
      />
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full blur-[160px] pointer-events-none opacity-15"
        style={{ background: "#3F3F46" }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[180px] bg-gradient-to-t from-[#000000] via-[#000000]/60 to-transparent pointer-events-none z-10"
      />

      {/* ═══ 2. TACTILE NOISE / FINE-GRAIN TEXTURE OVERLAY (3-5% Opacity) ═══ */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══ 3. EDITORIAL HERO HEADER & TYPOGRAPHY ═══ */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-8 sm:pt-12 pb-4 text-center flex flex-col items-center">
        
        {/* Floating Atelier Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181B]/90 backdrop-blur-md border border-[#27272A] text-[#E4E4E7] text-[11px] font-semibold uppercase tracking-[0.25em] mb-4 shadow-sm">
          <Sparkles size={11} className="text-white animate-pulse" />
          <span>Atelier Runway • Autumn / Winter '26</span>
        </div>

        {/* Large Scale Fashion Headline */}
        <h1
          style={{
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
            letterSpacing: "-0.04em",
          }}
          className="text-3xl sm:text-5xl lg:text-[56px] font-black uppercase text-white tracking-tight leading-[1.05] max-w-4xl mb-3"
        >
          Curated by Designers. <br className="hidden sm:inline" />
          <span className="text-[#A1A1AA]">Tailored for Community.</span>
        </h1>

        {/* Editorial Subtitle */}
        <p className="text-xs sm:text-[14px] text-[#A1A1AA] max-w-xl font-normal leading-relaxed mb-5">
          The next-generation sartorial platform where independent fashion creators showcase limited drops, commission bespoke garments, and pioneer modern streetwear.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <button
            onClick={() => {
              if (onShopNow) onShopNow();
              else router.push("/market");
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-white text-black text-[12px] font-bold uppercase tracking-wider hover:bg-[#E4E4E7] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md group"
          >
            <span>Explore Marketplace</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
          </button>

          <button
            onClick={() => router.push("/designs")}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#18181B]/80 hover:bg-[#27272A] border border-[#27272A] hover:border-[#3F3F46] text-white text-[12px] font-semibold uppercase tracking-wider active:scale-[0.98] transition-all duration-200 cursor-pointer backdrop-blur-md"
          >
            <Compass size={13} className="text-[#A1A1AA]" />
            <span>Discover Lookbooks</span>
          </button>
        </div>

      </div>

      {/* ═══ 4. LARGE INTERACTIVE MONOCHROME CHARACTER SQUAD SCENE ═══ */}
      <div className="relative w-full flex-1 max-w-[1500px] mx-auto px-4 sm:px-8 mt-2 overflow-hidden flex items-end justify-center">
        
        {/* Parallax Character Visual Wrapper */}
        <div
          className="relative w-full max-w-[1300px] h-[380px] sm:h-[460px] lg:h-[530px] rounded-t-[28px] sm:rounded-t-[36px] overflow-hidden border-t border-x border-[#27272A]/70 shadow-2xl transition-transform duration-75 ease-out"
          style={{
            transform: `translate3d(${smoothPos.x * 12}px, ${smoothPos.y * 6}px, 0)`,
          }}
        >
          {/* Studio Night Backdrop */}
          <div className="absolute inset-0 bg-[#0A0A0C]" />

          {/* 4 Fashion Editorial Models Artwork */}
          <img
            src="/weavly-hero-squad.jpg"
            alt="Weavly Fashion Editorial Models in Designer Monochrome Streetwear"
            className="w-full h-full object-cover object-[center_35%] filter brightness-[0.97] contrast-[1.04] transition-transform duration-700 hover:scale-[1.015]"
          />

          {/* Vignette Overlay & Bottom Seamless Fader */}
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/40" />
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#000000]/60 via-transparent to-[#000000]/60" />

          {/* ═══ FLOATING INTERACTIVE FASHION LOOKBOOK TAGS ═══ */}
          
          {/* Tag 1: Left Model (Overcoat) */}
          <div
            className="absolute top-10 left-6 sm:top-14 sm:left-12 z-20 flex items-center gap-2 bg-[#121214]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#27272A] text-white shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
            style={{
              transform: `translate3d(${smoothPos.x * -8}px, ${smoothPos.y * -4}px, 0)`,
            }}
            onClick={() => router.push("/women")}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide text-[#E4E4E7]">
              Look 01 • Tailored Wool Trench
            </span>
          </div>

          {/* Tag 2: Center Right Model (Tailored Suit) */}
          <div
            className="absolute top-8 right-1/4 sm:top-12 sm:right-1/3 z-20 hidden md:flex items-center gap-2 bg-[#121214]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#27272A] text-white shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
            style={{
              transform: `translate3d(${smoothPos.x * -14}px, ${smoothPos.y * -6}px, 0)`,
            }}
            onClick={() => router.push("/market")}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide text-[#E4E4E7]">
              Look 03 • Atelier Satin Suit
            </span>
          </div>

          {/* Tag 3: Right Model (Weavly Hoodie) */}
          <div
            className="absolute bottom-16 right-6 sm:bottom-20 sm:right-14 z-20 flex items-center gap-2 bg-[#121214]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#27272A] text-white shadow-xl transition-transform duration-300 hover:scale-105 cursor-pointer"
            style={{
              transform: `translate3d(${smoothPos.x * -10}px, ${smoothPos.y * -5}px, 0)`,
            }}
            onClick={() => router.push("/unisex")}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            <span className="text-[11px] font-medium tracking-wide text-[#E4E4E7]">
              Look 04 • Weavly Boxy Hoodie
            </span>
          </div>

          {/* Bottom Center Pill: Platform Attribution */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-[10px] text-[#A1A1AA] uppercase tracking-widest font-mono">
            <span>4 Models</span>
            <span>•</span>
            <span>Independent Creators Guild</span>
            <span>•</span>
            <span>Weavly Original</span>
          </div>

        </div>

      </div>

    </section>
  );
}
