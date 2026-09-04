"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ShoppingBag, Bookmark, ArrowRight, Sparkles } from "lucide-react";
import { getProducts } from "@/modules/products/services/productService";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import {
  isStrictlyMenProduct,
  isStrictlyFootwearProduct,
} from "@/modules/home/components/FamilyStudioHome";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";

const NEUTRAL_FALLBACK_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace(/^http:\/\//i, "https://");
};

function MenDepartmentCarousel({
  title,
  subtitle,
  categoryQuery,
  products = [],
  loading = false,
  onAddToCart,
  onToggleLike,
  isSaved,
  addedProductIds = {},
}) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -520 : 520;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  if (loading) {
    return (
      <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
        <div className="py-4 px-6 border-b border-[#183B56] flex justify-between items-center">
          <div>
            <div className="h-6 w-48 bg-[#183B56]/15 rounded-xs animate-pulse mb-1" />
            <div className="h-3.5 w-32 bg-[#183B56]/10 rounded-xs animate-pulse" />
          </div>
        </div>
        <div className="flex overflow-hidden divide-x divide-[#183B56]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="w-[240px] sm:w-[260px] shrink-0 p-4 space-y-3">
              <div className="aspect-[3/3.7] bg-[#DFE7ED] rounded-xs animate-pulse" />
              <div className="h-4 bg-[#183B56]/10 rounded-xs animate-pulse w-3/4 mx-auto" />
              <div className="h-4 bg-[#183B56]/15 rounded-xs animate-pulse w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-6 border-b border-[#183B56]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
            {title}
          </h2>
          <p className="text-xs text-[#5A7184] pt-0.5">
            {subtitle} • {products.length} Curated Items (Scroll Horizontally →)
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() =>
              router.push(
                `/market?gender=Men&category=${encodeURIComponent(categoryQuery || "")}`
              )
            }
            className="text-xs font-semibold text-[#183B56] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
          >
            <span>Explore All</span>
            <span className="text-sm font-normal leading-none">→</span>
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#183B56]">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex overflow-x-auto scroll-smooth scrollbar-none divide-x divide-[#183B56] snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, idx) => {
          const pid = product.id || product.productId || `men-${idx}`;
          const pName = product.name || product.title || "Men's Piece";
          const rawImg = product.imageUrl || product.image || product.images?.[0];
          const pImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;
          const pPrice =
            typeof product.price === "number"
              ? product.price
              : Number(product.price) || 1999;
          const saved = isSaved?.(pid);
          const isAdded = !!addedProductIds[pid];

          return (
            <div
              key={pid}
              onClick={() => product.id && router.push(`/product/${product.id}`)}
              className="w-[220px] sm:w-[250px] md:w-[270px] shrink-0 snap-start group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
            >
              <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-4 sm:p-5">
                <img
                  src={pImg}
                  alt={pName}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                />

                <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs border border-[#183B56] px-2 py-0.5 rounded-xs text-[10px] font-bold text-[#183B56]">
                  #{idx + 1}
                </div>

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

              <div className="py-3 px-3 text-center flex flex-col items-center justify-between min-h-[92px] bg-[#F5EFEB] space-y-1">
                <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#5A7184] uppercase tracking-wider px-1">
                  <span className="truncate max-w-[110px]">{product.brand || "WEAVLY"}</span>
                  <span className="text-[#183B56]">MEN</span>
                </div>
                <div
                  className="text-xs sm:text-[13px] font-bold text-[#183B56] group-hover:underline line-clamp-2 leading-snug w-full text-center px-1"
                  title={pName}
                >
                  {pName}
                </div>
                <div className="text-sm sm:text-base font-bold text-[#183B56] tracking-tight">
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

export default function MenPage() {
  const router = useRouter();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { addToCart } = useCart();

  const [addedProductIds, setAddedProductIds] = useState({});
  const [blazers, setBlazers] = useState([]);
  const [shirts, setShirts] = useState([]);
  const [trousersAndDenim, setTrousersAndDenim] = useState([]);
  const [footwear, setFootwear] = useState([]);
  const [loading, setLoading] = useState(true);

  const zyraRef = useRef(null);
  const blazersRef = useRef(null);
  const shirtsRef = useRef(null);
  const bottomsRef = useRef(null);
  const footwearRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    Promise.allSettled([
      getProducts({ gender: "Men", category: "jacket", limit: 40 }),
      getProducts({ gender: "Men", category: "shirt", limit: 40 }),
      getProducts({ gender: "Men", category: "tshirt", limit: 40 }),
      getProducts({ gender: "Men", category: "trousers", limit: 40 }),
      getProducts({ gender: "Men", category: "jeans", limit: 40 }),
      getProducts({ gender: "Men", category: "shoes", limit: 40 }),
    ]).then(([jacketsRes, shirtsRes, tshirtsRes, trousersRes, jeansRes, shoesRes]) => {
      if (isMounted) {
        const rawJackets = jacketsRes.status === "fulfilled" && Array.isArray(jacketsRes.value) ? jacketsRes.value : [];
        const rawShirts = shirtsRes.status === "fulfilled" && Array.isArray(shirtsRes.value) ? shirtsRes.value : [];
        const rawTshirts = tshirtsRes.status === "fulfilled" && Array.isArray(tshirtsRes.value) ? tshirtsRes.value : [];
        const rawTrousers = trousersRes.status === "fulfilled" && Array.isArray(trousersRes.value) ? trousersRes.value : [];
        const rawJeans = jeansRes.status === "fulfilled" && Array.isArray(jeansRes.value) ? jeansRes.value : [];
        const rawShoes = shoesRes.status === "fulfilled" && Array.isArray(shoesRes.value) ? shoesRes.value : [];

        // Apply strict 100% Men filters
        const validBlazers = rawJackets.filter(isStrictlyMenProduct);
        const validShirts = rawShirts.concat(rawTshirts).filter(isStrictlyMenProduct);
        const validBottoms = rawTrousers.concat(rawJeans).filter(isStrictlyMenProduct);
        const validShoes = rawShoes.filter((p) => isStrictlyMenProduct(p) && isStrictlyFootwearProduct(p));

        setBlazers(validBlazers);
        setShirts(validShirts);
        setTrousersAndDenim(validBottoms);
        setFootwear(validShoes);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

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

  const scrollToSection = (ref) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* ── MEN'S SARTORIAL HERO BANNER ── */}
        <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
            
            {/* LEFT: Quick Category Navigator */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-center space-y-3">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5A7184] mb-1">
                Men&apos;s Sartorial Atelier
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => scrollToSection(zyraRef)}
                  className="w-full text-left py-3 px-4 border border-[#183B56] bg-[#183B56] text-white hover:bg-[#102A43] font-bold text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>Zyra Personalized Picks</span>
                  </span>
                  <span>↓</span>
                </button>
                <button
                  onClick={() => scrollToSection(blazersRef)}
                  className="w-full text-left py-3 px-4 border border-[#183B56] bg-transparent hover:bg-[#183B56] hover:text-white text-[#183B56] font-bold text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Tailored Blazers & Outerwear</span>
                  <span>↓</span>
                </button>
                <button
                  onClick={() => scrollToSection(shirtsRef)}
                  className="w-full text-left py-3 px-4 border border-[#183B56] bg-transparent hover:bg-[#183B56] hover:text-white text-[#183B56] font-bold text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Oxford Shirts & Polos</span>
                  <span>↓</span>
                </button>
                <button
                  onClick={() => scrollToSection(bottomsRef)}
                  className="w-full text-left py-3 px-4 border border-[#183B56] bg-transparent hover:bg-[#183B56] hover:text-white text-[#183B56] font-bold text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Trousers, Chinos & Denim</span>
                  <span>↓</span>
                </button>
                <button
                  onClick={() => scrollToSection(footwearRef)}
                  className="w-full text-left py-3 px-4 border border-[#183B56] bg-transparent hover:bg-[#183B56] hover:text-white text-[#183B56] font-bold text-xs sm:text-sm flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Leather Derbys & Loafers</span>
                  <span>↓</span>
                </button>
              </div>
            </div>

            {/* CENTER: Men's Visual */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center bg-[#F5EFEB]">
              <div className="w-full aspect-[3/3.6] bg-[#DFE7ED] border border-[#183B56] relative overflow-hidden flex items-center justify-center p-6 shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80"
                  alt="Men's Sartorial Collection"
                  className="w-full h-full object-contain mix-blend-multiply transition-all duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                />
                <div className="absolute bottom-3 left-3 bg-white/90 border border-[#183B56] px-2.5 py-1 text-[10px] font-bold text-[#183B56]">
                  Curated Sartorial Collection
                </div>
              </div>
            </div>

            {/* RIGHT: Headline & Info */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                  Men&apos;s <br />
                  Sartorial Atelier.
                </h1>
                <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed pt-1 font-normal">
                  Refined single-breasted blazers, bespoke Oxford button-downs, pleated trousers, handcrafted leather derbys, and Italian leather accessories.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => router.push("/market?gender=Men")}
                  className="w-full py-3.5 px-4 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.18em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all"
                >
                  <span>Explore All Men&apos;s Pieces</span>
                  <ArrowRight size={13} />
                </button>
                <div className="text-center text-[10px] font-bold text-[#5A7184] pt-1">
                  ✓ 100% Men&apos;s Pieces • ✓ 0% Cross-Contamination • ✓ Verified Quality
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── ZYRA PERSONALIZED RECOMMENDATIONS (100% MEN'S PIECES) ── */}
        <div ref={zyraRef} className="border border-[#183B56] shadow-xs">
          <ZeraRecommendationsSection
            title="Zyra Sartorial Picks for Men"
            subtitle="Personalized Men's Curation Powered by Zyra V2"
            genderFilter="Men"
          />
        </div>

        {/* ── SHELF 1: TAILORED BLAZERS ── */}
        <div ref={blazersRef}>
          <MenDepartmentCarousel
            title="Tailored Blazers & Outerwear"
            subtitle="Single-breasted wool blazers, trench coats & formal jackets"
            categoryQuery="jacket"
            products={blazers}
            loading={loading}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            isSaved={isSaved}
            addedProductIds={addedProductIds}
          />
        </div>

        {/* ── SHELF 2: SHIRTS & POLOS ── */}
        <div ref={shirtsRef}>
          <MenDepartmentCarousel
            title="Oxford Shirts & Knit Polos"
            subtitle="Crisp cotton button-downs, breathable linen shirts & knitted polos"
            categoryQuery="shirt"
            products={shirts}
            loading={loading}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            isSaved={isSaved}
            addedProductIds={addedProductIds}
          />
        </div>

        {/* ── SHELF 3: TROUSERS & DENIM ── */}
        <div ref={bottomsRef}>
          <MenDepartmentCarousel
            title="Trousers, Chinos & Denim"
            subtitle="Pleated formal trousers, tailored chinos & raw selvedge denim"
            categoryQuery="trousers"
            products={trousersAndDenim}
            loading={loading}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            isSaved={isSaved}
            addedProductIds={addedProductIds}
          />
        </div>

        {/* ── SHELF 4: FOOTWEAR & LEATHER ACCENTS ── */}
        <div ref={footwearRef}>
          <MenDepartmentCarousel
            title="Leather Derbys, Loafers & Accents"
            subtitle="Handcrafted leather derbys, monk straps, penny loafers & belts"
            categoryQuery="shoes"
            products={footwear}
            loading={loading}
            onAddToCart={handleAddToCart}
            onToggleLike={handleToggleLike}
            isSaved={isSaved}
            addedProductIds={addedProductIds}
          />
        </div>

      </main>
    </div>
  );
}
