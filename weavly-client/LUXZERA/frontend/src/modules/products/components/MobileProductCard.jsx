"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingBag, Bookmark } from "lucide-react";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { recordClickActivity, recordBagActivity } from "@/modules/user/services/userActivityService";

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23E2EAEF'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='600' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";

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
  const productPrice = typeof product.price === "number" ? product.price : Number(product.price) || 999.0;

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
    addToCart({ ...product, id: productId, size: defaultSize, price: productPrice });
    setTimeout(() => setAdded(false), 1500);
  };

  const handleSave = (event) => {
    event.stopPropagation();
    toggleWardrobe({ ...product, id: productId, price: productPrice });
  };

  return (
    <article
      onClick={openProduct}
      className="bg-[#F5EFEB] border border-[#183B56]/30 overflow-hidden text-center cursor-pointer select-none"
    >
      {/* Full-bleed Cool Image Container */}
      <div className="relative aspect-[3/3.8] bg-[#E2EAEF] border-b border-[#183B56]/30 flex items-center justify-center p-3">
        <img
          src={productImage}
          alt={productName}
          className="h-full w-full object-contain mix-blend-multiply"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
          }}
        />
        {product.badge && (
          <span className="absolute left-2 top-2 rounded-xs bg-white/90 border border-[#183B56]/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#183B56]">
            {product.badge}
          </span>
        )}
        <button
          onClick={handleSave}
          className={`absolute right-2 top-2 h-7 w-7 rounded-full flex items-center justify-center transition-all ${
            saved
              ? "bg-white border border-[#183B56]/40 shadow-xs"
              : "bg-white/80 text-[#183B56] border border-[#183B56]/20"
          }`}
          aria-label={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
        >
          <Bookmark
            size={12}
            className={`transition-colors ${
              saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"
            }`}
          />
        </button>
      </div>

      {/* Bottom Title & Rate Box */}
      <div className="py-2.5 px-2 flex flex-col items-center justify-center space-y-0.5">
        <h3 className="text-[12px] font-bold text-[#183B56] truncate max-w-full flex items-center justify-center gap-1">
          <span>{productName}</span>
          <span>→</span>
        </h3>
        <span className="text-[13px] font-bold text-[#183B56]">
          ₹{Math.round(productPrice).toLocaleString("en-IN")}
        </span>
      </div>
    </article>
  );
}
