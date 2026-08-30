"use client";

import { useRouter } from "next/navigation";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import branding from "@/config/branding";
import { Globe, ArrowUp, Sparkles, ShieldCheck } from "lucide-react";

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
    <footer className="relative w-full bg-[#080A18] text-white font-sans select-none overflow-hidden border-t border-[#1D2245]">
      
      {/* ═══ 1. DISCORD-INSPIRED LAYERED ATMOSPHERIC BACKGROUND ═══ */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 90% 70% at 20% -10%, #171B4A 0%, #101536 38%, #080A18 85%)",
        }}
      />

      {/* ═══ 2. SUBTLE COLOR BLOOMS & AMBIENT GLOW ORBS ═══ */}
      {/* Glow 1: Dark Indigo/Blue bloom behind Brand & Product area */}
      <div 
        className="absolute -top-24 -left-20 w-[480px] h-[380px] rounded-full blur-[140px] pointer-events-none opacity-30"
        style={{ background: "#272A78" }}
      />
      {/* Glow 2: Electric Indigo/Purple bloom behind Atelier & Wardrobe */}
      <div 
        className="absolute top-12 left-1/3 w-[520px] h-[400px] rounded-full blur-[160px] pointer-events-none opacity-20"
        style={{ background: "#4A4FD4" }}
      />
      {/* Glow 3: Subtle Violet bloom toward the right */}
      <div 
        className="absolute -top-16 -right-16 w-[420px] h-[360px] rounded-full blur-[150px] pointer-events-none opacity-20"
        style={{ background: "#5865F2" }}
      />
      {/* Glow 4: Deep ambient blue illumination near the bottom wordmark */}
      <div 
        className="absolute -bottom-10 left-1/4 w-[650px] h-[220px] rounded-full blur-[130px] pointer-events-none opacity-25"
        style={{ background: "#1C2460" }}
      />

      {/* ═══ 3. TACTILE NOISE / FINE-GRAIN TEXTURE OVERLAY ═══ */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.045] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══ 4. MAIN CONTENT CONTAINER ═══ */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 pt-16 lg:pt-20 pb-8 flex flex-col">
        
        {/* ═══ TOP GRID: Identity (Left) + 4-Column Navigation (Right) ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* LEFT: Logo, Bio, Language Selector & Socials */}
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
            
            <p className="text-[13px] sm:text-[14px] text-[#A5B4FC]/80 leading-relaxed max-w-sm font-normal">
              {branding.description || "The next-generation curated fashion marketplace connecting visionary independent designers with discerning collectors worldwide."}
            </p>

            {/* Language & Region Selector + Social Badges */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#121636]/80 hover:bg-[#1D2250] border border-[#272E63]/80 hover:border-[#4B5699] text-[#CBD5E1] text-[12px] font-medium transition-all duration-200 cursor-pointer shadow-sm group"
              >
                <Globe size={13} className="text-[#818CF8] group-hover:rotate-12 transition-transform duration-300" />
                <span>English (US)</span>
                <span className="text-[10px] text-[#64748B] group-hover:translate-y-0.5 transition-transform duration-200">▾</span>
              </button>

              {/* Discord-Inspired Social Media Capsule Buttons */}
              <div className="flex items-center gap-2">
                {/* Discord */}
                <a
                  href="https://discord.gg"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Discord Community"
                  className="w-8 h-8 rounded-full bg-[#121636]/80 hover:bg-[#5865F2] border border-[#272E63]/80 hover:border-[#5865F2] flex items-center justify-center text-[#94A3B8] hover:text-white transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter / X"
                  className="w-8 h-8 rounded-full bg-[#121636]/80 hover:bg-[#1D2250] border border-[#272E63]/80 hover:border-[#4B5699] flex items-center justify-center text-[#94A3B8] hover:text-white transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-8 h-8 rounded-full bg-[#121636]/80 hover:bg-[#E1306C] border border-[#272E63]/80 hover:border-[#E1306C] flex items-center justify-center text-[#94A3B8] hover:text-white transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* GitHub */}
                <a
                  href="https://github.com/Ch-saketh/weavly"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Repository"
                  className="w-8 h-8 rounded-full bg-[#121636]/80 hover:bg-[#24292e] border border-[#272E63]/80 hover:border-[#4B5699] flex items-center justify-center text-[#94A3B8] hover:text-white transition-all duration-200 hover:scale-105"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT: 4 Multi-Column Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 text-xs">
            
            {/* Column 1: PRODUCT */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Product
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/market")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/men")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Men's Sartorial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/women")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Women's Atelier
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/unisex")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Unisex Drops
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/new-arrivals")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    New Arrivals
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: ATELIER */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Atelier
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/designers")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Discover Designers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designs")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Creator Lookbooks
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/custom-design")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Commission Garment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designer-studio")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Designer Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/become-designer")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Become a Designer
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: WARDROBE */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Wardrobe
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/wardrobe")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs flex items-center gap-1.5 group">
                    <Sparkles size={11} className="text-[#F07020] group-hover:scale-125 transition-transform" />
                    <span>Zyra Wardrobe</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/account")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    My Account
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/orders")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/bag")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Shopping Bag
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: POLICIES */}
            <div className="space-y-4">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#818CF8]">
                Policies
              </h4>
              <ul className="space-y-2.5 font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/terms")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/faq")} className="hover:text-white hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#94A3B8] text-xs block">
                    Help & FAQs
                  </button>
                </li>
                <li>
                  <span className="text-[#64748B] text-xs flex items-center gap-1.5 pt-1">
                    <ShieldCheck size={12} className="text-emerald-400" />
                    <span>Verified Atelier</span>
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ═══ 5. MIDDLE BAR: Legal Copyright & Back to Top ═══ */}
        <div className="pt-8 mt-12 border-t border-[#1C2142]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            <span>&copy; {currentYear} {branding.name}.</span>
            <span>All rights reserved.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-[#A5B4FC] transition-all duration-200 border-none bg-transparent cursor-pointer p-0 font-medium group hover:-translate-y-0.5"
          >
            <span>Back to top</span>
            <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform duration-200" />
          </button>
        </div>

      </div>

      {/* ═══ 6. OVERSIZED WEAVLY SIGNATURE WORDMARK ═══ */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none leading-none pt-4 text-center">
        {/* Subtle glowing accent line right above the giant wordmark */}
        <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#4A4FD4]/30 to-transparent mb-2" />

        <span
          style={{
            fontFamily: "'Mochiy Pop One', cursive, sans-serif",
            fontSize: "clamp(3.8rem, 18vw, 360px)",
            lineHeight: 0.72,
            letterSpacing: "-0.04em",
          }}
          className="block w-full text-center bg-gradient-to-b from-white/[0.14] via-[#818CF8]/[0.08] to-transparent bg-clip-text text-transparent transform translate-y-[10%]"
        >
          {branding.name}
        </span>
      </div>

    </footer>
  );
}