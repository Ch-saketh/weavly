"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, ShoppingBag } from "lucide-react";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import MobileProductCard from "@/modules/products/components/MobileProductCard";
import { recordClickActivity, recordBagActivity } from "@/modules/user/services/userActivityService";

export default function ProductCard({ product, onViewProduct, source = "MARKET" }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
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

  const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23E2EAEF'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='600' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";

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
        className="hidden sm:flex group relative flex-col bg-[#F5EFEB] border border-[#183B56]/30 overflow-hidden cursor-pointer text-center font-sans select-none hover:border-[#183B56] transition-colors"
      >
        {/* Full-bleed Cool-Tinted Flat Image Box */}
        <div className="relative aspect-[3/3.8] bg-[#E2EAEF] border-b border-[#183B56]/30 overflow-hidden flex items-center justify-center p-4">
          <img
            src={displayImage}
            alt={productName}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
            }}
          />

          {/* Quick Add Bottom Bar on Hover */}
          <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
            <button
              onClick={handleAdd}
              className="w-full py-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold text-white hover:bg-[#102A43] transition-colors border-none cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={12} />
              <span>{added ? "Added to Bag ✓" : "Add to Bag"}</span>
            </button>
          </div>

          {/* Optional Badge */}
          {product.badge && (
            <span className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs text-[#183B56] border border-[#183B56]/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 z-10 rounded-sm shadow-2xs">
              {product.badge}
            </span>
          )}

          {/* Wardrobe Bookmark (top-right) */}
          <button
            onClick={handleBookmark}
            className={`absolute top-2.5 right-2.5 z-30 w-7.5 h-7.5 rounded-full flex items-center justify-center transition-all ${
              saved
                ? "bg-white shadow-xs scale-105 border border-[#183B56]/40"
                : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 border border-[#183B56]/20"
            }`}
            title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
          >
            <Bookmark
              size={13}
              className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
            />
          </button>
        </div>

        {/* Bottom Rate & Title Box */}
        <div className="py-3 px-3 flex flex-col items-center justify-center bg-[#F5EFEB] space-y-1">
          <h3 className="font-bold text-[13px] text-[#183B56] group-hover:underline transition-colors leading-tight truncate max-w-full flex items-center justify-center gap-1">
            <span>{productName}</span>
            <span>→</span>
          </h3>
          <span className="text-[14px] font-bold text-[#183B56] tracking-tight">
            ₹{Math.round(productPrice).toLocaleString("en-IN")}
          </span>
        </div>
      </div>
    </>
  );
}
