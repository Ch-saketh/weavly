"use client";

// src/components/RelatedProducts.jsx


import { useRouter } from "next/navigation";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/modules/cart/store/CartContext";

export default function RelatedProducts({ products = [] }) {
  const router = useRouter();
  const { addToCart } = useCart();

  if (products.length === 0) return null;

  return (
    <section className="mt-24">
      <h2 className="text-4xl font-black uppercase tracking-tighter text-[#0b2240] mb-8">
        You May Also Like
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((p) => {
          const defaultSize = p.sizes?.[0] ?? "M";
          return (
            <div
              key={p.id}
              onClick={() => router.push(`/product/${p.id}`)}
              className="group bg-white border border-slate-100 hover:border-[#0b2240] transition-all duration-300 flex flex-col cursor-pointer"
            >
              {/* Product Card Image Frame */}
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-50">
                <img
                  src={p.images?.[0] || p.image}
                  alt={p.name}
                  className="w-full h-full object-cover object-top grayscale group-hover:grayscale-0 transition-all duration-500 ease-out"
                />
                
                {/* Fast Checkout Action Bar */}
                <div className="absolute bottom-0 inset-x-0 flex translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({ ...p, size: defaultSize });
                    }}
                    className="flex-1 flex items-center justify-center gap-2 py-3 font-black uppercase text-[10px] tracking-widest bg-[#ff5700] hover:bg-[#0b2240] text-white transition-colors duration-200"
                  >
                    <ShoppingBag size={12} strokeWidth={2.5} />
                    Add To Bag
                  </button>
                  <div className="w-12 flex items-center justify-center bg-white border-l border-slate-200 text-[#0b2240]">
                    <Eye size={14} />
                  </div>
                </div>
              </div>

              {/* Information Meta details */}
              <div className="p-4 flex flex-col gap-1">
                <span className="text-[9px] font-black uppercase tracking-widest text-[#3b82f6]">
                  {p.brand}
                </span>
                <h3 className="text-xs font-extrabold uppercase tracking-tight text-[#0b2240] line-clamp-1">
                  {p.name}
                </h3>
                <span className="text-xs font-black text-[#0b2240] mt-1">
                  ${p.price.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}