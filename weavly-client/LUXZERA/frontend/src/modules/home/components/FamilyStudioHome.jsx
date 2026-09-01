"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowDown, ChevronLeft, ChevronRight, ShoppingBag, Bookmark, Camera } from "lucide-react";
import { getProducts } from "@/modules/products/services/productService";
import { useAuth } from "@/modules/auth/store/useAuth";
import { useWardrobe } from "@/modules/wishlist/store/WardrobeContext";
import { useCart } from "@/modules/cart/store/CartContext";
import ZeraRecommendationsSection from "@/modules/recommendations/components/ZeraRecommendationsSection";
import BespokeFitModal from "./BespokeFitModal";

const NEUTRAL_FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='800' viewBox='0 0 600 800' fill='none'%3E%3Crect width='600' height='800' fill='%23DFE7ED'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='16' font-weight='700' fill='%23183B56' text-anchor='middle' letter-spacing='2'%3EWEAVLY%3C/text%3E%3C/svg%3E";

const ensureHttps = (url) => {
  if (!url || typeof url !== "string") return "";
  return url.replace(/^http:\/\//i, "https://");
};

// Strict Hard Filters — Prevent 100% of Cross-Gender & Kids Leakage
export const isStrictlyWomenProduct = (p) => {
  if (!p) return false;
  const g = (p.gender || p.department || p.audience || "").toLowerCase().trim();
  const name = (p.name || p.title || "").toLowerCase();
  
  // Rejection rules: Men, Male, Boy, Boys, Kids
  if (g === "men" || g === "male") return false;
  if (name.includes("men ") || name.includes(" men") || name.includes("men's") || name.includes("boys") || name.includes("boy ")) return false;
  if (name.includes("duke men") || name.includes("next look men") || name.includes("newport men") || name.includes("free authority men") || name.includes("parx men") || name.includes("qraa men")) return false;

  // Positive validation: Women, Female, Girl, or Women-specific items
  return (
    g.includes("women") ||
    g.includes("female") ||
    g.includes("girl") ||
    name.includes("women") ||
    name.includes("dress") ||
    name.includes("kurti") ||
    name.includes("saree") ||
    name.includes("lehenga") ||
    name.includes("playsuit") ||
    name.includes("gown")
  );
};

export const isStrictlyMenProduct = (p) => {
  if (!p) return false;
  const g = (p.gender || p.department || p.audience || "").toLowerCase().trim();
  const name = (p.name || p.title || "").toLowerCase();

  // Rejection rules: Women, Female, Girl, Girls, Kids
  if (g === "women" || g === "female" || g === "girl") return false;
  if (name.includes("women ") || name.includes(" women") || name.includes("women's") || name.includes("girls") || name.includes("girl ")) return false;
  if (name.includes("dress") || name.includes("bra ") || name.includes("kurti") || name.includes("saree") || name.includes("lehenga") || name.includes("playsuit") || name.includes("gown") || name.includes("hair dryer")) return false;

  // Positive validation: Men, Male, Boy, or Men-specific items
  return (
    g.includes("men") ||
    g.includes("male") ||
    g.includes("boy") ||
    name.includes("men") ||
    name.includes("shirt") ||
    name.includes("blazer") ||
    name.includes("polo") ||
    name.includes("trousers")
  );
};

export const isStrictlyFootwearProduct = (p) => {
  if (!p) return false;
  const c = (p.category || "").toLowerCase();
  const name = (p.name || p.title || "").toLowerCase();
  if (c === "shoes" || c === "footwear") return true;
  return (
    name.includes("shoe") ||
    name.includes("sneaker") ||
    name.includes("loafer") ||
    name.includes("derby") ||
    name.includes("derbys") ||
    name.includes("sandal") ||
    name.includes("sandals") ||
    name.includes("boots") ||
    name.includes("boot") ||
    name.includes("heels") ||
    name.includes("heel") ||
    name.includes("flats") ||
    name.includes("flat") ||
    name.includes("oxford") ||
    name.includes("brogues") ||
    name.includes("slippers")
  );
};

const MEN_HERO_CATEGORIES = [
  {
    id: "men_shirts",
    label: "Linen & Oxford Shirts",
    query: "Shirts",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,499",
  },
  {
    id: "men_blazers",
    label: "Tailored Blazers & Suits",
    query: "Blazers",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹2,999",
  },
  {
    id: "men_trousers",
    label: "Trousers & Chinos",
    query: "Trousers",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,299",
  },
  {
    id: "men_outerwear",
    label: "Jackets & Outerwear",
    query: "Jackets",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹2,499",
  },
];

const WOMEN_HERO_CATEGORIES = [
  {
    id: "women_dresses",
    label: "Dresses & Gowns",
    query: "Dresses",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,299",
  },
  {
    id: "women_tops",
    label: "Tops & Blouses",
    query: "Tops",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹999",
  },
  {
    id: "women_skirts",
    label: "Skirts & Bottoms",
    query: "Skirts",
    image: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,499",
  },
  {
    id: "women_outerwear",
    label: "Jackets & Trench Coats",
    query: "Jackets",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹2,999",
  },
];

const HERO_CATEGORIES = [
  {
    id: "men",
    label: "Men's Essentials",
    query: "Men",
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹999",
  },
  {
    id: "women",
    label: "Women's Collection",
    query: "Women",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,299",
  },
  {
    id: "shirts",
    label: "Linen & Oxford Shirts",
    query: "Shirts",
    image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹1,499",
  },
  {
    id: "outerwear",
    label: "Jackets & Outerwear",
    query: "Jackets",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    startPrice: "₹2,499",
  },
];

// Department Carousel Component (Infinite Side-Scroll Shelf)
function DepartmentCarousel({
  title,
  subtitle,
  deptQuery,
  products = [],
  loading = false,
  onAddToCart,
  onToggleLike,
  isSaved,
  addedProductIds = {},
}) {
  const router = useRouter();
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftPos = useRef(0);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const offset = direction === "left" ? -520 : 520;
      scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    }
  };

  // Drag-to-scroll handlers
  const handleMouseDown = (e) => {
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftPos.current = scrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftPos.current - walk;
  };

  if (loading) {
    return (
      <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
        <div className="py-4 px-6 border-b border-[#183B56] flex justify-between items-center">
          <div>
            <div className="h-6 w-48 bg-[#183B56]/15 rounded-xs animate-pulse mb-1" />
            <div className="h-3.5 w-32 bg-[#183B56]/10 rounded-xs animate-pulse" />
          </div>
        </div>
        <div className="flex overflow-hidden divide-x divide-[#183B56]">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="w-[240px] sm:w-[260px] shrink-0 p-4 space-y-3">
              <div className="aspect-[3/3.7] bg-[#DFE7ED] rounded-xs animate-pulse" />
              <div className="h-4 bg-[#183B56]/10 rounded-xs animate-pulse w-3/4 mx-auto" />
              <div className="h-4 bg-[#183B56]/15 rounded-xs animate-pulse w-1/2 mx-auto" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
      {/* Header Bar with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 px-6 border-b border-[#183B56]">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#183B56]">
            {title}
          </h2>
          <p className="text-xs text-[#5A7184] pt-0.5">
            {subtitle} • {products.length} Curated Items (Scroll Horizontally →)
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => router.push(`/market?gender=${encodeURIComponent(deptQuery)}`)}
            className="text-xs font-semibold text-[#183B56] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer p-0"
          >
            <span>Explore All</span>
            <span className="text-sm font-normal leading-none">→</span>
          </button>

          <div className="flex items-center gap-1.5 pl-2 border-l border-[#183B56]">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll right"
              className="w-7 h-7 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors active:scale-95"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Continuous Side-Scroll Track with Drag support */}
      <div
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="flex overflow-x-auto scroll-smooth scrollbar-none divide-x divide-[#183B56] snap-x snap-mandatory cursor-grab active:cursor-grabbing select-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {products.map((product, idx) => {
          const pid = product.id || product.productId || `dept-${idx}`;
          const pName = product.name || product.title || "Essential Piece";
          const rawImg = product.imageUrl || product.image || product.images?.[0];
          const pImg = rawImg ? ensureHttps(rawImg) : NEUTRAL_FALLBACK_IMAGE;
          const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
          const saved = isSaved?.(pid);
          const isAdded = !!addedProductIds[pid];

          return (
            <div
              key={pid}
              onClick={() => product.id && router.push(`/product/${product.id}`)}
              className="w-[220px] sm:w-[250px] md:w-[270px] shrink-0 snap-start group cursor-pointer flex flex-col justify-between hover:bg-[#183B56]/[0.02] transition-colors"
            >
              {/* Product Image Box */}
              <div className="relative aspect-[3/3.7] bg-[#DFE7ED] border-b border-[#183B56] overflow-hidden flex items-center justify-center p-4 sm:p-5">
                <img
                  src={pImg}
                  alt={pName}
                  loading="lazy"
                  draggable={false}
                  className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                />

                {/* Rank Tag */}
                <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs border border-[#183B56] px-2 py-0.5 rounded-xs text-[10px] font-bold text-[#183B56]">
                  #{idx + 1}
                </div>

                {/* Wardrobe Bookmark Icon on Hover */}
                <button
                  onClick={(e) => onToggleLike(e, product)}
                  className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center p-0 cursor-pointer transition-all ${
                    saved
                      ? "bg-white shadow-xs scale-105 border border-[#183B56]"
                      : "bg-white/80 backdrop-blur-xs text-[#183B56] opacity-0 group-hover:opacity-100 hover:bg-white hover:scale-105 border border-[#183B56]/30"
                  }`}
                  title={saved ? "Remove from Wardrobe" : "Save to Wardrobe"}
                >
                  <Bookmark
                    size={12}
                    className={saved ? "fill-[#183B56] text-[#183B56]" : "text-[#5A7184]"}
                  />
                </button>

                {/* Quick Add To Bag Slide-up Bar */}
                <div className="absolute bottom-0 left-0 right-0 bg-[#183B56] translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-20">
                  <button
                    onClick={(e) => onAddToCart(e, product)}
                    className={`w-full py-2 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all border-none cursor-pointer ${
                      isAdded ? "bg-[#2E7D32] text-white" : "bg-[#183B56] text-white hover:bg-[#102A43]"
                    }`}
                  >
                    <ShoppingBag size={11} />
                    <span>{isAdded ? "Added ✓" : "Add to Bag"}</span>
                  </button>
                </div>
              </div>

              {/* Bottom Rate & Title Box (Clean 2-Line Wrapping, No Text Cutoff) */}
              <div className="py-3 px-3 text-center flex flex-col items-center justify-between min-h-[92px] bg-[#F5EFEB] space-y-1">
                <div className="flex items-center justify-between w-full text-[10px] font-bold text-[#5A7184] uppercase tracking-wider px-1">
                  <span className="truncate max-w-[110px]">{product.brand || "WEAVLY"}</span>
                  <span>{product.gender || product.department || "UNISEX"}</span>
                </div>
                <div
                  className="text-xs sm:text-[13px] font-bold text-[#183B56] group-hover:underline line-clamp-2 leading-snug w-full text-center px-1"
                  title={pName}
                >
                  {pName}
                </div>
                <div className="text-sm sm:text-base font-bold text-[#183B56] tracking-tight">
                  ₹{Math.round(pPrice).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function FamilyStudioHome({ onShopNow, onOpenAuth }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toggleWardrobe, isSaved } = useWardrobe();
  const { addToCart } = useCart();

  const [addedProductIds, setAddedProductIds] = useState({});
  const [trendingProducts, setTrendingProducts] = useState([]);
  const [menProducts, setMenProducts] = useState([]);
  const [menFormalProducts, setMenFormalProducts] = useState([]);
  const [menCasualProducts, setMenCasualProducts] = useState([]);
  const [menFootwear, setMenFootwear] = useState([]);

  const [womenProducts, setWomenProducts] = useState([]);
  const [womenDresses, setWomenDresses] = useState([]);
  const [womenTops, setWomenTops] = useState([]);
  const [womenSkirts, setWomenSkirts] = useState([]);
  const [womenFootwear, setWomenFootwear] = useState([]);

  const [footwearProducts, setFootwearProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Determine user gender intent
  const userGenderNorm = (user?.gender || user?.fitData?.gender || "").toLowerCase().trim();
  const isMaleUser = userGenderNorm.startsWith("men") || userGenderNorm.startsWith("male") || userGenderNorm.startsWith("man");
  const isFemaleUser = userGenderNorm.startsWith("wom") || userGenderNorm.startsWith("female") || userGenderNorm.startsWith("ladies");

  const heroCategories = isMaleUser
    ? MEN_HERO_CATEGORIES
    : isFemaleUser
    ? WOMEN_HERO_CATEGORIES
    : HERO_CATEGORIES;

  // Active Category Selection
  const [selectedCategory, setSelectedCategory] = useState(heroCategories[0]);
  const [isFitModalOpen, setIsFitModalOpen] = useState(false);
  const firstShelfRef = useRef(null);

  useEffect(() => {
    if (isMaleUser) {
      setSelectedCategory(MEN_HERO_CATEGORIES[0]);
    } else if (isFemaleUser) {
      setSelectedCategory(WOMEN_HERO_CATEGORIES[0]);
    } else {
      setSelectedCategory(HERO_CATEGORIES[0]);
    }
  }, [isMaleUser, isFemaleUser]);

  // Initial products fetch across multiple departments with strict filtering
  useEffect(() => {
    let isMounted = true;
    setLoadingProducts(true);

    Promise.allSettled([
      getProducts({ limit: 50 }),
      getProducts({ gender: "Men", limit: 50 }),
      getProducts({ gender: "Women", limit: 50 }),
      getProducts({ category: "shoes", limit: 50 }),
      getProducts({ gender: "Men", category: "shoes", limit: 40 }),
      getProducts({ gender: "Women", category: "shoes", limit: 40 }),
      getProducts({ gender: "Women", category: "dress", limit: 40 }),
      getProducts({ gender: "Men", category: "jacket", limit: 40 }),
      getProducts({ gender: "Men", category: "shirt", limit: 40 }),
      getProducts({ gender: "Men", category: "tshirt", limit: 40 }),
      getProducts({ gender: "Women", category: "top", limit: 40 }),
      getProducts({ gender: "Women", category: "skirt", limit: 40 }),
      getProducts({ gender: "Women", category: "trousers", limit: 40 }),
      getProducts({ gender: "Women", category: "bag", limit: 40 }),
    ]).then(([
      trendingRes,
      menRes,
      womenRes,
      footwearRes,
      menShoesRes,
      womenShoesRes,
      dressesRes,
      menJacketsRes,
      menShirtsRes,
      menTshirtsRes,
      womenTopsRes,
      womenSkirtsRes,
      womenTrousersRes,
      womenBagsRes,
    ]) => {
      if (isMounted) {
        const rawTrending = trendingRes.status === "fulfilled" && Array.isArray(trendingRes.value) ? trendingRes.value : [];
        const rawMen = menRes.status === "fulfilled" && Array.isArray(menRes.value) ? menRes.value : [];
        const rawWomen = womenRes.status === "fulfilled" && Array.isArray(womenRes.value) ? womenRes.value : [];
        const rawFootwear = footwearRes.status === "fulfilled" && Array.isArray(footwearRes.value) ? footwearRes.value : [];
        const rawMenShoes = menShoesRes.status === "fulfilled" && Array.isArray(menShoesRes.value) ? menShoesRes.value : [];
        const rawWomenShoes = womenShoesRes.status === "fulfilled" && Array.isArray(womenShoesRes.value) ? womenShoesRes.value : [];
        const rawDresses = dressesRes.status === "fulfilled" && Array.isArray(dressesRes.value) ? dressesRes.value : [];
        const rawMenJackets = menJacketsRes.status === "fulfilled" && Array.isArray(menJacketsRes.value) ? menJacketsRes.value : [];
        const rawMenShirts = menShirtsRes.status === "fulfilled" && Array.isArray(menShirtsRes.value) ? menShirtsRes.value : [];
        const rawMenTshirts = menTshirtsRes.status === "fulfilled" && Array.isArray(menTshirtsRes.value) ? menTshirtsRes.value : [];
        const rawWomenTops = womenTopsRes.status === "fulfilled" && Array.isArray(womenTopsRes.value) ? womenTopsRes.value : [];
        const rawWomenSkirts = womenSkirtsRes.status === "fulfilled" && Array.isArray(womenSkirtsRes.value) ? womenSkirtsRes.value : [];
        const rawWomenTrousers = womenTrousersRes.status === "fulfilled" && Array.isArray(womenTrousersRes.value) ? womenTrousersRes.value : [];
        const rawWomenBags = womenBagsRes.status === "fulfilled" && Array.isArray(womenBagsRes.value) ? womenBagsRes.value : [];

        // Apply strict defensive filtering (0% cross contamination)
        const strictlyMen = rawMen.filter(isStrictlyMenProduct);
        const strictlyWomen = rawWomen.filter(isStrictlyWomenProduct);
        const strictlyDresses = rawDresses.filter(isStrictlyWomenProduct);
        const strictlyMenJackets = rawMenJackets.filter(isStrictlyMenProduct);
        const strictlyMenShirts = rawMenShirts.filter(isStrictlyMenProduct);
        const strictlyMenTshirts = rawMenTshirts.filter(isStrictlyMenProduct);
        const strictlyWomenTops = rawWomenTops.filter(isStrictlyWomenProduct);
        const strictlyWomenSkirts = rawWomenSkirts.concat(rawWomenTrousers).filter(isStrictlyWomenProduct);
        const strictlyWomenBags = rawWomenBags.filter(isStrictlyWomenProduct);

        // Footwear: MUST be strictly footwear AND strictly match gender
        const strictlyMenShoes = rawMenShoes.filter((p) => isStrictlyFootwearProduct(p) && isStrictlyMenProduct(p));
        const strictlyWomenShoes = rawWomenShoes.filter((p) => isStrictlyFootwearProduct(p) && isStrictlyWomenProduct(p));
        const strictlyGeneralFootwear = rawFootwear.filter(isStrictlyFootwearProduct);

        setTrendingProducts(rawTrending);
        setMenProducts(strictlyMen);
        setMenFormalProducts(strictlyMenJackets.length > 0 ? strictlyMenJackets : strictlyMenShirts);
        setMenCasualProducts(strictlyMenTshirts.length > 0 ? strictlyMenTshirts : strictlyMen.slice(10));
        setMenFootwear(strictlyMenShoes);

        setWomenProducts(strictlyWomen);
        setWomenDresses(strictlyDresses.length > 0 ? strictlyDresses : strictlyWomen.slice(0, 20));
        setWomenTops(strictlyWomenTops.length > 0 ? strictlyWomenTops : strictlyWomen.slice(10));
        setWomenSkirts(strictlyWomenSkirts.length > 0 ? strictlyWomenSkirts : strictlyWomen.slice(20));
        setWomenFootwear(strictlyWomenShoes.concat(strictlyWomenBags));

        setFootwearProducts(
          strictlyGeneralFootwear.length > 0
            ? strictlyGeneralFootwear
            : strictlyMenShoes.concat(strictlyWomenShoes)
        );
        setLoadingProducts(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleScrollToShelf = () => {
    if (firstShelfRef.current) {
      firstShelfRef.current.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push(`/market?q=${encodeURIComponent(selectedCategory.query)}`);
    }
  };

  const handleAddToCart = (e, product) => {
    e.stopPropagation();
    const pid = product.id || product.productId;
    const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
    addToCart({
      id: pid,
      name: product.name || product.title,
      price: pPrice,
      image: product.imageUrl || product.image || product.images?.[0] || NEUTRAL_FALLBACK_IMAGE,
      color: product.color || "Default",
      size: "M",
      qty: 1,
    });
    setAddedProductIds((prev) => ({ ...prev, [pid]: true }));
    setTimeout(() => {
      setAddedProductIds((prev) => ({ ...prev, [pid]: false }));
    }, 1500);
  };

  const handleToggleLike = (e, product) => {
    e.stopPropagation();
    const pid = product.id || product.productId;
    const pPrice = typeof product.price === "number" ? product.price : Number(product.price) || 1999;
    toggleWardrobe({
      id: pid,
      name: product.name || product.title,
      price: pPrice,
      image: product.imageUrl || product.image || product.images?.[0] || NEUTRAL_FALLBACK_IMAGE,
      brand: product.brand,
      category: product.category,
    });
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-20">

      {/* MASTER CONTAINER WITH GENEROUS EDGE MARGINS */}
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-12 sm:space-y-16 lg:space-y-20">

        {/* ════════════════════════════════════════════════════════════
            1. ULTRA-CLEAN 3-COLUMN HERO
        ════════════════════════════════════════════════════════════ */}
        <section className="border border-[#183B56] bg-[#F5EFEB] shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
            
            {/* LEFT: 1-Tap Category Selector (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-center space-y-3">
              <div className="text-[11px] uppercase tracking-[0.2em] font-bold text-[#5A7184] mb-1">
                Select Category
              </div>
              
              <div className="space-y-2">
                {heroCategories.map((cat) => {
                  const active = selectedCategory.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`w-full text-left py-3 px-4 border transition-all cursor-pointer flex items-center justify-between font-bold text-xs sm:text-sm ${
                        active
                          ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                          : "bg-transparent text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className="text-base font-normal leading-none">→</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CENTER: Big Clean Garment Visual (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col items-center justify-center bg-[#F5EFEB]">
              <div className="w-full aspect-[3/3.6] bg-[#DFE7ED] border border-[#183B56] relative overflow-hidden flex items-center justify-center shadow-xs">
                <img
                  src={selectedCategory.image}
                  alt={selectedCategory.label}
                  className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NEUTRAL_FALLBACK_IMAGE;
                  }}
                />

                <div className="absolute bottom-3 left-3 bg-white/95 border border-[#183B56] px-2.5 py-1 text-[10px] font-bold text-[#183B56] shadow-xs">
                  From {selectedCategory.startPrice}
                </div>
              </div>
            </div>

            {/* RIGHT: Big Bold Headline & Bespoke Fit AI Action (lg:col-span-4) */}
            <div className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#183B56] leading-[1.08]">
                  Wear What <br />
                  Truly Suits You.
                </h1>
                <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed pt-1 font-normal">
                  Upload your photo or set your proportions. Zyra analyzes your silhouette, skin undertones, and drape to curate clothes tailored specifically to flatter you.
                </p>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => setIsFitModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.18em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Camera size={14} />
                  <span>Personalize Fit & Photo</span>
                  <ArrowRight size={13} />
                </button>

                <button
                  onClick={handleScrollToShelf}
                  className="w-full py-2.5 px-4 bg-transparent hover:bg-[#183B56]/5 text-[#183B56] text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Explore Atelier Catalog</span>
                  <ArrowDown size={13} />
                </button>
                
                <div className="text-center text-[10px] font-bold text-[#5A7184] pt-1">
                  ✓ Silhouette Proportions • ✓ Undertone Harmony • ✓ Zero Sizing Regrets
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════
            DYNAMIC HOMEPAGE SHELVES ADAPTED TO USER PREFERENCE
        ════════════════════════════════════════════════════════════ */}

        {isMaleUser ? (
          /* ── MALE USER TAILORED HOMEPAGE SHELVES ── */
          <>
            <div ref={firstShelfRef}>
              <DepartmentCarousel
                title="Trending Men's Essentials"
                subtitle="Most desired seasonal pieces for men"
                deptQuery="Men"
                products={menProducts}
                loading={loadingProducts}
                onAddToCart={handleAddToCart}
                onToggleLike={handleToggleLike}
                isSaved={isSaved}
                addedProductIds={addedProductIds}
              />
            </div>

            <DepartmentCarousel
              title="Men's Sartorial & Tailored Wear"
              subtitle="Tailored blazers, Oxford shirts & formal trousers"
              deptQuery="Men"
              products={menFormalProducts}
              loading={loadingProducts}
              onAddToCart={handleAddToCart}
              onToggleLike={handleToggleLike}
              isSaved={isSaved}
              addedProductIds={addedProductIds}
            />

            <DepartmentCarousel
              title="Men's Casual, Denim & Polos"
              subtitle="Everyday streetwear, knit polos & slim-fit denim"
              deptQuery="Men"
              products={menCasualProducts}
              loading={loadingProducts}
              onAddToCart={handleAddToCart}
              onToggleLike={handleToggleLike}
              isSaved={isSaved}
              addedProductIds={addedProductIds}
            />

            {menFootwear.length > 0 && (
              <DepartmentCarousel
                title="Men's Footwear & Leather Accents"
                subtitle="Handcrafted leather derbys, loafers, sneakers & sandals (Men Only)"
                deptQuery="Men"
                products={menFootwear}
                loading={loadingProducts}
                onAddToCart={handleAddToCart}
                onToggleLike={handleToggleLike}
                isSaved={isSaved}
                addedProductIds={addedProductIds}
              />
            )}
          </>
        ) : isFemaleUser ? (
          /* ── FEMALE USER TAILORED HOMEPAGE SHELVES ── */
          <>
            <div ref={firstShelfRef}>
              <DepartmentCarousel
                title="Trending Women's Collection"
                subtitle="Most desired contemporary pieces for women"
                deptQuery="Women"
                products={womenProducts}
                loading={loadingProducts}
                onAddToCart={handleAddToCart}
                onToggleLike={handleToggleLike}
                isSaved={isSaved}
                addedProductIds={addedProductIds}
              />
            </div>

            <DepartmentCarousel
              title="Dresses, Gowns & Occasionwear"
              subtitle="Fit & flare silhouettes, midi dresses & eveningwear"
              deptQuery="Women"
              products={womenDresses}
              loading={loadingProducts}
              onAddToCart={handleAddToCart}
              onToggleLike={handleToggleLike}
              isSaved={isSaved}
              addedProductIds={addedProductIds}
            />

            <DepartmentCarousel
              title="Tops, Silk Blouses & Linen Knitwear"
              subtitle="Linen tops, silk blouses & lightweight knits"
              deptQuery="Women"
              products={womenTops}
              loading={loadingProducts}
              onAddToCart={handleAddToCart}
              onToggleLike={handleToggleLike}
              isSaved={isSaved}
              addedProductIds={addedProductIds}
            />

            <DepartmentCarousel
              title="Skirts, Tailored Pants & Denim"
              subtitle="Pleated skirts, tailored trousers & straight-leg denim"
              deptQuery="Women"
              products={womenSkirts}
              loading={loadingProducts}
              onAddToCart={handleAddToCart}
              onToggleLike={handleToggleLike}
              isSaved={isSaved}
              addedProductIds={addedProductIds}
            />

            {womenFootwear.length > 0 && (
              <DepartmentCarousel
                title="Women's Footwear & Designer Handbags"
                subtitle="Handcrafted heels, flats, loafers & designer tote bags (Women Only)"
                deptQuery="Women"
                products={womenFootwear}
                loading={loadingProducts}
                onAddToCart={handleAddToCart}
                onToggleLike={handleToggleLike}
                isSaved={isSaved}
                addedProductIds={addedProductIds}
              />
            )}
          </>
        ) : (
          /* ── GUEST / GENERAL STOREFRONT (STRICTLY SEGREGATED) ── */
          <>
            <div ref={firstShelfRef}>
              <DepartmentCarousel
                title="Men's Collection"
                subtitle="Tailored blazers, premium shirts & trousers (Strictly Men)"
                deptQuery="Men"
                products={menProducts}
                loading={loadingProducts}
                onAddToCart={handleAddToCart}
                onToggleLike={handleToggleLike}
                isSaved={isSaved}
                addedProductIds={addedProductIds}
              />
            </div>

            <DepartmentCarousel
              title="Women's Collection"
              subtitle="Contemporary silhouettes, dresses & knitwear (Strictly Women)"
              deptQuery="Women"
              products={womenProducts}
              loading={loadingProducts}
              onAddToCart={handleAddToCart}
              onToggleLike={handleToggleLike}
              isSaved={isSaved}
              addedProductIds={addedProductIds}
            />

            <DepartmentCarousel
              title="Footwear & Accents"
              subtitle="Handcrafted leather footwear, shoes & loafers (Footwear Only)"
              deptQuery="Footwear"
              products={footwearProducts}
              loading={loadingProducts}
              onAddToCart={handleAddToCart}
              onToggleLike={handleToggleLike}
              isSaved={isSaved}
              addedProductIds={addedProductIds}
            />
          </>
        )}

        {/* ════════════════════════════════════════════════════════════
            ZYRA PERSONALIZED RECOMMENDATIONS SECTION
        ════════════════════════════════════════════════════════════ */}
        <div className="border border-[#183B56] shadow-xs">
          <ZeraRecommendationsSection
            genderFilter={isMaleUser ? "Men" : isFemaleUser ? "Women" : null}
          />
        </div>

      </main>

      {/* ── BESPOKE FIT & STYLE STUDIO MODAL ── */}
      <BespokeFitModal
        isOpen={isFitModalOpen}
        onClose={() => setIsFitModalOpen(false)}
        onGenerated={() => {
          if (firstShelfRef.current) firstShelfRef.current.scrollIntoView({ behavior: "smooth" });
        }}
      />
    </div>
  );
}
