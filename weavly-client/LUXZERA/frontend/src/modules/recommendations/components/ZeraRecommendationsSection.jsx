"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Bookmark, Check } from "lucide-react";
import { useZeraRecommendations } from "@/modules/recommendations/hooks/useZeraRecommendations";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";

import { RecommendationCarouselSkeleton } from "@/shared/components/ui/Skeleton";

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23F4F1EC'/%3E%3Cpath d='M260 360C260 337.909 277.909 320 300 320C322.091 320 340 337.909 340 360V420C340 442.091 322.091 460 300 460C277.909 460 260 442.091 260 420V360Z' stroke='%23C5BCAD' stroke-width='8'/%3E%3Cpath d='M230 460C230 440 250 420 300 420C350 420 370 440 370 460V500H230V460Z' stroke='%23C5BCAD' stroke-width='8'/%3E%3Ctext x='50%25' y='560' font-family='sans-serif' font-size='16' font-weight='500' fill='%239E9484' text-anchor='middle' letter-spacing='2'%3ELUXZERA%3C/text%3E%3C/svg%3E";
const DEFAULT_FALLBACK_IMAGE = NEUTRAL_FALLBACK_IMAGE;

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace(/^http:\/\//i, "https://");
};

export default function ZeraRecommendationsSection({
  title = "Zyra Recommendations",
  subtitle = "Curated For You",
  genderFilter = null,
  maxItems = 50,
  className = "",
}) {
  const router = useRouter();
  const { recommendations, loading, isEmpty } = useZeraRecommendations();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { addToCart } = useCart();
  const scrollContainerRef = useRef(null);
  const [addedProductIds, setAddedProductIds] = useState({});

  if (loading) {
    return <RecommendationCarouselSkeleton />;
  }

  if (isEmpty) {
    return null;
  }

  // Defensive gender filtering
  let filtered = recommendations;
  if (genderFilter) {
    const gNorm = genderFilter.trim().toLowerCase();
    if (gNorm.startsWith("men") || gNorm.startsWith("male") || gNorm.startsWith("man")) {
      filtered = recommendations.filter((item) => {
        const g = (item.gender || item.department || "").toLowerCase();
        return g === "men" || g === "unisex" || g === "male";
      });
    } else if (gNorm.startsWith("wom") || gNorm.startsWith("female")) {
      filtered = recommendations.filter((item) => {
        const g = (item.gender || item.department || "").toLowerCase();
        return g === "women" || g === "unisex" || g === "female";
      });
    } else if (gNorm.startsWith("kid")) {
      filtered = recommendations.filter((item) => {
        const g = (item.gender || item.department || "").toLowerCase();
        return g === "kids" || g === "boy" || g === "girl";
      });
    }
  }

  const displayList = filtered.slice(0, maxItems);
  if (displayList.length === 0) {
    return null;
  }

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleProductClick = (item) => {
    const targetUrl = item.productUrl || (item.productId ? `/product/${item.productId}` : "/market");
    router.push(targetUrl);
  };

  const handleToggleLike = (e, item) => {
    e.stopPropagation();
    toggleWardrobe({
      id: item.productId || item.id,
      name: item.name,
      price: item.price,
      image: item.imageUrl || item.image || DEFAULT_FALLBACK_IMAGE,
      brand: item.brand,
      category: item.category,
    });
  };

  const handleAddToCart = (e, item) => {
    e.stopPropagation();
    const pid = item.productId || item.id;
    addToCart({
      id: pid,
      name: item.name,
      price: item.price,
      image: item.imageUrl || item.image || DEFAULT_FALLBACK_IMAGE,
      brand: item.brand,
      color: "Default",
      size: "M",
    });

    setAddedProductIds((prev) => ({ ...prev, [pid]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [pid]: false }));
    }, 1500);
  };

  return (
    <section className={`w-full py-8 md:py-12 ${className}`}>
      {/* Header */}
      <div className="flex items-end justify-between mb-6 px-1">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-[#F07020] border border-orange-200/50">
              <Sparkles size={11} className="text-[#F07020]" />
              Zyra Intelligence
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#111111] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-[#71717A] mt-1">
            {subtitle} • {displayList.length} Personalized Selections
          </p>
        </div>

        {/* Carousel Arrow Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous recommendations"
            className="w-9 h-9 rounded-full bg-white border border-[#E7E3DD] flex items-center justify-center text-[#111111] hover:bg-[#FAF8F5] transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next recommendations"
            className="w-9 h-9 rounded-full bg-white border border-[#E7E3DD] flex items-center justify-center text-[#111111] hover:bg-[#FAF8F5] transition-all shadow-2xs cursor-pointer active:scale-95"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {displayList.map((item, index) => {
          const pid = item.productId || item.id;
          const isAdded = !!addedProductIds[pid];
          const saved = isSaved(pid);
          const rawImg = item.imageUrl || item.image;
          const displayImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;

          return (
            <div
              key={item.id || `rec-${index}`}
              onClick={() => handleProductClick(item)}
              className="flex-none w-[200px] sm:w-[240px] md:w-[260px] snap-start group cursor-pointer"
            >
              {/* Product Image Container */}
              <div className="relative aspect-[3/4] w-full bg-[#F2F0ED] rounded-[20px] overflow-hidden mb-3 border border-[#EBE8E3] shadow-xs transition-all duration-300 group-hover:shadow-md group-hover:border-[#E0DCD5]">
                <img
                  src={displayImg}
                  alt={item.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Rank Badge */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-black text-[#111111] shadow-2xs">
                  #{item.rank || index + 1}
                </div>

                {/* Top Right Save / Wardrobe Toggle */}
                <button
                  onClick={(e) => handleToggleLike(e, item)}
                  aria-label="Save to wardrobe"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#111111] hover:text-[#F07020] transition-colors shadow-2xs active:scale-90"
                >
                  <Bookmark
                    size={14}
                    className={saved ? "fill-[#F07020] text-[#F07020]" : "text-[#111111]"}
                  />
                </button>

                {/* Quick Add To Cart Button */}
                <button
                  onClick={(e) => handleAddToCart(e, item)}
                  aria-label="Add to cart"
                  className="absolute bottom-3 right-3 w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center shadow-md opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:bg-[#F07020] active:scale-90"
                >
                  {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
                </button>
              </div>

              {/* Product Info */}
              <div className="space-y-1 px-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                  <span>{item.brand || "Luxzera"}</span>
                  <span>{item.gender || "Unisex"}</span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#111111] line-clamp-1 leading-snug group-hover:text-[#F07020] transition-colors">
                  {item.name}
                </h3>
                <div className="flex items-baseline gap-2 pt-0.5">
                  <span className="text-xs sm:text-sm font-black text-[#111111]">
                    ₹{item.price?.toLocaleString?.() || item.price}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
