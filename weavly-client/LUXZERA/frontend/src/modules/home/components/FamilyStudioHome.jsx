"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowDown, ChevronLeft, ChevronRight, ShoppingBag, Bookmark, Loader2 } from "lucide-react";
import { getProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace(/^http:\/\//i, "https://");
};

// Helper to chunk an array into rows of N
const chunkArray = (array, size) => {
  const chunked = [];
  for (let i = 0; i < array.length; i += size) {
    chunked.push(array.slice(i, i + size));
  }
  return chunked;
};

const HERO_CATEGORIES = [
  {
    id: "men",
    label: "Men's Essentials",
    query: "Men",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹999",
  },
  {
    id: "women",
    label: "Women's Collection",
    query: "Women",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,299",
  },
  {
    id: "shirts",
    label: "Linen & Oxford Shirts",
    query: "Shirts",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,499",
  },
  {
    id: "outerwear",
    label: "Jackets & Outerwear",
    query: "Jackets",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹2,499",
  },
];

// Department Carousel Component (15-20 products with side scroll)
function DepartmentCarousel({ title, subtitle, deptQuery, products = [], onAddToCart, onToggleLike, isSaved, addedProductIds }) {
  const router = useRouter();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -580 : 580;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const displayList = products.slice(0, 20);

  if (displayList.length === 0) return null;

  return (
    <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
      {/* Header Bar with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-6 border-b border-[#183B56]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
            {title}
          </h2>
          <p className="text-xs text-[#5A7184] pt-0.5">
            {subtitle} • {displayList.length} Curated Selections
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => router.push(`/market?gender=${deptQuery}`)}
            className="text-xs font-semibold text-[#183B56] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
          >
            <span>Explore All</span>
            <span className="text-sm font-normal leading-none">→</span>
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#183B56]">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Side-Scroll Strip (15-20 products) */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth scrollbar-none divide-x divide-[#183B56]"
      >
        {displayList.map((product, idx) => {
          const pid = product.id || product.productId || `dept-${idx}`;
          const pName = product.name || product.title || "Essential Piece";
          const rawImg = product.imageUrl || product.image || product.images?.[0];
          const pImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;
          const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
          const saved = isSaved?.(pid);
          const isAdded = !!addedProductIds[pid];

          return (
            <div
              key={pid}
              onClick={() => product.id && router.push(`/product/${product.id}`)}
              className="w-[240px] sm:w-[270px] shrink-0 group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
            >
              {/* Product Image Box */}
              <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-4 sm:p-5">
                <img
                  src={pImg}
                  alt={pName}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                />

                {/* Wardrobe Bookmark Icon on Hover */}
                <button
                  onClick={(e) => onToggleLike(e, product)}
                  className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center p-0 cursor-pointer transition-all ${
                    saved
                      ? "bg-white shadow-xs scale-105 border border-[#183B56]"
                      : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 border border-[#183B56]/30"
                  }`}
                  title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
                >
                  <Bookmark
                    size={12}
                    className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
                  />
                </button>

                {/* Quick Add To Bag Slide-up Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                  <button
                    onClick={(e) => onAddToCart(e, product)}
                    className={`w-full py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
                      isAdded ? "bg-[#2E7D32] text-white" : "bg-[#183B56] text-white hover:bg-[#102A43]"
                    }`}
                  >
                    <ShoppingBag size={11} />
                    <span>{isAdded ? "Added ✓" : "Add to Bag"}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Rate & Title Box (Clean 2-Line Wrapping, No Text Cutoff) */}
              <div className="py-3.5 px-3 text-center flex flex-col items-center justify-between min-h-[82px] bg-[#F5EFEB]">
                <div
                  className="text-xs sm:text-[13px] font-bold text-[#183B56] group-hover:underline line-clamp-2 leading-snug w-full text-center px-1"
                  title={pName}
                >
                  {pName}
                </div>
                <div className="text-sm sm:text-base font-bold text-[#183B56] tracking-tight mt-1">
                  ₹{Math.round(pPrice).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function FamilyStudioHome({ onShopNow, onOpenAuth }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { addToCart } = useCart();

  const [addedProductIds, setAddedProductIds] = useState({});
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Active Category Selection
  const [selectedCategory, setSelectedCategory] = useState(HERO_CATEGORIES[0]);
  const [activeCatalogTab, setActiveCatalogTab] = useState("All");

  // Infinite Scroll State (Row-by-Row)
  const [visibleRowsCount, setVisibleRowsCount] = useState(2);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);
  const catalogSectionRef = useRef(null);

  // Initial products fetch
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);
    getProducts({ limit: 100 }).then((items) => {
      if (isMounted) {
        const list = Array.isArray(items) ? items : [];
        setProductsList(list);
        setLoadingProducts(false);
        if (list.length <= 8) {
          setHasMore(false);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Segregate products into Men, Women, Kids
  const menProducts = productsList.filter((p) => {
    const g = (p.gender || p.department || "").toLowerCase();
    const c = (p.category || "").toLowerCase();
    return g.includes("men") || g.includes("male") || (!g.includes("women") && !g.includes("female") && !g.includes("kid") && !g.includes("girl") && c.includes("shirt"));
  });

  const womenProducts = productsList.filter((p) => {
    const g = (p.gender || p.department || "").toLowerCase();
    const c = (p.category || "").toLowerCase();
    return g.includes("women") || g.includes("female") || g.includes("girl") || c.includes("dress") || c.includes("top");
  });

  const kidsProducts = productsList.filter((p) => {
    const g = (p.gender || p.department || "").toLowerCase();
    const c = (p.category || "").toLowerCase();
    return g.includes("kid") || g.includes("child") || g.includes("boy") || g.includes("girl") || c.includes("kid");
  });

  // Filtered pool based on active tab
  const getActiveTabPool = () => {
    if (activeCatalogTab === "Men") return menProducts;
    if (activeCatalogTab === "Women") return womenProducts;
    if (activeCatalogTab === "Kids") return kidsProducts.length > 0 ? kidsProducts : productsList.slice(0, 16);
    return productsList;
  };

  const filteredPool = getActiveTabPool();
  const visibleCatalogProducts = filteredPool.slice(0, visibleRowsCount * 4);
  const catalogRows = chunkArray(visibleCatalogProducts, 4);

  // Infinite scroll row-by-row loader with fast-scroll pacing
  const loadNextRow = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    const currentlyVisible = visibleRowsCount * 4;

    if (currentlyVisible < filteredPool.length) {
      setIsLoadingMore(true);
      setTimeout(() => {
        setVisibleRowsCount((prev) => prev + 1);
        setIsLoadingMore(false);
      }, 250);
    } else {
      setIsLoadingMore(true);
      try {
        const moreItems = await getProducts({ limit: 20, offset: productsList.length });
        if (Array.isArray(moreItems) && moreItems.length > 0) {
          setProductsList((prev) => [...prev, ...moreItems]);
          setVisibleRowsCount((prev) => prev + 1);
        } else {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Error loading more products:", err);
        setHasMore(false);
      } finally {
        setIsLoadingMore(false);
      }
    }
  }, [isLoadingMore, hasMore, filteredPool.length, productsList.length, visibleRowsCount]);

  // IntersectionObserver on sentinel with 800px pre-fetch buffer
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadNextRow();
        }
      },
      { rootMargin: "800px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextRow]);

  const handleScrollToCatalog = () => {
    if (catalogSectionRef.current) {
      catalogSectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/market?q=${encodeURIComponent(selectedCategory.query)}`);
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const pid = product.id || product.productId;
    const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
    addToCart({
      id: pid,
      name: product.name || product.title,
      price: pPrice,
      image: product.imageUrl || product.image || product.images?.[0] || NEUTRAL_FALLBACK_IMAGE,
      color: product.color || "Default",
      size: "M",
      qty: 1,
    });
    setAddedProductIds((prev) => ({ ...prev, [pid]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [pid]: false }));
    }, 1500);
  };

  const handleToggleLike = (e, product) => {
    e.stopPropagation();
    const pid = product.id || product.productId;
    const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
    toggleWardrobe({
      id: pid,
      name: product.name || product.title,
      price: pPrice,
      image: product.imageUrl || product.image || product.images?.[0] || NEUTRAL_FALLBACK_IMAGE,
      brand: product.brand,
      category: product.category,
    });
  };

  // Section 2: Best Sellers (Top 4 products)
  const bestSellers = productsList.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">

      {/* MASTER CONTAINER WITH GENEROUS EDGE MARGINS */}
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* ════════════════════════════════════════════════════════════
            1. ULTRA-CLEAN 3-COLUMN HERO
        ════════════════════════════════════════════════════════════ */}
        <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
            
            {/* LEFT: 1-Tap Category Selector (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-center space-y-3">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5A7184] mb-1">
                Select Category
              </div>
              
              <div className="space-y-2">
                {HERO_CATEGORIES.map((cat) => {
                  const active = selectedCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left py-3 px-4 border transition-all cursor-pointer flex items-center justify-between font-bold text-xs sm:text-sm ${
                        active
                          ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                          : "bg-transparent text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-base font-normal leading-none">→</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTER: Big Clean Garment Visual (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center bg-[#F5EFEB]">
              <div className="w-full aspect-[3/3.6] bg-[#DFE7ED] border border-[#183B56] relative overflow-hidden flex items-center justify-center p-6 shadow-xs">
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.label}
                  className="w-full h-full object-contain mix-blend-multiply transition-all duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                />

                <div className="absolute bottom-3 left-3 bg-white/90 border border-[#183B56] px-2.5 py-1 text-[10px] font-bold text-[#183B56]">
                  From {selectedCategory.startPrice}
                </div>
              </div>
            </div>

            {/* RIGHT: Big Bold Headline & Direct Button (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5A7184]">
                  Weavly Studio
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.1]">
                  Wear What <br />
                  Endures.
                </h1>
                <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed pt-1">
                  Sustainable natural fabrics. Clean tailored fits made for everyday wear.
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleScrollToCatalog}
                  className="w-full py-4 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <span>Shop Collection</span>
                  <ArrowDown size={14} className="animate-bounce" />
                </button>
                
                <div className="text-center text-[10px] font-semibold text-[#5A7184]">
                  ✓ Free Global Delivery • ✓ Easy 30-Day Returns
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            2. BEST SELLERS: CONTINUOUS 4-COLUMN WIREFRAME BOX GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between py-3.5 px-6 border-b border-[#183B56]">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
              Best Sellers
            </h2>
            <button
              onClick={() => router.push("/market?sort=popularity")}
              className="text-xs sm:text-sm font-semibold text-[#183B56] hover:underline flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
            >
              <span>All Product</span>
              <span className="text-base font-normal leading-none">→</span>
            </button>
          </div>

          {/* 4 Continuous Architectural Grid Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56]">
            {(bestSellers.length > 0 ? bestSellers : Array(4).fill({})).map((product, idx) => {
              const pid = product.id || product.productId || `bs-${idx}`;
              const pName = product.name || product.title || "Essential Product";
              const rawImg = product.imageUrl || product.image || product.images?.[0];
              const pImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;
              const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
              const saved = isSaved?.(pid);
              const isAdded = !!addedProductIds[pid];

              return (
                <div
                  key={pid}
                  onClick={() => product.id && router.push(`/product/${product.id}`)}
                  className="group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
                >
                  {/* Full-bleed Cool-Tinted Flat Image Box */}
                  <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-4 sm:p-6">
                    <img
                      src={pImg}
                      alt={pName}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                      }}
                    />

                    {/* Wardrobe Bookmark Icon on Hover */}
                    <button
                      onClick={(e) => handleToggleLike(e, product)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center p-0 cursor-pointer transition-all ${
                        saved
                          ? "bg-white shadow-xs scale-105 border border-[#183B56]"
                          : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 border border-[#183B56]/30"
                      }`}
                      title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
                    >
                      <Bookmark
                        size={13}
                        className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
                      />
                    </button>

                    {/* Quick Add To Cart Slide-up Bar */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
                          isAdded ? "bg-[#2E7D32] text-white" : "bg-[#183B56] text-white hover:bg-[#102A43]"
                        }`}
                      >
                        <ShoppingBag size={12} />
                        <span>{isAdded ? "Added ✓" : "Add to Bag"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Rate & Title Box (Clean 2-Line Wrapping, No Text Cutoff) */}
                  <div className="py-3.5 px-3 text-center flex flex-col items-center justify-between min-h-[82px] bg-[#F5EFEB]">
                    <div
                      className="text-xs sm:text-[13px] font-bold text-[#183B56] group-hover:underline line-clamp-2 leading-snug w-full text-center px-1"
                      title={pName}
                    >
                      {pName}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-[#183B56] tracking-tight mt-1">
                      ₹{Math.round(pPrice).toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. MEN'S COLLECTION SIDE-SCROLL SHOWCASE (15-20 PRODUCTS)
        ════════════════════════════════════════════════════════════ */}
        <DepartmentCarousel
          title="Men's Collection"
          subtitle="Tailored blazers, premium shirts & trousers"
          deptQuery="Men"
          products={menProducts}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          isSaved={isSaved}
          addedProductIds={addedProductIds}
        />

        {/* ════════════════════════════════════════════════════════════
            4. WOMEN'S COLLECTION SIDE-SCROLL SHOWCASE (15-20 PRODUCTS)
        ════════════════════════════════════════════════════════════ */}
        <DepartmentCarousel
          title="Women's Collection"
          subtitle="Contemporary silhouettes, dresses & knitwear"
          deptQuery="Women"
          products={womenProducts}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          isSaved={isSaved}
          addedProductIds={addedProductIds}
        />

        {/* ════════════════════════════════════════════════════════════
            5. KIDS' ATELIER SIDE-SCROLL SHOWCASE (15-20 PRODUCTS)
        ════════════════════════════════════════════════════════════ */}
        <DepartmentCarousel
          title="Kids' Atelier"
          subtitle="Playful organic cottons & durable essentials"
          deptQuery="Kids"
          products={kidsProducts.length > 0 ? kidsProducts : productsList.slice(0, 16)}
          onAddToCart={handleAddToCart}
          onToggleLike={handleToggleLike}
          isSaved={isSaved}
          addedProductIds={addedProductIds}
        />



        {/* ── ZERA PERSONALIZED RECOMMENDATIONS SECTION ── */}
        <div className="border border-[#183B56] shadow-xs">
          <ZeraRecommendationsSection />
        </div>

        {/* ════════════════════════════════════════════════════════════
            7. ATELIER CATALOG: CATEGORIZED ROW-BY-ROW INFINITE SCROLL FEED
        ════════════════════════════════════════════════════════════ */}
        <section ref={catalogSectionRef} className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
          {/* Header Bar with Department Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6 border-b border-[#183B56]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
                Atelier Catalog
              </h2>
              <p className="text-xs text-[#5A7184] pt-0.5">
                Full collection feed • {filteredPool.length} products
              </p>
            </div>

            {/* Department Filter Tabs */}
            <div className="flex items-center gap-2">
              {["All", "Men", "Women", "Kids"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveCatalogTab(tab);
                    setVisibleRowsCount(2);
                  }}
                  className={`px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
                    activeCatalogTab === tab
                      ? "bg-[#183B56] text-white border-[#183B56]"
                      : "bg-transparent text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Render Continuous Rows of 4 Products */}
          {catalogRows.map((rowProducts, rowIndex) => (
            <div
              key={`row-${rowIndex}`}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56] border-b border-[#183B56] transition-opacity duration-500 animate-fadeIn"
            >
              {rowProducts.map((product, colIndex) => {
                const pid = product.id || product.productId || `cat-${rowIndex}-${colIndex}`;
                const pName = product.name || product.title || "Modern Essential";
                const rawImg = product.imageUrl || product.image || product.images?.[0];
                const pImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;
                const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
                const saved = isSaved?.(pid);
                const isAdded = !!addedProductIds[pid];

                return (
                  <div
                    key={pid}
                    onClick={() => product.id && router.push(`/product/${product.id}`)}
                    className="group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
                  >
                    {/* Full-bleed Cool-Tinted Flat Image Box */}
                    <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-4 sm:p-6">
                      <img
                        src={pImg}
                        alt={pName}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                        }}
                      />

                      {/* Wardrobe Bookmark Icon on Hover */}
                      <button
                        onClick={(e) => handleToggleLike(e, product)}
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center p-0 cursor-pointer transition-all ${
                          saved
                            ? "bg-white shadow-xs scale-105 border border-[#183B56]"
                            : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 border border-[#183B56]/30"
                        }`}
                        title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
                      >
                        <Bookmark
                          size={13}
                          className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
                        />
                      </button>

                      {/* Quick Add Button */}
                      <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          className={`w-full py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
                            isAdded ? "bg-[#2E7D32] text-white" : "bg-[#183B56] text-white hover:bg-[#102A43]"
                          }`}
                        >
                          <ShoppingBag size={12} />
                          <span>{isAdded ? "Added ✓" : "Add to Bag"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottom Rate & Title Box (Clean 2-Line Wrapping, No Text Cutoff) */}
                    <div className="py-3.5 px-3 text-center flex flex-col items-center justify-between min-h-[82px] bg-[#F5EFEB]">
                      <div
                        className="text-xs sm:text-[13px] font-bold text-[#183B56] group-hover:underline line-clamp-2 leading-snug w-full text-center px-1"
                        title={pName}
                      >
                        {pName}
                      </div>
                      <div className="text-sm sm:text-base font-bold text-[#183B56] tracking-tight mt-1">
                        ₹{Math.round(pPrice).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {/* Wireframe Skeletal Loading Row when Loading More */}
          {isLoadingMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56] border-b border-[#183B56] animate-pulse">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="flex flex-col justify-between">
                  <div className="aspect-[3/3.7] bg-[#DFE7ED]/60 border-b border-[#183B56] flex items-center justify-center p-6">
                    <div className="w-24 h-32 bg-[#183B56]/10 rounded-xs" />
                  </div>
                  <div className="py-5 px-3 space-y-2 bg-[#F5EFEB]">
                    <div className="h-3.5 bg-[#183B56]/15 w-3/4 mx-auto rounded-xs" />
                    <div className="h-4 bg-[#183B56]/20 w-1/3 mx-auto rounded-xs" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Infinite Scroll Sentinel Trigger */}
          <div ref={sentinelRef} className="py-8 flex items-center justify-center">
            {hasMore ? (
              <div className="flex items-center gap-2 text-xs font-bold text-[#183B56] uppercase tracking-[0.2em]">
                <Loader2 size={14} className="animate-spin text-[#183B56]" />
                <span>Loading Next Row...</span>
              </div>
            ) : (
              <div className="text-xs font-bold text-[#5A7184] uppercase tracking-[0.2em] py-2">
                — End of Collection • Weavly Atelier —
              </div>
            )}
          </div>
        </section>

      </main>
    </div>
  );
}
