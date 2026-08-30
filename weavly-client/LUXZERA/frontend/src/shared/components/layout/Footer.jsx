"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import branding from "@/config/branding";
import { Globe, ArrowUp, Sparkles, ShieldCheck } from "lucide-react";

export default function Footer({ onShopNow, onBetaClick, requireAuth, onRequireAuth }) {
  const router = RouterSafe();
  const currentYear = new Date().getFullYear();
  const sceneRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });

  function RouterSafe() {
    try {
      return useRouter();
    } catch {
      return { push: () => {} };
    }
  }

  const handleLinkClick = (path) => {
    if (requireAuth) {
      if (onRequireAuth) onRequireAuth(path);
      return;
    }
    if (path === "/market" && onShopNow) {
      onShopNow();
    } else {
      router.push(path);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Parallax tracking for the squad scene
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!sceneRef.current) return;
      const rect = sceneRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      setMousePos({ x: Math.max(-1, Math.min(1, x)), y: Math.max(-1, Math.min(1, y)) });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Lerp smoothing
  useEffect(() => {
    let animId;
    const updateLerp = () => {
      setSmoothPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.06,
        y: prev.y + (mousePos.y - prev.y) * 0.06,
      }));
      animId = requestAnimationFrame(updateLerp);
    };
    animId = requestAnimationFrame(updateLerp);
    return () => cancelAnimationFrame(animId);
  }, [mousePos]);

  return (
    <footer className="relative w-full bg-[#000000] text-white font-sans select-none overflow-hidden border-t border-[#1C1C20]">
      
      {/* ══════════════════════════════════════════════════════════════════════
          1. DISCORD-STYLE FASHION SQUAD SCENE SITTING ON FOOTER LEDGE
      ══════════════════════════════════════════════════════════════════════ */}
      <div
        ref={sceneRef}
        className="relative w-full bg-[#070709] overflow-hidden pt-12 sm:pt-16 pb-0 flex flex-col items-center justify-end border-b border-[#1F1F24]"
      >
        {/* Deep Atmospheric Backdrop Gradient */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 95% 75% at 50% 20%, #18181D 0%, #0D0D10 50%, #000000 90%)",
          }}
        />

        {/* Soft Volumetric Studio Lighting */}
        <div className="absolute top-10 left-1/4 w-[500px] h-[300px] rounded-full blur-[160px] pointer-events-none opacity-15 bg-[#3F3F46]" />
        <div className="absolute top-16 right-1/4 w-[450px] h-[280px] rounded-full blur-[150px] pointer-events-none opacity-15 bg-[#27272A]" />

        {/* Tactile Noise Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay z-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Top Floating Editorial Atelier Header */}
        <div className="relative z-20 text-center px-4 mb-4 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#18181D]/90 border border-[#27272A] text-[#E4E4E7] text-[11px] font-semibold uppercase tracking-[0.25em] mb-3 shadow-sm">
            <Sparkles size={11} className="text-white animate-pulse" />
            <span>Weavly Atelier • Autumn / Winter '26</span>
          </div>

          <h3 
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
              letterSpacing: "-0.03em",
            }}
            className="text-2xl sm:text-4xl font-extrabold uppercase text-white tracking-tight leading-tight"
          >
            Where Designers Gather.
          </h3>
        </div>

        {/* ═══ INTERACTIVE CHARACTER SQUAD SITTING ON LEDGE ═══ */}
        <div className="relative z-20 w-full max-w-[1300px] mx-auto px-4 sm:px-8 flex items-end justify-center overflow-hidden">
          <div
            className="relative w-full h-[320px] sm:h-[420px] lg:h-[480px] rounded-t-[28px] sm:rounded-t-[36px] overflow-hidden border-t border-x border-[#27272A]/70 shadow-2xl transition-transform duration-100 ease-out"
            style={{
              transform: `translate3d(${smoothPos.x * 10}px, ${smoothPos.y * 5}px, 0)`,
            }}
          >
            {/* Squad Artwork: Center figure sitting on ledge with dangling boots, squad standing */}
            <img
              src="/weavly-footer-squad.jpg"
              alt="Weavly Fashion Squad in Monochrome Streetwear"
              className="w-full h-full object-cover object-[center_35%] filter brightness-[0.98] contrast-[1.04]"
            />

            {/* Seamless Vignettes & Edge Blends */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#000000] via-transparent to-[#000000]/30" />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#000000]/60 via-transparent to-[#000000]/60" />

            {/* Floating Lookbook Pills */}
            <div
              onClick={() => handleLinkClick("/men")}
              className="absolute top-10 left-6 sm:top-14 sm:left-12 z-20 flex items-center gap-2 bg-[#121214]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#27272A] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:border-white/40 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide text-[#E4E4E7]">
                Look 01 • Wool Overcoat
              </span>
            </div>

            <div
              onClick={() => handleLinkClick("/unisex")}
              className="absolute top-20 right-6 sm:top-24 sm:right-14 z-20 flex items-center gap-2 bg-[#121214]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#27272A] text-white shadow-xl transition-all duration-300 hover:scale-105 hover:border-white/40 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide text-[#E4E4E7]">
                Look 02 • Tactical Utility Vest
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          2. FOOTER NAVIGATION CONTENT (UNDERNEATH THE LEDGE)
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-14 lg:pt-18 pb-8 flex flex-col">
        
        {/* TOP GRID: Identity (Left) + 4-Column Navigation (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: Logo, Bio & Language Selector */}
          <div className="lg:col-span-5 space-y-6">
            <div
              onClick={() => handleLinkClick("/")}
              className="hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer p-0 select-none"
              role="button"
              tabIndex={0}
              aria-label={`${branding.name} home`}
            >
              <WeavlyLogo size="md" showBeta={true} allWhite={true} onBetaClick={onBetaClick} />
            </div>
            
            <p className="text-[13px] sm:text-[14px] text-[#A1A1AA] leading-relaxed max-w-sm font-normal">
              {branding.description || "A curated fashion marketplace bringing together independent global designers for discerning sartorial buyers."}
            </p>

            {/* Language & Region Selector */}
            <div className="pt-1">
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141416] hover:bg-[#1F1F23] border border-[#27272A] hover:border-[#3F3F46] text-[#E4E4E7] text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <Globe size={13} className="text-[#A1A1AA] group-hover:rotate-12 transition-transform duration-300" />
                <span>English (US)</span>
                <span className="text-[10px] text-[#71717A] group-hover:translate-y-0.5 transition-transform duration-200">▾</span>
              </button>
            </div>
          </div>

          {/* RIGHT: 4 Multi-Column Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 text-xs">
            
            {/* Column 1: PRODUCT */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Product
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/market")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/men")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Men's Sartorial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/women")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Women's Atelier
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/unisex")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Unisex Drops
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/new-arrivals")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    New Arrivals
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: ATELIER */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Atelier
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/designers")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Discover Designers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designs")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Creator Lookbooks
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/custom-design")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Commission Garment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designer-studio")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Designer Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/become-designer")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Become a Designer
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: WARDROBE */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Wardrobe
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/wardrobe")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs flex items-center gap-1.5 group">
                    <Sparkles size={11} className="text-[#FFFFFF] group-hover:scale-125 transition-transform" />
                    <span>Zyra Wardrobe</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/account")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    My Account
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/orders")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/bag")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Shopping Bag
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: POLICIES */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Policies
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/terms")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/faq")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#A1A1AA] text-xs block">
                    Help & FAQs
                  </button>
                </li>
                <li>
                  <span className="text-[#71717A] text-xs flex items-center gap-1.5 pt-1">
                    <ShieldCheck size={12} className="text-white/80" />
                    <span>Verified Atelier</span>
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* MIDDLE BAR: Legal Copyright & Back to Top */}
        <div className="pt-8 mt-12 border-t border-[#1F1F23] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A]">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} {branding.name}.</span>
            <span>All rights reserved.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-white transition-all duration-200 border-none bg-transparent cursor-pointer p-0 font-medium group hover:-translate-y-0.5"
          >
            <span>Back to top</span>
            <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>

      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          3. OVERSIZED WEAVLY SIGNATURE WORDMARK
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none leading-none pt-4 text-center">
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#27272A] to-transparent mb-2" />

        <span
          style={{
            fontFamily: "'Mochiy Pop One', cursive, sans-serif",
            fontSize: "clamp(3.8rem, 18vw, 360px)",
            lineHeight: 0.72,
            letterSpacing: "-0.04em",
          }}
          className="block w-full text-center bg-gradient-to-b from-white/[0.12] via-white/[0.04] to-transparent bg-clip-text text-transparent transform translate-y-[10%]"
        >
          {branding.name}
        </span>
      </div>

    </footer>
  );
}