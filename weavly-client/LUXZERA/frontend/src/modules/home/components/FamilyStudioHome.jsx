"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowDown, ChevronLeft, ChevronRight, ShoppingBag, Bookmark, Sparkles, Camera } from "lucide-react";
import { getProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";
import BespokeFitModal from "./BespokeFitModal";

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace(/^http:\/\//i, "https://");
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

// Department Carousel Component (Infinite Side-Scroll Shelf)
function DepartmentCarousel({ title, subtitle, deptQuery, products = [], onAddToCart, onToggleLike, isSaved, addedProductIds }) {
  const router = useRouter();
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -580 : 580;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const displayList = products.length > 0 ? products : [];

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
            {subtitle} • {displayList.length} Curated Items (Scroll Horizontally →)
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
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Infinite Side-Scroll Track */}
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
  const [isFitModalOpen, setIsFitModalOpen] = useState(false);
  const firstShelfRef = useRef(null);

  // Initial products fetch
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);
    getProducts({ limit: 100 }).then((items) => {
      if (isMounted) {
        const list = Array.isArray(items) ? items : [];
        setProductsList(list);
        setLoadingProducts(false);
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

  const bestSellers = productsList.slice(0, 30);

  const handleScrollToShelf = () => {
    if (firstShelfRef.current) {
      firstShelfRef.current.scrollIntoView({ behavior: "smooth" });
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

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-20">

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

            {/* RIGHT: Big Bold Headline & Bespoke Fit AI Action (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                  Wear What <br />
                  Truly Suits You.
                </h1>
                <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed pt-1 font-normal">
                  Upload your photo or set your proportions. Zyra analyzes your silhouette, skin undertones, and drape to curate clothes tailored specifically to flatter you.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setIsFitModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.18em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Camera size={14} />
                  <span>Personalize Fit & Photo</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  onClick={handleScrollToShelf}
                  className="w-full py-2.5 px-4 bg-transparent hover:bg-[#183B56]/5 text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Explore Atelier Catalog</span>
                  <ArrowDown size={13} />
                </button>
                
                <div className="text-center text-[10px] font-bold text-[#5A7184] pt-1">
                  ✓ Silhouette Proportions • ✓ Undertone Harmony • ✓ Zero Sizing Regrets
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            ROW 1: BEST SELLERS & TRENDING (INFINITE SIDE-SCROLL SHELF)
        ════════════════════════════════════════════════════════════ */}
        <div ref={firstShelfRef}>
          <DepartmentCarousel
            title="Best Sellers & Trending"
            subtitle="Most desired seasonal atelier pieces"
            deptQuery="All"
            products={bestSellers}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            isSaved={isSaved}
            addedProductIds={addedProductIds}
          />
        </div>

        {/* ════════════════════════════════════════════════════════════
            ROW 2: MEN'S COLLECTION (INFINITE SIDE-SCROLL SHELF)
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
            ROW 3: WOMEN'S COLLECTION (INFINITE SIDE-SCROLL SHELF)
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
            ZYRA PERSONALIZED RECOMMENDATIONS SECTION
        ════════════════════════════════════════════════════════════ */}
        <div className="border border-[#183B56] shadow-xs">
          <ZeraRecommendationsSection />
        </div>

      </main>

      {/* ── BESPOKE FIT & STYLE STUDIO MODAL ── */}
      <BespokeFitModal
        isOpen={isFitModalOpen}
        onClose={() => setIsFitModalOpen(false)}
        onGenerated={() => {
          if (firstShelfRef.current) firstShelfRef.current.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
