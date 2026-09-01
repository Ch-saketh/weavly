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
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const mobileSearchContainerRef = useRef(null);
  const searchAbortControllerRef = useRef(null);
  const activeSearchQueryRef = useRef("");

  const isShopActive = pathname.startsWith("/market") || pathname.startsWith("/shop") || pathname.startsWith("/product");
  const isCollectionsActive = pathname === "/collections" || pathname === "/men" || pathname === "/women" || pathname === "/kids" || pathname === "/unisex";
  const isNewArrivalsActive = pathname === "/new-arrivals";
  const isDesignerActive = pathname.startsWith("/designer") || pathname === "/designers" || pathname === "/designs" || pathname === "/become-designer" || pathname === "/custom-design";

  useEffect(() => {
    setMounted(true);
    getRecentSearches(6).then((items) => setRecentSearches(items || []));
  }, []);

  // Debounced search suggestions fetch with AbortController and race-condition prevention
  useEffect(() => {
    const q = searchQuery.trim();
    activeSearchQueryRef.current = q;

    if (q.length < 2) {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      searchAbortControllerRef.current = controller;

      setIsSearching(true);
      try {
        const results = await getSearchSuggestions(q, 5, { signal: controller.signal });
        // Guarantee only the latest query updates state
        if (activeSearchQueryRef.current === q) {
          setSuggestions(results || []);
          setShowSuggestions(true);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Suggestions error:", err);
        }
      } finally {
        if (activeSearchQueryRef.current === q) {
          setIsSearching(false);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, [searchQuery]);

  // Click outside to dismiss suggestions and close desktop search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setDesktopSearchOpen(false);
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
      setDesktopSearchOpen(false);
      setMobileSearchOpen(false);
      desktopSearchInputRef.current?.blur();
      mobileSearchInputRef.current?.blur();
      onSearch?.(query);
      setMobileOpen(false);
    }
  };

  const handleRecentClick = (q) => {
    setSearchQuery(q);
    recordSearchActivity(q);
    setShowSuggestions(false);
    setDesktopSearchOpen(false);
    setMobileSearchOpen(false);
    desktopSearchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();
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
          <nav className="flex items-center gap-10 lg:gap-14 text-[13px] font-medium tracking-normal text-[#183B56]">

            {/* Dropdown: Collections */}
            <div className="relative group">
              <button
                onClick={() => router.push("/collections")}
                className={`hover:opacity-75 transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-bold ${
                  isCollectionsActive ? "text-[#183B56] underline" : "text-[#183B56]"
                }`}
              >
                <span>Collections</span>
                <ChevronDown size={11} strokeWidth={1.5} className={`transition-colors ${isCollectionsActive ? "text-[#183B56]" : "text-[#5A7184] group-hover:text-[#183B56]"}`} />
              </button>

              {/* Clean Luxury Editorial Dropdown */}
              <div className="absolute top-full -left-20 mt-3 w-[720px] bg-[#F5EFEB] border border-[#183B56] shadow-[0_16px_40px_rgba(24,59,86,0.12)] p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2 font-sans">
                <div className="grid grid-cols-3 gap-6 divide-x divide-[#183B56]/15">
                  
                  {/* Column 1: Men */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] pb-2 border-b border-[#183B56]/15">
                      Men&apos;s Atelier
                    </div>
                    <div className="flex flex-col space-y-1 pt-1">
                      <button onClick={() => router.push("/men")} className="text-left text-xs font-bold text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Men&apos;s Atelier Hub</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Men&category=shirt")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Suits, Shirts & Polos</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Men&category=jacket")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Tailored Blazers & Jackets</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Men&category=trousers")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Trousers & Chinos</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Men&category=shoes")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Leather Derbys & Footwear</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Women */}
                  <div className="space-y-3 pl-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] pb-2 border-b border-[#183B56]/15">
                      Women&apos;s Atelier
                    </div>
                    <div className="flex flex-col space-y-1 pt-1">
                      <button onClick={() => router.push("/women")} className="text-left text-xs font-bold text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Women&apos;s Atelier Hub</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Women&category=dress")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Dresses & Gowns</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Women&category=top")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Tops & Silk Blouses</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Women&category=skirt")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Skirts & Tailored Pants</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market?gender=Women&category=bag")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Footwear & Designer Handbags</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Column 3: Capsules */}
                  <div className="space-y-3 pl-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] pb-2 border-b border-[#183B56]/15">
                      Capsules & Market
                    </div>
                    <div className="flex flex-col space-y-1 pt-1">
                      <button onClick={() => router.push("/unisex")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Streetwear & Unisex</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/new-arrivals")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>New Season Drops</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/market")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Full Catalog & Search</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/wardrobe")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Saved Wardrobe</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
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
                className={`hover:opacity-75 transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-bold ${
                  isNewArrivalsActive ? "text-[#183B56] underline" : "text-[#183B56]"
                }`}
              >
                <span>New Arrivals</span>
              </button>
            </div>

            {/* Dropdown: Designer Studio */}
            <div className="relative group">
              <button
                onClick={() => router.push("/designer-studio")}
                className={`hover:opacity-75 transition-colors border-none bg-transparent cursor-pointer p-0 flex items-center gap-1.5 font-bold ${
                  isDesignerActive ? "text-[#183B56] underline" : "text-[#183B56]"
                }`}
              >
                <span>Designer Studio</span>
                <ChevronDown size={11} strokeWidth={1.5} className={`transition-colors ${isDesignerActive ? "text-[#183B56]" : "text-[#5A7184] group-hover:text-[#183B56]"}`} />
              </button>

              {/* Clean Luxury Editorial Dropdown */}
              <div className="absolute top-full -left-48 mt-3 w-[720px] bg-[#F5EFEB] border border-[#183B56] shadow-[0_16px_40px_rgba(24,59,86,0.12)] p-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top-left group-hover:translate-y-0 translate-y-2 font-sans">
                <div className="grid grid-cols-3 gap-6 divide-x divide-[#183B56]/15">
                  
                  {/* Column 1: Creators & Lookbooks */}
                  <div className="space-y-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] pb-2 border-b border-[#183B56]/15">
                      Creators & Lookbooks
                    </div>
                    <div className="flex flex-col space-y-1 pt-1">
                      <button onClick={() => router.push("/designer-studio")} className="text-left text-xs font-bold text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Studio Overview & Mission</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/designers")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Verified Creators Directory</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/designs")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Curated Lookbooks</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Column 2: Bespoke Commissions */}
                  <div className="space-y-3 pl-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] pb-2 border-b border-[#183B56]/15">
                      Bespoke Commissions
                    </div>
                    <div className="flex flex-col space-y-1 pt-1">
                      <button onClick={() => router.push("/custom-design")} className="text-left text-xs font-bold text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Commission Custom Garment</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/become-designer")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Apply for Atelier Pass</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/designer/login")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Designer Studio Sign In</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                    </div>
                  </div>

                  {/* Column 3: Client Care */}
                  <div className="space-y-3 pl-6">
                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] pb-2 border-b border-[#183B56]/15">
                      Client Care & Escrow
                    </div>
                    <div className="flex flex-col space-y-1 pt-1">
                      <button onClick={() => router.push("/orders")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Track Orders & Escrow</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/about")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>About Weavly Maison</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                      <button onClick={() => router.push("/faqs")} className="text-left text-xs font-medium text-[#183B56] hover:translate-x-1 transition-all border-none bg-transparent p-0 py-1.5 cursor-pointer flex items-center justify-between group">
                        <span>Atelier FAQs & Help</span>
                        <span className="text-[#5A7184] group-hover:text-[#183B56] text-xs transition-colors">→</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </nav>

          {/* ── RIGHT: Minimal Search & Neatly Aligned Action Icons ── */}
          {/* ── RIGHT: Outlined Search Icon & Neatly Aligned Action Icons ── */}
          <div className="flex items-center gap-3.5 shrink-0">
            
            {/* Search: Prominent Outlined Icon Button (Click to Open Search Bar) */}
            {!desktopSearchOpen ? (
              <button
                onClick={() => {
                  setDesktopSearchOpen(true);
                  setTimeout(() => desktopSearchInputRef.current?.focus(), 80);
                }}
                className="w-9 h-9 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-all shadow-xs"
                aria-label="Open search"
                title="Search products & collections"
              >
                <Search size={18} strokeWidth={2} />
              </button>
            ) : (
              /* Expandable Architectural Search Bar */
              <div ref={searchContainerRef} className="relative flex items-center gap-2 animate-in fade-in zoom-in-95 duration-200">
                <form
                  onSubmit={handleSearchSubmit}
                  className="flex items-center h-9 border border-[#183B56] bg-[#F5EFEB] w-[260px] lg:w-[320px] px-3 gap-2 shadow-xs"
                >
                  <Search size={16} className="text-[#183B56] shrink-0" strokeWidth={2} />
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
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search products, styles..."
                    className="min-w-0 flex-1 bg-transparent outline-none text-xs font-bold text-[#183B56] placeholder:text-[#5A7184]/70"
                  />
                  {isSearching ? (
                    <div className="w-3.5 h-3.5 border-2 border-[#183B56] border-t-transparent rounded-full animate-spin shrink-0" />
                  ) : null}
                </form>

                {/* Close Search Button */}
                <button
                  type="button"
                  onClick={() => {
                    setDesktopSearchOpen(false);
                    setShowSuggestions(false);
                  }}
                  className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors"
                  title="Close search"
                >
                  <X size={14} />
                </button>

                {/* Suggestions / Recent Searches Popover */}
                {showSuggestions && (
                  <div className="absolute top-full right-0 mt-2 w-[340px] bg-[#F5EFEB] border border-[#183B56] shadow-xl p-2 z-[120] animate-in fade-in-50 zoom-in-95 duration-150">
                    {/* If user is typing query and has suggestions */}
                    {searchQuery.trim().length >= 2 && suggestions.length > 0 && (
                      <>
                        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#5A7184] tracking-wider border-b border-[#183B56]/20 flex items-center justify-between">
                          <span>Instant Matches</span>
                          <span>{suggestions.length} items</span>
                        </div>

                        <div className="flex flex-col py-1 max-h-[280px] overflow-y-auto divide-y divide-[#183B56]/10">
                          {suggestions.map((item) => (
                            <div
                              key={item.productId}
                              onClick={() => {
                                recordClickActivity(item, "NAVBAR_SUGGESTION");
                                recordSearchActivity(item.name || searchQuery);
                                setShowSuggestions(false);
                                setDesktopSearchOpen(false);
                                router.push(`/product/${item.productId}`);
                              }}
                              className="flex items-center gap-3 p-2 hover:bg-[#183B56]/[0.05] cursor-pointer transition-colors group"
                            >
                              <div className="w-11 h-11 bg-[#DFE7ED] border border-[#183B56] overflow-hidden shrink-0 flex items-center justify-center p-1">
                                {item.imageUrl ? (
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform" />
                                ) : (
                                  <div className="text-[9px] font-bold text-[#5A7184]">WEAVLY</div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-[#183B56] truncate group-hover:underline">{item.name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                  {item.brand && (
                                    <span className="text-[10px] text-[#5A7184] uppercase tracking-wider truncate font-semibold">{item.brand}</span>
                                  )}
                                  <span className="text-xs font-bold text-[#183B56]">
                                    ₹{Number(item.price || 0).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button
                          onClick={handleSearchSubmit}
                          className="w-full mt-1 py-2 px-3 bg-[#183B56] hover:bg-[#102A43] text-white text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors border-none cursor-pointer"
                        >
                          <span>View all results for &ldquo;{searchQuery}&rdquo;</span>
                          <ArrowRight size={12} />
                        </button>
                      </>
                    )}

                    {/* If user is focused on empty/short query and has recent search history */}
                    {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
                      <div>
                        <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[#5A7184] tracking-wider border-b border-[#183B56]/20 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <History size={11} />
                            <span>Recent Searches</span>
                          </span>
                          <button
                            onClick={handleClearHistory}
                            className="text-[10px] font-bold text-[#5A7184] hover:text-[#D9381E] flex items-center gap-1 cursor-pointer transition-colors border-none bg-transparent p-0"
                          >
                            <Trash2 size={10} />
                            <span>Clear</span>
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 p-2.5">
                          {recentSearches.map((q, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                handleRecentClick(q);
                                setDesktopSearchOpen(false);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1 border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] text-[11px] font-bold transition-colors cursor-pointer"
                            >
                              <Clock size={10} />
                              <span>{q}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* When no query and no recent searches */}
                    {searchQuery.trim().length < 2 && recentSearches.length === 0 && (
                      <div className="p-4 text-center text-xs font-semibold text-[#5A7184]">
                        Type to search across brands, products, and categories
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

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
                className="relative w-10 h-10 flex items-center justify-center transition-opacity border-none bg-transparent cursor-pointer text-[#183B56] hover:opacity-75 p-0 select-none"
                aria-label="Shopping bag"
              >
                <ShoppingBag size={24} strokeWidth={1.5} />
                {mounted && cartCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#183B56] text-[8px] font-bold text-white leading-none">
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
                    className="w-10 h-10 flex items-center justify-center focus:outline-none cursor-pointer border-none bg-transparent p-0 text-[#183B56] hover:opacity-80 transition-opacity"
                    aria-label="User profile menu"
                  >
                    {profileImage ? (
                      <div className={`w-8 h-8 overflow-hidden bg-[#DFE7ED] border flex items-center justify-center transition-all ${
                        profileOpen ? "border-[#183B56] ring-1 ring-[#183B56]" : "border-[#183B56]/40 hover:border-[#183B56]"
                      }`}>
                        <img src={profileImage} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 flex items-center justify-center bg-[#DFE7ED] border transition-all text-[#183B56] font-bold text-xs ${
                        profileOpen ? "border-[#183B56] ring-1 ring-[#183B56]" : "border-[#183B56]/40 hover:border-[#183B56]"
                      }`}>
                        {profileFullName ? profileFullName.charAt(0).toUpperCase() : <User size={16} strokeWidth={2} />}
                      </div>
                    )}
                  </button>

                  {/* Weavly Architectural Blueprint Profile Dropdown */}
                  {profileOpen && (
                    <>
                      {/* Transparent backdrop for dismiss */}
                      <div
                        className="fixed inset-0 z-40 bg-black/[0.04] transition-opacity"
                        onClick={() => setProfileOpen(false)}
                      />

                      <div
                        className="absolute right-0 mt-3 w-80 z-50 bg-[#F5EFEB] border border-[#183B56] shadow-[0_16px_40px_rgba(24,59,86,0.18)] p-2 animate-in fade-in zoom-in-95 duration-150 ease-out origin-top-right select-none font-sans text-left"
                      >
                        {/* ── User Identity Header Card ── */}
                        <div className="p-3 mb-1.5 bg-white border border-[#183B56] flex items-center gap-3">
                          {profileImage ? (
                            <div className="w-10 h-10 overflow-hidden bg-[#DFE7ED] border border-[#183B56] shrink-0">
                              <img src={profileImage} alt="" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-[#183B56] text-white flex items-center justify-center font-bold text-sm shrink-0 border border-[#183B56]">
                              {profileFullName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-[#183B56] uppercase tracking-wide truncate leading-tight">
                                {profileFullName}
                              </p>
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-[#183B56] text-white text-[9px] font-mono font-bold tracking-wider uppercase border border-[#183B56]">
                                Member
                              </span>
                            </div>
                            <p className="text-[11px] text-[#5A7184] truncate mt-0.5 font-medium">
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
                            className="w-full group flex items-center justify-between px-3 py-2 text-xs font-bold text-[#183B56] hover:bg-white border border-transparent hover:border-[#183B56] transition-all bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-white border border-[#183B56]/30 group-hover:border-[#183B56] flex items-center justify-center text-[#183B56] transition-all">
                                <User size={14} strokeWidth={2} />
                              </div>
                              <span className="uppercase tracking-wider text-[11px]">My Account & Profile</span>
                            </div>
                            <ChevronRight size={13} className="text-[#183B56] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>

                          <button
                            onClick={() => {
                              onOrdersClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-xs font-bold text-[#183B56] hover:bg-white border border-transparent hover:border-[#183B56] transition-all bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-white border border-[#183B56]/30 group-hover:border-[#183B56] flex items-center justify-center text-[#183B56] transition-all">
                                <Package size={14} strokeWidth={2} />
                              </div>
                              <span className="uppercase tracking-wider text-[11px]">Orders & Deliveries</span>
                            </div>
                            <ChevronRight size={13} className="text-[#183B56] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>

                          <button
                            onClick={() => {
                              onWardrobeClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-xs font-bold text-[#183B56] hover:bg-white border border-transparent hover:border-[#183B56] transition-all bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-white border border-[#183B56]/30 group-hover:border-[#183B56] flex items-center justify-center text-[#183B56] transition-all">
                                <img src="/zyra_SVG.svg" alt="Wardrobe" className="w-4 h-4 object-contain" />
                              </div>
                              <span className="uppercase tracking-wider text-[11px]">Curated Wardrobe</span>
                            </div>
                            <span className="text-[9px] font-bold text-[#183B56] bg-white px-1.5 py-0.5 border border-[#183B56] uppercase tracking-wider">
                              {wardrobeCount > 0 ? `${wardrobeCount} saved` : "Studio"}
                            </span>
                          </button>
                        </div>

                        {/* ── Blueprint Divider ── */}
                        <div className="my-1 border-t border-[#183B56]/20" />

                        {/* ── Group 2: Creator & Atelier Space ── */}
                        <div className="py-0.5 space-y-0.5">
                          <button
                            onClick={() => {
                              onDesignerClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-xs font-bold text-[#183B56] hover:bg-white border border-transparent hover:border-[#183B56] transition-all bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-white border border-[#183B56]/30 group-hover:border-[#183B56] flex items-center justify-center text-[#183B56] transition-all">
                                <Palette size={14} strokeWidth={2} />
                              </div>
                              <span className="uppercase tracking-wider text-[11px]">Designer Studio</span>
                            </div>
                            <span className="text-[9px] font-mono font-bold text-[#5A7184] group-hover:text-[#183B56] transition-colors uppercase">
                              Creator
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              onFaqClick?.();
                              setProfileOpen(false);
                            }}
                            className="w-full group flex items-center justify-between px-3 py-2 text-xs font-bold text-[#183B56] hover:bg-white border border-transparent hover:border-[#183B56] transition-all bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-white border border-[#183B56]/30 group-hover:border-[#183B56] flex items-center justify-center text-[#183B56] transition-all">
                                <HelpCircle size={14} strokeWidth={2} />
                              </div>
                              <span className="uppercase tracking-wider text-[11px]">Help & FAQs</span>
                            </div>
                            <ChevronRight size={13} className="text-[#183B56] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </button>
                        </div>

                        {/* ── Blueprint Divider ── */}
                        <div className="my-1 border-t border-[#183B56]/20" />

                        {/* ── Group 3: Sign Out ── */}
                        <div className="pt-0.5">
                          <button
                            onClick={handleLogout}
                            className="w-full group flex items-center justify-between px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-50 border border-transparent hover:border-red-600 transition-all bg-transparent cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 bg-white border border-red-200 group-hover:border-red-600 flex items-center justify-center text-red-700 transition-all">
                                <LogOut size={13} strokeWidth={2} />
                              </div>
                              <span className="uppercase tracking-wider text-[11px]">Sign Out</span>
                            </div>
                            <span className="text-[10px] font-mono text-red-500 group-hover:text-red-700 transition-colors uppercase">
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
                  className="w-10 h-10 flex items-center justify-center transition-opacity border-none bg-transparent cursor-pointer text-[#183B56] hover:opacity-80 p-0"
                  aria-label="Sign in"
                >
                  <User size={26} strokeWidth={1.75} />
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
              className="w-9 h-9 flex items-center justify-center rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] transition-colors cursor-pointer p-0"
              aria-label="Search products"
            >
              {mobileSearchOpen ? <X size={18} /> : <Search size={18} strokeWidth={2} />}
            </button>

            {/* Mobile Zyra Wardrobe Icon */}
            <button
              onClick={onWardrobeClick}
              className="relative w-9 h-9 flex items-center justify-center rounded-full border border-[#183B56]/30 bg-white hover:bg-[#183B56]/5 transition-colors cursor-pointer p-0 text-[#183B56]"
              aria-label="Zyra Wardrobe"
            >
              <img src="/zyra_SVG.svg" alt="Zyra" className="w-5 h-5 object-contain" />
              {mounted && wardrobeCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#183B56] text-[8px] font-bold text-white leading-none">
                  {wardrobeCount}
                </span>
              )}
            </button>

            {/* Mobile Shopping Bag Icon */}
            <button
              onClick={onCartClick}
              className="relative w-9 h-9 flex items-center justify-center rounded-full border border-[#183B56]/30 bg-white hover:bg-[#183B56]/5 transition-colors cursor-pointer p-0 text-[#183B56]"
              aria-label="Shopping bag"
            >
              <ShoppingBag size={18} strokeWidth={1.75} />
              {mounted && cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#183B56] text-[8px] font-bold text-white leading-none">
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
                menuButtonColor="#183B56"
                openMenuButtonColor="#183B56"
                colors={["#183B56", "#102A43"]}
                accentColor="#183B56"
              />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center">
                <div className="w-5 h-5 rounded-md bg-[#DFE7ED]" />
              </div>
            )}
          </div>
        </div>

        {/* ── EXPANDABLE MOBILE SEARCH BAR ── */}
        {mobileSearchOpen && (
          <div ref={mobileSearchContainerRef} className="px-4 py-3 bg-[#F5EFEB] border-t border-b border-[#183B56] animate-in slide-in-from-top-2 duration-200">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, styles..."
                className="w-full h-10 pl-3 pr-11 bg-[#F5EFEB] border border-[#183B56] text-xs font-bold text-[#183B56] placeholder:text-[#5A7184]/70 outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 w-8 h-8 bg-[#183B56] hover:bg-[#102A43] text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                aria-label="Search"
              >
                <Search size={14} />
              </button>
            </form>

            {/* Mobile Recent Searches Chips */}
            {searchQuery.trim().length < 2 && recentSearches.length > 0 && (
              <div className="mt-2.5 pt-2 border-t border-[#183B56]/20">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#5A7184] tracking-wider mb-2">
                  <span className="flex items-center gap-1">
                    <History size={10} />
                    <span>Recent Searches</span>
                  </span>
                  <button onClick={handleClearHistory} className="text-[10px] font-bold text-[#5A7184] hover:text-[#D9381E] border-none bg-transparent cursor-pointer">
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
                      className="px-2.5 py-1 border border-[#183B56] bg-white text-[#183B56] text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Instant Match Suggestions */}
            {searchQuery.trim().length >= 2 && suggestions.length > 0 && (
              <div className="mt-2.5 max-h-[220px] overflow-y-auto flex flex-col gap-1 border-t border-[#183B56]/20 pt-2">
                {suggestions.map((item) => (
                  <div
                    key={item.productId}
                    onClick={() => {
                      setMobileSearchOpen(false);
                      recordClickActivity(item, "MOBILE_SUGGESTION");
                      recordSearchActivity(item.name || searchQuery);
                      router.push(`/product/${item.productId}`);
                    }}
                    className="flex items-center gap-2.5 p-1.5 hover:bg-[#183B56]/[0.05] cursor-pointer"
                  >
                    <div className="w-9 h-9 bg-[#DFE7ED] border border-[#183B56] overflow-hidden shrink-0 flex items-center justify-center p-0.5">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                      ) : (
                        <div className="text-[8px] font-bold text-[#5A7184]">WEAVLY</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#183B56] truncate">{item.name}</p>
                      <p className="text-xs font-bold text-[#183B56]">
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
