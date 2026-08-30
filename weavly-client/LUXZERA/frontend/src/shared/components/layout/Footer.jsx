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
      const x = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const y = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);

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
      className="relative w-full h-full min-h-[280px] sm:min-h-[320px] flex items-center justify-center select-none overflow-visible group"
    >
      {/* Ambient Soft Glow behind Zyra */}
      <div
        className="absolute w-[220px] sm:w-[260px] h-[220px] sm:h-[260px] rounded-full pointer-events-none transition-opacity duration-700 opacity-30 group-hover:opacity-50"
        style={{
          background: "radial-gradient(ellipse at center, rgba(37, 99, 235, 0.12) 0%, rgba(0, 0, 0, 0.03) 50%, transparent 70%)",
          filter: "blur(32px)",
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
          className="w-[200px] sm:w-[240px] lg:w-[260px] h-auto object-contain relative z-10 pointer-events-none drop-shadow-[0_10px_24px_rgba(0,0,0,0.12)]"
          draggable={false}
        />

        {/* Responsive Interactive Wide-Awake Face Container */}
        <div
          className="absolute z-20 flex flex-col items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
          style={{
            top: "48%",
            left: "52%",
            transform: `translate(calc(-50% + ${smoothPos.x * 15}px), calc(-50% + ${smoothPos.y * 13}px))`,
            willChange: "transform",
          }}
        >
          {/* Eyebrows */}
          <div className="flex items-center gap-6 sm:gap-7 mb-1.5 opacity-90 transition-all duration-200">
            <div
              className="w-[18px] sm:w-[20px] h-[2.5px] bg-[#111827] rounded-full transition-transform duration-150"
              style={{ transform: `rotate(${-5 + smoothPos.x * 8}deg) translateY(${isMoving ? -1.5 : 0}px)` }}
            />
            <div
              className="w-[18px] sm:w-[20px] h-[2.5px] bg-[#111827] rounded-full transition-transform duration-150"
              style={{ transform: `rotate(${5 + smoothPos.x * 8}deg) translateY(${isMoving ? -1.5 : 0}px)` }}
            />
          </div>

          {/* Glossy Eyes */}
          <div className="relative flex items-center justify-center gap-5 sm:gap-6">
            {/* Left Eye */}
            <div className="w-[22px] sm:w-[24px] h-[22px] sm:h-[24px] rounded-full bg-[#111827] relative shadow-sm overflow-hidden">
              <div className="w-[8px] h-[8px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
              <div className="w-[3.5px] h-[3.5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
            </div>

            {/* Right Eye */}
            <div className="w-[22px] sm:w-[24px] h-[22px] sm:h-[24px] rounded-full bg-[#111827] relative shadow-sm overflow-hidden">
              <div className="w-[8px] h-[8px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
              <div className="w-[3.5px] h-[3.5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
            </div>
          </div>

          {/* Mouth */}
          <div className="mt-1.5 opacity-95 transition-all duration-150">
            {isMoving ? (
              <svg width="20" height="10" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="7" r="5" fill="#111827" />
              </svg>
            ) : (
              <svg width="22" height="10" viewBox="0 0 30 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M 4 2 Q 15 12 26 2" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" fill="none" />
              </svg>
            )}
          </div>
        </div>
      </div>

      {/* Interactive Sub-Label */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-[#E4E4E7] text-[11px] text-[#52525B] pointer-events-none shadow-sm backdrop-blur-sm">
        <Sparkles size={10} className="text-black" />
        <span className="font-semibold text-black tracking-wider uppercase">Zyra Intelligence</span>
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
    <footer className="relative w-full bg-white text-[#18181B] font-sans select-none border-t border-[#E4E4E7]">
      
      {/* ═══ CENTERED FOOTER CONTAINER (GITHUB-STYLE STRUCTURE IN PURE WHITE) ═══ */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <div className="w-full bg-white border border-[#E4E4E7] rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden">
          
          {/* ── TOP SECTION: WEAVLY BRANDING (LEFT) + NEWSLETTER (RIGHT) ── */}
          <div className="px-6 sm:px-10 py-6 border-b border-[#E4E4E7] flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[#FAFAFA]">
            
            {/* Branding & Mission */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
              <div
                onClick={() => handleLinkClick("/")}
                className="hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer p-0 select-none"
                role="button"
                tabIndex={0}
                aria-label={`${branding.name} home`}
              >
                <WeavlyLogo size="md" showBeta={true} allBlack={true} onBetaClick={onBetaClick} />
              </div>

              <div className="hidden sm:block w-[1px] h-6 bg-[#E4E4E7]" />

              <p className="text-xs sm:text-[13px] text-[#71717A] max-w-md font-normal leading-relaxed">
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
                  className="w-full px-3.5 py-2 rounded-lg bg-white border border-[#D4D4D8] text-black placeholder:text-[#A1A1AA] text-xs focus:outline-none focus:border-black transition-colors shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-[#27272A] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                {subscribed ? (
                  <>
                    <Check size={13} className="text-white" />
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
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#E4E4E7]">
            
            {/* LEFT 4-COLUMN NAVIGATION (8 Columns on desktop) */}
            <div className="lg:col-span-8 p-6 sm:p-10 grid grid-cols-2 sm:grid-cols-4 gap-8">
              
              {/* Column 1: PRODUCT */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">
                  Product
                </h4>
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/market")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      All Products
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/men")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Men's Sartorial
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/women")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Women's Atelier
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/unisex")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Unisex Drops
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/new-arrivals")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      New Arrivals
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 2: ATELIER */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">
                  Atelier
                </h4>
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/designers")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Discover Designers
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/designs")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Creator Lookbooks
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/custom-design")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Commission Garment
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/designer-studio")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Designer Studio
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/become-designer")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Become a Designer
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 3: WARDROBE */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">
                  Wardrobe
                </h4>
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/wardrobe")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] flex items-center gap-1.5 group">
                      <Sparkles size={11} className="text-black group-hover:scale-125 transition-transform" />
                      <span>Zyra Wardrobe</span>
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/account")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      My Account
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/orders")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      My Orders
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/bag")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Shopping Bag
                    </button>
                  </li>
                </ul>
              </div>

              {/* Column 4: POLICIES */}
              <div className="space-y-4">
                <h4 className="text-[11px] font-bold uppercase tracking-[0.18em] text-black">
                  Policies
                </h4>
                <ul className="space-y-2.5 font-medium p-0 m-0 list-none text-xs">
                  <li>
                    <button onClick={() => handleLinkClick("/privacy")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Privacy Policy
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/terms")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Terms of Service
                    </button>
                  </li>
                  <li>
                    <button onClick={() => handleLinkClick("/faq")} className="hover:text-black hover:translate-x-0.5 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left text-[#52525B] block">
                      Help & FAQs
                    </button>
                  </li>
                  <li>
                    <span className="text-[#71717A] text-xs flex items-center gap-1.5 pt-1">
                      <ShieldCheck size={12} className="text-black" />
                      <span>Verified Atelier</span>
                    </span>
                  </li>
                </ul>
              </div>

            </div>

            {/* RIGHT DEDICATED ZYRA MASCOT VISUAL AREA (4 Columns on desktop) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex items-center justify-center bg-[#FBFBFC] relative overflow-hidden">
              <ZyraFooterCharacter />
            </div>

          </div>

          {/* ── BOTTOM SECTION: LEGAL / COPYRIGHT (LEFT) + LANGUAGE & BACK TO TOP (RIGHT) ── */}
          <div className="px-6 sm:px-10 py-4 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#FAFAFA] text-xs text-[#71717A]">
            
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <span>&copy; {currentYear} {branding.name}, Inc.</span>
              <span className="hidden sm:inline text-[#D4D4D8]">•</span>
              <button onClick={() => handleLinkClick("/privacy")} className="hover:text-black transition-colors border-none bg-transparent cursor-pointer p-0 text-[#71717A] text-xs">
                Privacy Policy
              </button>
              <button onClick={() => handleLinkClick("/terms")} className="hover:text-black transition-colors border-none bg-transparent cursor-pointer p-0 text-[#71717A] text-xs">
                Terms of Service
              </button>
            </div>

            <div className="flex items-center gap-4">
              {/* Language Selector */}
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white hover:bg-[#F4F4F6] border border-[#E4E4E7] text-[#52525B] text-xs transition-colors cursor-pointer shadow-sm"
              >
                <Globe size={12} className="text-[#71717A]" />
                <span>English (US)</span>
                <span className="text-[10px] text-[#A1A1AA]">▾</span>
              </button>

              {/* Back to Top */}
              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 text-xs text-[#52525B] hover:text-black transition-colors border-none bg-transparent cursor-pointer p-0 font-medium group"
              >
                <span>Back to top</span>
                <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}