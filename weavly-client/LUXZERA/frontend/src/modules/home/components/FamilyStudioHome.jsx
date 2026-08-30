"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Bookmark, Star } from "lucide-react";
import { getProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";

export default function FamilyStudioHome({ onShopNow, onOpenAuth }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { addToCart } = useCart();

  const [addedProductIds, setAddedProductIds] = useState({});
  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeHeroCategory, setActiveHeroCategory] = useState("Crafted Comfort");
  const [activeHeroImage, setActiveHeroImage] = useState(0);

  const heroThumbnails = [
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
  ];

  const heroCategoryLinks = [
    { label: "Crafted Comfort", query: "Comfort" },
    { label: "Everyday Luxury", query: "Luxury" },
    { label: "Sustainability in Style", query: "Sustainable" },
    { label: "Oxford", query: "Oxford" },
    { label: "Flannel", query: "Flannel" },
  ];

  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);
    getProducts({ limit: 60 }).then((items) => {
      if (isMounted) {
        setProductsList(Array.isArray(items) ? items : []);
        setLoadingProducts(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image || product.imageUrl,
      color: product.color || "Default",
      size: "M",
      qty: 1,
    });
    setAddedProductIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  const handleToggleLike = (e, product) => {
    e.stopPropagation();
    toggleWardrobe(product);
  };

  const featuredBestSellers = [
    {
      id: productsList[0]?.id || "bs-1",
      name: "Crafted Comfort",
      priceDisplay: "$80.00",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: productsList[1]?.id || "bs-2",
      name: "Everyday Luxury",
      priceDisplay: "$90.50",
      image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: productsList[2]?.id || "bs-3",
      name: "Oxford",
      priceDisplay: "$75.50",
      image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: productsList[3]?.id || "bs-4",
      name: "Sustainability",
      priceDisplay: "$60.50",
      image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=800&q=80",
    },
  ];

  const featuredNewCollection = [
    {
      id: productsList[4]?.id || "nc-1",
      name: "Classic Overcoat",
      priceDisplay: "$140.00",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: productsList[5]?.id || "nc-2",
      name: "Tailored Linen Blazer",
      priceDisplay: "$120.00",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: productsList[6]?.id || "nc-3",
      name: "Merino Wool Knit",
      priceDisplay: "$95.00",
      image: "https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: productsList[7]?.id || "nc-4",
      name: "Pleated Relaxed Trousers",
      priceDisplay: "$85.00",
      image: "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">

      {/* MASTER CONTINUOUS ARCHITECTURAL GRID WRAPPER */}
      <main className="max-w-[1440px] mx-auto border-x border-[#183B56]">

        {/* ════════════════════════════════════════════════════════════
            1. HERO SECTION: 3-COLUMN CONTINUOUS BLUEPRINT GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#183B56] divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
          
          {/* LEFT: Category Index Box (lg:col-span-3) */}
          <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <nav className="space-y-2">
                {heroCategoryLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveHeroCategory(item.label);
                      router.push(`/market?q=${encodeURIComponent(item.query)}`);
                    }}
                    className={`w-full text-left py-2.5 px-3 border border-[#183B56] flex items-center justify-between text-xs sm:text-sm font-bold tracking-tight transition-all cursor-pointer ${
                      activeHeroCategory === item.label
                        ? "bg-[#183B56] text-white shadow-xs"
                        : "bg-transparent text-[#183B56] hover:bg-[#183B56]/5"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-base font-normal leading-none">→</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Social Badges Row */}
            <div className="space-y-3 pt-6 border-t border-[#183B56]">
              <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#5A7184]">
                Follow Us
              </div>
              <div className="flex items-center gap-2">
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity" aria-label="Facebook">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity" aria-label="X">
                  <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity" aria-label="Instagram">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity" aria-label="YouTube">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* CENTER: Framed Hero Model & Arched Thumbnails (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col items-center justify-between gap-6">
            <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden bg-[#E2ECF1] border border-[#183B56] relative shadow-xs">
              <img
                src={heroThumbnails[activeHeroImage]}
                alt="Craftsmanship that lasts"
                className="w-full h-full object-cover object-top transition-all duration-700 hover:scale-105"
              />
            </div>

            {/* 3 Arched Mini Preview Thumbnails */}
            <div className="flex items-center justify-center gap-4">
              {heroThumbnails.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveHeroImage(idx)}
                  className={`w-18 h-22 rounded-t-full overflow-hidden border transition-all p-0 bg-[#DFE7ED] cursor-pointer ${
                    activeHeroImage === idx
                      ? "border-[#183B56] scale-105 shadow-xs"
                      : "border-[#183B56]/40 hover:border-[#183B56] opacity-75"
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Headline, Manifesto & Button (lg:col-span-4) */}
          <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.1]">
                Craftsmanship <br />
                That Lasts
              </h1>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-normal">
                Elevate your everyday with timeless, quality-crafted essentials. From sustainable organic materials to enduring designs, each piece is made to last.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => router.push("/market")}
                className="px-8 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.18em] rounded-sm transition-all cursor-pointer border-none shadow-xs inline-flex items-center gap-2.5"
              >
                <span>Explore Now</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </section>

        {/* ════════════════════════════════════════════════════════════
            2. BEST SELLERS: CONTINUOUS 4-COLUMN WIREFRAME BOX GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="border-b border-[#183B56]">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between py-3.5 px-6 border-b border-[#183B56]">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
              Best Sellers
            </h2>
            <button
              onClick={() => router.push("/market?sort=popularity")}
              className="text-xs sm:text-sm font-semibold text-[#183B56] hover:underline flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
            >
              <span>All Product</span>
              <span className="text-base font-normal leading-none">→</span>
            </button>
          </div>

          {/* 4 Continuous Architectural Grid Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56]">
            {featuredBestSellers.map((product) => {
              const saved = isSaved?.(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
                >
                  {/* Full-bleed Cool-Tinted Flat Image Box */}
                  <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-6 sm:p-8">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Wardrobe Bookmark Icon on Hover */}
                    <button
                      onClick={(e) => handleToggleLike(e, product)}
                      className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center p-0 cursor-pointer transition-all ${
                        saved
                          ? "bg-white shadow-xs scale-105 border border-[#183B56]"
                          : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white border border-[#183B56]/30"
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
                  <div className="py-5 px-3 text-center flex flex-col items-center justify-center space-y-1.5 bg-[#F5EFEB]">
                    <div className="text-[13px] sm:text-[14px] font-bold text-[#183B56] group-hover:underline flex items-center justify-center gap-1.5 truncate max-w-full">
                      <span>{product.name}</span>
                      <span className="text-sm font-normal">→</span>
                    </div>
                    <div className="text-[15px] sm:text-[16px] font-bold text-[#183B56] tracking-tight">
                      {product.priceDisplay}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. OUR BRAND / ATELIER COLLAGE BENTO GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 border-b border-[#183B56] divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
          
          {/* Left: Brand Story & Atelier Labels (lg:col-span-5) */}
          <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
                Our Brand
              </h2>
              <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-normal">
                Elevated essentials for every moment. Crafted with care, designed to endure. Embrace simplicity, redefine style. Less clutter, more meaning. Craftsmanship at its finest, indulgent fabrics, timeless appeal. For those who appreciate the art of dressing. Where elegance meets excellence.
              </p>
              <button onClick={() => router.push("/about")} className="text-xs font-bold text-[#183B56] hover:underline bg-transparent border-none cursor-pointer p-0">
                Read More...
              </button>
            </div>

            {/* Brand Labels Table & Stamp Badge */}
            <div className="flex items-center justify-between gap-6 pt-4 border-t border-[#183B56]">
              <div className="space-y-1 text-xs font-bold text-[#183B56] flex-1">
                <div className="py-1 border-b border-[#183B56]/30">GreenStitch</div>
                <div className="py-1 border-b border-[#183B56]/30">Urban Code</div>
                <div className="py-1 border-b border-[#183B56]/30">Threadline</div>
                <div className="py-1">Sovereign</div>
              </div>

              {/* Circular Atelier Stamp Badge */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-dashed border-[#183B56] flex flex-col items-center justify-center text-center p-2 rotate-12 hover:rotate-0 transition-transform shrink-0">
                <span className="text-[8px] sm:text-[9px] uppercase tracking-widest font-bold text-[#183B56]">Size M</span>
                <span className="text-xs font-extrabold text-[#183B56]">→</span>
                <span className="text-[8px] uppercase tracking-widest text-[#5A7184]">Atelier</span>
              </div>
            </div>
          </div>

          {/* Right: Multi-Texture Fashion Lookbook Collage (lg:col-span-7) */}
          <div className="lg:col-span-7 p-6 sm:p-10 grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="aspect-[3/4] border border-[#183B56] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"
                alt="Lookbook 1"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] border border-[#183B56] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
                alt="Lookbook 2"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="aspect-[3/4] border border-[#183B56] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                alt="Lookbook 3"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

        </section>

        {/* ── ZERA PERSONALIZED RECOMMENDATIONS SECTION ── */}
        <div className="border-b border-[#183B56]">
          <ZeraRecommendationsSection />
        </div>

        {/* ════════════════════════════════════════════════════════════
            4. NEW COLLECTION: CONTINUOUS 4-COLUMN WIREFRAME BOX GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="border-b border-[#183B56]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3.5 px-6 border-b border-[#183B56]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
                New Collection
              </h2>
              <p className="text-xs text-[#5A7184] pt-0.5">
                A fresh take on the essentials. Modern silhouettes with timeless appeal.
              </p>
            </div>
            <button
              onClick={() => router.push("/market?sort=new")}
              className="text-xs sm:text-sm font-semibold text-[#183B56] hover:underline flex items-center gap-1.5 bg-transparent border-none cursor-pointer p-0"
            >
              <span>All Product</span>
              <span className="text-base font-normal leading-none">→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56]">
            {featuredNewCollection.map((product) => {
              const isAdded = addedProductIds[product.id];
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
                >
                  {/* Full-bleed Cool-Tinted Flat Image Box */}
                  <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-6 sm:p-8">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover object-top mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick Add Button */}
                    <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full py-2.5 text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
                          isAdded ? "bg-[#2E7D32] text-white" : "bg-[#183B56] text-white hover:bg-[#102A43]"
                        }`}
                      >
                        <ShoppingBag size={12} />
                        <span>{isAdded ? "Added ✓" : "Add to Bag"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Rate & Title Box */}
                  <div className="py-5 px-3 text-center flex flex-col items-center justify-center space-y-1.5 bg-[#F5EFEB]">
                    <div className="text-[13px] sm:text-[14px] font-bold text-[#183B56] group-hover:underline flex items-center justify-center gap-1.5 truncate max-w-full">
                      <span>{product.name}</span>
                      <span className="text-sm font-normal">→</span>
                    </div>
                    <div className="text-[15px] sm:text-[16px] font-bold text-[#183B56] tracking-tight">
                      {product.priceDisplay}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            5. CUSTOMER REVIEWS: CONTINUOUS 4-COLUMN WIREFRAME BOX GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="border-b border-[#183B56]">
          <div className="text-center py-6 border-b border-[#183B56]">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
              Customer Reviews
            </h2>
            <p className="text-xs text-[#5A7184] mt-0.5">
              What Our Customers Are Saying: Comfort and Quality You Can Trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56]">
            {[
              {
                name: "Geneva Williamson",
                rating: 5,
                img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
                quote: "Incredible quality and drape. Feels bespoke and lasts through every wash.",
              },
              {
                name: "Leslie Alexander",
                rating: 5,
                img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
                quote: "The texture and tailoring are unmatched. A permanent staple in my wardrobe.",
              },
              {
                name: "Robert Fox",
                rating: 5,
                img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
                quote: "Soft organic fabrics, pristine cuts. Exactly what modern luxury should be.",
              },
              {
                name: "Darlene Robertson",
                rating: 5,
                img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
                quote: "Stunning craftsmanship and seamless fit recommendations from Zyra.",
              },
            ].map((review, i) => (
              <div key={i} className="p-6 bg-[#F5EFEB] space-y-3 text-center flex flex-col justify-between">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-[#183B56] mx-auto">
                  <img src={review.img} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-center gap-1 text-[#183B56]">
                  {[...Array(review.rating)].map((_, s) => (
                    <Star key={s} size={11} className="fill-[#183B56]" />
                  ))}
                </div>
                <p className="text-xs text-[#5A7184] italic leading-relaxed">
                  "{review.quote}"
                </p>
                <div className="text-xs font-bold text-[#183B56]">
                  {review.name}
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}
