"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ShoppingBag, User, LogOut, X, Menu, Search, ChevronDown, Sparkles, Scissors, Palette, ArrowRight, History, Trash2, Clock, Package, ChevronRight, HelpCircle, Heart, ShieldCheck, Settings } from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import StaggeredMenu from "@/shared/components/ui/StaggeredMenu";
import branding from "@/config/branding";
import { getSearchSuggestions } from "@/modules/products/services/productService";
import { recordSearchActivity, recordClickActivity, getRecentSearches, clearSearchHistory } from "@/modules/user/services/userActivityService";

export default function Navbar({
  cartCount = 0,
  wardrobeCount = 0,
  onLogoClick,
  onShopClick,
  onMenClick,
  onWomenClick,
  onUnisexClick,
  onKidsClick,
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
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const currentCategory = searchParams?.get("category") || "";
  const currentSort = searchParams?.get("sort") || "";
  const currentQuery = searchParams?.get("q") || "";

  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [expandedNav, setExpandedNav] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [mounted, setMounted] = useState(false);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);

  const isShopActive = pathname.startsWith("/market") || pathname.startsWith("/shop") || pathname.startsWith("/product");
  const isCollectionsActive = pathname === "/collections" || pathname === "/men" || pathname === "/women" || pathname === "/kids" || pathname === "/unisex";
  const isNewArrivalsActive = pathname === "/new-arrivals";
  const isDesignerActive = pathname.startsWith("/designer") || pathname === "/designers" || pathname === "/designs" || pathname === "/become-designer" || pathname === "/custom-design";

  useEffect(() => {
    setMounted(true);
    getRecentSearches(6).then((items) => setRecentSearches(items || []));
  }, []);

  // Debounced search suggestions fetch
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await getSearchSuggestions(q, 5);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestions error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    if (event) event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      recordSearchActivity(query);
      setShowSuggestions(false);
      onSearch?.(query);
      setMobileOpen(false);
    }
  };

  const handleRecentClick = (q) => {
    setSearchQuery(q);
    recordSearchActivity(q);
    setShowSuggestions(false);
    onSearch?.(q);
  };

  const handleClearHistory = async (e) => {
    e.stopPropagation();
    await clearSearchHistory();
    setRecentSearches([]);
  };

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setIsScrolled(scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ════════════════════════════════════════════
          EDITORIAL WARM LINEN NAVBAR (OFFICIAL ZERA EMBLEM ICON)
      ════════════════════════════════════════════ */}
      <header
        className={`hidden md:block w-full select-none sticky top-0 z-[100] text-[#183B56] font-sans m-0 p-0 transition-all duration-300 ${
          isScrolled
            ? "bg-[#F5EFEB]/90 backdrop-blur-md border-b border-[#183B56]/15 shadow-xs"
            : "bg-[#F5EFEB]"
        }`}
      >
        <div className="max-w-[1360px] mx-auto h-[70px] px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 flex items-center justify-between gap-8">

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
                onClick={() => router.push("/market")}
                className={`hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium ${
                  isShopActive ? "text-[#F07020]" : "text-[#1D1D1F]"
                }`}
              >
                <span>Shop</span>
                <ChevronDown size={11} strokeWidth={1.5} className={`transition-colors ${isShopActive ? "text-[#F07020]" : "text-[#9B9B9B] group-hover:text-[#F07020]"}`} />
              </button>

              {/* CardNav-Style Dropdown Menu */}
              <div className="absolute top-full -left-8 mt-3 w-[660px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-[#1D1D1F] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#111113] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Apparel</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/market")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${pathname === "/market" && !currentCategory ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> All Clothing
                      </button>
                      <button onClick={() => router.push("/market?category=Outerwear")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${currentCategory === "Outerwear" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Outerwear & Jackets
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#2F293A] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#25202e] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Footwear</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/market?q=boots")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${currentQuery === "boots" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Handmade Boots
                      </button>
                      <button onClick={() => router.push("/market?q=loafers")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${currentQuery === "loafers" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Leather Loafers
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#252836] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#1c1e29] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Outlet</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/market?sort=trending")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${currentSort === "trending" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Best Sellers
                      </button>
                      <button onClick={() => router.push("/market?sort=discount")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${currentSort === "discount" ? "text-[#D9381E] font-semibold" : "text-white/90 hover:text-[#D9381E]"}`}>
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
                onClick={() => router.push("/collections")}
                className={`hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium ${
                  isCollectionsActive ? "text-[#F07020]" : "text-[#1D1D1F]"
                }`}
              >
                <span>Collections</span>
                <ChevronDown size={11} strokeWidth={1.5} className={`transition-colors ${isCollectionsActive ? "text-[#F07020]" : "text-[#9B9B9B] group-hover:text-[#F07020]"}`} />
              </button>

              {/* CardNav-Style Dropdown Menu */}
              <div className="absolute top-full -left-20 mt-3 w-[660px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                <div className="grid grid-cols-3 gap-3">
                  {/* Card 1: Men */}
                  <div className="bg-[#1D1D1F] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#111113] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Men</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/men")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${pathname === "/men" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Suits & Shirts
                      </button>
                      <button onClick={() => router.push("/men")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${pathname === "/men" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Jackets & Pants
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Women */}
                  <div className="bg-[#2F293A] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#25202e] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Women</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/women")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${pathname === "/women" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Dresses & Tops
                      </button>
                      <button onClick={() => router.push("/women")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${pathname === "/women" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Skirts & Handbags
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Capsules */}
                  <div className="bg-[#252836] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#1c1e29] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Capsules</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/unisex")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${pathname === "/unisex" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
                        <span className="text-[14px]">↗</span> Street Couture
                      </button>
                      <button onClick={() => router.push("/designs")} className={`text-left text-[14px] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5 ${pathname === "/designs" ? "text-[#F07020] font-semibold" : "text-white/90 hover:text-[#F07020]"}`}>
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
                onClick={() => router.push("/new-arrivals")}
                className={`hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium ${
                  isNewArrivalsActive ? "text-[#F07020]" : "text-[#1D1D1F]"
                }`}
              >
                <span>New Arrivals</span>
              </button>
            </div>

            {/* Dropdown: Designer Studio */}
            <div className="relative group">
              <button
                onClick={() => router.push("/designer-studio")}
                className={`hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-medium ${
                  isDesignerActive ? "text-[#F07020]" : "text-[#1D1D1F]"
                }`}
              >
                <span>Designer Studio</span>
                <ChevronDown size={11} strokeWidth={1.5} className={`transition-colors ${isDesignerActive ? "text-[#F07020]" : "text-[#9B9B9B] group-hover:text-[#F07020]"}`} />
              </button>

              {/* CardNav-Style Dropdown Menu */}
              <div className="absolute top-full -left-48 mt-3 w-[660px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2">
                <div className="grid grid-cols-3 gap-3">
                  {/* Card 1: Creators */}
                  <div className="bg-[#1D1D1F] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#111113] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Creators</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/designer-studio")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Publish Designs
                      </button>
                      <button onClick={() => router.push("/designer-studio")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Set Your Prices
                      </button>
                    </div>
                  </div>

                  {/* Card 2: Studio Pass */}
                  <div className="bg-[#2F293A] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#25202e] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Studio Pass</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/become-designer")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Creator Verification
                      </button>
                      <button onClick={() => router.push("/designer-studio")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Analytics Dashboard
                      </button>
                    </div>
                  </div>

                  {/* Card 3: Apply */}
                  <div className="bg-[#252836] text-white p-5 rounded-xl flex flex-col justify-between h-[200px] select-none hover:bg-[#1c1e29] transition-colors">
                    <div className="text-[22px] font-semibold tracking-tight">Apply</div>
                    <div className="flex flex-col gap-2 mt-auto">
                      <button onClick={() => router.push("/become-designer")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Independent Pass
                      </button>
                      <button onClick={() => router.push("/designer/register")} className="text-left text-[14px] text-white/90 hover:text-[#F07020] transition-colors border-none bg-transparent p-0 cursor-pointer flex items-center gap-1.5">
                        <span className="text-[14px]">↗</span> Join Network
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </nav>

          {/* ── RIGHT: Minimal Search & Neatly Aligned Action Icons ── */}
          <div className="flex items-center gap-5 shrink-0">
            
            {/* Minimalist Search Field with Live Autocomplete Popover */}
            <div ref={searchContainerRef} className="relative">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center h-8 rounded-full border border-[#ECECEC]/80 bg-[#FAFAF9] focus-within:bg-[#FFFFFF] focus-within:border-[#1D1D1F] w-[180px] lg:w-[220px] px-3.5 gap-2 transition-all duration-200"
              >
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(event) => {
                    setSearchQuery(event.target.value);
                    if (event.target.value.trim().length >= 2) {
                      setShowSuggestions(true);
                    }
                  }}
                  onFocus={() => {
                    setShowSuggestions(true);
                  }}
                  placeholder="Search products, brands..."
                  className="min-w-0 flex-1 bg-transparent outline-none text-[12px] font-normal text-[#1D1D1F] placeholder:text-[#A1A1AA] placeholder:font-normal"
                />
                {isSearching ? (
                  <div className="w-3 h-3 border border-[#F07020] border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <Search size={13} strokeWidth={1.5} className="shrink-0 text-[#A1A1AA] cursor-pointer hover:text-[#1D1D1F] transition-colors" onClick={handleSearchSubmit} />
                )}
              </form>

              {/* Suggestions / Recent Searches Dropdown */}
              {showSuggestions && (
                <div className="absolute top-full right-0 mt-2 w-[340px] bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-2xl p-2 z-[120] animate-in fade-in-50 zoom-in-95 duration-150">
                  {/* If user is typing query and has suggestions */}
                  {searchQuery.trim().length >= 2 && suggestions.length > 0 && (
                    <>
                      <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#8E8E93] tracking-wider border-b border-[#F2F2F7] flex items-center justify-between">
                        <span>Instant Matches</span>
                        <span>{suggestions.length} items</span>
                      </div>

                      <div className="flex flex-col py-1 max-h-[280px] overflow-y-auto">
                        {suggestions.map((item) => (
                          <div
                            key={item.productId}
                            onClick={() => {
                              recordClickActivity(item, "NAVBAR_SUGGESTION");
                              recordSearchActivity(item.name || searchQuery);
                              setShowSuggestions(false);
                              router.push(`/product/${item.productId}`);
                            }}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#F8F8F8] cursor-pointer transition-colors group"
                          >
                            <div className="w-11 h-11 rounded-lg bg-[#F2F2F7] overflow-hidden shrink-0 border border-[#ECECEC]/60">
                              {item.imageUrl ? (
                                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-[9px] text-[#A1A1AA]">No Pic</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-medium text-[#1D1D1F] truncate group-hover:text-[#F07020] transition-colors">{item.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {item.brand && (
                                  <span className="text-[10px] text-[#8E8E93] uppercase tracking-wider truncate">{item.brand}</span>
                                )}
                                <span className="text-[11px] font-semibold text-[#1D1D1F]">
                                  ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={handleSearchSubmit}
                        className="w-full mt-1 py-2 px-3 bg-[#FAFAF9] hover:bg-[#F2F2F7] text-[#1D1D1F] hover:text-[#F07020] text-[11px] font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-[#ECECEC]/60 cursor-pointer"
                      >
                        <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                        <ArrowRight size={12} />
                      </button>
                    </>
                  )}

                  {/* If user is focused on empty/short query and has recent search history */}
                  {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
                    <div>
                      <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#8E8E93] tracking-wider border-b border-[#F2F2F7] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <History size={11} />
                          <span>Recent Searches</span>
                        </span>
                        <button
                          onClick={handleClearHistory}
                          className="text-[10px] text-[#8E8E93] hover:text-[#FF3B30] flex items-center gap-1 cursor-pointer transition-colors"
                        >
                          <Trash2 size={10} />
                          <span>Clear</span>
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 p-2.5">
                        {recentSearches.map((q, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleRecentClick(q)}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F2F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-[11px] font-medium transition-colors cursor-pointer"
                          >
                            <Clock size={10} className="text-[#8E8E93]" />
                            <span>{q}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* When no query and no recent searches */}
                  {searchQuery.trim().length < 2 && recentSearches.length === 0 && (
                    <div className="p-4 text-center text-xs text-[#8E8E93]">
                      Type to search across brands, products, and categories
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Action Icons: Zera Wardrobe Emblem, Cart Bag, Profile */}
            <div className="flex items-center gap-1 text-[#1D1D1F]">
              
              {/* Zyra Emblem (Wardrobe) Icon */}
              <button
                onClick={onWardrobeClick}
                className="relative w-10 h-10 flex items-center justify-center transition-colors border-none bg-transparent cursor-pointer text-[#1D1D1F] hover:text-[#F07020] p-0"
                aria-label="Zyra Wardrobe"
                title="Zyra Wardrobe"
              >
                <img src="/zyra_SVG.svg" alt="Zyra Wardrobe" className="w-8 h-8 object-contain transition-transform hover:scale-105" />
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

                  {/* Apple-Level Premium Profile Dropdown */}
                  {profileOpen && (
                    <>
                      {/* Transparent backdrop for dismiss */}
                      <div
                        className="fixed inset-0 z-40 bg-black/[0.02] transition-opacity"
                        onClick={() => setProfileOpen(false)}
                      />

                      <div
                        className="absolute right-0 mt-3 w-80 z-50 bg-white/95 backdrop-blur-2xl border border-black/[0.08] shadow-[0_24px_50px_rgba(0,0,0,0.14),0_6px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.03)] rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-200 ease-out origin-top-right select-none"
                      >
                        {/* ── User Identity Header Card ── */}
                        <div className="p-3 mb-1 bg-[#F5F5F7]/80 rounded-xl flex items-center gap-3 border border-black/[0.04]">
                          {profileImage ? (
                            <div className="w-11 h-11 rounded-full overflow-hidden bg-white ring-2 ring-black/5 shrink-0 shadow-2xs">
                              <img src={profileImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#1D1D1F] to-[#434346] text-white flex items-center justify-center font-semibold text-sm ring-2 ring-black/5 shrink-0 shadow-2xs">
                              {profileFullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-[13px] font-semibold text-[#1D1D1F] truncate leading-tight">
                                {profileFullName}
                              </p>
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-semibold tracking-wide border border-emerald-200/50">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                Member
                              </span>
                            </div>
                            <p className="text-[11px] text-[#86868B] truncate mt-0.5 font-normal">
                              {profileEmail}
                            </p>
                          </div>
                        </div>

                        {/* ── Group 1: Personal Space & Wardrobe ── */}
                        <div className="py-1 space-y-0.5">
                          <button
                            onClick={() => {
                              onAccountClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all border-none bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] group-hover:bg-white flex items-center justify-center text-[#1D1D1F] group-hover:shadow-2xs transition-all">
                                <User size={15} strokeWidth={1.75} />
                              </div>
                              <span>My Account & Measurements</span>
                            </div>
                            <ChevronRight size={13} className="text-[#AEAEB2] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>

                          <button
                            onClick={() => {
                              onOrdersClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all border-none bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] group-hover:bg-white flex items-center justify-center text-[#1D1D1F] group-hover:shadow-2xs transition-all">
                                <Package size={15} strokeWidth={1.75} />
                              </div>
                              <span>My Orders & Deliveries</span>
                            </div>
                            <ChevronRight size={13} className="text-[#AEAEB2] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>

                          <button
                            onClick={() => {
                              onWardrobeClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all border-none bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] group-hover:bg-white flex items-center justify-center text-[#1D1D1F] group-hover:shadow-2xs transition-all">
                                <img src="/zyra.png" alt="Zyra" className="w-3.5 h-3.5 object-contain" />
                              </div>
                              <span>Zyra AI Wardrobe</span>
                            </div>
                            <span className="text-[10px] font-semibold text-[#F07020] bg-[#FFF5EE] px-2 py-0.5 rounded-full border border-[#F07020]/20">
                              {wardrobeCount > 0 ? `${wardrobeCount} saved` : "AI Studio"}
                            </span>
                          </button>
                        </div>

                        {/* ── Apple Divider ── */}
                        <div className="my-1 border-t border-black/[0.06]" />

                        {/* ── Group 2: Creator & Atelier Space ── */}
                        <div className="py-0.5 space-y-0.5">
                          <button
                            onClick={() => {
                              onDesignerClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all border-none bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] group-hover:bg-white flex items-center justify-center text-[#1D1D1F] group-hover:shadow-2xs transition-all">
                                <Palette size={15} strokeWidth={1.75} />
                              </div>
                              <span>Designer Studio</span>
                            </div>
                            <span className="text-[10px] font-medium text-[#86868B] group-hover:text-[#1D1D1F] transition-colors">
                              Creator
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              onFaqClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#1D1D1F] hover:bg-[#F5F5F7] rounded-xl transition-all border-none bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-[#F5F5F7] group-hover:bg-white flex items-center justify-center text-[#1D1D1F] group-hover:shadow-2xs transition-all">
                                <HelpCircle size={15} strokeWidth={1.75} />
                              </div>
                              <span>Help & FAQs</span>
                            </div>
                            <ChevronRight size={13} className="text-[#AEAEB2] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        </div>

                        {/* ── Apple Divider ── */}
                        <div className="my-1 border-t border-black/[0.06]" />

                        {/* ── Group 3: Sign Out ── */}
                        <div className="pt-0.5">
                          <button
                            onClick={handleLogout}
                            className="w-full group flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#E03131] hover:bg-red-50/80 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-red-50 group-hover:bg-white flex items-center justify-center text-[#E03131] group-hover:shadow-2xs transition-all">
                                <LogOut size={14} strokeWidth={1.75} />
                              </div>
                              <span>Sign Out</span>
                            </div>
                            <span className="text-[11px] text-red-400 group-hover:text-red-600 transition-colors">
                              Exit
                            </span>
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

      <header
        className={`md:hidden sticky top-0 z-50 w-full m-0 p-0 transition-all duration-300 ${
          isScrolled
            ? "bg-[#F5EFEB]/90 backdrop-blur-md border-b border-[#183B56]/15 shadow-xs"
            : "bg-[#F5EFEB]"
        }`}
      >
        <div className="w-full h-[64px] px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* LEFT: Weavly Brand Logo (Mochiy Pop One) */}
          <div onClick={onLogoClick} aria-label="Weavly home" className="border-none bg-transparent cursor-pointer p-0 shrink-0">
            <WeavlyLogo size="sm" showBeta={true} onBetaClick={onBetaClick} />
          </div>

          {/* RIGHT: Mobile Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mobile Search Toggle Button */}
            <button
              onClick={() => {
                setMobileSearchOpen(!mobileSearchOpen);
                if (!mobileSearchOpen) {
                  setTimeout(() => mobileSearchInputRef.current?.focus(), 150);
                }
              }}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors border-none cursor-pointer p-0 ${
                mobileSearchOpen ? "bg-[#F07020] text-white" : "bg-[#FAFAF9] text-[#1D1D1F] hover:bg-[#F2F2F7]"
              }`}
              aria-label="Search products"
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} strokeWidth={1.75} />}
            </button>

            {/* Mobile Zyra Wardrobe Icon */}
            <button
              onClick={onWardrobeClick}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#FAFAF9] hover:bg-[#F2F2F7] transition-colors border-none cursor-pointer p-0 text-[#1D1D1F]"
              aria-label="Zyra Wardrobe"
            >
              <img src="/zyra_SVG.svg" alt="Zyra" className="w-5 h-5 object-contain" />
              {mounted && wardrobeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#F07020] text-[8px] font-bold text-white leading-none">
                  {wardrobeCount}
                </span>
              )}
            </button>

            {/* Mobile Shopping Bag Icon */}
            <button
              onClick={onCartClick}
              className="relative w-9 h-9 flex items-center justify-center rounded-full bg-[#FAFAF9] hover:bg-[#F2F2F7] transition-colors border-none cursor-pointer p-0 text-[#1D1D1F]"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={18} strokeWidth={1.75} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#1D1D1F] text-[8px] font-bold text-white leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Staggered MENU Toggle */}
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
                  { label: "Atelier", link: "https://weavly.store" },
                ]}
                displaySocials={true}
                displayItemNumbering={true}
                menuButtonColor="#1D1D1F"
                openMenuButtonColor="#1D1D1F"
                colors={["#1D1D1F", "#F07020"]}
                accentColor="#F07020"
              />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center">
                <div className="w-5 h-5 rounded-md bg-[#F4F4F5]" />
              </div>
            )}
          </div>
        </div>

        {/* ── EXPANDABLE MOBILE SEARCH BAR ── */}
        {mobileSearchOpen && (
          <div ref={mobileSearchContainerRef} className="px-4 py-3 bg-[#FFFFFF] border-t border-[#ECECEC] animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, styles..."
                className="w-full h-11 pl-4 pr-11 bg-[#FAFAF9] border border-[#ECECEC] rounded-xl text-[13px] font-normal text-[#1D1D1F] placeholder:text-[#A1A1AA] outline-none focus:bg-white focus:border-[#1D1D1F] transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 w-8 h-8 rounded-lg bg-[#1D1D1F] hover:bg-[#F07020] text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                aria-label="Search"
              >
                <Search size={14} />
              </button>
            </form>

            {/* Mobile Recent Searches Chips */}
            {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[#F2F2F7]">
                <div className="flex items-center justify-between text-[10px] uppercase font-semibold text-[#8E8E93] tracking-wider mb-2">
                  <span className="flex items-center gap-1">
                    <History size={10} />
                    <span>Recent</span>
                  </span>
                  <button onClick={handleClearHistory} className="text-[10px] text-[#8E8E93] hover:text-[#FF3B30] border-none bg-transparent cursor-pointer">
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMobileSearchOpen(false);
                        handleRecentClick(q);
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#F2F2F7] text-[#1D1D1F] text-[11px] font-medium transition-colors border-none cursor-pointer active:bg-[#E5E5EA]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Instant Match Suggestions */}
            {searchQuery.trim().length >= 2 && suggestions.length > 0 && (
              <div className="mt-2.5 max-h-[220px] overflow-y-auto flex flex-col gap-1 border-t border-[#F2F2F7] pt-2">
                {suggestions.map((item) => (
                  <div
                    key={item.productId}
                    onClick={() => {
                      setMobileSearchOpen(false);
                      recordClickActivity(item, "MOBILE_SUGGESTION");
                      recordSearchActivity(item.name || searchQuery);
                      router.push(`/product/${item.productId}`);
                    }}
                    className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-[#F8F8F8] active:bg-[#F2F2F7] cursor-pointer"
                  >
                    <div className="w-9 h-9 rounded-md bg-[#F2F2F7] overflow-hidden shrink-0">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] text-[#A1A1AA]">Item</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1D1D1F] truncate">{item.name}</p>
                      <p className="text-[11px] font-semibold text-[#1D1D1F]">
                        ₹{Number(item.price || 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
}
