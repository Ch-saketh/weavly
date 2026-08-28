"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Bookmark } from "lucide-react";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";

export default function MobileProductCard({ product, onViewProduct }) {
  const [added, setAdded] = useState(false);
  const router = useRouter();
  const { addToCart } = useCart();
  const { isSaved, toggleWardrobe } = useWardrobe();

  const productId = product.id || product.productId;
  const productName = product.name || product.title || "Product";
  const productImage = product.imageUrl || product.image || product.images?.[0] || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80";

  const saved = isSaved(productId);
  const defaultSize = product.sizes?.[0] ?? "M";

  const openProduct = () => {
    if (onViewProduct) {
      onViewProduct(product);
      return;
    }
    router.push(`/product/${productId}`);
  };

  const handleAdd = (event) => {
    event.stopPropagation();
    setAdded(true);
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
            e.currentTarget.src = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=900&q=80";
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
            ${product.price.toFixed(0)}
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
