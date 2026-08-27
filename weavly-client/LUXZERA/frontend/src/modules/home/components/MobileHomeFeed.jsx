"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Heart, ShoppingBag, TrendingUp, ChevronRight, Zap } from "lucide-react";
import { PRODUCTS } from "@/modules/products/data/products";
import MobileProductCard from "@/modules/products/components/MobileProductCard";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useAuth } from "@/modules/auth/store/useAuth";

const STORIES = [
  { id: "new", name: "New Drop", tag: "Just In", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80", color: "#F07020" },
  { id: "men", name: "Men", tag: "Sartorial", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80", color: "#37352F" },
  { id: "women", name: "Women", tag: "Editorial", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&q=80", color: "#F07020" },
  { id: "outer", name: "Outerwear", tag: "Jackets", img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&q=80", color: "#F07020" },
  { id: "belts", name: "Belts & Acc", tag: "Luxury", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80", color: "#C6A15B" },
  { id: "street", name: "Streetwear", tag: "Relaxed", img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80", color: "#37352F" },
  { id: "denim", name: "Denim", tag: "Classic", img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&q=80", color: "#37352F" },
  { id: "footwear", name: "Footwear", tag: "Sartorial", img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80", color: "#F07020" },
  { id: "designers", name: "Atelier", tag: "Exclusive", img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80", color: "#C6A15B" },
];

import { getProducts } from "@/modules/products/services/productService";

const CATEGORY_TAGS = ["All", "Tops", "Outerwear", "Bottoms", "Denim", "Belts & Acc", "Footwear", "Luxury"];

export default function MobileHomeFeed({ onShopNow }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("All");
  const [products, setProducts] = useState(() => PRODUCTS);

  // Derive gender for backend filter
  const userGenderRaw = (user?.gender || "").toLowerCase();
  const genderParam = ["male", "men", "man", "boy"].includes(userGenderRaw)
    ? "men"
    : ["female", "women", "woman", "girl"].includes(userGenderRaw)
    ? "women"
    : undefined;

  useEffect(() => {
    let isMounted = true;
    getProducts({ limit: 20, gender: genderParam }).then((items) => {
      if (isMounted && Array.isArray(items) && items.length > 0) {
        setProducts(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [genderParam]);

  const trendingProducts = products.slice(0, 6);
  const editorProducts = products.slice(6, 10);

  const handleCategoryClick = (tag) => {
    setActiveCategory(tag);
    if (tag === "All") {
      onShopNow();
    } else {
      router.push(`/market?category=${encodeURIComponent(tag)}`);
    }
  };

  return (
    <section className="md:hidden bg-[#FFFFFF] min-h-screen pb-36 font-sans select-none overflow-x-hidden">
      
      {/* ═══ 1. INSTAGRAM/APP-STYLE STORIES ROW (No Divider Lines) ═══ */}
      <div className="bg-transparent py-4 px-4 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-4 min-w-max">
          {STORIES.map((story) => (
            <button
              key={story.id}
              onClick={() => {
                if (story.id === "new") router.push("/market?sort=newest");
                else if (story.id === "men") router.push("/men");
                else if (story.id === "women") router.push("/women");
                else router.push("/market");
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer border-none bg-transparent"
            >
              <div className="p-[2.5px] rounded-full bg-gradient-to-tr from-[#F07020] via-[#C6A15B] to-[#37352F] group-active:scale-95 transition-transform duration-150">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white bg-white relative">
                  <img
                    src={story.img}
                    alt={story.name}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#37352F] tracking-tight truncate max-w-[76px]">
                {story.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══ 2. CATEGORY QUICK PILLS BAR (Seamless Floating Pill Bar) ═══ */}
      <div className="bg-transparent py-2 px-4 overflow-x-auto scrollbar-none sticky top-16 z-30">
        <div className="flex items-center gap-2 min-w-max bg-[#FFFFFF] px-3 py-2 rounded-full border border-[#ECECEC] shadow-xs transform-gpu">
          {CATEGORY_TAGS.map((tag) => {
            const isActive = activeCategory === tag;
            return (
              <button
                key={tag}
                onClick={() => handleCategoryClick(tag)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider transition-transform duration-150 active:scale-95 cursor-pointer border-none ${
                  isActive
                    ? "bg-[#F07020] text-white shadow-xs"
                    : "bg-transparent text-[#37352F] hover:bg-[#FAFAF9] hover:text-[#F07020]"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══ 4. DIRECT PRODUCTS SWIPER (IMMEDIATELY UPFRONT) ═══ */}
      <div className="pt-6 pb-4">
        <div className="flex items-center justify-between px-5 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F07020] block">
              Just Dropped
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#37352F]">
              Direct Collection
            </h2>
          </div>
          <button
            onClick={onShopNow}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] hover:text-[#F07020] transition-colors border-none bg-transparent cursor-pointer"
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        {/* Scroll Row */}
        <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-none snap-x snap-mandatory transform-gpu">
          {trendingProducts.map((product) => (
            <div key={product.id} className="snap-center shrink-0 w-[72vw] min-[400px]:w-[240px]">
              <MobileProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 4. FULL-BLEED EDITORIAL 4:5 HERO CAROUSEL ═══ */}
      <div className="px-4 pt-6 pb-2">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-[#F07020]" />
            <h2 className="text-[14px] font-extrabold uppercase tracking-wider text-[#37352F]">
              Featured Editorial
            </h2>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#9B9B9B]">01 / 03</span>
        </div>

        {/* Full-bleed swipeable card */}
        <div 
          onClick={onShopNow}
          className="relative w-full aspect-[4/5] rounded-3xl overflow-hidden border border-[#ECECEC] shadow-xs bg-[#37352F] group cursor-pointer transform-gpu"
        >
          <img
            src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=85"
            alt="Editorial campaign"
            className="w-full h-full object-cover object-top group-active:scale-103 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#37352F]/90 via-[#37352F]/20 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <span className="bg-[#FFFFFF] text-[#37352F] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full border border-[#ECECEC]">
              Capsule SS26
            </span>
            <span className="bg-[#F07020] text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              New Drop
            </span>
          </div>

          {/* Bottom Card Copy */}
          <div className="absolute bottom-6 left-5 right-5 text-white">
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/70 block mb-1">
              // Lookbook Edit
            </span>
            <h3 className="text-2xl min-[390px]:text-3xl font-black uppercase leading-tight tracking-tight">
              Sartorial Minimalist
            </h3>
            <p className="mt-1 text-[12px] text-white/80 line-clamp-2 font-medium">
              Architectural silhouettes designed for modern elegance.
            </p>

            <button className="mt-4 w-full h-12 bg-white text-[#37352F] rounded-xl font-bold uppercase text-[12px] tracking-wider flex items-center justify-center gap-2 active:bg-[#FAFAF9] transition-colors border-none">
              Explore Edit
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ═══ 5. HORIZONTAL PRODUCTS SWIPER (TRENDING FITS) ═══ */}
      <div className="pt-8 pb-4">
        <div className="flex items-center justify-between px-5 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F07020] block">
              Curated Edit
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#37352F]">
              Trending Fits
            </h2>
          </div>
          <button
            onClick={onShopNow}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] hover:text-[#F07020] transition-colors border-none bg-transparent"
          >
            See All <ChevronRight size={14} />
          </button>
        </div>

        {/* Scroll Row */}
        <div className="flex gap-4 overflow-x-auto px-5 pb-2 scrollbar-none snap-x snap-mandatory">
          {trendingProducts.map((product) => (
            <div key={product.id} className="snap-center shrink-0 w-[72vw] min-[400px]:w-[240px]">
              <MobileProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* ═══ 6. MOBILE HIGH-IMPACT PROMO CARD (KISS Professional Black) ═══ */}
      <div className="px-4 py-4">
        <div 
          onClick={onShopNow}
          className="bg-[#18181B] active:bg-[#000000] rounded-3xl p-6 text-white relative overflow-hidden group cursor-pointer shadow-sm border border-[#ECECEC]"
        >
          <h3 className="text-2xl font-black uppercase leading-tight tracking-tight text-[#FAFAF9]">
            Curated Fits<br />For You Alone
          </h3>
          <p className="mt-2 text-[12px] text-[#9B9B9B] font-medium max-w-[260px] leading-relaxed">
            Answer 3 questions to unlock your personalized fashion recommendations.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 bg-[#F07020] hover:bg-[#D85C10] text-white text-[11px] font-bold uppercase tracking-wider px-6 py-3.5 rounded-xl border-none cursor-pointer">
            <Sparkles size={14} className="fill-white" />
            Get Started
            <ArrowRight size={14} />
          </div>
        </div>
      </div>

      {/* ═══ 7. EDITOR'S PICKS GRID ═══ */}
      <div className="pt-6 px-4">
        <div className="flex items-center justify-between px-1 mb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#F07020] block">
              Handpicked
            </span>
            <h2 className="text-xl font-black uppercase tracking-tight text-[#37352F]">
              Editor's Selects
            </h2>
          </div>
          <button
            onClick={onShopNow}
            className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#9B9B9B] hover:text-[#F07020] transition-colors border-none bg-transparent"
          >
            All <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {editorProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl p-2 border border-[#ECECEC] shadow-sm flex flex-col justify-between">
              <div 
                onClick={() => router.push(`/product/${product.id}`)}
                className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-[#FAFAF9] cursor-pointer"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleWardrobe(product);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#FFFFFF] border border-[#ECECEC] flex items-center justify-center text-[#37352F] border-none cursor-pointer transform-gpu active:scale-95 transition-transform duration-150"
                >
                  <Heart size={13} className={isSaved?.(product.id) ? "fill-[#F07020] text-[#F07020]" : "text-[#37352F]"} />
                </button>
              </div>

              <div className="pt-2.5 px-1 pb-1">
                <span className="text-[10px] font-bold text-[#9B9B9B] uppercase tracking-wider block truncate">
                  {product.brand || "Weavly"}
                </span>
                <h4 
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="text-[12px] font-bold text-[#37352F] truncate cursor-pointer hover:text-[#F07020] transition-colors mt-0.5"
                >
                  {product.name}
                </h4>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[13px] font-black text-[#37352F]">
                    ${product.price}
                  </span>
                  <button
                    onClick={() => addToCart(product)}
                    className="w-8 h-8 rounded-lg bg-[#37352F] hover:bg-[#F07020] text-white flex items-center justify-center transition-colors border-none cursor-pointer"
                    aria-label="Add to cart"
                  >
                    <ShoppingBag size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
