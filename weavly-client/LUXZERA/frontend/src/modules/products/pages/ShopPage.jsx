"use client";

// src/pages/ShopPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// Weavly — Collection Page
// • Clean typography printed directly on a flat sheet of warm stone paper
// • Strict Department Gender Lock (Women page shows 100% Women items, Men shows 100% Men items)
// • Dynamic category sections for Dresses, Tops, Skirts, Handbags, Footwear
// ──────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import ProductCard from "@/modules/products/components/ProductCard";
import FiltersSidebar from "@/modules/products/components/FiltersSidebar";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";
import { getPaginatedProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { recordSearchActivity } from "@/modules/user/services/userActivityService";

const CATEGORIES = ["All", "Tops", "Bottoms", "Outerwear"];
const SIZES      = ["XS", "S", "M", "L", "XL", "XXL"];
const PRICE_STEPS = [50, 75, 100, 125, 150, 200, 500, 1000, 5000];
const SORT_OPTIONS = [
  { label: "Featured",          value: "featured"   },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "New Arrivals",      value: "newest"     },
];

// Friendly display labels per department
const DEPT_CATEGORY_LABELS = {
  Men:    { All: "All", Tops: "Shirts & Tops",   Bottoms: "Pants",          Outerwear: "Jackets"   },
  Women:  { All: "All", Tops: "Tops & Blouses",  Bottoms: "Skirts & Pants", Outerwear: "Outerwear" },
  Unisex: { All: "All", Tops: "Tops",            Bottoms: "Bottoms",        Outerwear: "Outerwear" },
  All:    { All: "All", Tops: "Tops",            Bottoms: "Bottoms",        Outerwear: "Outerwear" },
};

const DEPT_META = {
  All:    { title: "FOR",       suffix: "YOU" },
  Men:    { title: "MEN'S",     suffix: "COLLECTION" },
  Women:  { title: "WOMEN'S",   suffix: "COLLECTION" },
  Unisex: { title: "UNISEX'S",  suffix: "COLLECTION" },
  Kids:   { title: "KIDS'",     suffix: "COLLECTION" },
};

const DEPT_HERO_CONFIG = {
  Men: {
    bgColor: "bg-[#CFE2EE]",
    title: "Men's Sartorial & Tailored Wear",
    desc: "Discover quality fashion that reflects your style with unique items for everyday elegance.",
    discount: "50%",
    discountLabel: "OFF",
    heroImage: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80",
    card1Title: "Tailored Blazers",
    card1Link: "/market?gender=Men&category=jacket",
    card1Image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
    card2Title: "Leather Derbys & Shoes",
    card2Link: "/market?gender=Men&category=shoes",
    card2Image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80"
  },
  Women: {
    bgColor: "bg-[#EAE8E3]",
    title: "Women's Summer Elegance & Silk",
    desc: "Curated silk blazers, pleated skirts, and timeless leather accessories for modern sophistication.",
    discount: "NEW",
    discountLabel: "ARRIVALS",
    heroImage: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80",
    card1Title: "Structured Leather Handbags",
    card1Link: "/market?gender=Women&category=bag",
    card1Image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80",
    card2Title: "Dresses & Skirts",
    card2Link: "/market?gender=Women&category=dress",
    card2Image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80"
  },
  Unisex: {
    bgColor: "bg-[#E2E8F0]",
    title: "Sneakers & Streetwear Drops",
    desc: "Exclusive limited drops, premium leather sneakers, and unisex minimalist staples.",
    discount: "LIMIT",
    discountLabel: "EDITION",
    heroImage: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=80",
    card1Title: "Performance Shoes",
    card1Link: "/market?category=shoes",
    card1Image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
    card2Title: "Heavyweight Tees",
    card2Link: "/market?category=tshirt",
    card2Image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
  },
  All: {
    bgColor: "bg-[#F2F0ED]",
    title: "Weavly Family Studio Collection",
    desc: "Explore complete curated looks and statement pieces designed for everyday distinction.",
    discount: "2026",
    discountLabel: "LOOKBOOK",
    heroImage: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=80",
    card1Title: "High-Fashion Apparel",
    card1Link: "/market",
    card1Image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    card2Title: "Luxury Accessories",
    card2Link: "/market?category=shoes",
    card2Image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  }
};

function ShopPageContent({ initialDepartment = "All" }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const query = searchParams?.get("q")?.trim() || "";
  const categoryParam = searchParams?.get("category")?.trim() || "";
  const genderParam = searchParams?.get("gender")?.trim() || "";
  const { user } = useAuth();

  // Derive gender from user profile for server-side filtering on generic pages
  const userGender = (() => {
    const g = (user?.gender || "").toLowerCase();
    if (["male", "men", "man", "boy"].includes(g)) return "male";
    if (["female", "women", "woman", "girl"].includes(g)) return "female";
    return null;
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeCat,    setActiveCat]    = useState("All");
  const [activeSizes,  setActiveSizes]  = useState([]);
  const [activeBrand,  setActiveBrand]  = useState("All");
  const [priceMax,     setPriceMax]     = useState(5000);
  const [sortBy,       setSortBy]       = useState("featured");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [productError, setProductError] = useState("");
  const loadMoreTriggerRef = useRef(null);

  // Reset category when department changes
  useEffect(() => { 
    if (categoryParam) {
      setActiveCat(categoryParam);
    } else {
      setActiveCat("All"); 
    }
  }, [initialDepartment, categoryParam]);

  const clearAll = useCallback(() => {
    setActiveCat("All"); setActiveSizes([]); setActiveBrand("All"); setPriceMax(5000);
  }, []);

  // Initial products load with AbortController and request cancellation
  const initialLoadAbortRef = useRef(null);

  const resolveEffectiveDept = useCallback(() => {
    if (genderParam) return genderParam;
    if (initialDepartment && initialDepartment !== "All") return initialDepartment;
    if (query) return undefined;
    if (userGender === "male") return "Men";
    if (userGender === "female") return "Women";
    return undefined;
  }, [genderParam, initialDepartment, query, userGender]);

  useEffect(() => {
    if (initialLoadAbortRef.current) {
      initialLoadAbortRef.current.abort();
    }
    const controller = new AbortController();
    initialLoadAbortRef.current = controller;

    const loadInitialProducts = async () => {
      setLoadingProducts(true);
      setProductError("");
      try {
        const effectiveDept = resolveEffectiveDept();
        const res = await getPaginatedProducts({
          limit: 48,
          offset: 0,
          gender: effectiveDept,
          category: categoryParam || undefined,
          search: query || undefined,
        }, { signal: controller.signal });

        if (!controller.signal.aborted) {
          setProducts(res.products || []);
          setHasMore(res.hasMore);
          if (query) {
            recordSearchActivity(query, res.products?.length || 0);
          }
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Product API error:", error);
          setProducts([]);
          setHasMore(false);
          setProductError("Unable to load products. Please check server connection.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoadingProducts(false);
        }
      }
    };

    loadInitialProducts();
    return () => {
      controller.abort();
    };
  }, [resolveEffectiveDept, categoryParam, query]);

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loadingProducts) return;
    setLoadingMore(true);
    try {
      const effectiveDept = resolveEffectiveDept();
      const res = await getPaginatedProducts({
        limit: 48,
        offset: products.length,
        gender: effectiveDept,
        category: categoryParam || undefined,
        search: query || undefined,
      });
      if (res.products && res.products.length > 0) {
        setProducts((prev) => {
          const ids = new Set(prev.map((x) => x.id));
          const fresh = res.products.filter((x) => !ids.has(x.id));
          return [...prev, ...fresh];
        });
        setHasMore(res.hasMore);
      } else {
        setHasMore(false);
      }
    } catch (e) {
      console.error("Failed to load more products:", e);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, loadingProducts, products.length, resolveEffectiveDept, categoryParam, query]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: "400px" }
    );
    const el = loadMoreTriggerRef.current;
    if (el) observer.observe(el);
    return () => {
      if (el) observer.unobserve(el);
    };
  }, [loadMore]);

  // ── Filtered & sorted products ─────────────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...products].filter((p) => p.price <= priceMax);
    
    // Strict Department-Level Gender Lock
    const effectiveDept = resolveEffectiveDept();
    if (effectiveDept === "Women") {
      list = list.filter((p) => {
        const pg = (p.gender || p.department || "").toLowerCase().trim();
        const name = (p.name || "").toLowerCase();
        if (pg.includes("men") || pg.includes("male") || pg.includes("kid") || pg.includes("boy")) return false;
        if (name.includes("men ") || name.includes(" men") || name.includes("boy")) return false;
        return ["female", "women", "woman"].includes(pg) || (pg === "unisex" && !name.includes("men"));
      });
    } else if (effectiveDept === "Men") {
      list = list.filter((p) => {
        const pg = (p.gender || p.department || "").toLowerCase().trim();
        const name = (p.name || "").toLowerCase();
        if (pg.includes("women") || pg.includes("female") || pg.includes("kid") || pg.includes("girl")) return false;
        if (name.includes("women") || name.includes("dress") || name.includes("girl")) return false;
        return ["male", "men", "man"].includes(pg) || (pg === "unisex" && !name.includes("women"));
      });
    }

    if (activeCat !== "All") {
      const matchCat = activeCat.toLowerCase();
      list = list.filter((p) => (p.category || "").toLowerCase().includes(matchCat) || (p.name || "").toLowerCase().includes(matchCat));
    }
    if (activeBrand !== "All") list = list.filter((p) => p.brand === activeBrand);
    if (activeSizes.length) list = list.filter((p) => activeSizes.some((s) => p.sizes?.includes(s)));
    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, priceMax, resolveEffectiveDept, activeCat, activeBrand, activeSizes, sortBy]);

  const categorySections = useMemo(() => {
    let list = [...products];
    const effectiveDept = resolveEffectiveDept();

    if (effectiveDept === "Women") {
      list = list.filter((p) => {
        const pg = (p.gender || p.department || "").toLowerCase().trim();
        const name = (p.name || "").toLowerCase();
        if (pg.includes("men") || pg.includes("male") || pg.includes("kid") || pg.includes("boy")) return false;
        if (name.includes("men ") || name.includes(" men") || name.includes("boy")) return false;
        return ["female", "women", "woman"].includes(pg) || (pg === "unisex" && !name.includes("men"));
      });

      const groups = [
        { id: "Dresses", title: "Dresses & Gowns", subtitle: "Fit & flare silhouettes, midi dresses & eveningwear", items: [] },
        { id: "Tops", title: "Tops & Blouses", subtitle: "Linen tops, silk blouses & knitwear", items: [] },
        { id: "Bottoms", title: "Skirts & Trousers", subtitle: "Structured skirts, tailored pants & denim", items: [] },
        { id: "Footwear", title: "Footwear & Handbags", subtitle: "Handcrafted heels, flats, totes & jewellery", items: [] },
      ];

      list.forEach((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        if (cat.includes("dress") || name.includes("dress") || name.includes("gown") || name.includes("saree") || name.includes("lehenga") || name.includes("playsuit")) {
          groups[0].items.push(p);
        } else if (cat.includes("top") || cat.includes("shirt") || cat.includes("tee") || name.includes("top") || name.includes("blouse")) {
          groups[1].items.push(p);
        } else if (cat.includes("skirt") || cat.includes("pant") || cat.includes("trouser") || cat.includes("jean") || name.includes("skirt")) {
          groups[2].items.push(p);
        } else {
          groups[3].items.push(p);
        }
      });
      return groups.filter((g) => g.items.length > 0);
    } else if (effectiveDept === "Men") {
      list = list.filter((p) => {
        const pg = (p.gender || p.department || "").toLowerCase().trim();
        const name = (p.name || "").toLowerCase();
        if (pg.includes("women") || pg.includes("female") || pg.includes("kid") || pg.includes("girl")) return false;
        if (name.includes("women") || name.includes("dress") || name.includes("girl")) return false;
        return ["male", "men", "man"].includes(pg) || (pg === "unisex" && !name.includes("women"));
      });

      const groups = [
        { id: "Outerwear", title: "Tailored Blazers & Outerwear", subtitle: "Structured blazers, overcoats & jackets", items: [] },
        { id: "Shirts", title: "Oxford Shirts & Polos", subtitle: "Crisp cotton shirts, linen tops & knit polos", items: [] },
        { id: "Bottoms", title: "Trousers, Chinos & Denim", subtitle: "Pleated formal trousers & slim-fit jeans", items: [] },
        { id: "Footwear", title: "Leather Footwear & Accessories", subtitle: "Handcrafted derbys, loafers & belts", items: [] },
      ];

      list.forEach((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        if (cat.includes("jacket") || cat.includes("blazer") || cat.includes("outerwear") || name.includes("blazer") || name.includes("jacket")) {
          groups[0].items.push(p);
        } else if (cat.includes("shirt") || cat.includes("tshirt") || cat.includes("polo") || name.includes("shirt") || name.includes("polo")) {
          groups[1].items.push(p);
        } else if (cat.includes("trouser") || cat.includes("pant") || cat.includes("jean") || cat.includes("chino")) {
          groups[2].items.push(p);
        } else {
          groups[3].items.push(p);
        }
      });
      return groups.filter((g) => g.items.length > 0);
    } else {
      const groups = [
        { id: "Outerwear", title: "Outerwear & Jackets", subtitle: "Tailored blazers, coats & jackets", items: [] },
        { id: "Tops", title: "Shirts & Tops", subtitle: "Structured tees, linen tops & knitwear", items: [] },
        { id: "Bottoms", title: "Pants & Bottoms", subtitle: "Pleated trousers, cargo pants & shorts", items: [] },
        { id: "Footwear", title: "Footwear & Accessories", subtitle: "Minimalist sneakers, loafers & bags", items: [] }
      ];

      list.forEach((p) => {
        const cat = (p.category || "").toLowerCase();
        if (cat.includes("outerwear") || cat.includes("jacket") || cat.includes("blazer")) {
          groups[0].items.push(p);
        } else if (cat.includes("top") || cat.includes("shirt") || cat.includes("tee")) {
          groups[1].items.push(p);
        } else if (cat.includes("bottom") || cat.includes("pant") || cat.includes("short") || cat.includes("skirt")) {
          groups[2].items.push(p);
        } else {
          groups[3].items.push(p);
        }
      });
      return groups.filter((g) => g.items.length > 0);
    }
  }, [products, resolveEffectiveDept]);

  const meta = DEPT_META[initialDepartment] || DEPT_META.All;
  const heroConfig = DEPT_HERO_CONFIG[initialDepartment] || DEPT_HERO_CONFIG.All;

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 md:space-y-16">
        
        {/* ── BENTO HERO BANNER (Matches Homepage Style) ── */}
        {/* ── TOP HERO / SEARCH HEADER ── */}
        {query ? (
          <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] tracking-tight">
                Results for &ldquo;<span className="text-[#111111]">{query}</span>&rdquo;
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F2F2F7] text-[#71717A] font-semibold border border-[#E5E5EA]">
                {displayed.length} items
              </span>
            </div>
            <button
              onClick={() => router.push(pathname)}
              className="text-xs font-semibold text-[#8E8E93] hover:text-[#1D1D1F] transition-colors cursor-pointer py-1 px-2.5 rounded-md hover:bg-[#F2F2F7]"
            >
              Clear search ✕
            </button>
          </div>
        ) : (
          <>
            {/* Main Hero Bento */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              <div className={`lg:col-span-8 ${heroConfig.bgColor} rounded-[28px] md:rounded-[36px] p-6 sm:p-10 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[400px] md:min-h-[460px] shadow-xs`}>
                <div className="flex items-start justify-between gap-4 z-10">
                  <div className="max-w-md">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] leading-[1.05] tracking-tight">
                      {heroConfig.title}
                    </h1>
                    <p className="mt-4 text-xs sm:text-sm text-[#37352F]/80 leading-relaxed max-w-xs font-medium">
                      {heroConfig.desc}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-3xl sm:text-4xl md:text-5xl font-black text-[#111111] tracking-tight block">
                      {heroConfig.discount}
                    </span>
                    <span className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#37352F] block -mt-1">
                      {heroConfig.discountLabel}
                    </span>
                  </div>
                </div>

                <img
                  src={heroConfig.heroImage}
                  alt={heroConfig.title}
                  className="absolute right-0 bottom-0 w-1/2 md:w-5/12 h-full object-cover object-top opacity-90 mix-blend-multiply pointer-events-none"
                />
              </div>

              <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
                <div
                  onClick={() => heroConfig.card1Link && router.push(heroConfig.card1Link)}
                  className="bg-[#F2F0ED] rounded-[28px] p-5 relative overflow-hidden h-[200px] md:h-[220px] flex flex-col justify-between group shadow-xs cursor-pointer border border-[#183B56]/20 hover:border-[#183B56] transition-all"
                >
                  <img
                    src={heroConfig.card1Image}
                    alt={heroConfig.card1Title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="z-10 bg-white/95 backdrop-blur-sm self-start px-3 py-1 rounded-full text-xs font-bold text-[#183B56] border border-[#183B56]/30 flex items-center gap-1">
                    <span>{heroConfig.card1Title}</span>
                    <span>→</span>
                  </div>
                </div>

                <div
                  onClick={() => heroConfig.card2Link && router.push(heroConfig.card2Link)}
                  className="bg-[#F2F0ED] rounded-[28px] p-5 relative overflow-hidden h-[200px] md:h-[220px] flex flex-col justify-between group shadow-xs cursor-pointer border border-[#183B56]/20 hover:border-[#183B56] transition-all"
                >
                  <img
                    src={heroConfig.card2Image}
                    alt={heroConfig.card2Title}
                    className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="z-10 bg-white/95 backdrop-blur-sm self-start px-3 py-1 rounded-full text-xs font-bold text-[#183B56] border border-[#183B56]/30 flex items-center gap-1">
                    <span>{heroConfig.card2Title}</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ── ZERA PERSONALIZED RECOMMENDATIONS SECTION ── */}
            <ZeraRecommendationsSection
              title={`${initialDepartment && initialDepartment !== "All" ? initialDepartment : "Curated"} Recommendations`}
              subtitle={`Personalized For You • ${initialDepartment || "All"}`}
              genderFilter={initialDepartment !== "All" ? initialDepartment : undefined}
            />
          </>
        )}

        {/* ── PRODUCT GRID / SECTIONS ── */}
        <div className="space-y-16 pt-4">
          {query || activeCat !== "All" ? (
            /* Search / Filter Results Direct Relevance Grid */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-[#183B56] uppercase tracking-tight">
                  {query ? `Search: "${query}"` : `${activeCat} Collection`} ({displayed.length} Pieces)
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {displayed.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          ) : (
            /* Stacked Category Sections for Catalog Browsing */
            categorySections.map((group) => (
              <section key={group.id} className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#183B56]/20 pb-3">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#183B56] uppercase tracking-tight">
                      {group.title}
                    </h2>
                    <p className="text-xs font-medium text-[#5A7184] mt-0.5">{group.subtitle} • {group.items.length} items</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {group.items.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            ))
          )}

          {/* ── INFINITE SCROLL TRIGGER & STATUS ── */}
          <div ref={loadMoreTriggerRef} className="py-8 flex flex-col items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-[#183B56] text-[#183B56] text-xs font-bold shadow-2xs uppercase tracking-wider">
                <Loader2 size={16} className="animate-spin text-[#183B56]" />
                <span>Loading more luxury pieces...</span>
              </div>
            )}
            {!hasMore && displayed.length > 0 && (
              <div className="flex items-center gap-3 py-6 text-[#5A7184] text-xs font-bold tracking-widest uppercase">
                <div className="w-12 h-px bg-[#183B56]/20" />
                <span>End of Curated Selection</span>
                <div className="w-12 h-px bg-[#183B56]/20" />
              </div>
            )}
          </div>

          {displayed.length === 0 && !loadingProducts && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#183B56] mb-2">
                No products found
              </h3>
              <p className="text-xs text-[#5A7184] max-w-sm mb-6">
                We couldn&apos;t find any items matching your selected filters. Try broadening your criteria.
              </p>
              <button
                onClick={clearAll}
                className="py-2.5 px-6 border border-[#183B56] bg-transparent text-[#183B56] text-xs font-bold uppercase tracking-widest hover:bg-[#183B56] hover:text-white transition-all cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ShopPage({ initialDepartment = "All" }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#183B56]" />
      </div>
    }>
      <ShopPageContent initialDepartment={initialDepartment} />
    </Suspense>
  );
}
