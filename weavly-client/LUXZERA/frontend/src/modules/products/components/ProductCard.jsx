"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark } from "lucide-react";
import { useCart }     from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import MobileProductCard from "@/modules/products/components/MobileProductCard";
import { recordClickActivity, recordBagActivity } from "@/modules/user/services/userActivityService";

export default function ProductCard({ product, onViewProduct, source = "MARKET" }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addToCart }          = useCart();
  const { isSaved, toggleWardrobe } = useWardrobe();

  const productId = product.id || product.productId;
  const productName = product.name || product.title || "Product";
  const productPrice = typeof product.price === "number" ? product.price : Number(product.price) || 999.0;
  const productImage = product.images?.[0] || product.image || product.imageUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23F4F1EC'/%3E%3C/svg%3E";

  const saved = isSaved(productId);
  const defaultSize = product.sizes?.[0] ?? "M";

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdded(true);
    recordBagActivity(product, "ADD", defaultSize);
    addToCart({ ...product, id: productId, size: defaultSize, price: productPrice });
    setTimeout(() => setAdded(false), 1800);
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWardrobe({ ...product, id: productId, price: productPrice });
  };

  const handleView = () => {
    recordClickActivity(product, source);
    if (onViewProduct) { onViewProduct(product); return; }
    router.push(`/product/${productId}`);
  };

  const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23F4F1EC'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='500' fill='%239E9484' text-anchor='middle' letter-spacing='2'%3ELUXZERA%3C/text%3E%3C/svg%3E";

  const ensureHttps = (url) => {
    if (!url || typeof url !== "string") return "";
    return url.replace(/^http:\/\//i, "https://");
  };

  const rawImg = product.imageUrl || product.image || product.images?.[0];
  const displayImage = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;

  return (
    <>
      <div className="sm:hidden">
        <MobileProductCard product={product} onViewProduct={onViewProduct} />
      </div>
      <div
        onClick={handleView}
        className="hidden sm:flex group relative flex-col bg-transparent cursor-pointer text-left font-sans select-none"
      >
        {/* Image */}
        <div className="relative aspect-[3/4.2] overflow-hidden bg-[#E5EEF3] border border-[#183B56]/20 select-none flex items-center justify-center rounded-2xl shadow-xs transition-shadow duration-300 group-hover:shadow-md p-4">
          <img
            src={displayImage}
            alt={product.name || product.title || "Product"}
            className="w-full h-full object-contain mix-blend-multiply transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
            }}
          />

          {/* Quick Add panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
            <button
              onClick={handleAdd}
              className="w-full py-3.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-white hover:bg-[#102A43] transition-colors duration-200 border-none cursor-pointer"
            >
              {added ? "Added to Bag ✓" : "Add to Bag"}
            </button>
          </div>

          {/* Optional Badge */}
          {product.badge && (
            <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#183B56] border border-[#183B56]/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 z-10 rounded-full shadow-2xs">
              {product.badge}
            </span>
          )}

          {/* Save to Wardrobe — top-right */}
          <button
            onClick={handleBookmark}
            className={`absolute top-3 right-3 z-30 w-8.5 h-8.5 rounded-full flex items-center justify-center transition-all duration-300 ${
              saved
                ? "bg-white shadow-md scale-110 border border-[#183B56]/30"
                : "bg-white/85 backdrop-blur-md text-[#183B56] opacity-85 hover:opacity-100 hover:bg-white hover:scale-110 border border-[#183B56]/20"
            }`}
            title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
          >
            <Bookmark
              size={15}
              className={`transition-colors ${
                saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"
              }`}
            />
          </button>
        </div>

        {/* Details */}
        <div className="pt-3 pb-1 flex flex-col font-sans">
          <div className="flex items-center justify-between text-[11px] font-semibold tracking-[0.15em] text-[#5A7184] uppercase mb-0.5">
            <span className="truncate">{product.brand || "Weavly ATELIER"}</span>
            {product.category && (
              <span className="text-[#5A7184]/70 text-[10px] uppercase tracking-wider shrink-0">{product.category}</span>
            )}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-bold text-[13px] text-[#183B56] group-hover:text-[#102A43] transition-colors leading-tight truncate flex-1 flex items-center gap-1">
              <span>{product.name || product.title}</span>
              <span>→</span>
            </h3>
            <span className="text-[13px] font-bold text-[#183B56] tracking-wide shrink-0">
              ₹{Math.round(productPrice).toLocaleString("en-IN")}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
