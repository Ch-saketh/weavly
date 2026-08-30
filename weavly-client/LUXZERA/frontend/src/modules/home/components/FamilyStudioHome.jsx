"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, ShoppingBag, Bookmark, Star, Instagram, Twitter, Facebook, Youtube, Sparkles } from "lucide-react";
import { getProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";
import { ProductGridSkeleton } from "@/shared/components/ui/Skeleton";

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
    "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&q=80",
    "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&q=80",
    "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80",
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
      image: product.imageUrl || product.image,
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

  // Best Sellers (first 4 products)
  const bestSellers = productsList.slice(0, 4);

  // New Collection (next 4 products)
  const newCollection = productsList.slice(4, 8);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">

      {/* ── TOP EDITORIAL SUB-BAR ── */}
      <div className="w-full border-b border-[#183B56]/20 py-2.5 px-6 sm:px-12 flex items-center justify-between text-xs tracking-wider uppercase font-semibold text-[#183B56]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#183B56] animate-pulse" />
          <span>Atelier Spring/Summer Edition 2026</span>
        </div>
        <div className="hidden sm:flex items-center gap-6 text-[11px] font-medium text-[#5A7184]">
          <span>Sustainable Organic Fibres</span>
          <span>•</span>
          <span>Complimentary Global Delivery</span>
          <span>•</span>
          <span>Bespoke Tailoring Guarantee</span>
        </div>
      </div>

      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-12 py-8 space-y-16 lg:space-y-24">

        {/* ════════════════════════════════════════════════════════════
            1. HERO SECTION: ARCHITECTURAL 3-COLUMN EDITORIAL SHOWCASE
        ════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-2">
          
          {/* LEFT: Category Index with Angled Lines & Socials (lg:col-span-3) */}
          <div className="lg:col-span-3 flex flex-col justify-between space-y-8 border-l-2 border-[#183B56] pl-6 py-2">
            <div className="space-y-4">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5A7184]">
                Categories
              </div>
              <nav className="space-y-2">
                {heroCategoryLinks.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setActiveHeroCategory(item.label);
                      router.push(`/market?q=${encodeURIComponent(item.query)}`);
                    }}
                    className={`w-full text-left py-2 px-3 border border-[#183B56]/30 hover:border-[#183B56] flex items-center justify-between text-sm font-semibold tracking-tight transition-all cursor-pointer bg-transparent ${
                      activeHeroCategory === item.label
                        ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                        : "text-[#183B56] hover:bg-[#183B56]/5"
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-base font-normal">→</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Social Follow Badges */}
            <div className="space-y-3 pt-6 border-t border-[#183B56]/20">
              <div className="text-[11px] uppercase tracking-[0.2em] font-semibold text-[#5A7184]">
                Follow Us
              </div>
              <div className="flex items-center gap-2">
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity">
                  <Facebook size={14} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity">
                  <Twitter size={14} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity">
                  <Instagram size={14} />
                </a>
                <a href="#" className="w-8 h-8 rounded-full bg-[#183B56] text-white flex items-center justify-center hover:opacity-85 transition-opacity">
                  <Youtube size={14} />
                </a>
              </div>
            </div>
          </div>

          {/* CENTER: Framed Hero Model & Arched Thumbnails (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col items-center gap-6">
            <div className="w-full aspect-[4/5] rounded-[36px] overflow-hidden bg-[#E2ECF1] border border-[#183B56]/25 relative shadow-md">
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
                  className={`w-20 h-24 rounded-t-full overflow-hidden border-2 transition-all p-0 bg-white cursor-pointer ${
                    activeHeroImage === idx
                      ? "border-[#183B56] scale-105 shadow-md"
                      : "border-[#183B56]/30 hover:border-[#183B56]/70 opacity-80"
                  }`}
                >
                  <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT: Brand Manifesto Headline & CTA (lg:col-span-4) */}
          <div className="lg:col-span-4 flex flex-col justify-between py-4 pl-0 lg:pl-6 space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-tight text-[#183B56] leading-[1.08]">
                Craftsmanship <br />
                That Lasts
              </h1>
              <p className="text-sm sm:text-base text-[#5A7184] leading-relaxed max-w-md font-normal">
                Elevate your everyday with timeless, quality-crafted essentials. From sustainable organic materials to enduring designs, each piece is made to last.
              </p>
            </div>

            <div className="pt-4">
              <button
                onClick={() => router.push("/market")}
                className="px-8 py-4 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] rounded-sm transition-all cursor-pointer border-none shadow-md hover:translate-x-1 inline-flex items-center gap-3"
              >
                <span>Explore Now</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

        </section>

        {/* ════════════════════════════════════════════════════════════
            2. BEST SELLERS: 4-COLUMN ARCHITECTURAL WIREFRAME GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="border-t-2 border-b-2 border-[#183B56]">
          
          {/* Header Bar */}
          <div className="flex items-center justify-between py-4 px-2 border-b border-[#183B56]/30">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
              Best Sellers
            </h2>
            <button
              onClick={() => router.push("/market?sort=popularity")}
              className="text-xs sm:text-sm font-bold text-[#183B56] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
            >
              <span>All Products</span>
              <span>→</span>
            </button>
          </div>

          {/* 4 Architectural Columns */}
          {loadingProducts ? (
            <ProductGridSkeleton count={4} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56]/30">
              {bestSellers.map((product) => {
                const saved = isSaved?.(product.id);
                return (
                  <div
                    key={product.id}
                    onClick={() => router.push(`/product/${product.id}`)}
                    className="p-6 group cursor-pointer flex flex-col justify-between gap-6 hover:bg-[#183B56]/[0.02] transition-colors"
                  >
                    {/* Cool-Tinted Garment Backdrop */}
                    <div className="aspect-[3/4] bg-[#E5EEF3] rounded-2xl overflow-hidden p-6 relative flex items-center justify-center border border-[#183B56]/15">
                      <img
                        src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"}
                        alt={product.name}
                        className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80";
                        }}
                      />

                      {/* Wardrobe Bookmark Icon */}
                      <button
                        onClick={(e) => handleToggleLike(e, product)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 border border-[#183B56]/20 flex items-center justify-center p-0 cursor-pointer shadow-xs hover:scale-110 transition-transform"
                      >
                        <Bookmark
                          size={14}
                          className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
                        />
                      </button>
                    </div>

                    {/* Product Meta */}
                    <div className="text-center space-y-1">
                      <div className="text-sm font-bold text-[#183B56] group-hover:text-[#102A43] flex items-center justify-center gap-1 truncate">
                        <span>{product.name}</span>
                        <span>→</span>
                      </div>
                      <div className="text-sm font-bold text-[#183B56]">
                        ₹{Math.round(product.price || 1999).toLocaleString("en-IN")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. OUR BRAND / ATELIER COLLAGE BENTO GRID
        ════════════════════════════════════════════════════════════ */}
        <section className="border-t-2 border-b-2 border-[#183B56] py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left: Brand Story & Atelier Labels (lg:col-span-5) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#183B56]">
                  Our Brand
                </h2>
                <p className="text-sm text-[#5A7184] leading-relaxed font-normal">
                  Elevated essentials for every moment. Crafted with care, designed to endure. Embrace simplicity, redefine style. Less clutter, more meaning. Craftsmanship at its finest, indulgent fabrics, timeless appeal. For those who appreciate the art of dressing. Where elegance meets excellence.
                </p>
                <button onClick={() => router.push("/about")} className="text-xs font-bold text-[#183B56] hover:underline bg-transparent border-none cursor-pointer p-0">
                  Read More...
                </button>
              </div>

              {/* Brand Labels Table & Stamp Badge */}
              <div className="flex items-center justify-between gap-6 pt-4 border-t border-[#183B56]/20">
                <div className="space-y-2 text-xs font-semibold text-[#183B56]">
                  <div className="py-1 border-b border-[#183B56]/15">GreenStitch</div>
                  <div className="py-1 border-b border-[#183B56]/15">Urban Code</div>
                  <div className="py-1 border-b border-[#183B56]/15">Threadline</div>
                  <div className="py-1">Sovereign</div>
                </div>

                {/* Circular Atelier Stamp Badge */}
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#183B56] flex flex-col items-center justify-center text-center p-2 rotate-12 hover:rotate-0 transition-transform">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-[#183B56]">Atelier</span>
                  <span className="text-xs font-extrabold text-[#183B56]">100%</span>
                  <span className="text-[8px] uppercase tracking-widest text-[#5A7184]">Cotton</span>
                </div>
              </div>
            </div>

            {/* Right: Multi-Texture Fashion Lookbook Collage (lg:col-span-7) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#183B56]/20 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&q=80"
                  alt="Lookbook 1"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#183B56]/20 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80"
                  alt="Lookbook 2"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="aspect-[3/4] rounded-2xl overflow-hidden border border-[#183B56]/20 shadow-sm">
                <img
                  src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                  alt="Lookbook 3"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

          </div>
        </section>

        {/* ── ZERA PERSONALIZED RECOMMENDATIONS SECTION ── */}
        <ZeraRecommendationsSection />

        {/* ════════════════════════════════════════════════════════════
            4. NEW COLLECTION: 4-COLUMN PRODUCT ARCHITECTURE
        ════════════════════════════════════════════════════════════ */}
        <section className="border-t-2 border-b-2 border-[#183B56]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 px-2 border-b border-[#183B56]/30">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
                New Collection
              </h2>
              <p className="text-xs text-[#5A7184] pt-0.5">
                A fresh take on the essentials. Modern silhouettes with timeless appeal.
              </p>
            </div>
            <button
              onClick={() => router.push("/market?sort=new")}
              className="text-xs sm:text-sm font-bold text-[#183B56] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
            >
              <span>All Products</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#183B56]/30">
            {newCollection.map((product) => {
              const isAdded = addedProductIds[product.id];
              return (
                <div
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="p-6 group cursor-pointer flex flex-col justify-between gap-4 hover:bg-[#183B56]/[0.02] transition-colors"
                >
                  <div className="aspect-[3/4] bg-white rounded-2xl overflow-hidden p-4 relative flex items-center justify-center border border-[#183B56]/15">
                    <img
                      src={product.imageUrl || product.image || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Quick Add Button */}
                    <button
                      onClick={(e) => handleAddToCart(e, product)}
                      className={`absolute bottom-3 left-3 right-3 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
                        isAdded
                          ? "bg-[#2E7D32] text-white"
                          : "bg-[#183B56] text-white opacity-0 group-hover:opacity-100 shadow-md"
                      }`}
                    >
                      <ShoppingBag size={12} />
                      <span>{isAdded ? "Added ✓" : "Add to Bag"}</span>
                    </button>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <h3 className="text-sm font-bold text-[#183B56] truncate max-w-[180px]">
                      {product.name}
                    </h3>
                    <span className="text-sm font-bold text-[#183B56]">
                      ₹{Math.round(product.price || 1999).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            5. CUSTOMER REVIEWS & TESTIMONIALS (4-COLUMN EDITORIAL)
        ════════════════════════════════════════════════════════════ */}
        <section className="border-t-2 border-b-2 border-[#183B56] py-12">
          <div className="text-center max-w-xl mx-auto space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
              Customer Reviews
            </h2>
            <p className="text-xs text-[#5A7184]">
              What Our Customers Are Saying: Comfort and Quality You Can Trust.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
              <div key={i} className="p-6 bg-white rounded-2xl border border-[#183B56]/20 space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-full overflow-hidden border border-[#183B56]/30 mx-auto">
                  <img src={review.img} alt={review.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-center gap-1 text-[#183B56]">
                  {[...Array(review.rating)].map((_, s) => (
                    <Star key={s} size={12} className="fill-[#183B56]" />
                  ))}
                </div>
                <p className="text-xs text-[#5A7184] text-center italic leading-relaxed">
                  "{review.quote}"
                </p>
                <div className="text-center text-xs font-bold text-[#183B56]">
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
