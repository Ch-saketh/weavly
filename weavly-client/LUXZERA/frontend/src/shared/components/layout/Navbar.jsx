"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, User, LogOut, X, Menu, Search, ChevronDown, Sparkles, Scissors, Palette } from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import StaggeredMenu from "@/shared/components/ui/StaggeredMenu";
import branding from "@/config/branding";

export default function Navbar({
  cartCount = 0,
  wardrobeCount = 0,
  onLogoClick,
  onShopClick,
  onMenClick,
  onWomenClick,
  onUnisexClick,
  onFaqClick,
  onCartClick,
  onWardrobeClick,
  onAuthClick,
  currentPage,
  currentUser,
  authLoading,
  onAccountClick,
  onOrdersClick,
  onLogout,
  onSearch,
  onDesignerClick,
  onBetaClick,
}) {
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const desktopSearchInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileImage = currentUser?.profilePicture || currentUser?.avatarUrl || null;
  const profileFullName = currentUser?.firstName
    ? `${currentUser.firstName} ${currentUser.lastName || ""}`.trim()
    : "My Account";
  const profileEmail = currentUser?.email || "";

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    onLogout?.();
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      onSearch?.(query);
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* ════════════════════════════════════════════
          PURE WHITE EDITORIAL NAVBAR (OFFICIAL ZERA EMBLEM ICON)
      ════════════════════════════════════════════ */}
      <header className="hidden md:block w-full select-none sticky top-0 z-[100] bg-[#FFFFFF] border-b border-[#ECECEC] text-[#1D1D1F] font-sans m-0 p-0">
        <div className="h-[70px] w-full px-6 sm:px-8 lg:px-10 flex items-center justify-between gap-8">

          {/* ── LEFT: Brand Logo ── */}
          <div className="flex items-center shrink-0">
            <div 
              onClick={onLogoClick} 
              role="button"
              tabIndex={0}
              aria-label={`${branding.name} home`} 
              className="hover:opacity-75 transition-opacity flex items-center shrink-0 border-none bg-transparent cursor-pointer p-0 select-none"
            >
              <WeavlyLogo showBeta={true} onBetaClick={onBetaClick} />
            </div>
          </div>

          {/* ── CENTER: Navigation Links ── */}
          <nav className="flex items-center gap-10 lg:gap-14 text-[13px] font-medium tracking-normal text-[#1D1D1F]">
            
            {/* Dropdown: Shop */}
            <div className="relative group">
              <button
                onClick={onShopClick}
                className={`hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium ${
                  currentPage === "shop" ? "text-[#F07020]" : "text-[#1D1D1F]"
                }`}
              >
                <span>Shop</span>
                <ChevronDown size={11} strokeWidth={1.5} className="text-[#9B9B9B] group-hover:text-[#F07020] transition-colors" />
              </button>

              {/* CardNav-Style Dropdown Menu */}
              <div className="absolute top-full -left-8 mt-3 w-[660px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1D1D1F] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#111113] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Apparel</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onShopClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> All Clothing
                      </button>
                      <button onClick={() => onMenClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Outerwear & Jackets
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#2F293A] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#25202e] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Footwear</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onShopClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Handmade Boots
                      </button>
                      <button onClick={() => onShopClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Leather Loafers
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#252836] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#1c1e29] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Outlet</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onShopClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Best Sellers
                      </button>
                      <button onClick={() => onShopClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#D9381E] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Seasonal Sale
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dropdown: Collections */}
            <div className="relative group">
              <button
                onClick={onShopClick}
                className="hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium text-[#1D1D1F]"
              >
                <span>Collections</span>
                <ChevronDown size={11} strokeWidth={1.5} className="text-[#9B9B9B] group-hover:text-[#F07020] transition-colors" />
              </button>

              {/* CardNav-Style Dropdown Menu */}
              <div className="absolute top-full -left-20 mt-3 w-[660px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                <div className="grid grid-cols-3 gap-3">
                  {/* Card 1: Men */}
                  <div className="bg-[#1D1D1F] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#111113] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Men</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onMenClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Suits & Shirts
                      </button>
                      <button onClick={() => onMenClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Jackets & Pants
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Women */}
                  <div className="bg-[#2F293A] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#25202e] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Women</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onWomenClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Dresses & Tops
                      </button>
                      <button onClick={() => onWomenClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Skirts & Handbags
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Capsules */}
                  <div className="bg-[#252836] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#1c1e29] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Capsules</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onUnisexClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Street Couture
                      </button>
                      <button onClick={() => onUnisexClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Designer Drops
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dropdown: New Arrivals */}
            <div className="relative group">
              <button
                onClick={() => onSearch?.("new arrivals")}
                className="hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium text-[#1D1D1F]"
              >
                <span>New Arrivals</span>
                <ChevronDown size={11} strokeWidth={1.5} className="text-[#9B9B9B] group-hover:text-[#F07020] transition-colors" />
              </button>

              {/* CardNav-Style Dropdown Menu */}
              <div className="absolute top-full -left-36 mt-3 w-[660px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1D1D1F] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#111113] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Fresh Drops</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onSearch?.("summer 2026")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Summer '26 Capsule
                      </button>
                      <button onClick={() => onSearch?.("runway")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Runway Pre-Orders
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#2F293A] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#25202e] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Trending</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onSearch?.("jackets")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Tailored Outerwear
                      </button>
                      <button onClick={() => onSearch?.("dresses")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Statement Dresses
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#252836] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#1c1e29] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Spotlight</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => onDesignerClick?.()} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Designer Spotlight
                      </button>
                      <button onClick={() => onSearch?.("shoes")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Limited Footwear
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dropdown: Designer Studio */}
            <div className="relative group">
              <button
                onClick={onDesignerClick}
                className="hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium text-[#1D1D1F]"
              >
                <span>Designer Studio</span>
                <ChevronDown size={11} strokeWidth={1.5} className="text-[#9B9B9B] group-hover:text-[#F07020] transition-colors" />
              </button>

              {/* CardNav-Style Dropdown Menu */}
              <div className="absolute top-full -left-48 mt-3 w-[660px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1D1D1F] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#111113] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight font-serif">Discovery</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/designers")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Discover Designers
                      </button>
                      <button onClick={() => router.push("/designs")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Creator Lookbooks
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#2F293A] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#25202e] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight font-serif">Custom Made</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/custom-design")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Commission Garment
                      </button>
                      <button onClick={() => router.push("/designs")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Customize a Piece
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#252836] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#1c1e29] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight font-serif">Atelier Portal</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/designer-studio")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Designer Studio
                      </button>
                      <button onClick={() => router.push("/become-designer")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Become a Designer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </nav>

          {/* ── RIGHT: Minimal Search & Neatly Aligned Action Icons ── */}
          <div className="flex items-center gap-5 shrink-0">
            
            {/* Minimalist Search Field */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center h-8 rounded-full border border-[#ECECEC]/80 bg-[#FAFAF9] focus-within:bg-[#FFFFFF] focus-within:border-[#1D1D1F] w-[180px] lg:w-[210px] px-3.5 gap-2 transition-all duration-200"
            >
              <input
                ref={desktopSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search..."
                className="min-w-0 flex-1 bg-transparent outline-none text-[12px] font-normal text-[#1D1D1F] placeholder:text-[#A1A1AA] placeholder:font-normal"
              />
              <Search size={13} strokeWidth={1.5} className="shrink-0 text-[#A1A1AA] cursor-pointer hover:text-[#1D1D1F] transition-colors" onClick={handleSearchSubmit} />
            </form>

            {/* Action Icons: Zera Wardrobe Emblem, Cart Bag, Profile */}
            <div className="flex items-center gap-1 text-[#1D1D1F]">
              
              {/* Zyra Emblem (Wardrobe) Icon */}
              <button
                onClick={onWardrobeClick}
                className="relative w-10 h-10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer text-[#1D1D1F] hover:text-[#F07020] p-0"
                aria-label="Zyra Wardrobe"
                title="Zyra Wardrobe"
              >
                <img src="/zera_SVG.svg" alt="Zyra Wardrobe" className="w-8 h-8 object-contain transition-transform hover:scale-105" />
                {mounted && wardrobeCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#F07020] text-[8px] font-bold text-white leading-none">
                    {wardrobeCount}
                  </span>
                )}
              </button>

              {/* Shopping Bag Icon */}
              <button
                onClick={onCartClick}
                className="relative w-10 h-10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer text-[#1D1D1F] hover:text-[#F07020] p-0"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={24} strokeWidth={1.5} />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#1D1D1F] text-[8px] font-bold text-white leading-none">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Profile Avatar / Sign In Icon */}
              {!mounted || authLoading ? (
                <div className="w-10 h-10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#F4F4F5] animate-pulse border border-[#ECECEC]" />
                </div>
              ) : currentUser ? (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-10 h-10 flex items-center justify-center focus:outline-none cursor-pointer border-none bg-transparent p-0 text-[#1D1D1F] hover:text-[#F07020]"
                    aria-label="User profile menu"
                  >
                    {profileImage ? (
                      <div className={`w-8 h-8 rounded-full overflow-hidden bg-[#F4F4F5] border border-[#ECECEC] flex items-center justify-center transition-all ${
                        profileOpen ? "border-[#1D1D1F]" : "hover:border-[#1D1D1F]"
                      }`}>
                        <img src={profileImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <User size={28} strokeWidth={1.4} />
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {profileOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                      <div className="absolute right-0 mt-3 w-56 z-50 bg-[#FFFFFF] border border-[#ECECEC] shadow-xs rounded-xl p-1.5 animate-in fade-in duration-200">
                        <div className="px-3 py-2.5 border-b border-[#ECECEC]">
                          <p className="text-xs font-semibold text-[#1D1D1F] truncate">{profileFullName}</p>
                          <p className="text-[11px] text-[#71717A] truncate">{profileEmail}</p>
                        </div>
                        <div className="py-1">
                          <button onClick={() => { onAccountClick?.(); setProfileOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-[#1D1D1F] hover:text-[#F07020] hover:bg-[#FAFAF9] rounded-lg border-none bg-transparent cursor-pointer">
                            My Account
                          </button>
                          <button onClick={() => { onOrdersClick?.(); setProfileOpen(false); }} className="w-full text-left px-3 py-2 text-xs font-medium text-[#1D1D1F] hover:text-[#F07020] hover:bg-[#FAFAF9] rounded-lg border-none bg-transparent cursor-pointer">
                            My Orders
                          </button>
                          <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-xs font-medium text-[#D9381E] hover:bg-red-50 rounded-lg border-none bg-transparent cursor-pointer">
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="w-10 h-10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer text-[#1D1D1F] hover:text-[#F07020] p-0"
                  aria-label="Sign in"
                >
                  <User size={28} strokeWidth={1.4} />
                </button>
              )}

            </div>

          </div>

        </div>
      </header>

      {/* ════════════════════════════════════════════
          MOBILE EDITORIAL NAVBAR WITH STAGGERED MENU (< 768px)
      ════════════════════════════════════════════ */}
      <header className="md:hidden sticky top-0 z-50 bg-[#FFFFFF] border-b border-[#ECECEC] w-full m-0 p-0">
        <div className="w-full h-[64px] px-6 flex items-center justify-between">
          {/* LEFT: Weavly Original Brand Logo */}
          <button onClick={onLogoClick} aria-label="Weavly home" className="border-none bg-transparent cursor-pointer p-0">
            <WeavlyLogo />
          </button>

          {/* RIGHT: Staggered MENU Toggle Button ONLY */}
          <div className="flex items-center">
            {mounted ? (
              <StaggeredMenu
                showToggleOnly={true}
                isFixed={true}
                position="right"
                items={[
                  {
                    label: wardrobeCount > 0 ? `Zyra Wardrobe (${wardrobeCount})` : "Zyra Wardrobe",
                    onClick: () => onWardrobeClick?.()
                  },
                  {
                    label: cartCount > 0 ? `Shopping Bag (${cartCount})` : "Shopping Bag",
                    onClick: () => onCartClick?.()
                  },
                  { label: "Shop All", onClick: () => onShopClick?.() },
                  { label: "Men's Sartorial", onClick: () => onMenClick?.() },
                  { label: "Women's Atelier", onClick: () => onWomenClick?.() },
                  { label: "Discover Designers", onClick: () => router.push("/designers") },
                  { label: "Creator Lookbooks", onClick: () => router.push("/designs") },
                  { label: "Custom Commission", onClick: () => router.push("/custom-design") },
                  { label: "Designer Studio", onClick: () => router.push("/designer-studio") },
                  { label: "Become a Designer", onClick: () => router.push("/become-designer") },
                  ...(currentUser
                    ? [
                        { label: "My Account", onClick: () => onAccountClick?.() },
                        { label: "Orders & History", onClick: () => onOrdersClick?.() },
                        { label: "Log Out", onClick: handleLogout },
                      ]
                    : [
                        { label: "Sign In / Join", onClick: () => onAuthClick?.() },
                      ]),
                ]}

                socialItems={[
                  { label: "Instagram", link: "https://instagram.com" },
                  { label: "Twitter", link: "https://twitter.com" },
                  { label: "Atelier", link: "https://Weavly.com" },
                ]}
                displaySocials={true}
                displayItemNumbering={true}
                menuButtonColor="#1D1D1F"
                openMenuButtonColor="#1D1D1F"
                colors={["#1D1D1F", "#F07020"]}
                accentColor="#F07020"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center">
                <div className="w-6 h-6 rounded-md bg-[#F4F4F5]" />
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
