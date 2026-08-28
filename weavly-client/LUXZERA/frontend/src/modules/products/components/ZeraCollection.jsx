"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, ShoppingBag, AlertCircle, Bookmark } from "lucide-react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import { fetchZyraRecommendations } from "@/infrastructure/api/zyra/zyraService";
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
  // Normalize gender for Zyra backend: 'male' or 'female'
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
        if (forceRefresh) {
          const generated = await generateUserRecommendations("10009781", 50);
          setRecommendations(generated.recommendations || []);
          return;
        }

        const data = await getMyRecommendations();
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations);
        } else {
          // Fallback if no user generation exists yet
          const fallback = await fetchZyraRecommendations({
            userId,
            occasion: selectedOccasion,
            limit: 10,
            forceRefresh,
            gender: userGender,
          });
          setRecommendations(fallback.recommendations || []);
        }
      } catch (err) {
        console.error("Failed to load Zyra recommendations:", err);
        setError(err.message || "Unable to load personalized recommendations.");
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
    toggleWardrobe?.({
      id: product.productId,
      name: product.title,
      price: product.price,
      image: product.imageUrl,
    });
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart?.({
      id: product.productId,
      name: product.title,
      price: product.price || 2999.0,
      image: product.imageUrl,
      qty: 1,
    });
    setAddedProductIds((prev) => ({ ...prev, [product.productId]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [product.productId]: false }));
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
    <section className="space-y-8 py-6 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* ── HEADER & OCCASION SELECTOR ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#ECECEC] pb-6">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-light tracking-tight text-[#1D1D1F]">
            Zyra <span className="font-normal">Collection</span>
          </h2>
        </div>

        {/* Occasion Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {OCCASIONS.map((occ) => (
            <button
              key={occ.id}
              onClick={() => setSelectedOccasion(occ.id)}
              className={`h-9 px-4 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer border-none shrink-0 ${
                selectedOccasion === occ.id
                  ? "bg-[#1D1D1F] text-white shadow-xs"
                  : "bg-[#F4F2EE] text-[#515154] hover:bg-[#EBE9E4] hover:text-[#1D1D1F]"
              }`}
            >
              {occ.label}
            </button>
          ))}

          {/* Refresh Button */}
          <button
            onClick={() => loadRecommendations(true)}
            disabled={loading}
            title="Regenerate with Zyra"
            className="w-9 h-9 rounded-full bg-[#F4F2EE] hover:bg-[#EBE9E4] text-[#1D1D1F] flex items-center justify-center cursor-pointer border-none shrink-0 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#F07020]" : ""} />
          </button>
        </div>
      </div>

      {/* ── LOADING STATE ── */}
      {loading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div key={idx} className="flex flex-col gap-3 animate-pulse">
              <div className="aspect-[3/4] bg-[#F0EDE8] rounded-[22px]" />
              <div className="h-4 bg-[#F0EDE8] rounded-md w-3/4" />
              <div className="h-3 bg-[#F0EDE8] rounded-md w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* ── ERROR STATE ── */}
      {!loading && error && (
        <div className="p-8 rounded-[24px] bg-[#FFF8F6] border border-[#FDE3DE] text-center space-y-4 max-w-lg mx-auto">
          <AlertCircle size={32} className="text-[#F07020] mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-[#1D1D1F]">
              Zyra Recommendation Service Unavailable
            </h3>
            <p className="text-xs text-[#71717A] leading-relaxed">{error}</p>
          </div>
          <button
            onClick={() => loadRecommendations(true)}
            className="h-9 px-5 bg-[#1D1D1F] hover:bg-[#F07020] text-white text-xs font-semibold rounded-full border-none cursor-pointer transition-colors shadow-xs"
          >
            Retry Zyra AI
          </button>
        </div>
      )}

      {/* ── EMPTY STATE ── */}
      {!loading && !error && recommendations.length === 0 && (
        <div className="text-center py-16 space-y-3">
          <p className="text-sm font-medium text-[#71717A]">
            No recommendations found for &quot;{selectedOccasion}&quot;.
          </p>
          <button
            onClick={() => loadRecommendations(true)}
            className="h-9 px-5 bg-[#1D1D1F] text-white text-xs font-semibold rounded-full border-none cursor-pointer"
          >
            Generate Recommendations
          </button>
        </div>
      )}

      {/* ── TOP-10 PRODUCT CARDS GRID ── */}
      {!loading && !error && recommendations.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
          {recommendations.map((item) => {
            const saved = isSaved?.(item.productId);
            const isAdded = addedProductIds[item.productId];
            const matchPercent = Math.round((item.score || 0.90) * 100);

            return (
              <div
                key={item.productId}
                onClick={() => handleCardClick(item.productId)}
                className="group cursor-pointer flex flex-col gap-3"
              >
                {/* Image Container with Rank & Match Score */}
                <div className="aspect-[3/4] bg-[#FAF8F5] rounded-[22px] overflow-hidden border border-[#E7E3DD] relative shadow-xs group-hover:shadow-md transition-shadow">
                  <img
                    src={
                      item.imageUrl ||
                      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
                    }
                    alt={item.title || item.productId}
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                  />

                  {/* Top Left Rank Badge */}
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-[#1D1D1F]/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wider shadow-xs">
                    #{item.rank}
                  </span>

                  {/* Top Right Match Score Pill */}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E7E3DD] text-[#1D1D1F] text-[10px] font-semibold tracking-tight shadow-xs">
                    {matchPercent}% Match
                  </span>

                  {/* Save to Wardrobe Bookmark */}
                  <button
                    onClick={(e) => handleToggleLike(e, item)}
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-[#E7E3DD] flex items-center justify-center cursor-pointer shadow-xs p-0 z-10 hover:bg-white transition-transform hover:scale-105"
                    aria-label="Save to Wardrobe"
                    title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
                  >
                    <Bookmark
                      size={14}
                      className={`transition-colors ${
                        saved ? "fill-[#F07020] text-[#F07020]" : "text-[#71717A]"
                      }`}
                    />
                  </button>

                  {/* Add to Bag Hover Button */}
                  <div className="absolute bottom-3 left-3 right-12 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={(e) => handleAddToCart(e, item)}
                      className={`w-full h-8 rounded-full text-[10px] font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer border-none shadow-md ${
                        isAdded
                          ? "bg-[#2E7D32] text-white"
                          : "bg-[#1D1D1F]/95 hover:bg-[#F07020] text-white"
                      }`}
                    >
                      <ShoppingBag size={12} />
                      <span>{isAdded ? "ADDED ✓" : "BAG"}</span>
                    </button>
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-0.5 px-1">
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-xs font-semibold text-[#1D1D1F] group-hover:text-[#F07020] transition-colors truncate max-w-[140px]">
                      {item.title || `Product ${item.productId}`}
                    </h3>
                    <span className="text-xs font-bold text-[#1D1D1F]">
                      ₹{Math.round(item.price || 999).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#86868B] font-normal truncate">
                    {item.brand || "Luxzera Studio"} • {item.primaryColor || "Curated"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
