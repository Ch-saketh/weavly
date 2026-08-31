"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronLeft, ChevronRight, ShoppingBag, Bookmark } from "lucide-react";
import { useZeraRecommendations } from "@/modules/recommendations/hooks/useZeraRecommendations";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import { RecommendationCarouselSkeleton } from "@/shared/components/ui/Skeleton";

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";
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
    <section className={`w-full bg-[#F5EFEB] ${className}`}>
      {/* Architectural Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-6 border-b border-[#183B56]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
            {title}
          </h2>
          <p className="text-xs text-[#5A7184] pt-0.5">
            {subtitle} • {displayList.length} Personalized Selections
          </p>
        </div>

        {/* Wireframe Carousel Arrow Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => scroll("left")}
            aria-label="Previous recommendations"
            className="w-8 h-8 rounded-full border border-[#183B56] flex items-center justify-center text-[#183B56] hover:bg-[#183B56] hover:text-white transition-colors cursor-pointer active:scale-95 bg-transparent"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Next recommendations"
            className="w-8 h-8 rounded-full border border-[#183B56] flex items-center justify-center text-[#183B56] hover:bg-[#183B56] hover:text-white transition-colors cursor-pointer active:scale-95 bg-transparent"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Horizontal Continuous Wireframe Box Carousel */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto divide-x divide-[#183B56] border-b border-[#183B56] snap-x snap-mandatory scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {displayList.map((item, index) => {
          const pid = item.productId || item.id;
          const isAdded = !!addedProductIds[pid];
          const saved = isSaved(pid);
          const rawImg = item.imageUrl || item.image;
          const displayImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;
          const productPrice = typeof item.price === "number" ? item.price : Number(item.price) || 1999;

          return (
            <div
              key={item.id || `rec-${index}`}
              onClick={() => handleProductClick(item)}
              className="flex-none w-[200px] sm:w-[240px] md:w-[260px] snap-start group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
            >
              {/* Full-bleed Cool Image Container Box */}
              <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-4 sm:p-6">
                <img
                  src={displayImg}
                  alt={item.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                />

                {/* Rank Badge */}
                <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs border border-[#183B56] px-2 py-0.5 rounded-xs text-[10px] font-bold text-[#183B56] shadow-2xs">
                  #{item.rank || index + 1}
                </div>

                {/* Top Right Save / Wardrobe Toggle */}
                <button
                  onClick={(e) => handleToggleLike(e, item)}
                  aria-label="Save to wardrobe"
                  className={`absolute top-2.5 right-2.5 w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all ${
                    saved
                      ? "bg-white shadow-xs scale-105 border border-[#183B56]"
                      : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 border border-[#183B56]/30"
                  }`}
                >
                  <Bookmark
                    size={12}
                    className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
                  />
                </button>

                {/* Quick Add To Cart Slide-up Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                  <button
                    onClick={(e) => handleAddToCart(e, item)}
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
              <div className="py-3.5 px-3 text-center flex flex-col items-center justify-between min-h-[96px] bg-[#F5EFEB] space-y-1">
                <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#5A7184] uppercase tracking-wider px-1">
                  <span className="truncate max-w-[110px]">{item.brand || "WEAVLY"}</span>
                  <span>{item.gender || "UNISEX"}</span>
                </div>
                <div
                  className="text-xs sm:text-[13px] font-bold text-[#183B56] group-hover:underline line-clamp-2 leading-snug w-full text-center px-1"
                  title={item.name}
                >
                  {item.name}
                </div>
                <div className="text-sm sm:text-base font-bold text-[#183B56] tracking-tight">
                  ₹{Math.round(productPrice).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
