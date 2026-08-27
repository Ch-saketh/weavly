import { useState, useEffect } from "react";
import { ArrowRight, Clock, Shirt, Tag, Heart, Plus, Sparkles, ChevronDown, User, ShoppingBag, TrendingUp, Search, Check } from "lucide-react";
import ProductCard from "@/modules/products/components/ProductCard";
import { PRODUCTS } from "@/modules/products/data/products";
import { getProducts } from "@/modules/products/services/productService";

const MODEL_A = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80";
const MODEL_B = "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80";
const MODEL_C = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80";
const MODEL_D = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80";

const CHANNELS = [
  { label: "New Arrivals",        tag: "Just Dropped",     color: "#F07020", img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80",   span: "md:col-span-2" },
  { label: "Relaxed Fit",         tag: "Casual Edit",      color: "#F07020", img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80",      span: "" },
  { label: "Minimalist Essentials",tag: "Timeless",         color: "#F07020", img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80",      span: "" },
  { label: "Independent Brands",  tag: "Exclusive",        color: "#F07020", img: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=600&q=80",      span: "" },
  { label: "Tailored Classics",   tag: "Sartorial",        color: "#F07020", img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80",   span: "md:col-span-2" },
];

const DESIGNERS = [
  {
    name: "Elena Rostova",
    location: "Paris, FR",
    role: "Lead Outerwear Designer",
    quote: "Luxury is in the details you do not see. It is the fit, the weight, the fall.",
    img: MODEL_D,
    accent: "#F07020",
  },
  {
    name: "Kian Wells",
    location: "London, UK",
    role: "Menswear Creator",
    quote: "I design for men who don't follow trends — they set them.",
    img: MODEL_B,
    accent: "#F07020",
  },
];

export default function Home({ onShopNow }) {
  const [products, setProducts] = useState(() => PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    getProducts({ limit: 20 }).then((items) => {
      if (isMounted && Array.isArray(items) && items.length > 0) {
        setProducts(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const trendingProducts = products.slice(0, 4);
  const editorPicks     = products.slice(4, 7);

  const categories = [
    { name: "Shirts",       img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=80&q=70" },
    { name: "Outerwear",    img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=80&q=70" },
    { name: "Conceptual",   img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=80&q=70" },
    { name: "Denim",        img: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=80&q=70" },
    { name: "Streetwear",   img: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=80&q=70" },
    { name: "Luxury",       img: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=80&q=70" },
  ];

  return (
    <div className="bg-white text-[#1D1D1F] font-sans">

      {/* ════════════════════════════════════════════
          0. HERO SECTION — Removed per request
      ════════════════════════════════════════════ */}

      {/* ════════════════════════════════════════════
          1. CURATED CHANNELS — Magazine Grid
      ════════════════════════════════════════════ */}
      <section className="w-full bg-white">
        {/* Section Header */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 pt-24 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#F07020] block mb-2">
              — Curated For You
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-[48px] font-black uppercase tracking-tight text-[#37352F] leading-[0.9]">
              Shop By<br />Channel
            </h2>
          </div>
          <button
            onClick={onShopNow}
            className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-[#9B9B9B] hover:text-[#F07020] transition-colors shrink-0 border-none bg-transparent cursor-pointer"
          >
            View All <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        {/* Channel Grid */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {CHANNELS.map((ch, i) => (
              <div
                key={ch.label}
                onClick={onShopNow}
                className={`group relative overflow-hidden rounded-2xl cursor-pointer border border-[#ECECEC] bg-white ${ch.span} ${
                  i === 0 || i === 5 ? "h-64" : "h-52"
                }`}
              >
                <img
                  src={ch.img}
                  alt={ch.label}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-[1.4s] group-hover:scale-105"
                  loading="lazy"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#37352F]/80 via-[#37352F]/10 to-transparent" />

                {/* Channel label */}
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <div>
                    <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-white/70 block mb-1">{ch.tag}</span>
                    <span className="text-[16px] font-bold uppercase tracking-wide text-[#FAFAF9] leading-tight">{ch.label}</span>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 bg-[#F07020]"
                  >
                    <ArrowRight size={14} className="text-[#FAFAF9]" strokeWidth={2} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          2. CATEGORY BADGE SCROLL ROW
      ════════════════════════════════════════════ */}
      <section className="w-full bg-white py-6 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-6 md:px-10 flex items-center gap-4 whitespace-nowrap min-w-max">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={onShopNow}
              className="flex items-center gap-3 border border-[#ECECEC] bg-white hover:border-[#5B6EF5]/40 hover:bg-white px-5 py-2.5 rounded-full transition-all duration-200 group shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden border border-[#ECECEC] shrink-0">
                <img src={cat.img} alt="" className="w-full h-full object-cover" />
              </div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1D1D1F] group-hover:text-[#5B6EF5] transition-colors">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════
          3. THE Weavly WAY — Custom Onboarding Stepper Flow
      ════════════════════════════════════════════ */}
      <section className="w-full bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 py-24">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-16">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-[48px] font-black uppercase tracking-tight text-[#37352F] leading-[0.9]">
                For You.<br /><span className="text-[#F07020]">Not Everyone.</span>
              </h2>
              <p className="mt-4 text-[14px] text-[#9B9B9B] leading-relaxed font-medium max-w-md">
                Weavly personalizes your fashion journey — from discovery to your wardrobe to your next purchase.
              </p>
            </div>
            
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <div className="h-14 w-[1px] bg-[#ECECEC] hidden md:block" />
              <div className="flex items-start gap-3 max-w-xs">
                <div className="w-9 h-9 rounded-full bg-white border border-[#ECECEC] flex items-center justify-center text-[#86868B] shrink-0 mt-0.5">
                  <Clock size={16} strokeWidth={1.5} />
                </div>
                <div>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#1D1D1F] block">Save Time. Shop Better.</span>
                  <span className="text-[12px] text-[#86868B] font-medium leading-normal mt-0.5 block">
                    We do the heavy lifting so you can focus on what you love.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">

            {/* Card 1 — Upload & Tell Us Your Style */}
            <div className="flex flex-col gap-4 border border-[#ECECEC] bg-white rounded-2xl p-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#86868B] bg-white border border-[#ECECEC] px-2.5 py-1 rounded-lg">
                  01
                </span>
                
                {/* Desktop Connector Arrow */}
                <div className="hidden lg:block absolute -right-5 top-1/3 -translate-y-1/2 z-20 text-[#ECECEC] pointer-events-none">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="0" y1="6" x2="18" y2="6" strokeDasharray="3 3" />
                    <path d="M14 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              
              {/* Illustration container */}
              <div className="relative w-full h-36 bg-white rounded-xl overflow-hidden border border-[#ECECEC] flex items-center justify-center select-none">
                {/* Polaroid 1 */}
                <div className="w-14 h-18 bg-white border border-[#ECECEC] p-1 shadow-sm transform -rotate-12 absolute left-4 top-6">
                  <img src={MODEL_A} alt="" className="w-full h-full object-cover object-top filter grayscale-[20%]" />
                </div>
                {/* Polaroid 2 */}
                <div className="w-14 h-18 bg-white border border-[#ECECEC] p-1 shadow-sm transform rotate-6 absolute left-14 top-4 z-10">
                  <img src={MODEL_C} alt="" className="w-full h-full object-cover object-top" />
                </div>
                {/* Polaroid 3 */}
                <div className="w-14 h-18 bg-white border border-[#ECECEC] p-1 shadow-sm transform -rotate-3 absolute left-24 top-8">
                  <img src={MODEL_D} alt="" className="w-full h-full object-cover object-top" />
                </div>
                {/* Phone mockup */}
                <div className="w-16 h-28 bg-white border border-[#1D1D1F] rounded-lg shadow-md absolute right-4 bottom-2 z-20 flex flex-col p-1">
                  <div className="w-full h-1 bg-[#1D1D1F]/10 rounded-full mb-1" />
                  <div className="flex-1 bg-white rounded border border-[#ECECEC] p-1 flex flex-col justify-between">
                    <div className="w-full h-3 rounded bg-[#5B6EF5]/15 flex items-center justify-center">
                      <span className="text-[5px] font-bold text-[#5B6EF5]">UPLOAD</span>
                    </div>
                    <div className="grid grid-cols-2 gap-0.5">
                      <div className="h-6 bg-white border border-[#ECECEC] rounded-sm" />
                      <div className="h-6 bg-white border border-[#ECECEC] rounded-sm" />
                    </div>
                    <div className="w-full h-2.5 rounded-sm bg-[#5B6EF5] flex items-center justify-center">
                      <span className="text-[4px] font-black text-white uppercase tracking-widest">Done</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#1D1D1F] leading-tight mb-2">
                  Upload &amp; Tell Us<br />Your Style
                </h3>
                <p className="text-[12px] text-[#86868B] leading-relaxed font-medium">
                  Upload 4–6 photos and share a few preferences. That's all we need to get started.
                </p>
              </div>
            </div>

            {/* Card 2 — We Curate For You */}
            <div className="flex flex-col gap-4 border border-[#ECECEC] bg-white rounded-2xl p-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#86868B] bg-white border border-[#ECECEC] px-2.5 py-1 rounded-lg">
                  02
                </span>
                
                {/* Desktop Connector Arrow */}
                <div className="hidden lg:block absolute -right-5 top-1/3 -translate-y-1/2 z-20 text-[#ECECEC] pointer-events-none">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="0" y1="6" x2="18" y2="6" strokeDasharray="3 3" />
                    <path d="M14 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Illustration container */}
              <div className="relative w-full h-36 bg-white rounded-xl overflow-hidden border border-[#ECECEC] flex items-center justify-center select-none">
                {/* Hanger rack drawing */}
                <div className="w-40 h-28 border border-dashed border-[#ECECEC] rounded-lg flex flex-col items-center justify-between p-2">
                  {/* Horizontal Bar */}
                  <div className="w-full h-1 bg-[#1D1D1F]/60 rounded-full mt-2 relative">
                    {/* Hangers */}
                    <div className="absolute left-6 -top-1 flex flex-col items-center">
                      <div className="w-4 h-3 border-t border-l border-r border-[#1D1D1F] rounded-t-full" />
                      <div className="w-8 h-12 bg-[#86868B] rounded-sm border border-[#ECECEC]" />
                    </div>
                    <div className="absolute left-16 -top-1 flex flex-col items-center">
                      <div className="w-4 h-3 border-t border-l border-r border-[#1D1D1F] rounded-t-full" />
                      <div className="w-8 h-14 bg-[#5B6EF5] rounded-sm border border-[#5B6EF5]" />
                    </div>
                    <div className="absolute left-26 -top-1 flex flex-col items-center">
                      <div className="w-4 h-3 border-t border-l border-r border-[#1D1D1F] rounded-t-full" />
                      <div className="w-8 h-10 bg-[#1D1D1F] rounded-sm border border-[#1D1D1F]" />
                    </div>
                  </div>
                  {/* Curated Package Box */}
                  <div className="w-14 h-8 bg-white border border-[#ECECEC] rounded shadow-sm flex items-center justify-center relative">
                    <div className="w-full h-[1px] bg-[#ECECEC] absolute top-1/2" />
                    <span className="text-[6px] font-black uppercase tracking-wider text-[#86868B] z-10 bg-white px-1">Weavly</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#1D1D1F] leading-tight mb-2">
                  We Curate<br />For You
                </h3>
                <p className="text-[12px] text-[#86868B] leading-relaxed font-medium">
                  We handpick pieces that match your taste, fit your vibe, and suit every part of your life.
                </p>
              </div>
            </div>

            {/* Card 3 — Save in Your Wardrobe */}
            <div className="flex flex-col gap-4 border border-[#ECECEC] bg-white rounded-2xl p-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#86868B] bg-white border border-[#ECECEC] px-2.5 py-1 rounded-lg">
                  03
                </span>
                
                {/* Desktop Connector Arrow */}
                <div className="hidden lg:block absolute -right-5 top-1/3 -translate-y-1/2 z-20 text-[#ECECEC] pointer-events-none">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="0" y1="6" x2="18" y2="6" strokeDasharray="3 3" />
                    <path d="M14 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Miniature Wardrobe Dashboard Illustration */}
              <div className="relative w-full h-36 bg-white rounded-xl overflow-hidden border border-[#ECECEC] flex flex-col p-2.5 select-none">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#ECECEC] pb-1.5 mb-1.5">
                  <span className="text-[8px] font-black uppercase tracking-widest text-[#1D1D1F]">Wardrobe</span>
                  <div className="flex items-center gap-1 text-[#86868B]">
                    <Plus size={8} strokeWidth={3} />
                  </div>
                </div>
                {/* Tiny tabs */}
                <div className="flex gap-1 mb-2 overflow-x-auto scrollbar-none">
                  <span className="text-[6.5px] font-black uppercase tracking-wider bg-[#5B6EF5] text-white px-2 py-0.5 rounded-full shrink-0">Casual</span>
                  <span className="text-[6.5px] font-bold uppercase tracking-wider text-[#86868B] bg-white px-2 py-0.5 rounded-full shrink-0">Office</span>
                  <span className="text-[6.5px] font-bold uppercase tracking-wider text-[#86868B] bg-white px-2 py-0.5 rounded-full shrink-0">Vacation</span>
                </div>
                {/* Tiny items grid */}
                <div className="grid grid-cols-3 gap-1 flex-1">
                  <div className="border border-[#ECECEC] bg-white rounded p-0.5 flex flex-col items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5">
                      <path d="M20.38 3.46L16 2.18l-4 3.75-4-3.75-4.38 1.28A2 2 0 0 0 2 5.38V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V5.38a2 2 0 0 0-1.62-1.92z" />
                    </svg>
                  </div>
                  <div className="border border-[#ECECEC] bg-white rounded p-0.5 flex flex-col items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                    </svg>
                  </div>
                  <div className="border border-[#ECECEC] bg-white rounded p-0.5 flex flex-col items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1D1D1F" strokeWidth="1.5">
                      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#1D1D1F] leading-tight mb-2">
                  Save in Your<br />Wardrobe
                </h3>
                <p className="text-[12px] text-[#86868B] leading-relaxed font-medium">
                  Save your favorites, build outfits, create collections, and plan your looks anytime.
                </p>
              </div>
            </div>

            {/* Card 4 — Add to Bag When Ready */}
            <div className="flex flex-col gap-4 border border-[#ECECEC] bg-white rounded-2xl p-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#86868B] bg-white border border-[#ECECEC] px-2.5 py-1 rounded-lg">
                  04
                </span>
                
                {/* Desktop Connector Arrow */}
                <div className="hidden lg:block absolute -right-5 top-1/3 -translate-y-1/2 z-20 text-[#ECECEC] pointer-events-none">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <line x1="0" y1="6" x2="18" y2="6" strokeDasharray="3 3" />
                    <path d="M14 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Illustration container */}
              <div className="relative w-full h-36 bg-white rounded-xl overflow-hidden border border-[#ECECEC] flex items-center justify-center select-none">
                {/* Weavly Shopping Bag */}
                <div className="w-16 h-20 bg-white border border-[#ECECEC] rounded shadow-sm relative flex flex-col items-center justify-center">
                  {/* Handle */}
                  <div className="w-8 h-6 border-2 border-b-0 border-[#1D1D1F]/40 rounded-t-full absolute -top-4" />
                  <span className="text-[7.5px] font-black uppercase tracking-wider text-[#1D1D1F] mb-1">Weavly</span>
                  {/* Heart icon inside blue badge */}
                  <div className="absolute bottom-2 -right-3 w-6 h-6 rounded-full bg-white border border-[#ECECEC] shadow-sm flex items-center justify-center text-[#5B6EF5]">
                    <Heart size={10} className="fill-[#5B6EF5]" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#1D1D1F] leading-tight mb-2">
                  Add to Bag<br />When Ready
                </h3>
                <p className="text-[12px] text-[#86868B] leading-relaxed font-medium">
                  Move the pieces you love to your bag when you're ready to make them yours.
                </p>
              </div>
            </div>

            {/* Card 5 — Checkout & Enjoy */}
            <div className="flex flex-col gap-4 border border-[#ECECEC] bg-white rounded-2xl p-6 relative">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-[#86868B] bg-white border border-[#ECECEC] px-2.5 py-1 rounded-lg">
                  05
                </span>
              </div>

              {/* Illustration container */}
              <div className="relative w-full h-36 bg-white rounded-xl overflow-hidden border border-[#ECECEC] flex items-center justify-center select-none">
                {/* Delivery package */}
                <div className="w-16 h-12 bg-white border border-[#1D1D1F]/30 rounded relative shadow-sm flex items-center justify-center">
                  <div className="w-full h-[1px] bg-[#1D1D1F]/20 absolute top-1/2" />
                  <div className="w-[1px] h-full bg-[#1D1D1F]/20 absolute left-1/2" />
                  {/* Shipping Label */}
                  <div className="w-5 h-3 bg-white absolute top-1.5 left-1.5 rounded-sm border border-[#ECECEC] flex flex-col justify-between p-0.5">
                    <div className="w-full h-[1px] bg-[#1D1D1F]/30" />
                    <div className="w-2/3 h-[1px] bg-[#1D1D1F]/30" />
                  </div>
                  {/* Sparkles icon next to it */}
                  <div className="absolute -top-3 -right-2 text-[#5B6EF5]">
                    ✦
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[14px] font-bold uppercase tracking-wide text-[#1D1D1F] leading-tight mb-2">
                  Checkout &amp;<br />Enjoy
                </h3>
                <p className="text-[12px] text-[#86868B] leading-relaxed font-medium">
                  Experience fast delivery and step out in styles that feel uniquely you.
                </p>
              </div>
            </div>

          </div>

          {/* Bottom Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-10 mt-16">
            
            {/* Feature 1 — Saves You Hours */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#86868B] shrink-0">
                <Clock size={16} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Saves You Hours
                </h4>
                <p className="text-[12px] text-[#86868B] font-medium leading-normal mt-1">
                  No more endless scrolling. We show you what truly fits you.
                </p>
              </div>
            </div>

            {/* Feature 2 — Made Just for You */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#86868B] shrink-0">
                <Shirt size={16} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Made Just for You
                </h4>
                <p className="text-[12px] text-[#86868B] font-medium leading-normal mt-1">
                  Your style, body type, and vibe — all considered.
                </p>
              </div>
            </div>

            {/* Feature 3 — Better Choices */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#86868B] shrink-0">
                <Tag size={16} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  Better Choices
                </h4>
                <p className="text-[12px] text-[#86868B] font-medium leading-normal mt-1">
                  Handpicked options you'll actually wear and love.
                </p>
              </div>
            </div>

            {/* Feature 4 — More Confidence */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#86868B] shrink-0">
                <Heart size={16} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#1D1D1F]">
                  More Confidence
                </h4>
                <p className="text-[12px] text-[#86868B] font-medium leading-normal mt-1">
                  Look good, feel great, every single day.
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>



      {/* ════════════════════════════════════════════
          4. TRENDING COLLECTIONS — Horizontal Luxury Grid
      ════════════════════════════════════════════ */}
      <section className="w-full border-b border-[#ECECEC] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pt-20 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5B6EF5] block mb-3">
              — Curation Edit
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-[#1D1D1F] leading-[0.9]">
              Trending<br />Collections
            </h2>
          </div>
          <button
            onClick={onShopNow}
            className="shrink-0 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#86868B] hover:text-[#5B6EF5] transition-colors"
          >
            View All <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pb-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {trendingProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          5. FEATURED DESIGNERS — Bold two-card layout
      ════════════════════════════════════════════ */}
      <section className="w-full bg-white border-b border-[#ECECEC]">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pt-20 pb-20">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5B6EF5] block mb-3">
                — Creative Direction
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1D1D1F] leading-[0.9]">
                Featured<br />Designers
              </h2>
            </div>
            <button
              onClick={onShopNow}
              className="shrink-0 bg-[#1D1D1F] hover:bg-[#2B2B2B] text-white text-[12px] font-semibold uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-sm"
            >
              See All Designers <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {DESIGNERS.map((d) => (
              <div
                key={d.name}
                onClick={onShopNow}
                className="group relative overflow-hidden rounded-2xl cursor-pointer border border-[#ECECEC] bg-white flex flex-col md:flex-row h-72 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.02)] transition-shadow duration-300"
              >
                {/* Image */}
                <div className="w-full md:w-[42%] h-48 md:h-full overflow-hidden bg-white shrink-0 relative">
                  <img
                    src={d.img}
                    alt={d.name}
                    className="w-full h-full object-cover object-top transition-transform duration-[1.4s] group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/30" />
                </div>

                {/* Content */}
                <div className="flex-1 p-7 flex flex-col justify-between">
                  <div>
                    <span
                      className="text-[12px] font-semibold uppercase tracking-[0.15em] block mb-2 text-[#5B6EF5]"
                    >
                      {d.role} · {d.location}
                    </span>
                    <h3 className="text-2xl font-black uppercase tracking-tight text-[#1D1D1F] leading-tight">
                      {d.name}
                    </h3>
                  </div>
                  <blockquote className="text-[12px] text-[#86868B] leading-[1.65] font-medium italic border-l-2 border-[#ECECEC] pl-3 mt-2">
                    "{d.quote}"
                  </blockquote>
                  <div
                    className="mt-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] group-hover:gap-3 transition-all text-[#5B6EF5]"
                  >
                    View Collection <ArrowRight size={12} strokeWidth={1.5} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          6. LUXURY BRAND EDITORIAL BANNERS
      ════════════════════════════════════════════ */}
      <section className="w-full border-b border-[#ECECEC] overflow-hidden bg-white">
        <div className="grid grid-cols-1 md:grid-cols-2">

          {/* Banner 1 — Brand Blue */}
          <div
            onClick={onShopNow}
            className="group relative overflow-hidden bg-[#5B6EF5] px-12 py-16 cursor-pointer flex flex-col justify-between min-h-[18rem]"
          >
            <div
              className="absolute inset-0 opacity-8 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(-45deg, #FAFAF9 0, #FAFAF9 1px, transparent 0, transparent 50%)",
                backgroundSize: "14px 14px",
                opacity: 0.05,
              }}
            />
            <div className="relative z-10">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF9]/60 block mb-4">// Nocturne Studio · London</span>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#FAFAF9] leading-[0.88]">
                TRENDS<br />FASHION<br />VIBES
              </h3>
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF9]/60 block">SS26 Capsule Drop</span>
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#FAFAF9] mt-1 block hover:opacity-80 transition-opacity">
                  Shop Now →
                </span>
              </div>
              {/* Right image overlay */}
              <div className="w-28 h-32 rounded-2xl overflow-hidden border border-[#FAFAF9]/20 opacity-80 group-hover:opacity-100 transition-opacity">
                <img src={MODEL_B} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
            </div>
          </div>

          {/* Banner 2 — Near Black */}
          <div
            onClick={onShopNow}
            className="group relative overflow-hidden bg-[#1D1D1F] px-12 py-16 cursor-pointer flex flex-col justify-between min-h-[18rem]"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "repeating-linear-gradient(-45deg, #FAFAF9 0, #FAFAF9 1px, transparent 0, transparent 50%)",
                backgroundSize: "14px 14px",
                opacity: 0.05,
              }}
            />
            <div className="relative z-10">
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF9]/60 block mb-4">// Voidwear · Paris Atelier</span>
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-[#FAFAF9] leading-[0.88]">
                STYLE<br />SHIRT<br />SPRING
              </h3>
            </div>
            <div className="relative z-10 flex items-end justify-between">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#FAFAF9]/60 block">Limited Edition</span>
                <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#FAFAF9] mt-1 block hover:opacity-80 transition-opacity">
                  Shop Now →
                </span>
              </div>
              <div className="w-28 h-32 rounded-2xl overflow-hidden border border-[#FAFAF9]/20 opacity-80 group-hover:opacity-100 transition-opacity">
                <img src={MODEL_D} alt="" className="w-full h-full object-cover object-top" loading="lazy" />
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ════════════════════════════════════════════
          7. EDITOR'S PICKS — Clean Showcase Grid
      ════════════════════════════════════════════ */}
      <section className="w-full border-b border-[#ECECEC] bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-10 lg:px-14 pt-20 pb-20">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#5B6EF5] block mb-3">
                — Curated Picks
              </span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-[#1D1D1F] leading-[0.9]">
                Editor's<br />Picks
              </h2>
            </div>
            <button
              onClick={onShopNow}
              className="shrink-0 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.2em] text-[#86868B] hover:text-[#5B6EF5] transition-colors"
            >
              See All <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {editorPicks.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          8. COMMUNITY SPOTLIGHT — Big Quote + Categories (Pure Black & Crisp White)
      ════════════════════════════════════════════ */}
      <section className="w-full bg-[#000000] border-b border-[#000000]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 lg:px-16 py-24 text-center">
          <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#9B9B9B] block mb-6">
            — Weavly Community
          </span>
          <blockquote className="text-3xl md:text-4xl lg:text-[48px] font-black uppercase tracking-tight text-white leading-[0.9] max-w-4xl mx-auto">
            "Fashion is not just<br />what you wear.<br />It's who you are."
          </blockquote>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
            {["Shirts", "Hot Summer", "Conceptual", "Denim Blazer", "Streetwear", "Luxury"].map((tag) => (
              <button
                key={tag}
                onClick={onShopNow}
                className="border border-white/20 hover:border-white text-white text-[12px] font-bold uppercase tracking-[0.15em] px-6 py-3 rounded-xl transition-all duration-200 hover:bg-white/10 cursor-pointer bg-transparent"
              >
                {tag}
              </button>
            ))}
          </div>
          <button
            onClick={onShopNow}
            className="mt-12 bg-white hover:bg-[#FAFAF9] text-[#18181B] text-[12px] font-extrabold uppercase tracking-[0.15em] px-8 py-4 rounded-xl transition-all duration-300 inline-flex items-center gap-2 shadow-md border-none cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            Start Exploring <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </section>

    </div>
  );
}