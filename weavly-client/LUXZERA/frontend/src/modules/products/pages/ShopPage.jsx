"use client";

// src/pages/ShopPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// Weavly — Collection Page
// • Clean typography printed directly on a flat sheet of warm stone paper
// • No background containers, headers, or redundant item count blocks
// • Clean Left Sidebar (using standalone FiltersSidebar component)
// ──────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Loader2 } from "lucide-react";
import ProductCard from "@/modules/products/components/ProductCard";
import FiltersSidebar from "@/modules/products/components/FiltersSidebar";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";
import { getPaginatedProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";

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
    title: "Men's Summer Arrival Outfit",
    desc: "Discover quality fashion that reflects your style with unique items for everyday elegance.",
    discount: "50%",
    discountLabel: "OFF",
    heroImage: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1000&q=80",
    card1Title: "Tailored Jackets",
    card1Image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80",
    card2Title: "Minimalist Sneakers",
    card2Image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80"
  },
  Women: {
    bgColor: "bg-[#EAE8E3]",
    title: "Women's Summer Elegance & Silk",
    desc: "Curated silk blazers, pleated skirts, and timeless leather accessories for modern sophistication.",
    discount: "NEW",
    discountLabel: "ARRIVALS",
    heroImage: "https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=1000&q=80",
    card1Title: "Structured Leather Tote",
    card1Image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80",
    card2Title: "Silk Pleated Skirts",
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
    card1Image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=600&q=80",
    card2Title: "Heavyweight Tees",
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
    card1Image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80",
    card2Title: "Luxury Accessories",
    card2Image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80"
  }
};

function ShopPageContent({ initialDepartment = "All" }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const query = searchParams?.get("q")?.trim() || "";
  const { user } = useAuth();

  // Derive gender from user profile for server-side filtering
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
  useEffect(() => { setActiveCat("All"); }, [initialDepartment]);

  const clearAll = useCallback(() => {
    setActiveCat("All"); setActiveSizes([]); setActiveBrand("All"); setPriceMax(5000);
  }, []);

  // Initial products load
  useEffect(() => {
    let ignore = false;

    const loadInitialProducts = async () => {
      setLoadingProducts(true);
      setProductError("");
      try {
        const effectiveDept = initialDepartment !== "All" ? initialDepartment : (userGender === "male" ? "men" : userGender === "female" ? "women" : undefined);
        const res = await getPaginatedProducts({
          limit: 24,
          offset: 0,
          gender: effectiveDept,
          search: query || undefined,
        });
        if (!ignore) {
          setProducts(res.products || []);
          setHasMore(res.hasMore);
        }
      } catch (error) {
        console.error("Product API error:", error);
        if (!ignore) {
          setProducts([]);
          setHasMore(false);
          setProductError("Unable to load products. Please check server connection.");
        }
      } finally {
        if (!ignore) {
          setLoadingProducts(false);
        }
      }
    };

    loadInitialProducts();
    return () => {
      ignore = true;
    };
  }, [userGender, initialDepartment, query]);

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loadingProducts) return;
    setLoadingMore(true);
    try {
      const effectiveDept = initialDepartment !== "All" ? initialDepartment : (userGender === "male" ? "men" : userGender === "female" ? "women" : undefined);
      const res = await getPaginatedProducts({
        limit: 24,
        offset: products.length,
        gender: effectiveDept,
        search: query || undefined,
      });
      if (res.products && res.products.length > 0) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => String(p.id)));
          const uniqueNew = res.products.filter((p) => !existingIds.has(String(p.id)));
          return [...prev, ...uniqueNew];
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
  }, [loadingMore, hasMore, loadingProducts, products.length, userGender, initialDepartment, query]);

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
    const normalizedQuery = query.toLowerCase();
    let list = [...products].filter((p) => p.price <= priceMax);
    // Gender filter: male users see male/unisex, female users see female/unisex
    if (userGender === "male") {
      list = list.filter((p) => {
        const pg = (p.gender || "").toLowerCase();
        return !pg || ["male", "men", "man", "boy", "boys", "unisex"].includes(pg);
      });
    } else if (userGender === "female") {
      list = list.filter((p) => {
        const pg = (p.gender || "").toLowerCase();
        return !pg || ["female", "women", "woman", "girl", "girls", "unisex"].includes(pg);
      });
    }
    if (initialDepartment !== "All") list = list.filter((p) => p.department === initialDepartment);
    if (activeCat  !== "All") list = list.filter((p) => p.category === activeCat);
    if (activeBrand !== "All") list = list.filter((p) => p.brand   === activeBrand);
    if (activeSizes.length)   list = list.filter((p) => activeSizes.some((s) => p.sizes?.includes(s)));
    if (sortBy === "price_asc")  list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, userGender, initialDepartment, activeCat, activeBrand, activeSizes, priceMax, sortBy]);

  const categorySections = useMemo(() => {
    let list = [...products];
    // Gender filter on category sections too
    if (userGender === "male") {
      list = list.filter((p) => {
        const pg = (p.gender || "").toLowerCase();
        return !pg || ["male", "men", "man", "boy", "boys", "unisex"].includes(pg);
      });
    } else if (userGender === "female") {
      list = list.filter((p) => {
        const pg = (p.gender || "").toLowerCase();
        return !pg || ["female", "women", "woman", "girl", "girls", "unisex"].includes(pg);
      });
    }
    if (initialDepartment !== "All") list = list.filter((p) => p.department === initialDepartment);

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
  }, [products, userGender, initialDepartment, query]);

  const meta = DEPT_META[initialDepartment] || DEPT_META.All;
  const heroConfig = DEPT_HERO_CONFIG[initialDepartment] || DEPT_HERO_CONFIG.All;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] font-sans pb-24">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12 md:space-y-16">
        
        {/* ── BENTO HERO BANNER (Matches Homepage Style) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main Hero Card Left */}
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

            {/* Model Image */}
            <img
              src={heroConfig.heroImage}
              alt={heroConfig.title}
              className="absolute right-0 bottom-0 w-1/2 md:w-5/12 h-full object-cover object-top opacity-90 mix-blend-multiply pointer-events-none"
            />
          </div>

          {/* Right Column: 2 Stacked Cards */}
          <div className="lg:col-span-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-5">
            {/* Card 1 */}
            <div className="bg-[#F2F0ED] rounded-[28px] p-5 relative overflow-hidden h-[200px] md:h-[220px] flex flex-col justify-between group shadow-xs">
              <img
                src={heroConfig.card1Image}
                alt={heroConfig.card1Title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="z-10 bg-white/90 backdrop-blur-sm self-start px-3 py-1 rounded-full text-xs font-bold text-[#111111]">
                {heroConfig.card1Title}
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-[#F2F0ED] rounded-[28px] p-5 relative overflow-hidden h-[200px] md:h-[220px] flex flex-col justify-between group shadow-xs">
              <img
                src={heroConfig.card2Image}
                alt={heroConfig.card2Title}
                className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              <div className="z-10 bg-white/90 backdrop-blur-sm self-start px-3 py-1 rounded-full text-xs font-bold text-[#111111]">
                {heroConfig.card2Title}
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

        {/* ── STACKED CATEGORY SECTIONS ── */}
        <div className="space-y-16 pt-4">
          {query && (
            <div className="p-5 sm:p-6 bg-[#FAFAF9] border border-[#ECECEC] rounded-2xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8E8E93]">Search Results</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#1D1D1F] text-white font-medium">{products.length} found</span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1D1D1F] mt-1 tracking-tight">
                  &ldquo;{query}&rdquo;
                </h1>
              </div>
              <button
                onClick={() => router.push(pathname)}
                className="px-4 py-2 text-xs font-semibold text-[#1D1D1F] bg-white border border-[#ECECEC] hover:border-[#1D1D1F] rounded-full transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          )}

          {categorySections.map((group) => (
            <section key={group.id} className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#ECECEC] pb-3">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#111111] uppercase tracking-tight">
                    {group.title}
                  </h2>
                  <p className="text-xs font-semibold text-[#9B9B9B] mt-0.5">{group.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {group.items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          ))}

          {/* ── INFINITE SCROLL TRIGGER & STATUS ── */}
          <div ref={loadMoreTriggerRef} className="py-8 flex flex-col items-center justify-center">
            {loadingMore && (
              <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#FAF8F5] border border-[#E7E3DD] text-[#71717A] text-xs font-semibold shadow-2xs">
                <Loader2 size={16} className="animate-spin text-[#F07020]" />
                <span>Loading more luxury pieces...</span>
              </div>
            )}
            {!hasMore && products.length > 0 && (
              <div className="flex items-center gap-3 py-6 text-[#A1A1AA] text-xs font-semibold tracking-wider uppercase">
                <div className="w-12 h-px bg-[#E4E4E7]" />
                <span>You've explored the complete catalog</span>
                <div className="w-12 h-px bg-[#E4E4E7]" />
              </div>
            )}
          </div>

          {categorySections.length === 0 && !loadingProducts && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#9B9B9B] mb-2">
                No products found
              </h3>
              <p className="text-xs text-[#71717A] max-w-xs mb-6">
                No items found for your active search.
              </p>
              <button
                onClick={clearAll}
                className="bg-[#111111] text-white text-xs font-bold uppercase px-6 py-2.5 rounded-full hover:bg-[#F07020] transition-colors border-none cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ShopPage(props) {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-[#F07020]" />
      </div>
    }>
      <ShopPageContent {...props} />
    </Suspense>
  );
}
