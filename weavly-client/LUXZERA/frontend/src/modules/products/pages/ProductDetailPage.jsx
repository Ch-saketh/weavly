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
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Bookmark,
  ArrowLeft,
  Check,
} from "lucide-react";

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
    return () => { isMounted = false; };
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
          className="bg-[#183B56] text-white text-xs font-bold uppercase px-8 py-3 border-none cursor-pointer hover:bg-[#102A43] transition-colors"
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
    <div className="bg-[#F5EFEB] text-[#183B56] font-sans min-h-screen">

      {/* ── BREADCRUMB / BACK HEADER ── */}
      <div className="border-b border-[#183B56] bg-[#F5EFEB]">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 h-11 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#5A7184] hover:text-[#183B56] transition-colors bg-transparent border-none cursor-pointer p-0"
          >
            <ArrowLeft size={14} />
            <span>Back</span>
          </button>

          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#86868B] flex items-center gap-2">
            <span
              className="hover:text-[#183B56] cursor-pointer transition-colors"
              onClick={() => router.push("/")}
            >
              HOME
            </span>
            <span>/</span>
            <span
              className="hover:text-[#183B56] cursor-pointer transition-colors"
              onClick={() => router.push("/market")}
            >
              CATALOG
            </span>
            <span>/</span>
            <span className="text-[#183B56] font-bold truncate max-w-[180px] sm:max-w-xs">
              {product.name?.toUpperCase()}
            </span>
          </p>
        </div>
      </div>

      {/* ── MAIN PRODUCT GRID ── */}
      <div className="max-w-[1440px] mx-auto border-x border-[#183B56]">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-6rem)]">

          {/* ════ LEFT: Image Column ════ */}
          <div className="lg:col-span-7 border-r border-[#183B56] flex">

            {/* Thumbnail Rail */}
            {productImages.length > 1 && (
              <div className="w-16 sm:w-20 shrink-0 border-r border-[#183B56] flex flex-col overflow-y-auto">
                {productImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectImg(img, idx)}
                    className={`w-full aspect-square shrink-0 overflow-hidden p-0 cursor-pointer border-none border-b border-[#183B56] transition-all ${
                      activeImgIndex === idx
                        ? "bg-[#183B56]"
                        : "bg-[#F5EFEB] hover:bg-[#183B56]/10"
                    }`}
                  >
                    <img
                      src={img}
                      alt=""
                      onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
                      className="w-full h-full object-cover object-top"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Hero Image */}
            <div
              onClick={() => setLightboxOpen(true)}
              className="relative flex-1 bg-[#DFE7ED] cursor-zoom-in group overflow-hidden"
            >
              <img
                src={selectedImage || product.imageUrl || product.image || DEFAULT_FALLBACK_IMAGE}
                alt={product.name}
                onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]"
                style={{ maxHeight: "calc(100vh - 6rem)" }}
              />

              {/* Fullscreen badge */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="px-2.5 py-1 bg-white border border-[#183B56] text-[10px] font-bold uppercase tracking-wider text-[#183B56] flex items-center gap-1.5">
                  <Maximize2 size={11} /> Full Screen
                </span>
              </div>

              {/* Carousel Arrows */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImg}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-[#183B56] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#183B56] hover:text-white cursor-pointer p-0"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={handleNextImg}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-[#183B56] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-[#183B56] hover:text-white cursor-pointer p-0"
                    aria-label="Next"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {/* Image counter badge */}
              {productImages.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-white border border-[#183B56] px-2 py-0.5 text-[10px] font-bold text-[#183B56] uppercase tracking-wider">
                  {activeImgIndex + 1} / {productImages.length}
                </div>
              )}

              {/* Wardrobe bookmark */}
              <button
                onClick={handleToggleWardrobe}
                className={`absolute top-4 right-4 w-9 h-9 border flex items-center justify-center cursor-pointer p-0 transition-all ${
                  saved
                    ? "bg-[#183B56] border-[#183B56] text-white"
                    : "bg-white border-[#183B56] text-[#183B56] hover:bg-[#183B56] hover:text-white"
                }`}
                title={saved ? "Saved in Wardrobe" : "Save to Wardrobe"}
              >
                <Bookmark size={15} className={saved ? "fill-white" : ""} />
              </button>
            </div>
          </div>

          {/* ════ RIGHT: Purchase Panel ════ */}
          <div className="lg:col-span-5 flex flex-col lg:overflow-y-auto" style={{ maxHeight: "calc(100vh - 6rem)" }}>

            {/* Brand + Name + Price block */}
            <div className="border-b border-[#183B56] p-6 sm:p-8 space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184] block">
                {product.brand || "Luxzera Atelier"}
              </span>

              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#183B56] tracking-tight leading-tight">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 pt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#183B56]">
                  ₹{formattedPrice}
                </span>
                <span className="text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] border border-[#A5D6A7] px-2.5 py-0.5 uppercase tracking-wider">
                  In Stock
                </span>
              </div>

              {product.description && (
                <p className="text-xs leading-relaxed text-[#5A7184] pt-1">
                  {product.description}
                </p>
              )}
            </div>

            {/* Color Selector */}
            <div className="border-b border-[#183B56] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#183B56]">Colour</span>
                <span className="text-[10px] font-semibold text-[#5A7184] uppercase tracking-wider">{selectedColor}</span>
              </div>
              <div className="flex items-center gap-2.5">
                {colorOptions.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`relative p-0 cursor-pointer border-2 transition-all ${
                      selectedColor === c.name
                        ? "border-[#183B56] scale-110"
                        : "border-transparent hover:border-[#183B56]/40"
                    }`}
                    title={c.name}
                    style={{ background: "none" }}
                  >
                    <span
                      className="block w-6 h-6 border border-black/10"
                      style={{ backgroundColor: c.color }}
                    />
                    {selectedColor === c.name && (
                      <span className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-[#183B56]" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector */}
            <div className="border-b border-[#183B56] p-5 sm:p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#183B56]">Size</span>
                <span className="text-[10px] font-semibold text-[#5A7184] uppercase tracking-wider">True to Size</span>
              </div>
              <div className="flex items-center gap-2">
                {sizeOptions.map((sz) => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`min-w-[44px] h-9 px-3 text-[11px] font-bold border transition-all cursor-pointer ${
                      selectedSize === sz
                        ? "bg-[#183B56] text-white border-[#183B56]"
                        : "bg-[#F5EFEB] text-[#183B56] border-[#183B56] hover:bg-[#183B56]/10"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="p-5 sm:p-6 flex flex-col gap-3 border-b border-[#183B56]">
              <button
                onClick={handleAddToCart}
                className="w-full h-11 bg-[#183B56] hover:bg-[#102A43] text-white text-[11px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer border-none flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {added ? (
                  <><Check size={15} /><span>Added to Bag</span></>
                ) : (
                  <><ShoppingBag size={15} strokeWidth={1.5} /><span>Add to Bag</span></>
                )}
              </button>

              <button
                onClick={handleToggleWardrobe}
                className={`w-full h-11 border text-[11px] font-bold uppercase tracking-[0.2em] transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98] ${
                  saved
                    ? "bg-[#183B56] text-white border-[#183B56]"
                    : "bg-transparent text-[#183B56] border-[#183B56] hover:bg-[#183B56]/10"
                }`}
              >
                <Bookmark size={15} className={saved ? "fill-white" : ""} />
                <span>{saved ? "Saved in Wardrobe" : "Save to Wardrobe"}</span>
              </button>
            </div>

            {/* Guarantees */}
            <div className="p-5 sm:p-6 space-y-3">
              <div className="flex items-start gap-3 text-[11px] text-[#5A7184] font-medium">
                <Truck size={14} strokeWidth={1.5} className="text-[#183B56] shrink-0 mt-0.5" />
                <span>Delivered in 3–5 business days with premium express tracking</span>
              </div>
              <div className="flex items-start gap-3 text-[11px] text-[#5A7184] font-medium">
                <Globe size={14} strokeWidth={1.5} className="text-[#183B56] shrink-0 mt-0.5" />
                <span>Complimentary worldwide shipping on orders above ₹2,500</span>
              </div>
              <div className="flex items-start gap-3 text-[11px] text-[#5A7184] font-medium">
                <ShieldCheck size={14} strokeWidth={1.5} className="text-[#183B56] shrink-0 mt-0.5" />
                <span>100% Authenticity Guarantee & 30-Day Effortless Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ZYRA RECOMMENDATIONS ── */}
      <div className="max-w-[1440px] mx-auto border-x border-b border-[#183B56] mt-0">
        <div className="border-t border-[#183B56]">
          <ZeraRecommendationsSection
            title="Pairs Well With"
            subtitle="Zyra Curated Selections"
            genderFilter={product?.gender}
          />
        </div>
      </div>

      {/* ════ LIGHTBOX ════ */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10"
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
              className="w-10 h-10 border border-white/30 bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer p-0"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          <div className="relative flex-1 w-full max-w-5xl mx-auto my-4 flex items-center justify-center overflow-hidden">
            <img
              src={productImages[activeImgIndex]}
              alt=""
              onError={(e) => { e.currentTarget.src = DEFAULT_FALLBACK_IMAGE; }}
              className="max-h-[80vh] max-w-full object-contain select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {productImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImg}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/30 bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer p-0"
                  aria-label="Previous"
                >
                  <ChevronLeft size={22} />
                </button>

                <button
                  onClick={handleNextImg}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/30 bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer p-0"
                  aria-label="Next"
                >
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}