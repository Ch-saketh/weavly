import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, ShoppingBag, Bookmark } from "lucide-react";
import { PRODUCTS } from "@/modules/products/data/products";
import { getProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";

export default function FamilyStudioHome({ onShopNow, onOpenAuth }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { addToCart } = useCart();

  // Added animation state map
  const [addedProductIds, setAddedProductIds] = useState({});

  // Category & Gender filter state
  const userGenderRaw = (user?.gender || "").toLowerCase();
  const userGenderNorm = ["male", "men", "man", "boy"].includes(userGenderRaw)
    ? "MEN"
    : ["female", "women", "woman", "girl"].includes(userGenderRaw)
    ? "WOMAN"
    : null;
  const initialGender = userGenderNorm || "MEN";
  const [activeTab, setActiveTab] = useState("ALL");
  const [genderFilter, setGenderFilter] = useState(initialGender);
  const [productsList, setProductsList] = useState(() => PRODUCTS);

  useEffect(() => {
    let isMounted = true;
    // Fetch with gender filter to get backend-filtered results
    const genderParam = userGenderNorm === "MEN" ? "men" : userGenderNorm === "WOMAN" ? "women" : undefined;
    getProducts({ limit: 100, gender: genderParam }).then((items) => {
      if (isMounted && Array.isArray(items) && items.length > 0) {
        setProductsList(items);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userGenderNorm]);

  // Products Data mapping with Gender & Category Filtering
  const categoryProducts = productsList.filter((p) => {
    // 1. Gender filtering
    const pGender = (p.gender || p.audience || "").toLowerCase();
    if (genderFilter === "MEN") {
      if (pGender && !["men", "male", "boys", "boy", "unisex"].includes(pGender)) {
        return false;
      }
    } else if (genderFilter === "WOMAN") {
      if (pGender && !["women", "female", "girls", "girl", "unisex"].includes(pGender)) {
        return false;
      }
    }

    // 2. Category filtering
    if (activeTab === "ALL") return true;
    if (activeTab === "SHORTS") return p.category?.toUpperCase() === "PANTS" || p.category?.toUpperCase() === "SHORTS" || p.category?.toUpperCase() === "BOTTOMS";
    if (activeTab === "JACKETS") return p.category?.toUpperCase() === "JACKETS" || p.category?.toUpperCase() === "OUTERWEAR";
    if (activeTab === "SHOES") return p.category?.toUpperCase() === "SHOES" || p.category?.toUpperCase() === "FOOTWEAR";
    if (activeTab === "T-SHIRT") return p.category?.toUpperCase() === "SHIRTS" || p.category?.toUpperCase() === "TOPS";
    return true;
  });

  const handleToggleLike = (e, product) => {
    e.stopPropagation();
    toggleWardrobe(product);
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      color: product.color || "Default",
      size: "M",
      qty: 1,
    });
    setAddedProductIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#1D1D1F] font-sans selection:bg-[#1D1D1F] selection:text-white pb-32">
      
      {/* ── MAIN WORKSPACE ── */}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14 pt-6 space-y-16 lg:space-y-24">

        {/* ════════════════════════════════════════════════════════════
            1. HERO BENTO GRID (Clean, Professional, No Frame Noise)
        ════════════════════════════════════════════════════════════ */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* LEFT COLUMN: Large Hero Banner + 2 Bottom Cards (lg:col-span-8) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Top Large Hero Banner (Blue-Teal Backdrop + 50% OFF Badge + Models) */}
            <div 
              onClick={() => router.push("/market")}
              className="bg-[#6B8594] rounded-[32px] overflow-hidden min-h-[380px] sm:min-h-[440px] relative group cursor-pointer p-8 sm:p-12 flex flex-col justify-between text-white shadow-xs"
            >
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80" 
                alt="Summer Arrival of Outfit" 
                className="absolute inset-0 w-full h-full object-cover object-top mix-blend-overlay opacity-90"
              />

              {/* Top 50% OFF Badge */}
              <div className="relative z-10 flex items-start justify-between">
                <div className="max-w-md space-y-3">
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light tracking-tight leading-[1.05] text-white drop-shadow-sm">
                    Summer <br /> Arrival of <br />
                    <span className="font-normal">Outfit</span>
                  </h1>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal pt-1 max-w-xs">
                    Discover quality fashion that reflects your style and makes everyday living more enjoyable.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-4xl sm:text-5xl font-light tracking-tighter">50%</span>
                  <span className="text-xs font-semibold uppercase tracking-wider block">OFF</span>
                </div>
              </div>

              {/* Bottom Explore Product Pill Button */}
              <div className="relative z-10 pt-6">
                <button
                  onClick={() => router.push("/market")}
                  className="h-11 px-6 bg-[#1D1D1F] hover:bg-[#F07020] text-white text-xs font-semibold tracking-wider rounded-full inline-flex items-center gap-2 transition-all cursor-pointer border-none shadow-md"
                >
                  <span>EXPLORE PRODUCT</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>

            {/* Bottom 2 Wide Cards Row (Sunglasses & Popular Shoes) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Card 1: Trendy Sunglasses (Sage Green) */}
              <div 
                onClick={() => router.push("/market?cat=ACCESSORIES")}
                className="bg-[#D8DFD5] rounded-[28px] overflow-hidden h-[180px] p-6 relative group cursor-pointer flex items-center justify-between shadow-xs border border-[#CBD3C8] hover:bg-[#CFD7CC] transition-colors"
              >
                <div className="space-y-1 z-10">
                  <h3 className="text-2xl font-light tracking-tight text-[#1D1D1F] leading-tight">
                    Trendy <br /> <span className="font-normal">Sunglass</span>
                  </h3>
                </div>
                <div className="w-36 h-36 relative z-10 shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=80" 
                    alt="Trendy Sunglass" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#1D1D1F] z-10">
                  <ArrowUpRight size={16} />
                </div>
              </div>

              {/* Card 2: Popular Shoes (Warm Beige) */}
              <div 
                onClick={() => router.push("/market?cat=SHOES")}
                className="bg-[#E7DACD] rounded-[28px] overflow-hidden h-[180px] p-6 relative group cursor-pointer flex items-center justify-between shadow-xs border border-[#DCBCAE] hover:bg-[#DFCDBF] transition-colors"
              >
                <div className="space-y-1 z-10">
                  <h3 className="text-2xl font-light tracking-tight text-[#1D1D1F] leading-tight">
                    Popular <br /> <span className="font-normal">Shoes</span>
                  </h3>
                </div>
                <div className="w-36 h-36 relative z-10 shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80" 
                    alt="Popular Shoes" 
                    className="w-full h-full object-contain" 
                  />
                </div>
                <div className="absolute bottom-5 right-5 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-[#1D1D1F] z-10">
                  <ArrowUpRight size={16} />
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: Vertical Fashion Style Card (lg:col-span-4) */}
          <div className="lg:col-span-4">
            <div 
              onClick={() => router.push("/market")}
              className="bg-[#EBE9E4] rounded-[32px] overflow-hidden h-full min-h-[500px] p-8 relative group cursor-pointer border border-[#E0DDD7] flex flex-col justify-between shadow-xs"
            >
              <div className="z-10">
                <h3 className="text-3xl font-light tracking-tight text-[#1D1D1F] leading-tight">
                  Fashion <br /> <span className="font-normal">Style</span>
                </h3>
              </div>

              <img 
                src="https://images.unsplash.com/photo-1584273143981-41c073dfe8f8?auto=format&fit=crop&w=800&q=80" 
                alt="Fashion Style" 
                className="absolute inset-0 w-full h-full object-cover object-top" 
              />

              <div className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-[#1D1D1F] z-10 shadow-sm">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>

        </section>

        {/* ════════════════════════════════════════════════════════════
            2. BROWSE CATEGORIES (Clean Category Cards)
        ════════════════════════════════════════════════════════════ */}
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-[#E7E3DD] pb-4">
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#1D1D1F] uppercase">
              BROWSE CATEGORIES
            </h2>

            {/* Segmented Filter Toggle Pill: [ MEN | WOMAN ] */}
            <div className="flex items-center gap-1 bg-[#EBE9E4] p-1 rounded-full border border-[#E0DDD7]">
              <button
                onClick={() => setGenderFilter("MEN")}
                className={`px-4 py-1 rounded-full text-[11px] font-semibold tracking-wider transition-all cursor-pointer border-none ${
                  genderFilter === "MEN" ? "bg-[#1D1D1F] text-white" : "text-[#71717A] hover:text-[#1D1D1F]"
                }`}
              >
                MEN
              </button>
              <button
                onClick={() => setGenderFilter("WOMAN")}
                className={`px-4 py-1 rounded-full text-[11px] font-semibold tracking-wider transition-all cursor-pointer border-none ${
                  genderFilter === "WOMAN" ? "bg-[#1D1D1F] text-white" : "text-[#71717A] hover:text-[#1D1D1F]"
                }`}
              >
                WOMAN
              </button>
            </div>
          </div>

          {/* 4 Large Category Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Category 1: SHOES */}
            <div 
              onClick={() => router.push("/market?cat=SHOES")}
              className="bg-[#E5E4E0] rounded-[24px] overflow-hidden aspect-[4/3] relative group cursor-pointer border border-[#DDDCD7]"
            >
              <img 
                src="https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=600&q=80" 
                alt="Shoes" 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/90 text-[#1D1D1F] rounded-full shadow-2xs">
                SHOES
              </span>
            </div>

            {/* Category 2: BRASH / ACCESSORIES */}
            <div 
              onClick={() => router.push("/market?cat=ACCESSORIES")}
              className="bg-[#E5E4E0] rounded-[24px] overflow-hidden aspect-[4/3] relative group cursor-pointer border border-[#DDDCD7]"
            >
              <img 
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" 
                alt="Accessories" 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/90 text-[#1D1D1F] rounded-full shadow-2xs">
                ACCESSORIES
              </span>
            </div>

            {/* Category 3: BAGE / HANDBAGS */}
            <div 
              onClick={() => router.push("/market?cat=BAGS")}
              className="bg-[#E5E4E0] rounded-[24px] overflow-hidden aspect-[4/3] relative group cursor-pointer border border-[#DDDCD7]"
            >
              <img 
                src="https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=600&q=80" 
                alt="Bags" 
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/90 text-[#1D1D1F] rounded-full shadow-2xs">
                BAGS
              </span>
            </div>

            {/* Category 4: T-SHIRT / WOMEN */}
            <div 
              onClick={() => router.push("/women")}
              className="bg-[#E5E4E0] rounded-[24px] overflow-hidden aspect-[4/3] relative group cursor-pointer border border-[#DDDCD7]"
            >
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80" 
                alt="T-Shirt" 
                className="w-full h-full object-cover object-top" 
              />
              <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-white/90 text-[#1D1D1F] rounded-full shadow-2xs">
                T-SHIRT
              </span>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            3. NEW COLLECTION (Product Cards + ADD TO BAG Option)
        ════════════════════════════════════════════════════════════ */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#1D1D1F]">
              New Collection
            </h2>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {["ALL", "SHORTS", "JACKETS", "SHOES", "T-SHIRT"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`h-8 px-5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer border-none ${
                    activeTab === tab
                      ? "bg-[#1D1D1F] text-white"
                      : "bg-[#EBE9E4] text-[#515154] hover:bg-[#E0DDD7] hover:text-[#1D1D1F]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid with ADD TO BAG Option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {categoryProducts.map((product) => {
              const saved = isSaved?.(product.id);
              const isAdded = addedProductIds[product.id];
              return (
                <div 
                  key={product.id}
                  onClick={() => router.push(`/product/${product.id}`)}
                  className="group cursor-pointer flex flex-col gap-3"
                >
                  {/* Clean Full-Bleed Product Card Container */}
                  <div className="aspect-[3/4] bg-[#FAF8F5] rounded-[24px] overflow-hidden border border-[#E7E3DD] relative shadow-xs">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover object-top" 
                    />

                    {/* Top Right Bookmark Badge */}
                    <button
                      onClick={(e) => handleToggleLike(e, product)}
                      className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-[#E7E3DD] flex items-center justify-center cursor-pointer shadow-xs p-0 z-10 hover:bg-white transition-transform hover:scale-105"
                      aria-label="Save to Wardrobe"
                      title={saved ? "Saved in Wardrobe" : "Save to Wardrobe"}
                    >
                      <Bookmark 
                        size={15}
                        className={`transition-colors ${
                          saved ? "fill-[#F07020] text-[#F07020]" : "text-[#71717A]"
                        }`} 
                      />
                    </button>

                    {/* Bottom ADD TO BAG Quick Action Button (Reveals on Hover) */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className={`w-full h-9 rounded-full text-[11px] font-semibold tracking-wider flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer border-none shadow-md ${
                          isAdded
                            ? "bg-[#2E7D32] text-white"
                            : "bg-[#1D1D1F]/95 hover:bg-[#F07020] text-white backdrop-blur-md"
                        }`}
                      >
                        <ShoppingBag size={13} />
                        <span>{isAdded ? "ADDED TO BAG ✓" : "ADD TO BAG"}</span>
                      </button>
                    </div>
                  </div>

                  {/* Below Image Text: Title + Price */}
                  <div className="flex justify-between items-baseline pt-1 px-1">
                    <h3 className="text-sm font-semibold text-[#1D1D1F] group-hover:text-[#F07020] transition-colors truncate max-w-[200px]">
                      {product.name}
                    </h3>
                    <span className="text-sm font-semibold text-[#1D1D1F]">
                      ₹{Math.round(product.price || 999).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            4. END OF SEASON SALE BANNER (Pitch Black Row)
        ════════════════════════════════════════════════════════════ */}
        <section className="bg-[#111111] text-white rounded-[32px] overflow-hidden p-8 sm:p-12 lg:p-14 relative group cursor-pointer border border-[#222222] shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column Text */}
            <div className="lg:col-span-8 space-y-4 z-10">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#A1A1AA] block">
                LAST CHANCE
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tight leading-tight text-white">
                END OF SEASON SALE <br />
                <span className="font-semibold">UP TO 50% OFF</span>
              </h2>

              <div className="pt-4">
                <button
                  onClick={() => router.push("/market?sale=true")}
                  className="h-11 px-7 bg-white hover:bg-[#F07020] hover:text-white text-[#1D1D1F] text-xs font-bold uppercase tracking-wider rounded-full transition-all cursor-pointer border-none shadow-md"
                >
                  CHECK IT NOW
                </button>
              </div>
            </div>

            {/* Right Column Image */}
            <div className="lg:col-span-4 aspect-[4/3] rounded-[24px] overflow-hidden relative z-10 border border-[#333333]">
              <img 
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" 
                alt="End of Season Sale" 
                className="w-full h-full object-cover object-top" 
              />
            </div>

          </div>
        </section>

      </main>

    </div>
  );
}
