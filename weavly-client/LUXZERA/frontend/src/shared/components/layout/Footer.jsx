"use client";

import { useRouter } from "next/navigation";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Wordmark from "@/shared/components/branding/Wordmark";
import branding from "@/config/branding";
import { Globe, ArrowUp, Sparkles, ShieldCheck, Heart } from "lucide-react";

export default function Footer({ onShopNow, onBetaClick, requireAuth, onRequireAuth }) {
  const router = RouterSafe();
  const currentYear = new Date().getFullYear();

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

  return (
    <footer className="w-full bg-[#0C0F1D] text-white font-sans select-none border-t border-[#1C2138] overflow-hidden">
      
      {/* ═══ 1. DISCORD-STYLE ROOFTOP LEDGE ARTWORK BANNER ═══ */}
      <div className="relative w-full h-[220px] sm:h-[280px] md:h-[340px] lg:h-[380px] bg-[#070913] overflow-hidden">
        {/* Deep Cosmic Starry Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#060810] via-[#090D1F] to-[#0C0F1D]" />

        {/* Character Artwork */}
        <img
          src="/weavly-anime-trio.jpg"
          alt="Weavly Anime Streetwear Squad on Rooftop Ledge"
          className="relative w-full h-full object-cover object-[center_28%] filter brightness-[0.98] contrast-[1.03] transition-transform duration-700 hover:scale-[1.01]"
        />

        {/* Subtle Ambient Vignette & Sky Blend */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#0C0F1D] via-transparent to-[#060810]/70" />

        {/* Floating Atelier Badge Overlay */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-8 z-10 flex items-center gap-2 bg-[#0C0F1D]/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
          <Sparkles size={12} className="text-[#F07020] animate-pulse" />
          <span className="text-[11px] font-medium tracking-wide text-white/90">
            Weavly Atelier Crew • Autumn / Winter '26
          </span>
        </div>

        {/* Ledge Glowing Bottom Accent Border */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#3A4268]/60 to-transparent" />
      </div>

      {/* ═══ 2. MAIN FOOTER CONTENT (DISCORD-STYLE MULTI-COLUMN) ═══ */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-12 pb-10 flex flex-col gap-12">
        
        {/* Main Grid: Left Identity Column + Right 4-Column Navigation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Official Logo + Language + Bio */}
          <div className="lg:col-span-4 space-y-5">
            <div
              onClick={() => handleLinkClick("/")}
              className="hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer p-0 select-none"
              role="button"
              tabIndex={0}
              aria-label={`${branding.name} home`}
            >
              <WeavlyLogo size="md" showBeta={true} allWhite={true} onBetaClick={onBetaClick} />
            </div>
            
            <p className="text-xs sm:text-[13px] text-[#A0AEC0] leading-relaxed max-w-sm font-normal">
              {branding.description || "The next-generation curated fashion marketplace powered by independent designers and Zyra AI styling."}
            </p>

            {/* Language & Region Selector Pill */}
            <div className="pt-2">
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181D33] hover:bg-[#202744] border border-[#2A3154] text-[#E2E8F0] text-[12px] font-medium transition-colors cursor-pointer"
              >
                <Globe size={13} className="text-[#F07020]" />
                <span>English (US)</span>
                <span className="text-[10px] text-[#718096]">▾</span>
              </button>
            </div>
          </div>

          {/* Right Columns: 4-Column Navigation Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8 text-xs">
            
            {/* Column 1: Product / Marketplace */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Product
              </h4>
              <ul className="space-y-2.5 text-[#CBD5E1] font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/market")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/men")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Men's Sartorial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/women")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Women's Atelier
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/unisex")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Unisex Drops
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/new-arrivals")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    New Arrivals
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Atelier & Studio */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Atelier
              </h4>
              <ul className="space-y-2.5 text-[#CBD5E1] font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/designers")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Discover Designers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designs")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Creator Lookbooks
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/custom-design")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Commission Garment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designer-studio")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Designer Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/become-designer")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Become a Designer
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Zyra AI & Wardrobe */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Wardrobe
              </h4>
              <ul className="space-y-2.5 text-[#CBD5E1] font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/wardrobe")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[#F07020]" />
                    <span>Zyra Wardrobe</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/account")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    My Account
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/orders")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/bag")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Shopping Bag
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Policies & Trust */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Policies
              </h4>
              <ul className="space-y-2.5 text-[#CBD5E1] font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/terms")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/faq")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] hover:text-white text-xs">
                    Help & FAQs
                  </button>
                </li>
                <li>
                  <span className="text-[#64748B] text-xs flex items-center gap-1">
                    <ShieldCheck size={11} className="text-emerald-400" /> Verified Platform
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ═══ 3. MIDDLE BAR: Legal Left + Back to Top Right ═══ */}
        <div className="pt-6 border-t border-[#1C2138] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#718096]">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} {branding.name}.</span>
            <span>All rights reserved.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#A0AEC0] hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 font-medium"
          >
            <span>Back to top</span>
            <ArrowUp size={12} />
          </button>
        </div>

      </div>

      {/* ═══ 4. BOTTOM SIGNATURE WORDMARK ═══ */}
      <div className="w-full overflow-hidden select-none border-t border-[#1C2138] leading-none pt-4 pb-2 text-center bg-[#070913]">
        <Wordmark allWhite={true} />
      </div>
    </footer>
  );
}