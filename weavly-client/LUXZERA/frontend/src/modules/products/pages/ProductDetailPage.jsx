"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { PRODUCTS } from "@/modules/products/data/products";
import { getProductById } from "@/modules/products/services/productService";
import { useCart } from "@/modules/cart/store/CartContext";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { ShoppingBag, Truck, Globe, ShieldCheck, ChevronDown, Star, Check, Feather, Sparkles, RefreshCw, ChevronLeft, ChevronRight, Maximize2, X, GripVertical, Bookmark } from "lucide-react";
import branding from "@/config/branding";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();
  const { addToCart } = useCart();
  const { toggleWardrobe, isSaved } = useWardrobe();

  const [product, setProduct] = useState(() => {
    return PRODUCTS.find((p) => String(p.id) === String(id) || String(p.productId) === String(id)) || PRODUCTS[0];
  });

  useEffect(() => {
    let isMounted = true;
    if (id) {
      getProductById(id).then((fetched) => {
        if (isMounted && fetched) {
          setProduct(fetched);
        }
      });
    }
    return () => {
      isMounted = false;
    };
  }, [id]);

  // States
  const [selectedColor, setSelectedColor] = useState("Black");
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedImage, setSelectedImage] = useState(product?.image || product?.imageUrl);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState("designerNotes");
  const [lightboxOpen, setLightboxOpen] = useState(false);

  // Draggable Floating View Button State
  const [btnPos, setBtnPos] = useState({ x: null, y: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const productImages = product.images && product.images.length > 0 
    ? product.images 
    : [
        product.image,
        "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1200&q=80",
        "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=1200&q=80",
      ];

  useEffect(() => {
    if (product) {
      const initialImg = product.image || product.images?.[0];
      setSelectedImage(initialImg);
      setActiveImgIndex(0);
      setSelectedSize(product.sizes?.[0] || "M");
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [id, product]);

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

  // Draggable Button Event Listeners
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setHasMoved(false);
    const currentX = btnPos.x ?? (typeof window !== "undefined" ? window.innerWidth - 220 : 0);
    const currentY = btnPos.y ?? (typeof window !== "undefined" ? window.innerHeight - 100 : 0);
    setDragStart({
      x: e.clientX - currentX,
      y: e.clientY - currentY,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setHasMoved(true);
    const newX = Math.max(10, Math.min(window.innerWidth - 200, e.clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 80, e.clientY - dragStart.y));
    setBtnPos({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setHasMoved(false);
    const currentX = btnPos.x ?? (typeof window !== "undefined" ? window.innerWidth - 220 : 0);
    const currentY = btnPos.y ?? (typeof window !== "undefined" ? window.innerHeight - 100 : 0);
    setDragStart({
      x: touch.clientX - currentX,
      y: touch.clientY - currentY,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    setHasMoved(true);
    const touch = e.touches[0];
    const newX = Math.max(10, Math.min(window.innerWidth - 200, touch.clientX - dragStart.x));
    const newY = Math.max(10, Math.min(window.innerHeight - 80, touch.clientY - dragStart.y));
    setBtnPos({ x: newX, y: newY });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!product) return null;

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
    addToCart({
      ...product,
      size: selectedSize,
      color: selectedColor,
    });
  };

  const [relatedProducts, setRelatedProducts] = useState(() => PRODUCTS.slice(1, 4));

  useEffect(() => {
    let isMounted = true;
    getProducts({ limit: 6 }).then((items) => {
      if (isMounted && Array.isArray(items) && items.length > 0) {
        const filtered = items.filter((p) => String(p.id) !== String(product.id));
        setRelatedProducts(filtered.slice(0, 3));
      }
    });
    return () => {
      isMounted = false;
    };
  }, [product.id]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] font-sans selection:bg-[#F07020] selection:text-white pb-28 relative">
      
      {/* ── BREADCRUMB HEADER (Minimalist Editorial Whitespace) ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-8 pb-6">
        <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#86868B] flex items-center gap-2">
          <span className="hover:text-[#1D1D1F] cursor-pointer transition-colors" onClick={() => router.push("/")}>HOME</span>
          <span className="text-[#CCCCCC]">/</span>
          <span className="hover:text-[#1D1D1F] cursor-pointer transition-colors" onClick={() => router.push("/market")}>CATALOG</span>
          <span className="text-[#CCCCCC]">/</span>
          <span className="text-[#1D1D1F] font-bold">{product.name}</span>
        </p>
      </div>

      {/* ── MAIN EDITORIAL HERO GRID (60% Image Dominance, Sticky Right Panel, Interactive View Options) ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 py-4 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        
        {/* ════ LEFT COLUMN: Hero Image Gallery (60% Viewport Width / col-span-7) ════ */}
        <div className="lg:col-span-7 flex flex-col-reverse md:flex-row gap-6 items-start">
          
          {/* Vertical Thumbnail Rail (Increased Spacing & Clean Indicator) */}
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
                <img src={img} alt="" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>

          {/* Main Hero Showcase Shot (Interactive Lightbox & Hover Navigation) */}
          <div 
            onClick={() => setLightboxOpen(true)}
            className="flex-1 w-full bg-[#FAF8F5] rounded-2xl overflow-hidden min-h-[560px] sm:min-h-[660px] lg:min-h-[740px] relative group cursor-zoom-in select-none"
          >
            <img 
              src={selectedImage || product.image} 
              alt={product.name} 
              className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-102"
            />
            
            {/* View Fullscreen Expand Button Overlay */}
            <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#ECECEC] text-[10px] font-bold uppercase tracking-wider text-[#1D1D1F] flex items-center gap-1.5 shadow-xs">
                <Maximize2 size={12} /> Full Screen View
              </span>
            </div>

            {/* Left/Right Carousel Controls Overlay */}
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

            {/* Bookmark Action */}
            <button
              onClick={handleToggleWardrobe}
              className="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/90 backdrop-blur-md border border-[#ECECEC] flex items-center justify-center cursor-pointer shadow-xs p-0 z-10 hover:bg-white transition-transform hover:scale-105"
              title={isSaved?.(product.id) ? "Saved in Wardrobe" : "Save to Wardrobe"}
            >
              <Bookmark 
                size={18}
                className={`transition-colors ${
                  isSaved?.(product.id) ? "fill-[#F07020] text-[#F07020]" : "text-[#71717A]"
                }`} 
              />
            </button>
          </div>

        </div>

        {/* ════ RIGHT COLUMN: Sticky Purchase Panel & Editorial Storytelling (40% Viewport Width / col-span-5) ════ */}
        <div className="lg:col-span-5 flex flex-col gap-9 lg:sticky lg:top-24 self-start">
          
          {/* Brand & Name (Strict Typography Hierarchy: 44px Title, 28px Price) */}
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#86868B] block">
              {product.brand || `${branding.name} Atelier`}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-normal text-[#1D1D1F] tracking-tight leading-[1.1]">
              {product.name}
            </h1>
            
            <div className="flex items-baseline gap-4 pt-2">
              <span className="text-2xl sm:text-[28px] font-semibold text-[#1D1D1F]">
                ₹{Math.round(product.price || 999).toLocaleString('en-IN')}
              </span>
              {product.originalPrice && (
                <span className="text-base font-normal text-[#86868B] line-through">
                  ₹{Math.round(product.originalPrice).toLocaleString('en-IN')}
                </span>
              )}
              <span className="text-[11px] font-semibold text-[#D9381E] bg-[#D9381E]/8 px-3 py-1 rounded-full">
                Only 3 Available
              </span>
            </div>
          </div>

          {/* Description (Light Weight Editorial Copy: 16-17px) */}
          <p className="text-base lg:text-[17px] leading-relaxed text-[#515154] font-normal pt-1">
            Designed for movement and everyday layering, the {product.name} blends modern sartorial lines with uncompromised comfort. Crafted from durable yet lightweight organic textiles, offering an effortless silhouette built to outlast seasonal trends.
          </p>

          {/* Color Selector Swatches (Apple Watch Style: Perfect Circles, Thin 1px Outline, Refined Ring) */}
          <div className="space-y-4 pt-4 border-t border-[#ECECEC]">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#1D1D1F]">Color</span>
              <span className="text-xs font-medium text-[#86868B]">{selectedColor}</span>
            </div>
            <div className="flex items-center gap-4">
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
                    className="block w-7 h-7 rounded-full border border-[#000000]/10 shadow-xs" 
                    style={{ backgroundColor: c.color }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selector Pills (Premium Fashion Controls: Soft Corners, Breathing Room) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-[#1D1D1F]">Size</span>
              <button className="text-xs text-[#86868B] underline hover:text-[#1D1D1F] bg-transparent border-none cursor-pointer p-0">
                Size Guide
              </button>
            </div>
            <div className="flex items-center gap-3">
              {sizeOptions.map((sz) => (
                <button
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  className={`min-w-[52px] h-11 px-4 text-xs font-semibold rounded-2xl border transition-all cursor-pointer ${
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

          {/* ════ PREMIUM CTA SECTION: Primary (Add to Bag) + Secondary (Wishlist) ════ */}
          <div className="flex flex-col gap-3.5 pt-4">
            <button
              onClick={handleAddToCart}
              className="w-full h-12 rounded-xl bg-[#1D1D1F] hover:bg-[#F07020] text-white text-xs font-bold uppercase tracking-[0.15em] transition-colors cursor-pointer border-none shadow-xs flex items-center justify-center gap-2.5"
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              <span>ADD TO BAG</span>
            </button>

            <button
              onClick={handleToggleWardrobe}
              className="w-full h-12 rounded-xl border border-[#ECECEC] hover:border-[#1D1D1F] bg-white text-[#1D1D1F] text-xs font-semibold uppercase tracking-[0.15em] transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <img src="/zera_SVG.svg" alt="" className="w-4 h-4 object-contain opacity-75" />
              <span>{isSaved?.(product.id) ? "SAVED IN WARDROBE" : "SAVE TO WARDROBE"}</span>
            </button>
          </div>

          {/* Delivery & Security Guarantee (Minimal Whitespace List) */}
          <div className="flex flex-col gap-3.5 pt-8 border-t border-[#ECECEC]">
            <div className="flex items-center gap-3 text-xs text-[#515154] font-medium">
              <Truck size={16} strokeWidth={1.5} className="text-[#1D1D1F] shrink-0" />
              <span>Delivered in 3–5 business days with express tracking</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#515154] font-medium">
              <Globe size={16} strokeWidth={1.5} className="text-[#1D1D1F] shrink-0" />
              <span>Complimentary worldwide shipping on orders over $150</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#515154] font-medium">
              <ShieldCheck size={16} strokeWidth={1.5} className="text-[#F07020] shrink-0" />
              <span>Encrypted secure checkout &amp; 30-day effortless returns</span>
            </div>
          </div>

          {/* ════ EDITORIAL STORYTELLING & ACCORDIONS (Designer Notes, Craftsmanship, Materials, Care, Shipping) ════ */}
          <div className="flex flex-col divide-y divide-[#ECECEC] border-t border-b border-[#ECECEC] pt-2 mt-2">
            
            {/* 1. Designer Notes */}
            <button
              onClick={() => toggleAccordion("designerNotes")}
              className="py-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#1D1D1F] border-none bg-transparent cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Sparkles size={14} className="text-[#F07020]" />
                <span>Designer Notes &amp; Concept</span>
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === "designerNotes" ? "rotate-180" : ""}`} />
            </button>
            {openAccordion === "designerNotes" && (
              <div className="pb-4 space-y-2 text-xs text-[#515154] leading-relaxed font-normal">
                <p>
                  "With the {product.name}, our atelier set out to bridge structural tailoring with functional ease. Every line was cut to maintain fluid movement while preserving crisp visual architecture."
                </p>
                <span className="text-[11px] font-semibold text-[#1D1D1F] block pt-1">— Creative Director, Weavly Studio</span>
              </div>
            )}

            {/* 2. Materials & Sustainability */}
            <button
              onClick={() => toggleAccordion("materials")}
              className="py-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#1D1D1F] border-none bg-transparent cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Feather size={14} className="text-[#1D1D1F]" />
                <span>Materials &amp; Sustainability</span>
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === "materials" ? "rotate-180" : ""}`} />
            </button>
            {openAccordion === "materials" && (
              <div className="pb-4 space-y-2 text-xs text-[#515154] leading-relaxed font-normal">
                <p>
                  Crafted using 100% GOTS-certified organic long-staple cotton blended with natural cellulose fibers. Sourced exclusively from ethical mills practicing zero-water wastage and low-impact eco-dyeing processes.
                </p>
              </div>
            )}

            {/* 3. Atelier Craftsmanship */}
            <button
              onClick={() => toggleAccordion("craftsmanship")}
              className="py-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#1D1D1F] border-none bg-transparent cursor-pointer"
            >
              <span>Atelier Craftsmanship</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === "craftsmanship" ? "rotate-180" : ""}`} />
            </button>
            {openAccordion === "craftsmanship" && (
              <p className="text-xs text-[#515154] pb-4 leading-relaxed font-normal">
                Double-needle stitched seams, hand-beveled horn buttons, and reinforced pressure points ensure years of enduring luxury wear without losing drape shape.
              </p>
            )}

            {/* 4. Care Guide */}
            <button
              onClick={() => toggleAccordion("care")}
              className="py-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#1D1D1F] border-none bg-transparent cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="text-[#1D1D1F]" />
                <span>Care Guide</span>
              </span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === "care" ? "rotate-180" : ""}`} />
            </button>
            {openAccordion === "care" && (
              <p className="text-xs text-[#515154] pb-4 leading-relaxed font-normal">
                Dry clean or machine wash cold on gentle delicate cycle. Lay flat or line dry inside out away from direct heat to preserve fabric texture and tone.
              </p>
            )}

            {/* 5. Shipping & Complimentary Returns */}
            <button
              onClick={() => toggleAccordion("shipping")}
              className="py-4 flex items-center justify-between text-left text-xs font-bold uppercase tracking-wider text-[#1D1D1F] border-none bg-transparent cursor-pointer"
            >
              <span>Shipping &amp; Complimentary Returns</span>
              <ChevronDown size={14} className={`transition-transform duration-300 ${openAccordion === "shipping" ? "rotate-180" : ""}`} />
            </button>
            {openAccordion === "shipping" && (
              <p className="text-xs text-[#515154] pb-4 leading-relaxed font-normal">
                Enjoy complimentary express air shipping on all orders over $150. Returns and size exchanges are accepted free of charge within 30 days of delivery.
              </p>
            )}
          </div>

          {/* ════ LUXURY SPECIFICATIONS SHEET (Low Row Height, Soft Dividers, Balanced Spacing) ════ */}
          <div className="pt-8">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-[#1D1D1F] mb-4">
              Product Specifications
            </h3>
            
            <div className="divide-y divide-[#F0EDE8] text-xs">
              <div className="flex justify-between py-2.5 items-center">
                <span className="text-[#86868B] font-normal">Style Category</span>
                <span className="font-medium text-[#1D1D1F]">Atelier Tailored Outerwear</span>
              </div>
              <div className="flex justify-between py-2.5 items-center">
                <span className="text-[#86868B] font-normal">Occasion</span>
                <span className="font-medium text-[#1D1D1F]">Everyday, Sartorial, Travel</span>
              </div>
              <div className="flex justify-between py-2.5 items-center">
                <span className="text-[#86868B] font-normal">Material Composition</span>
                <span className="font-medium text-[#1D1D1F]">100% Organic Cotton Blend</span>
              </div>
              <div className="flex justify-between py-2.5 items-center">
                <span className="text-[#86868B] font-normal">Selected Tone</span>
                <span className="font-medium text-[#1D1D1F]">{selectedColor}</span>
              </div>
              <div className="flex justify-between py-2.5 items-center">
                <span className="text-[#86868B] font-normal">Fit Profile</span>
                <span className="font-medium text-[#1D1D1F]">Relaxed Modern Silhouette</span>
              </div>
            </div>
          </div>

          {/* ════ REFINED REVIEWS SECTION (Smaller Avatar, Cleaner Typography, Integrated Card) ════ */}
          <div className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex text-[#F07020]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={13} fill="currentColor" />
                  ))}
                </div>
                <span className="text-xs font-bold text-[#1D1D1F]">4.8 / 5</span>
              </div>
              <span className="text-xs text-[#86868B]">24 Verified Reviews</span>
            </div>

            {/* Featured Review Quote */}
            <div className="bg-[#FAFAF9] p-4 rounded-xl border border-[#ECECEC] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#1D1D1F] text-white flex items-center justify-center text-[10px] font-bold">
                    SJ
                  </div>
                  <span className="text-xs font-semibold text-[#1D1D1F]">Sarah Johnson</span>
                </div>
                <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <Check size={9} /> Verified Buyer
                </span>
              </div>
              <p className="text-xs text-[#515154] leading-relaxed font-normal italic">
                "The silhouette and material quality exceeded my expectations. Outstanding craftsmanship that fits effortlessly."
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* ── LOWER SECTION: Complete The Look / Related Products (Editorial Grid) ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 pt-24 border-t border-[#ECECEC] mt-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#86868B] block mb-1.5">
              CURATED SELECTION
            </span>
            <h2 className="text-2xl font-medium tracking-tight text-[#1D1D1F]">Complete The Look</h2>
          </div>

          <button 
            onClick={() => router.push("/market")} 
            className="text-xs font-semibold uppercase tracking-wider text-[#1D1D1F] hover:text-[#F07020] transition-colors cursor-pointer border-none bg-transparent"
          >
            Explore Catalog &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {relatedProducts.map((rel) => (
            <div 
              key={rel.id} 
              className="group cursor-pointer flex flex-col gap-4" 
              onClick={() => router.push(`/product/${rel.id}`)}
            >
              <div className="aspect-[3/4] bg-[#FAF8F5] rounded-2xl overflow-hidden relative">
                <img 
                  src={rel.image} 
                  alt={rel.name} 
                  className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-700" 
                />
              </div>
              
              <div className="flex justify-between items-start pt-1">
                <div>
                  <h3 className="text-sm font-medium text-[#1D1D1F] group-hover:text-[#F07020] transition-colors">
                    {rel.name}
                  </h3>
                  <span className="text-xs text-[#86868B] block mt-0.5">
                    {rel.category || "Atelier Apparel"}
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#1D1D1F]">
                  ₹{Math.round(rel.price || 999).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>



      {/* ════ FULLSCREEN INTERACTIVE LIGHTBOX MODAL ════ */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[200] bg-[#000000]/95 backdrop-blur-xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-200 selection:bg-transparent"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Lightbox Header Bar */}
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

          {/* Lightbox Main Stage Image */}
          <div className="relative flex-1 w-full max-w-5xl mx-auto my-4 flex items-center justify-center overflow-hidden">
            <img 
              src={productImages[activeImgIndex]} 
              alt="" 
              className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl select-none"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Prev/Next Lightbox Controls */}
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
          </div>

          {/* Lightbox Bottom Thumbnail Bar */}
          <div className="w-full flex items-center justify-center gap-3 z-10" onClick={(e) => e.stopPropagation()}>
            {productImages.map((img, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectImg(img, idx)}
                className={`w-14 h-16 rounded-lg overflow-hidden transition-all cursor-pointer p-0 border-none ${
                  activeImgIndex === idx 
                    ? "ring-2 ring-white scale-110 opacity-100" 
                    : "opacity-40 hover:opacity-100"
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover object-top" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}