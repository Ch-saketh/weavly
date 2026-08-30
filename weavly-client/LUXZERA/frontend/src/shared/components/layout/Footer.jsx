"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import branding from "@/config/branding";
import { Globe, ArrowUp, Sparkles, ShieldCheck, ArrowRight, Check } from "lucide-react";

/**
 * Animated ZYRA Character for the Footer
 * Features subtle floating, breathing, and responsive eye/head tracking following the mouse cursor.
 */
function ZyraFooterCharacter() {
  const containerRef = useRef(null);
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let idleTimer = null;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      // Relative mouse vector centered on the Zyra container (-1 to 1)
      const x = ((e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2));
      const y = ((e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2));

      setTargetPos({
        x: Math.max(-1, Math.min(1, x)),
        y: Math.max(-1, Math.min(1, y)),
      });

      setIsMoving(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsMoving(false);
      }, 900);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  // Smooth lerp physics for eye tracking
  useEffect(() => {
    let animId;
    let currentX = smoothPos.x;
    let currentY = smoothPos.y;

    const updatePhysics = () => {
      currentX += (targetPos.x - currentX) * 0.18;
      currentY += (targetPos.y - currentY) * 0.18;
      setSmoothPos({ x: currentX, y: currentY });
      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [targetPos]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full min-h-[300px] sm:min-h-[340px] flex items-center justify-center select-none overflow-visible group"
    >
      {/* Ambient Soft Studio Glow behind Zyra */}
      <div
        className="absolute w-[240px] sm:w-[280px] h-[240px] sm:h-[280px] rounded-full pointer-events-none transition-opacity duration-700 opacity-25 group-hover:opacity-40"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0.03) 45%, transparent 70%)",
          filter: "blur(36px)",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      />

      {/* Floating & Breathing Wrapper */}
      <div 
        className="relative flex items-center justify-center transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${smoothPos.x * 6}px, ${smoothPos.y * 6}px, 0)`,
        }}
      >
        {/* Authentic Zyra Base Emblem */}
        <img
          src="/zera_clean.svg?v=2"
          alt="Zyra AI Fashion Intelligence"
          className="w-[220px] sm:w-[260px] lg:w-[290px] h-auto object-contain relative z-10 pointer-events-none drop-shadow-[0_12px_28px_rgba(0,0,0,0.8)]"
          draggable={false}
        />

        {/* Responsive Interactive Wide-Awake Face Container */}
        <div
          className="absolute z-20 flex flex-col items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
          style={{
            top: "48%",
            left: "52%",
            transform: `translate(calc(-50% + ${smoothPos.x * 16}px), calc(-50% + ${smoothPos.y * 14}px))`,
            willChange: "transform",
          }}
        >
          {/* Eyebrows */}
          <div className="flex items-center gap-7 mb-1.5 opacity-90 transition-all duration-200">
            <div
              className="w-[20px] sm:w-[22px] h-[2.5px] bg-[#111827] rounded-full transition-transform duration-150"
              style={{ transform: `rotate(${-5 + smoothPos.x * 8}deg) translateY(${isMoving ? -1.5 : 0}px)` }}
            />
            <div
              className="w-[20px] sm:w-[22px] h-[2.5px] bg-[#111827] rounded-full transition-transform duration-150"
              style={{ transform: `rotate(${5 + smoothPos.x * 8}deg) translateY(${isMoving ? -1.5 : 0}px)` }}
            />
          </div>

          {/* Glossy Eyes */}
          <div className="relative flex items-center justify-center gap-5 sm:gap-6">
            {/* Left Eye */}
            <div className="w-[24px] sm:w-[26px] h-[24px] sm:h-[26px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
              <div className="w-[9px] h-[9px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
              <div className="w-[4px] h-[4px] rounded-full bg-white/90 absolute bottom-1 right-1" />
            </div>

            {/* Right Eye */}
            <div className="w-[24px] sm:w-[26px] h-[24px] sm:h-[26px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
              <div className="w-[9px] h-[9px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
              <div className="w-[4px] h-[4px] rounded-full bg-white/90 absolute bottom-1 right-1" />
            </div>
          </div>

          {/* Mouth */}
          <div className="mt-2 opacity-95 transition-all duration-150">
            {isMoving ? (
              <svg width="22" height="11" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="7" r="5" fill="#111827" />
              </svg>
            ) : (
              <svg width="24" height="11" viewBox="0 0 30 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 4 2 Q 15 12 26 2" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Sub-Label */}
      <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121216]/90 border border-[#27272F] text-[11px] text-[#A1A1AA] pointer-events-none shadow-sm">
        <Sparkles size={10} className="text-white" />
        <span className="font-semibold text-white tracking-wider uppercase">Zyra Intelligence</span>
      </div>
    </div>
  );
}

export default function Footer({ onShopNow, onBetaClick, requireAuth, onRequireAuth }) {
  const router = RouterSafe();
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 3500);
  };

  return (
    <footer className="relative w-full bg-[#000000] text-white font-sans select-none overflow-hidden pt-12 sm:pt-16 pb-10 border-t border-[#18181C]">
      
      {/* ═══ 1. SUBTLE BACKGROUND TONALITY & GRAIN ═══ */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 90% 70% at 50% 15%, #101014 0%, #060608 55%, #000000 100%)",
        }}
      />

      {/* Tactile Fine-Grain Noise Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.028] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ═══ 2. LARGE CENTERED FOOTER CONTAINER (GITHUB-STYLE STRUCTURE) ═══ */}
      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="w-full bg-[#09090C] border border-[#1E1E24] rounded-2xl sm:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden">
          
          {/* ── TOP SECTION: WEAVLY BRANDING (LEFT) + NEWSLETTER (RIGHT) ── */}
          <div className="px-6 sm:px-10 py-7 sm:py-8 border-b border-[#1E1E24] flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#0B0B0E]/60">
            
            {/* Branding & Mission */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div
                onClick={() => handleLinkClick("/")}
                className="hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer p-0 select-none"
                role="button"
                tabIndex={0}
                aria-label={`${branding.name} home`}
              >
                <WeavlyLogo size="md" showBeta={true} allWhite={true} onBetaClick={onBetaClick} />
              </div>

              <div className="hidden sm:block w-[1px] h-6 bg-[#27272F]" />

              <p className="text-xs sm:text-[13px] text-[#8E8E98] max-w-md font-normal leading-relaxed">
                A curated fashion marketplace bringing together independent global designers for discerning sartorial buyers.
              </p>
            </div>

            {/* Newsletter Dispatch Input */}
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-md w-full lg:w-auto">
              <div className="relative flex-1 sm:w-64">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Subscribe to newsletter"
                  required
                  className="w-full px-4 py-2 rounded-lg bg-[#141418] border border-[#27272F] text-white placeholder:text-[#6E6E78] text-xs focus:outline-none focus:border-white transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-white text-black text-xs font-bold uppercase tracking-wider hover:bg-[#E4E4E7] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                {subscribed ? (
                  <>
                    <Check size={13} className="text-black" />
                    <span>Subscribed</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>

          </div>

          {/* ── MIDDLE SECTION: 4-COLUMN NAVIGATION (LEFT) + ZYRA VISUAL (RIGHT) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#1E1E24]">
            
            {/* LEFT 4-COLUMN NAVIGATION (8 Columns on desktop) */}
            <div className="lg:col-span-8 p-6 sm:p-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
              
              {/* Column 1: PRODUCT */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                  Product
                </h4>
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/market")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      All Products
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/men")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Men's Sartorial
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/women")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Women's Atelier
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/unisex")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Unisex Drops
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/new-arrivals")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
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
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/designers")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Discover Designers
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/designs")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Creator Lookbooks
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/custom-design")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Commission Garment
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/designer-studio")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Designer Studio
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/become-designer")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
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
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/wardrobe")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] flex items-center gap-1.5 group">
                      <Sparkles size={11} className="text-white group-hover:scale-125 transition-transform" />
                      <span>Zyra Wardrobe</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/account")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      My Account
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/orders")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      My Orders
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/bag")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
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
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/terms")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/faq")} className="hover:text-white hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#9A9AA6] block">
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

            {/* RIGHT DEDICATED ZYRA MASCOT VISUAL AREA (4 Columns on desktop) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex items-center justify-center bg-[#07070A]/80 relative overflow-hidden">
              <ZyraFooterCharacter />
            </div>

          </div>

          {/* ── BOTTOM SECTION: LEGAL / COPYRIGHT (LEFT) + LANGUAGE & BACK TO TOP (RIGHT) ── */}
          <div className="px-6 sm:px-10 py-5 border-t border-[#1E1E24] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0B0B0E]/60 text-xs text-[#71717A]">
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span>&copy; {currentYear} {branding.name}, Inc.</span>
              <span className="hidden sm:inline text-[#27272F]">•</span>
              <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-[#71717A] text-xs">
                Privacy Policy
              </button>
              <button onClick={() => handleLinkClick("/terms")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-[#71717A] text-xs">
                Terms of Service
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-[#141418] hover:bg-[#1C1C22] border border-[#27272F] text-[#C4C4CE] text-xs transition-colors cursor-pointer"
              >
                <Globe size={12} className="text-[#8E8E98]" />
                <span>English (US)</span>
                <span className="text-[10px] text-[#71717A]">▾</span>
              </button>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 text-xs text-[#8E8E98] hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 font-medium group"
              >
                <span>Back to top</span>
                <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ═══ 3. SUBTLE OVERSIZED BACKGROUND WEAVLY WORDMARK ═══ */}
      <div className="relative w-full overflow-hidden select-none pointer-events-none leading-none pt-8 text-center opacity-30">
        <span
          style={{
            fontFamily: "'Mochiy Pop One', cursive, sans-serif",
            fontSize: "clamp(3rem, 16vw, 320px)",
            lineHeight: 0.72,
            letterSpacing: "-0.04em",
          }}
          className="block w-full text-center bg-gradient-to-b from-white/[0.08] via-white/[0.02] to-transparent bg-clip-text text-transparent transform translate-y-[10%]"
        >
          {branding.name}
        </span>
      </div>

    </footer>
  );
}