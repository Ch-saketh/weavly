"use client";

// src/modules/products/pages/ShopPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// Weavly — Market & Collection Catalog
// • Signature Warm Stone (#F5EFEB) and Architectural Navy (#183B56) Theme
// • Strict Gender Locking (Women shows 100% Women, Men shows 100% Men)
// • Direct category relevance grid with zero cross-contamination
// ──────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, Loader2, ArrowRight, ArrowLeft, Filter, Sparkles } from "lucide-react";
import ProductCard from "@/modules/products/components/ProductCard";
import { getPaginatedProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { recordSearchActivity } from "@/modules/user/services/userActivityService";
import {
  isStrictlyMenProduct,
  isStrictlyWomenProduct,
  isStrictlyFootwearProduct,
} from "@/modules/home/components/FamilyStudioHome";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const SORT_OPTIONS = [
  { label: "Featured",          value: "featured"   },
  { label: "Price: Low → High", value: "price_asc"  },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "New Arrivals",      value: "newest"     },
];

const WOMEN_QUICK_FILTERS = [
  { label: "All Women", query: "" },
  { label: "Dresses & Gowns", query: "dress" },
  { label: "Tops & Blouses", query: "top" },
  { label: "Skirts", query: "skirt" },
  { label: "Pants & Bottoms", query: "trousers" },
  { label: "Handbags & Bags", query: "bag" },
  { label: "Footwear & Heels", query: "shoes" },
];

const MEN_QUICK_FILTERS = [
  { label: "All Men", query: "" },
  { label: "Tailored Blazers", query: "jacket" },
  { label: "Oxford & Linen Shirts", query: "shirt" },
  { label: "Polo & T-Shirts", query: "tshirt" },
  { label: "Trousers & Chinos", query: "trousers" },
  { label: "Denim & Jeans", query: "jeans" },
  { label: "Leather Footwear", query: "shoes" },
];

const GENERAL_QUICK_FILTERS = [
  { label: "All Pieces", query: "" },
  { label: "Dresses", query: "dress" },
  { label: "Shirts", query: "shirt" },
  { label: "Blazers & Jackets", query: "jacket" },
  { label: "Trousers", query: "trousers" },
  { label: "Footwear", query: "shoes" },
  { label: "Handbags", query: "bag" },
];

function ShopPageContent({ initialDepartment = "All" }) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const query = searchParams?.get("q")?.trim() || "";
  const categoryParam = searchParams?.get("category")?.trim() || "";
  const genderParam = searchParams?.get("gender")?.trim() || "";
  const { user } = useAuth();

  const userGender = (() => {
    const g = (user?.gender || "").toLowerCase();
    if (["male", "men", "man", "boy"].includes(g)) return "male";
    if (["female", "women", "woman", "girl"].includes(g)) return "female";
    return null;
  })();

  const effectiveGender = useMemo(() => {
    if (genderParam) {
      if (genderParam.toLowerCase().includes("wom") || genderParam.toLowerCase().includes("fem")) return "Women";
      if (genderParam.toLowerCase().includes("men") || genderParam.toLowerCase().includes("male")) return "Men";
      return genderParam;
    }
    // When actively searching a keyword, search across ALL products
    if (query) {
      return "All";
    }
    if (initialDepartment && initialDepartment !== "All") return initialDepartment;
    if (userGender === "female") return "Women";
    if (userGender === "male") return "Men";
    return "All";
  }, [genderParam, query, initialDepartment, userGender]);

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeCat, setActiveCat] = useState(categoryParam || "");
  const [priceMax, setPriceMax] = useState(50000);
  const [sortBy, setSortBy] = useState("featured");
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [productError, setProductError] = useState("");
  const loadMoreTriggerRef = useRef(null);

  useEffect(() => {
    setActiveCat(categoryParam || "");
  }, [categoryParam]);

  // Initial load
  const initialLoadAbortRef = useRef(null);

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
        const res = await getPaginatedProducts({
          limit: 60,
          offset: 0,
          gender: effectiveGender !== "All" ? effectiveGender : undefined,
          category: activeCat || undefined,
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
          setProductError("Unable to load products.");
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
  }, [effectiveGender, activeCat, query]);

  // Load more on scroll
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loadingProducts) return;
    setLoadingMore(true);
    try {
      const res = await getPaginatedProducts({
        limit: 48,
        offset: products.length,
        gender: effectiveGender !== "All" ? effectiveGender : undefined,
        category: activeCat || undefined,
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
  }, [loadingMore, hasMore, loadingProducts, products.length, effectiveGender, activeCat, query]);

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

  // Strict Defensive Filtering
  const displayed = useMemo(() => {
    let list = [...products].filter((p) => p.price <= priceMax);

    // Only filter strictly by gender if NOT a freeform text search query OR if explicit genderParam is given
    if (!query || genderParam) {
      if (effectiveGender === "Women") {
        list = list.filter(isStrictlyWomenProduct);
      } else if (effectiveGender === "Men") {
        list = list.filter(isStrictlyMenProduct);
      }
    }

    if (activeCat) {
      const matchCat = activeCat.toLowerCase();
      list = list.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        if (matchCat === "shoes" || matchCat === "footwear") {
          return isStrictlyFootwearProduct(p);
        }
        return cat.includes(matchCat) || name.includes(matchCat);
      });
    }

    if (sortBy === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price_desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, priceMax, effectiveGender, activeCat, sortBy, query, genderParam]);

  const quickFilters = useMemo(() => {
    if (effectiveGender === "Women") return WOMEN_QUICK_FILTERS;
    if (effectiveGender === "Men") return MEN_QUICK_FILTERS;
    return GENERAL_QUICK_FILTERS;
  }, [effectiveGender]);

  const handleCategorySelect = (catQuery) => {
    setActiveCat(catQuery);
    const params = new URLSearchParams(searchParams.toString());
    if (catQuery) {
      params.set("category", catQuery);
    } else {
      params.delete("category");
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const getPageTitle = () => {
    if (query) return `Search: "${query}"`;
    if (effectiveGender === "Women") {
      if (activeCat === "dress") return "Women's Dresses & Gowns";
      if (activeCat === "top") return "Women's Tops & Silk Blouses";
      if (activeCat === "skirt") return "Women's Skirts & Bottoms";
      if (activeCat === "bag") return "Women's Handbags & Totes";
      if (activeCat === "shoes") return "Women's Footwear & Heels";
      return "Women's Haute Collection";
    }
    if (effectiveGender === "Men") {
      if (activeCat === "shirt") return "Men's Oxford & Linen Shirts";
      if (activeCat === "jacket") return "Men's Tailored Blazers & Outerwear";
      if (activeCat === "trousers") return "Men's Trousers & Chinos";
      if (activeCat === "shoes") return "Men's Leather Footwear";
      return "Men's Sartorial Atelier";
    }
    return "Weavly Atelier Market";
  };

  const getPageSubtitle = () => {
    if (query) {
      return `Showing matching pieces across all departments for "${query}"`;
    }
    if (effectiveGender === "Women") {
      return "Curated strictly for women • 100% verified silhouettes • Zero cross-gender contamination";
    }
    if (effectiveGender === "Men") {
      return "Curated strictly for men • Refined bespoke tailoring & sartorial essentials";
    }
    return "Curated designer pieces and limited atelier drops";
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-8 sm:space-y-12">

        {/* ── EDITORIAL ATELIER HEADER (WEAVLY THEME) ── */}
        <section className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-10 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#183B56] text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56]">
                <Sparkles size={12} />
                <span>
                  {query
                    ? "Search Results"
                    : (effectiveGender !== "All" ? `${effectiveGender}'s Department` : "Weavly Collection")}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                {getPageTitle()}
              </h1>

              <p className="text-xs sm:text-sm text-[#5A7184] font-normal leading-relaxed">
                {getPageSubtitle()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-2xl sm:text-3xl font-bold text-[#183B56]">
                  {displayed.length}
                </div>
                <div className="text-[10px] font-bold text-[#5A7184] uppercase tracking-wider">
                  Curated Pieces
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CATEGORY QUICK-FILTER PILLS ── */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#183B56]">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {quickFilters.map((f) => {
              const active = activeCat.toLowerCase() === f.query.toLowerCase();
              return (
                <button
                  key={f.label}
                  onClick={() => handleCategorySelect(f.query)}
                  className={`py-2 px-4 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? "bg-[#183B56] text-white border border-[#183B56] shadow-xs"
                      : "bg-transparent text-[#183B56] border border-[#183B56]/30 hover:border-[#183B56]"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs font-bold text-[#183B56]">
            <span className="text-[10px] text-[#5A7184] uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="py-1.5 px-3 bg-white border border-[#183B56] text-xs font-bold text-[#183B56] outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── PRODUCT GRID ── */}
        {loadingProducts ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="border border-[#183B56] bg-[#F5EFEB] p-4 space-y-3 animate-pulse">
                <div className="aspect-[3/3.7] bg-[#DFE7ED]" />
                <div className="h-4 bg-[#183B56]/10 w-3/4 mx-auto" />
                <div className="h-4 bg-[#183B56]/15 w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : displayed.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayed.map((product) => (
              <ProductCard key={product.id || product.productId} product={product} />
            ))}
          </div>
        ) : (
          <div className="border border-[#183B56] bg-[#F5EFEB] py-16 px-6 text-center space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#183B56]">
              No {effectiveGender !== "All" ? effectiveGender : ""} Products Found
            </h3>
            <p className="text-xs text-[#5A7184] max-w-sm mx-auto">
              We couldn&apos;t find any pieces matching the selected category. Try selecting a different filter.
            </p>
            <button
              onClick={() => handleCategorySelect("")}
              className="py-2.5 px-6 border border-[#183B56] bg-white text-[#183B56] text-xs font-bold uppercase tracking-widest hover:bg-[#183B56] hover:text-white transition-all cursor-pointer"
            >
              Reset Category
            </button>
          </div>
        )}

        {/* ── INFINITE SCROLL TRIGGER ── */}
        <div ref={loadMoreTriggerRef} className="py-8 flex flex-col items-center justify-center">
          {loadingMore && (
            <div className="flex items-center gap-2.5 px-5 py-2.5 bg-white border border-[#183B56] text-[#183B56] text-xs font-bold shadow-xs uppercase tracking-wider">
              <Loader2 size={16} className="animate-spin text-[#183B56]" />
              <span>Loading more pieces...</span>
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
