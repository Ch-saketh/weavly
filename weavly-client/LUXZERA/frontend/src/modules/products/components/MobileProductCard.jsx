"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Bookmark } from "lucide-react";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { recordClickActivity, recordBagActivity } from "@/modules/user/services/userActivityService";

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23F4F1EC'/%3E%3Cpath d='M260 360C260 337.909 277.909 320 300 320C322.091 320 340 337.909 340 360V420C340 442.091 322.091 460 300 460C277.909 460 260 442.091 260 420V360Z' stroke='%23C5BCAD' stroke-width='8'/%3E%3Cpath d='M230 460C230 440 250 420 300 420C350 420 370 440 370 460V500H230V460Z' stroke='%23C5BCAD' stroke-width='8'/%3E%3Ctext x='50%25' y='560' font-family='sans-serif' font-size='16' font-weight='500' fill='%239E9484' text-anchor='middle' letter-spacing='2'%3ELUXZERA%3C/text%3E%3C/svg%3E";

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace(/^http:\/\//i, "https://");
};

export default function MobileProductCard({ product, onViewProduct, source = "MARKET" }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { isSaved, toggleWardrobe } = useWardrobe();

  const productId = product.id || product.productId;
  const productName = product.name || product.title || "Product";
  const rawImg = product.imageUrl || product.image || product.images?.[0];
  const productImage = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;

  const saved = isSaved(productId);
  const defaultSize = product.sizes?.[0] ?? "M";

  const openProduct = () => {
    recordClickActivity(product, source);
    if (onViewProduct) {
      onViewProduct(product);
      return;
    }
    router.push(`/product/${productId}`);
  };

  const handleAdd = (event) => {
    event.stopPropagation();
    setAdded(true);
    recordBagActivity(product, "ADD", defaultSize);
    addToCart({ ...product, id: productId, size: defaultSize });
    setTimeout(() => setAdded(false), 1500);
  };

  const handleSave = (event) => {
    event.stopPropagation();
    toggleWardrobe({ ...product, id: productId });
  };

  return (
    <article onClick={openProduct} className="rounded-2xl bg-white border border-[#ECECEC] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
      <div className="relative aspect-[4/5] bg-white">
        <img
          src={productImage}
          alt={productName}
          className="h-full w-full object-cover object-top"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
          }}
        />
        {product.badge && (
          <span className="absolute left-3 top-3 rounded-lg bg-[#FFFFFF] border border-[#ECECEC] px-2.5 py-1 text-[12px] font-semibold uppercase tracking-[0.15em] text-[#1D1D1F] shadow-xs">
            {product.badge}
          </span>
        )}
        <button
          onClick={handleSave}
          className={`absolute right-3 top-3 h-8 w-8 rounded-full flex items-center justify-center shadow-xs transition-transform duration-200 ease-out transform-gpu active:scale-95 ${
            saved
              ? "bg-[#FFFFFF] scale-105 border border-[#ECECEC]"
              : "bg-[#FFFFFF] text-[#111111] border border-[#ECECEC]"
          }`}
          aria-label={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
        >
          <Bookmark
            size={14}
            className={`transition-colors ${
              saved ? "fill-[#F07020] text-[#F07020]" : "text-[#111111]"
            }`}
          />
        </button>
      </div>

      <div className="p-4">
        <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-[#86868B]">
          {product.brand || "Weavly"}
        </p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="text-[14px] font-semibold uppercase leading-tight tracking-wider text-[#1D1D1F] truncate flex-1">
            {product.name}
          </h3>
          <span className="shrink-0 text-[14px] font-bold text-[#1D1D1F] tracking-wide">
            ₹{Math.round(product.price || 999).toLocaleString("en-IN")}
          </span>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={handleAdd}
            className="h-10 flex-1 rounded-xl bg-[#1D1D1F] text-[#FAFAF9] text-[12px] font-semibold uppercase tracking-[0.15em] flex items-center justify-center gap-2 active:scale-95 transform-gpu transition-transform duration-150 border-none cursor-pointer"
          >
            <ShoppingBag size={14} />
            {added ? "Added" : "Add"}
          </button>
          <button
            onClick={openProduct}
            className="h-10 px-4 rounded-xl border border-[#ECECEC] text-[12px] font-semibold uppercase tracking-[0.15em] text-[#1D1D1F] active:scale-95 transform-gpu transition-transform duration-150 bg-white border-none cursor-pointer"
          >
            View
          </button>
        </div>
      </div>
    </article>
  );
}
