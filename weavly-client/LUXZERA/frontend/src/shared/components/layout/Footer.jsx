"use client";

import { useRouter } from "next/navigation";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Wordmark from "@/shared/components/branding/Wordmark";
import branding from "@/config/branding";

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

  return (
    <footer className="w-full bg-[#000000] text-white font-sans select-none border-t border-[#222222]">
      {/* Upper Footer Content Container */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-10 pt-16 pb-12 flex flex-col gap-14">
        
        {/* ═══ TOP ROW: Brand Info Left + Link Columns Right ═══ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Left Column: Official Logo + Description */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => handleLinkClick("/")}
              className="hover:opacity-85 transition-opacity inline-flex items-center gap-2 cursor-pointer p-0 select-none"
              role="button"
              tabIndex={0}
              aria-label={`${branding.name} home`}
            >
              <WeavlyLogo size="md" showBeta={true} allWhite={true} onBetaClick={onBetaClick} />
            </div>
            
            <p className="text-xs sm:text-sm text-[#FFFFFF] leading-relaxed max-w-sm font-normal">
              {branding.description}
            </p>
          </div>

          {/* Right Column: Multi-column Navigation Links */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 text-xs">
            
            {/* Column 1: Collections */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Collections
              </h4>
              <ul className="space-y-2 text-[#FFFFFF] font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/market")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/men")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Men's Sartorial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/women")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Women's Atelier
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/unisex")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Unisex Drops
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: Studio & Designers */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Designer Atelier
              </h4>
              <ul className="space-y-2 text-[#FFFFFF] font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/designers")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Discover Designers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designs")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Creator Lookbooks
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/custom-design")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Commission Garment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designer-studio")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Designer Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/become-designer")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    Become a Designer
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Account */}
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FFFFFF]">
                Account
              </h4>
              <ul className="space-y-2 text-[#FFFFFF] font-medium p-0 m-0 list-none">
                <li>
                  <button onClick={() => handleLinkClick("/account")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    My Account
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/orders")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/wardrobe")} className="hover:opacity-80 transition-opacity border-none bg-transparent cursor-pointer p-0 text-left text-white text-xs">
                    {branding.name} Wardrobe
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>

        {/* ═══ MIDDLE BAR: Copyright Left + Year Right ═══ */}
        <div className="pt-6 border-t border-[#222222] flex items-center justify-between text-xs text-[#FFFFFF] font-medium">
          <div>
            Created by <span className="text-white font-semibold cursor-pointer" onClick={() => handleLinkClick("/")}>{branding.legalName}</span>
          </div>
          <div>
            &copy; {currentYear} {branding.name}. All rights reserved.
          </div>
        </div>

      </div>

      {/* ═══ BOTTOM SHOWSTOPPER GIANT PURE WHITE WORDMARK ═══ */}
      <div className="w-full overflow-hidden select-none border-t border-[#222222] leading-none pt-4 pb-2 text-center bg-[#000000]">
        <Wordmark allWhite={true} />
      </div>
    </footer>
  );
}