"use client";

import { ArrowRight, ShoppingBag, Sparkles, Heart, Eye, Star } from "lucide-react";
import MobileHero from "@/modules/home/components/MobileHero";

const SHOWCASE_PRODUCTS = [
  {
    id: "hero-1",
    name: "Atelier Graphic Heavyweight Tee",
    brand: "Weavly Studio",
    price: "$120",
    badge: "HOT DROP",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=85",
  },
  {
    id: "hero-2",
    name: "Japanese Raw Denim Jacket",
    brand: "Tokyo Sartorial",
    price: "$240",
    badge: "NEW ARRIVAL",
    rating: "5.0",
    img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=85",
  },
  {
    id: "hero-3",
    name: "Cropped Oversized Hoodie",
    brand: "Atelier Streetwear",
    price: "$160",
    badge: "POPULAR",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=85",
  },
  {
    id: "hero-4",
    name: "Editorial Cut Blazer Coat",
    brand: "Milan Atelier",
    price: "$380",
    badge: "LIMITED",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=85",
  },
];

export default function Hero({ onShopNow }) {
  return (
    <>
      <div className="md:hidden">
        <MobileHero onShopNow={onShopNow} />
      </div>
      
      <section className="hidden md:block w-full bg-white font-sans select-none border-b border-[#ECECEC]">

        {/* ═══ 1. HIGH-CONTRAST MARQUEE STRIP ═══ */}
        <div className="w-full bg-[#18181B] text-white py-2.5 px-8 flex items-center justify-between text-[11px] font-extrabold uppercase tracking-[0.2em] border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#F07020] animate-pulse" />
            <span>SS26 ATELIER DROPS • 150+ INDEPENDENT DESIGNERS</span>
          </div>
          <div className="flex items-center gap-6 text-white/70">
            <span>EXPRESS WORLDWIDE SHIPPING</span>
            <span>•</span>
            <span>VERIFIED SARTORIAL QUALITY</span>
          </div>
        </div>

        {/* ═══ 2. TOP HERO TITLE & CATEGORY BAR ═══ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 pt-8 pb-4">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-[#ECECEC]">
            <div>
              <div className="inline-flex items-center gap-2 text-[#F07020] text-[11px] font-extrabold uppercase tracking-[0.2em] mb-2">
                <Sparkles size={13} />
                <span>Featured Atelier Drops</span>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black uppercase text-[#18181B] tracking-tight leading-none">
                NEW SEASONAL FITS &amp; DROPS.
              </h1>
              <p className="mt-2 text-[14px] text-[#86868B] font-medium">
                Direct access to independent luxury fashion ateliers. Shop top trending silhouettes below.
              </p>
            </div>

            {/* Direct Category Filters & Shop All Action */}
            <div className="flex flex-wrap items-center gap-2">
              {["All Drops", "Outerwear", "Streetwear", "Sartorial", "New Arrivals"].map((cat, idx) => (
                <button
                  key={cat}
                  onClick={onShopNow}
                  className={`px-4 py-2 rounded-full text-[11px] font-extrabold uppercase tracking-wider transition-all border cursor-pointer ${
                    idx === 0
                      ? "bg-[#18181B] text-white border-[#18181B]"
                      : "bg-[#FAFAF9] hover:bg-white text-[#37352F] hover:text-[#F07020] border-[#ECECEC]"
                  }`}
                >
                  {cat}
                </button>
              ))}

              <button
                onClick={onShopNow}
                className="bg-[#F07020] hover:bg-[#D85C10] text-white text-[11px] font-extrabold uppercase tracking-[0.15em] px-5 py-2 rounded-full flex items-center gap-1.5 transition-all shadow-sm cursor-pointer border-none ml-2"
              >
                <span>Shop All</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* ═══ 3. DIRECT 4-COLUMN PRODUCT SHOWCASE GRID (First Fold) ═══ */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 pb-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {SHOWCASE_PRODUCTS.map((product) => (
              <div
                key={product.id}
                onClick={onShopNow}
                className="group flex flex-col cursor-pointer"
              >
                {/* Product Image Canvas */}
                <div className="relative w-full h-[340px] xl:h-[380px] rounded-2xl overflow-hidden bg-[#FAFAF9] border border-[#ECECEC] group-hover:border-[#F07020]/40 transition-all shadow-2xs group-hover:shadow-xl">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  
                  {/* Top Badge Overlay */}
                  <div className="absolute top-3 left-3 bg-[#F07020] text-white px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase tracking-[0.15em] shadow-sm">
                    {product.badge}
                  </div>

                  {/* Rating Tag Overlay */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#ECECEC] text-[10px] font-extrabold text-[#18181B] flex items-center gap-1 shadow-2xs">
                    <Star size={11} className="fill-[#F07020] text-[#F07020]" />
                    <span>{product.rating}</span>
                  </div>

                  {/* Hover Action Overlay Pill */}
                  <div className="absolute bottom-4 left-4 right-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onShopNow();
                      }}
                      className="w-full bg-[#18181B] hover:bg-[#F07020] text-white font-extrabold uppercase text-[11px] tracking-[0.15em] py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-colors border-none cursor-pointer"
                    >
                      <ShoppingBag size={14} />
                      <span>Quick Add to Bag</span>
                    </button>
                  </div>
                </div>

                {/* Product Details Below Canvas */}
                <div className="pt-3 flex flex-col gap-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-[#F07020]">
                    {product.brand}
                  </span>
                  <h3 className="text-[13px] font-bold text-[#18181B] group-hover:text-[#F07020] transition-colors truncate">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[15px] font-black text-[#18181B]">{product.price}</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] group-hover:text-[#F07020] transition-colors flex items-center gap-1">
                      Shop Fit <ArrowRight size={11} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </section>
    </>
  );
}
