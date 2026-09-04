"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/modules/products/services/productService";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";
import { ProductDetailSkeleton } from "@/shared/components/ui/Skeleton";
import {
  ShoppingBag,
  Truck,
  Globe,
  ShieldCheck,
  ChevronDown,
  Star,
  Check,
  Feather,
  Sparkles,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Bookmark,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import branding from "@/config/branding";

const DEFAULT_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWardrobe, isSaved } = useWardrobe();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState("designerNotes");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (id) {
      setLoading(true);
      getProductById(id).then((fetched) => {
        if (isMounted) {
          setProduct(fetched || null);
          setLoading(false);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (product) {
      const initialImg =
        product.imageUrl ||
        product.image ||
        (product.images && product.images.length > 0 ? product.images[0] : DEFAULT_FALLBACK_IMAGE);
      setSelectedImage(initialImg);
      setActiveImgIndex(0);
      setSelectedSize(product.sizes?.[0] || "M");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [product]);

  // Handle ESC key & Keyboard Arrow navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (lightboxOpen) {
        if (e.key === "ArrowRight") handleNextImg();
        if (e.key === "ArrowLeft") handlePrevImg();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, activeImgIndex]);

  const productImages = (() => {
    if (!product) return [DEFAULT_FALLBACK_IMAGE];
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    if (product.imageUrl) return [product.imageUrl];
    if (product.image) return [product.image];
    return [DEFAULT_FALLBACK_IMAGE];
  })();

  const colorOptions = [
    { name: "Black", color: "#111111" },
    { name: "Olive", color: "#6A7B52" },
    { name: "Sand", color: "#D8CDBC" },
    { name: "Stone", color: "#9CA4A6" },
    { name: "Navy", color: "#1F2B42" },
  ];

  const sizeOptions = ["S", "M", "L", "XL", "XXL"];

  const handleSelectImg = (img, idx) => {
    setSelectedImage(img);
    setActiveImgIndex(idx);
  };

  const handleNextImg = (e) => {
    e?.stopPropagation();
    const nextIdx = (activeImgIndex + 1) % productImages.length;
    setActiveImgIndex(nextIdx);
    setSelectedImage(productImages[nextIdx]);
  };

  const handlePrevImg = (e) => {
    e?.stopPropagation();
    const prevIdx = (activeImgIndex - 1 + productImages.length) % productImages.length;
    setActiveImgIndex(prevIdx);
    setSelectedImage(productImages[prevIdx]);
  };

  const toggleAccordion = (name) => {
    setOpenAccordion(openAccordion === name ? null : name);
  };

  const handleAddToCart = () => {
    if (!product) return;
    const pid = product.productId || product.id;
    addToCart({
      id: pid,
      name: product.name,
      price: product.price,
      image: selectedImage || product.imageUrl || product.image || DEFAULT_FALLBACK_IMAGE,
      brand: product.brand,
      size: selectedSize,
      color: selectedColor,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleWardrobe = (e) => {
    e?.stopPropagation();
    if (!product) return;
    const pid = product.productId || product.id;
    toggleWardrobe({
      id: pid,
      name: product.name,
      price: product.price,
      image: selectedImage || product.imageUrl || product.image || DEFAULT_FALLBACK_IMAGE,
      brand: product.brand,
      category: product.category,
    });
  };

  if (loading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F5EFEB] flex flex-col items-center justify-center gap-6 px-4 text-center">
        <h2 className="text-2xl font-bold text-[#183B56]">Product Not Found</h2>
        <p className="text-xs text-[#5A7184] max-w-sm">
          The item you are looking for might have been moved or is currently unavailable.
        </p>
        <button
          onClick={() => router.push("/market")}
          className="bg-[#183B56] text-white text-xs font-bold uppercase px-8 py-3 rounded-full hover:bg-[#102A43] transition-colors border-none cursor-pointer"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const pid = product.productId || product.id;
  const saved = isSaved(pid);
  const formattedPrice = Math.round(product.price || 999).toLocaleString("en-IN");

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-28 relative">
      {/* ── BREADCRUMB & BACK HEADER ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-4 flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#71717A] hover:text-[#111111] transition-colors bg-transparent border-none cursor-pointer p-0"
        >
          <ArrowLeft size={16} />
          <span>Back</span>
        </button>

        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#86868B] flex items-center gap-2">
          <span
            className="hover:text-[#1D1D1F] cursor-pointer transition-colors"
            onClick={() => router.push("/")}
          >
            HOME
          </span>
          <span className="text-[#CCCCCC]">/</span>
          <span
            className="hover:text-[#1D1D1F] cursor-pointer transition-colors"
            onClick={() => router.push("/market")}
          >
            CATALOG
          </span>
          <span className="text-[#CCCCCC]">/</span>
          <span className="text-[#1D1D1F] font-bold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </p>
      </div>

      {/* ── MAIN EDITORIAL HERO GRID ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-4 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* ════ LEFT COLUMN: Hero Image Gallery ════ */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6 items-start">
          {/* Vertical Thumbnail Rail */}
          {productImages.length > 1 && (
            <div className="flex md:flex-col gap-4 shrink-0 overflow-x-auto md:overflow-y-auto max-w-full md:w-20">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectImg(img, idx)}
                  className={`w-16 h-20 md:w-20 md:h-28 rounded-xl overflow-hidden transition-all duration-300 transform cursor-pointer p-0 bg-[#FAF8F5] border-none shrink-0 ${
                    activeImgIndex === idx
                      ? "ring-1 ring-[#1D1D1F] ring-offset-2 opacity-100 scale-102 shadow-xs"
                      : "opacity-60 hover:opacity-100 hover:scale-103"
                  }`}
                >
                  <img
                    src={img}
                    alt=""
                    onError={(e) => {
                      e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover object-top"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Hero Showcase Shot */}
          <div
            onClick={() => setLightboxOpen(true)}
            className="flex-1 w-full bg-[#FAF8F5] rounded-2xl overflow-hidden min-h-[460px] sm:min-h-[580px] lg:min-h-[680px] relative group cursor-zoom-in select-none border border-[#EBE8E3]"
          >
            <img
              src={selectedImage || product.imageUrl || product.image || DEFAULT_FALLBACK_IMAGE}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
              }}
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-102"
            />

            {/* View Fullscreen Expand Button */}
            <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center gap-1.5 shadow-xs">
                <Maximize2 size={12} /> Full Screen
              </span>
            </div>

            {/* Left/Right Carousel Controls */}
            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImg}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#ECECEC] flex items-center justify-center text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer shadow-xs p-0"
                  aria-label="Previous view"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={handleNextImg}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#ECECEC] flex items-center justify-center text-[#1D1D1F] opacity-0 group-hover:opacity-100 transition-all hover:scale-110 cursor-pointer shadow-xs p-0"
                  aria-label="Next view"
                >
                  <ChevronRight size={20} />
                </button>
              </>
            )}

            {/* Bookmark Action */}
            <button
              onClick={handleToggleWardrobe}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-[#ECECEC] flex items-center justify-center cursor-pointer shadow-xs p-0 z-10 hover:bg-white transition-transform hover:scale-105 active:scale-95"
              title={saved ? "Saved in Wardrobe" : "Save to Wardrobe"}
            >
              <Bookmark
                size={18}
                className={`transition-colors ${
                  saved ? "fill-[#F07020] text-[#F07020]" : "text-[#71717A]"
                }`}
              />
            </button>
          </div>
        </div>

        {/* ════ RIGHT COLUMN: Sticky Purchase Panel ════ */}
        <div className="lg:col-span-5 flex flex-col gap-8 lg:sticky lg:top-24 self-start">
          {/* Brand & Name */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#86868B] block">
              {product.brand || "Luxzera Atelier"}
            </span>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#1D1D1F] tracking-tight leading-[1.15]">
              {product.name}
            </h1>

            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-2xl sm:text-3xl font-black text-[#1D1D1F]">
                ₹{formattedPrice}
              </span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/50 px-3 py-0.5 rounded-full">
                In Stock • Verified Authentic
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm leading-relaxed text-[#515154] font-normal">
            {product.description ||
              `Designed for effortless layering and refined movement, the ${product.name} combines precision tailoring with contemporary comfort. Handcrafted to endure beyond fleeting trends.`}
          </p>

          {/* Color Selector */}
          <div className="space-y-3 pt-4 border-t border-[#ECECEC]">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#1D1D1F] uppercase tracking-wider">Color</span>
              <span className="text-[#86868B]">{selectedColor}</span>
            </div>
            <div className="flex items-center gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`relative p-0.5 rounded-full border transition-all cursor-pointer bg-transparent ${
                    selectedColor === c.name
                      ? "border-[#1D1D1F] ring-2 ring-[#1D1D1F] ring-offset-2 scale-110"
                      : "border-transparent hover:border-[#CCCCCC] opacity-85 hover:opacity-100"
                  }`}
                  title={c.name}
                >
                  <span
                    className="block w-6 h-6 rounded-full border border-black/10 shadow-2xs"
                    style={{ backgroundColor: c.color }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#1D1D1F] uppercase tracking-wider">Size</span>
              <span className="text-[#86868B]">True to Size</span>
            </div>
            <div className="flex items-center gap-2.5">
              {sizeOptions.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-[48px] h-10 px-3.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedSize === sz
                      ? "bg-[#1D1D1F] text-white border-[#1D1D1F] shadow-xs"
                      : "bg-[#FAFAF9] text-[#1D1D1F] border-[#E7E3DD] hover:border-[#1D1D1F] hover:bg-white"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              className="w-full h-12 rounded-xl bg-[#1D1D1F] hover:bg-[#F07020] text-white text-xs font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer border-none shadow-xs flex items-center justify-center gap-2.5 active:scale-98"
            >
              {added ? (
                <>
                  <Check size={16} />
                  <span>ADDED TO BAG</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} strokeWidth={1.5} />
                  <span>ADD TO BAG</span>
                </>
              )}
            </button>

            <button
              onClick={handleToggleWardrobe}
              className="w-full h-12 rounded-xl border border-[#ECECEC] hover:border-[#1D1D1F] bg-white text-[#1D1D1F] text-xs font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-98"
            >
              <Bookmark
                size={16}
                className={saved ? "fill-[#F07020] text-[#F07020]" : "text-[#111111]"}
              />
              <span>{saved ? "SAVED IN WARDROBE" : "SAVE TO WARDROBE"}</span>
            </button>
          </div>

          {/* Guarantees */}
          <div className="flex flex-col gap-3 pt-6 border-t border-[#ECECEC]">
            <div className="flex items-center gap-3 text-xs text-[#515154] font-medium">
              <Truck size={16} strokeWidth={1.5} className="text-[#1D1D1F] shrink-0" />
              <span>Delivered in 3–5 business days with premium express tracking</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#515154] font-medium">
              <Globe size={16} strokeWidth={1.5} className="text-[#1D1D1F] shrink-0" />
              <span>Complimentary worldwide shipping on orders above ₹2,500</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#515154] font-medium">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-[#F07020] shrink-0" />
              <span>100% Authenticity Guarantee & 30-Day Effortless Returns</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── LOWER SECTION: ZYRA RECOMMENDATIONS / CURATED PAIRINGS ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-16 border-t border-[#ECECEC] mt-16">
        <ZeraRecommendationsSection
          title="Pairs Well With"
          subtitle="Zyra Curated Selections"
          genderFilter={product?.gender}
        />
      </div>

      {/* ════ FULLSCREEN INTERACTIVE LIGHTBOX MODAL ════ */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-200"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="w-full flex items-center justify-between z-10">
            <div className="text-white">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#86868B] block">
                {product.name}
              </span>
              <span className="text-xs text-[#CCCCCC]">
                View {activeImgIndex + 1} of {productImages.length}
              </span>
            </div>

            <button
              onClick={() => setLightboxOpen(false)}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer border-none p-0"
              aria-label="Close fullscreen view"
            >
              <X size={22} />
            </button>
          </div>

          <div className="relative flex-1 w-full max-w-5xl mx-auto my-4 flex items-center justify-center overflow-hidden">
            <img
              src={productImages[activeImgIndex]}
              alt=""
              onError={(e) => {
                e.currentTarget.src = DEFAULT_FALLBACK_IMAGE;
              }}
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImg}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border-none p-0 shadow-lg"
                  aria-label="Previous view"
                >
                  <ChevronLeft size={26} />
                </button>

                <button
                  onClick={handleNextImg}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border-none p-0 shadow-lg"
                  aria-label="Next view"
                >
                  <ChevronRight size={26} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}