"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, ShoppingBag, AlertCircle, Bookmark, Loader2 } from "lucide-react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import { getProducts } from "@/modules/products/services/productService";
import {
  getMyRecommendations,
  generateUserRecommendations,
} from "@/modules/recommendations/services/recommendationService";

const OCCASIONS = [
  { id: "college", label: "College" },
  { id: "casual", label: "Casual" },
  { id: "party", label: "Party" },
  { id: "formal", label: "Formal" },
  { id: "wedding", label: "Wedding" },
  { id: "date", label: "Date" },
  { id: "work", label: "Work" },
  { id: "sport", label: "Sport" },
];

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace(/^http:\/\//i, "https://");
};

export default function ZeraCollection({
  initialOccasion = "college",
  onProductClick,
}) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { addToCart } = useCart();

  const [selectedOccasion, setSelectedOccasion] = useState(initialOccasion);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState({});

  const userId = user?.id || user?.userId || user?.email || "anonymous_user";
  const userGender = (() => {
    const g = (user?.gender || "").toLowerCase();
    if (["male", "men", "man", "boy"].includes(g)) return "male";
    if (["female", "women", "woman", "girl"].includes(g)) return "female";
    return null;
  })();

  const loadRecommendations = useCallback(
    async (forceRefresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const occParam = selectedOccasion && selectedOccasion.toLowerCase() !== "all" ? selectedOccasion : null;

        if (forceRefresh) {
          try {
            const generated = await generateUserRecommendations({
              occasion: occParam,
              topK: 50,
            });
            if (generated.recommendations && generated.recommendations.length > 0) {
              setRecommendations(generated.recommendations);
              return;
            }
          } catch (genErr) {
            console.warn("Recommendation generation notice:", genErr);
          }
        }

        const data = await getMyRecommendations(occParam);
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
        } else {
          try {
            const generated = await generateUserRecommendations({
              occasion: occParam,
              topK: 50,
            });
            if (generated.recommendations && generated.recommendations.length > 0) {
              setRecommendations(generated.recommendations);
              return;
            }
          } catch (genErr) {
            console.warn("Occasion generation notice:", genErr);
          }

          const fallback = await getProducts({ limit: 16, gender: userGender });
          if (fallback && fallback.length > 0) {
            setRecommendations(fallback);
          } else {
            setRecommendations([]);
          }
        }
      } catch (err) {
        console.warn("Zera recommendation retrieval note:", err.message);
        try {
          const fallback = await getProducts({ limit: 16, gender: userGender });
          setRecommendations(fallback || []);
        } catch (catErr) {
          setRecommendations([]);
        }
      } finally {
        setLoading(false);
      }
    },
    [userId, selectedOccasion, userGender]
  );

  useEffect(() => {
    loadRecommendations(false);
  }, [loadRecommendations]);

  const handleToggleLike = (e, product) => {
    e.stopPropagation();
    const pid = product.productId || product.id;
    const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
    toggleWardrobe?.({
      id: pid,
      name: product.title || product.name,
      price: pPrice,
      image: product.imageUrl || product.image,
    });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const pid = product.productId || product.id;
    const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
    addToCart?.({
      id: pid,
      name: product.title || product.name,
      price: pPrice,
      image: product.imageUrl || product.image || NEUTRAL_FALLBACK_IMAGE,
      qty: 1,
      size: "M",
      color: "Default",
    });
    setAddedProductIds((prev) => ({ ...prev, [pid]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [pid]: false }));
    }, 1500);
  };

  const handleCardClick = (productId) => {
    if (onProductClick) {
      onProductClick(productId);
    } else {
      router.push(`/product/${productId}`);
    }
  };

  return (
    <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
      
      {/* ── HEADER & OCCASION SELECTOR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 px-6 border-b border-[#183B56]">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} className="text-[#183B56]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
              Zyra Intelligence
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
            Curated For You
          </h2>
          <p className="text-xs text-[#5A7184] pt-0.5">
            {recommendations.length} selections matched for &ldquo;{selectedOccasion}&rdquo;
          </p>
        </div>

        {/* Occasion Filter Tabs & Refresh Button */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
          {OCCASIONS.map((occ) => {
            const active = selectedOccasion === occ.id;
            return (
              <button
                key={occ.id}
                onClick={() => setSelectedOccasion(occ.id)}
                className={`px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  active
                    ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                    : "bg-transparent text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                }`}
              >
                {occ.label}
              </button>
            );
          })}

          {/* Refresh Button */}
          <button
            onClick={() => loadRecommendations(true)}
            disabled={loading}
            title="Regenerate with Zyra"
            className="w-7.5 h-7.5 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer shrink-0 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* ── LOADING STATE ── */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56] border-b border-[#183B56] animate-pulse">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="flex flex-col justify-between">
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

      {/* ── ERROR STATE ── */}
      {!loading && error && (
        <div className="p-10 text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle size={32} className="text-[#183B56] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#183B56]">
              Zyra Recommendation Service Unavailable
            </h3>
            <p className="text-xs text-[#5A7184] leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => loadRecommendations(true)}
            className="px-6 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none cursor-pointer shadow-xs transition-colors"
          >
            Retry Zyra AI
          </button>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm font-semibold text-[#5A7184]">
            No recommendations found for &quot;{selectedOccasion}&quot;.
          </p>
          <button
            onClick={() => loadRecommendations(true)}
            className="px-6 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none cursor-pointer"
          >
            Generate Recommendations
          </button>
        </div>
      )}

      {/* ── CONTINUOUS 4-COLUMN ARCHITECTURAL WIREFRAME BOX GRID ── */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56]">
          {recommendations.map((item, idx) => {
            const pid = item.productId || item.id;
            const pName = item.title || item.name || `Product ${pid}`;
            const saved = isSaved?.(pid);
            const isAdded = !!addedProductIds[pid];
            const simValue = Number(item.similarity || item.score || 0.90);
            const matchPercent = Math.round(simValue * 100);
            const rawImg = item.imageUrl || item.image;
            const displayImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;
            const pPrice = typeof item.price === "number" ? item.price : Number(item.price) || 1999;

            return (
              <div
                key={pid || `zera-${idx}`}
                onClick={() => handleCardClick(pid)}
                className="group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
              >
                {/* Full-bleed Cool-Tinted Flat Image Box */}
                <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-4 sm:p-6">
                  <img
                    src={displayImg}
                    alt={pName}
                    className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                    }}
                  />

                  {/* Top Left Rank & Match Score Badge */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/90 backdrop-blur-xs border border-[#183B56] text-[#183B56] text-[10px] font-bold tracking-tight shadow-xs">
                    #{item.rank || idx + 1} • {matchPercent}% Match
                  </span>

                  {/* Save to Wardrobe Bookmark */}
                  <button
                    onClick={(e) => handleToggleLike(e, item)}
                    className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center p-0 cursor-pointer transition-all ${
                      saved
                        ? "bg-white shadow-xs scale-105 border border-[#183B56]"
                        : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 border border-[#183B56]/30"
                    }`}
                    aria-label="Save to Wardrobe"
                    title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
                  >
                    <Bookmark
                      size={13}
                      className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
                    />
                  </button>

                  {/* Quick Add To Bag Slide-up Bar */}
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
      )}
    </section>
  );
}
