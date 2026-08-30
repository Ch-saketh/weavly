"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ShoppingBag, ArrowRight } from "lucide-react";
import AuthModal from "@/modules/auth/components/AuthModal";
import CircularGallery from "@/shared/components/ui/CircularGallery";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Masonry from "@/shared/components/ui/Masonry";
import ChromaGrid from "@/shared/components/ui/ChromaGrid";
import StaggeredTransitionOverlay from "@/shared/components/ui/StaggeredTransitionOverlay";
import StaggeredMenu from "@/shared/components/ui/StaggeredMenu";
import Footer from "@/shared/components/layout/Footer";
import RotatingText from "@/shared/components/ui/RotatingText";
import VariableProximity from "@/shared/components/ui/VariableProximity";
import CardNav from "@/shared/components/ui/CardNav";
import CardSwap, { Card } from "@/shared/components/ui/CardSwap";
import WeavlyImmersiveHero from "@/shared/components/hero/WeavlyImmersiveHero";

const CARD_NAV_ITEMS = [
  {
    label: "Explore Zyra",
    bgColor: "#1D1D1F",
    textColor: "#FFFFFF",
    links: [
      { label: "What is Zyra", href: "#meet-zera", ariaLabel: "What is Zyra" },
      { label: "Curated Styles", href: "#curated-styles", ariaLabel: "Curated Styles" },
      { label: "Buyer Protection", href: "#escrow-protection", ariaLabel: "Buyer Protection" }
    ]
  },
  {
    label: "Collections",
    bgColor: "#F07020",
    textColor: "#FFFFFF",
    links: [
      { label: "Zyra Edits", href: "#zera-collections", ariaLabel: "Zyra Edits" },
      { label: "Summer Capsule", href: "#zera-collections", ariaLabel: "Summer Capsule" },
      { label: "Atelier Looks", href: "#zera-collections", ariaLabel: "Atelier Looks" }
    ]
  },
  {
    label: "For Creators",
    bgColor: "#C6A15B",
    textColor: "#FFFFFF",
    links: [
      { label: "Publish Designs", href: "#for-designers", ariaLabel: "Publish Designs" },
      { label: "Designer Pass", href: "#for-designers", ariaLabel: "Designer Pass" },
      { label: "Join Network", href: "#for-designers", ariaLabel: "Join Network" }
    ]
  }
];

// Masonry Showcase Items
const MASONRY_ITEMS = [
  {
    id: "m1",
    img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    title: "Elegance Satin Gown",
    category: "Haute Couture",
    price: "₹3,480",
    height: 520,
    url: "/market",
  },
  {
    id: "m2",
    img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80",
    title: "Tailored Linen Blazer",
    category: "Menswear",
    price: "₹2,320",
    height: 380,
    url: "/men",
  },
  {
    id: "m3",
    img: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    title: "Silk Corset Ensemble",
    category: "Womenswear",
    price: "₹1,890",
    height: 580,
    url: "/women",
  },
  {
    id: "m4",
    img: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    title: "Monochrome Trench Coat",
    category: "Outerwear",
    price: "₹3,540",
    height: 420,
    url: "/market",
  },
  {
    id: "m5",
    img: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
    title: "Modern Statement Dress",
    category: "Evening Edition",
    price: "₹2,410",
    height: 540,
    url: "/women",
  },
  {
    id: "m6",
    img: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800&q=80",
    title: "Minimalist Leather Tote",
    category: "Accessories",
    price: "₹1,860",
    height: 360,
    url: "/market",
  },
  {
    id: "m7",
    img: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80",
    title: "Structured Velvet Suit",
    category: "Runway Capsule",
    price: "₹4,690",
    height: 480,
    url: "/market",
  },
  {
    id: "m8",
    img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800&q=80",
    title: "Plissé Pleated Skirt",
    category: "Resort Collection",
    price: "₹2,340",
    height: 440,
    url: "/women",
  },
];

const CHROMA_ITEMS = [
  {
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    title: 'Minimalist Silk Dress',
    subtitle: 'Womenswear · Atelier',
    handle: '₹2,320',
    borderColor: '#F07020',
    gradient: 'linear-gradient(145deg, #FFFFFF, #FAFAF9)',
  },
  {
    image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    title: 'Tailored Italian Suit',
    subtitle: 'Menswear · Sartorial',
    handle: '₹5,850',
    borderColor: '#C6A15B',
    gradient: 'linear-gradient(180deg, #FFFFFF, #FAFAF9)',
  },
  {
    image: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    title: 'Oversized Wool Overcoat',
    subtitle: 'Unisex · Drop #04',
    handle: '₹3,480',
    borderColor: '#3B82F6',
    gradient: 'linear-gradient(165deg, #FFFFFF, #FAFAF9)',
  },
  {
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
    title: 'Monochrome Trench Coat',
    subtitle: 'Womenswear · Capsule',
    handle: '₹2,410',
    borderColor: '#10B981',
    gradient: 'linear-gradient(195deg, #FFFFFF, #FAFAF9)',
  },
  {
    image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=800&q=80',
    title: 'Suede Chelsea Boots',
    subtitle: 'Footwear · Handmade',
    handle: '₹2,290',
    borderColor: '#8B5CF6',
    gradient: 'linear-gradient(225deg, #FFFFFF, #FAFAF9)',
  },
  {
    image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80',
    title: 'Sculptural Leather Bag',
    subtitle: 'Accessories · Studio',
    handle: '₹2,360',
    borderColor: '#EF4444',
    gradient: 'linear-gradient(135deg, #FFFFFF, #FAFAF9)',
  },
];

// Helper Images
const HERO_IMG_LEFT = "https://images.unsplash.com/photo-1618932260643-eee4a2f652a6?w=800&q=80"; // Abstract/texture
const HERO_IMG_MID = "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80"; // Two women/fashion
const HERO_IMG_RIGHT = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"; // Single woman

const PILL_1 = "https://images.unsplash.com/photo-1584916201218-f4242ceb4809?w=400&q=80";
const PILL_2 = "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&q=80";
const PILL_3 = "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&q=80";

const COL_1 = "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80";
const COL_2 = "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80";
const COL_3 = "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=800&q=80";

const FEAT_IMG = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=1000&q=80";

const KNIT_1 = "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80";
const KNIT_2 = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80";
const KNIT_3 = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80";

const GAL_1 = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80";
const GAL_2 = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80";
const GAL_3 = "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80";
const GAL_4 = "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&q=80";
const GAL_5 = "https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600&q=80";
const GAL_6 = "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&q=80";

const FOOTER_BG = "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1600&q=80";



function AnimatedDottedMeshBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = 0;
    let height = 0;
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };
    let isMouseActive = false;
    let isImageHover = false;
    let mouseIdleTimer = null;
    let clickRipples = [];
    let imageRects = [];
    let frameCount = 0;

    const updateImageRects = () => {
      if (!canvas) return;
      const canvasRect = canvas.getBoundingClientRect();
      const elements = document.querySelectorAll(
        "[data-no-dots], .no-dots"
      );
      const rects = [];
      elements.forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.height > 0) {
          rects.push({
            left: r.left - canvasRect.left - 4,
            right: r.right - canvasRect.left + 4,
            top: r.top - canvasRect.top - 4,
            bottom: r.bottom - canvasRect.top + 4,
          });
        }
      });
      imageRects = rects;
    };

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
      updateImageRects();
    };

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      isMouseActive = true;

      const target = e.target;
      const isImg = target.tagName === "IMG" || target.tagName === "BUTTON" || target.closest("img") || target.closest("button") || target.closest(".rounded-3xl") || target.closest(".rounded-2xl");
      isImageHover = Boolean(isImg);

      if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
      mouseIdleTimer = setTimeout(() => {
        isMouseActive = false;
        isImageHover = false;
      }, 700);
    };

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      clickRipples.push({
        x: clickX,
        y: clickY,
        radius: 10,
        maxRadius: 320,
        speed: 9,
        alpha: 1.0,
      });
    };

    handleResize();
    updateImageRects();
    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", updateImageRects, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    const spacing = 28;

    const render = () => {
      frameCount++;
      if (frameCount % 30 === 0) {
        updateImageRects();
      }

      mouse.x += (mouse.targetX - mouse.x) * 0.20;
      mouse.y += (mouse.targetY - mouse.y) * 0.20;

      ctx.clearRect(0, 0, width, height);

      const cols = Math.ceil(width / spacing) + 2;
      const rows = Math.ceil(height / spacing) + 2;

      // Update click shockwave ripples
      for (let i = clickRipples.length - 1; i >= 0; i--) {
        const ripple = clickRipples[i];
        ripple.radius += ripple.speed;
        ripple.alpha *= 0.94;
        if (ripple.radius > ripple.maxRadius || ripple.alpha < 0.02) {
          clickRipples.splice(i, 1);
        }
      }

      const currentRadius = isImageHover ? 70 : 55;
      const currentHighlight = isImageHover ? 45 : 35;

      for (let r = 0; r < rows; r++) {
        const baseY = (r - 0.5) * spacing;

        for (let c = 0; c < cols; c++) {
          const baseX = (c - 0.5) * spacing;

          const dx = baseX - mouse.x;
          const dy = baseY - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          let mouseOffsetX = 0;
          let mouseOffsetY = 0;

          if (isMouseActive && dist < currentRadius) {
            const force = (1 - dist / currentRadius) * (isImageHover ? 8 : 5);
            const angle = Math.atan2(dy, dx);
            mouseOffsetX = Math.cos(angle) * force;
            mouseOffsetY = Math.sin(angle) * force;
          }

          let rippleOpacityBoost = 0;
          let rippleRadiusBoost = 0;
          for (let rip of clickRipples) {
            const ripDx = baseX - rip.x;
            const ripDy = baseY - rip.y;
            const ripDist = Math.sqrt(ripDx * ripDx + ripDy * ripDy);
            const distFromRing = Math.abs(ripDist - rip.radius);
            if (distFromRing < 45) {
              const ringIntensity = (1 - distFromRing / 45) * rip.alpha;
              rippleOpacityBoost = Math.max(rippleOpacityBoost, ringIntensity * 0.75);
              rippleRadiusBoost = Math.max(rippleRadiusBoost, ringIntensity * 1.5);
            }
          }

          const finalX = baseX + mouseOffsetX;
          const finalY = baseY + mouseOffsetY;

          // NEVER draw dots over/inside any images or image components
          let isInsideImage = false;
          for (let i = 0; i < imageRects.length; i++) {
            const rect = imageRects[i];
            if (
              finalX >= rect.left &&
              finalX <= rect.right &&
              finalY >= rect.top &&
              finalY <= rect.bottom
            ) {
              isInsideImage = true;
              break;
            }
          }
          if (isInsideImage) continue;

          const isHighlight = isMouseActive && dist < currentHighlight;
          const radius = (isHighlight ? 2.2 : 1.35) + rippleRadiusBoost;
          const opacity = Math.min(1, (isHighlight ? 0.75 : 0.25) + rippleOpacityBoost);

          ctx.fillStyle = `rgba(37, 99, 235, ${opacity})`;
          ctx.beginPath();
          ctx.arc(finalX, finalY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", updateImageRects);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
      if (mouseIdleTimer) clearTimeout(mouseIdleTimer);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 dotted-mesh-canvas"
      style={{ opacity: 0.95 }}
    />
  );
}

function ZeraInteractiveEyesMascot() {
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const [smoothPos, setSmoothPos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    let idleTimer = null;

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setTargetPos({ x, y });

      setIsMoving(true);
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        setIsMoving(false);
      }, 1000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  // Fast & responsive lerp loop (lerp factor 0.35 for snappy tracking)
  useEffect(() => {
    let animationFrameId;
    let currentX = smoothPos.x;
    let currentY = smoothPos.y;

    const updatePosition = () => {
      currentX += (targetPos.x - currentX) * 0.35;
      currentY += (targetPos.y - currentY) * 0.35;
      setSmoothPos({ x: currentX, y: currentY });
      animationFrameId = requestAnimationFrame(updatePosition);
    };

    animationFrameId = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameId);
  }, [targetPos]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: 460, height: 460 }}>
      {/* Ambient blue glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 480,
          height: 480,
          background: "radial-gradient(ellipse at center, rgba(59,130,246,0.12) 0%, transparent 68%)",
          filter: "blur(32px)",
          pointerEvents: "none",
        }}
      />

      {/* Mascot Base Emblem */}
      <img
        src="/zera_clean.svg?v=2"
        alt="Zyra"
        style={{ width: 460, height: 460, objectFit: "contain", position: "relative", zIndex: 2, userSelect: "none" }}
        draggable={false}
      />

      {/* Fast & Responsive Wide-Awake Face Container — Perfectly Scaled & Centered */}
      <div
        className="absolute z-10 flex flex-col items-center justify-center pointer-events-none transition-transform duration-75 ease-out"
        style={{
          top: "48%",
          left: "52%",
          transform: `translate(calc(-50% + ${smoothPos.x * 24}px), calc(-50% + ${smoothPos.y * 24}px))`,
          willChange: "transform",
        }}
      >
        {/* Raised Happy Eyebrows — Scaled to 28px width */}
        <div className="flex items-center gap-10 mb-2 opacity-90 transition-all duration-200">
          <div
            className="w-[28px] h-[3.5px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${-5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
          <div
            className="w-[28px] h-[3.5px] bg-[#111827] rounded-full transition-transform duration-150"
            style={{ transform: `rotate(${5 + smoothPos.x * 10}deg) translateY(${isMoving ? -2 : 0}px)` }}
          />
        </div>

        {/* Wide Open Shiny Eyes — Scaled to 32px diameter */}
        <div className="relative flex items-center justify-center gap-7">
          {/* Left Eye — Wide, Awake & Glossy */}
          <div className="w-[32px] h-[32px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[12px] h-[12px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[5px] h-[5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>

          {/* Right Eye — Wide, Awake & Glossy */}
          <div className="w-[32px] h-[32px] rounded-full bg-[#111827] relative shadow-md overflow-hidden">
            <div className="w-[12px] h-[12px] rounded-full bg-white absolute top-1 left-1 shadow-sm" />
            <div className="w-[5px] h-[5px] rounded-full bg-white/90 absolute bottom-1 right-1" />
          </div>
        </div>

        {/* Crisp Monochrome Mouth — Scaled to 30x14 */}
        <div className="mt-2.5 opacity-95 transition-all duration-150">
          {isMoving ? (
            <svg width="28" height="14" viewBox="0 0 28 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="7" r="5.5" fill="#111827" />
            </svg>
          ) : (
            <svg width="30" height="14" viewBox="0 0 30 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M 4 2 Q 15 12 26 2" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" fill="none" />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GuestOnboardingPage({ onOpenAuth }) {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authInitialView, setAuthInitialView] = useState("register");
  const inlineTextRef = useRef(null);

  const triggerAuth = (view = "register") => {
    if (onOpenAuth) {
      onOpenAuth(view);
    } else {
      setAuthInitialView(view);
      setAuthModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-[#1A1A1A] overflow-x-hidden relative">

      {/* 1. Dedicated Onboarding Header */}
      <header className="relative z-50 w-full h-20 flex items-center justify-between px-4 sm:px-8 md:px-16 pt-4">
        <WeavlyLogo />

        {/* Center Nav Links — desktop only */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'What is Zera', target: 'meet-zera' },
            { label: 'Collections', target: 'zera-collections' },
            { label: 'Designers', target: 'for-designers' },
          ].map(({ label, target }) => (
            <button
              key={target}
              onClick={() => {
                const el = document.getElementById(target);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-[13px] font-semibold text-[#37352F]/70 hover:text-[#1D1D1F] transition-colors bg-transparent border-none cursor-pointer tracking-wide"
            >
              {label}
            </button>
          ))}
        </nav>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerAuth("login");
          }}
          className="relative z-50 bg-black text-white px-5 sm:px-6 py-2.5 rounded-full text-[13px] font-semibold hover:bg-black/85 active:scale-[0.98] transition-all cursor-pointer shadow-sm touch-manipulation"
        >
          Sign In
        </button>
      </header>

      {/* 2. Discord-Inspired Monochrome Immersive Fashion Hero */}
      <WeavlyImmersiveHero onShopNow={() => triggerAuth("login")} onOpenAuth={(view) => triggerAuth(view)} />

      {/* 3. Inline Text Section */}
      <section className="py-20 px-8 md:px-16 text-center bg-white w-full overflow-hidden">
        <div ref={inlineTextRef} className="max-w-5xl mx-auto text-2xl md:text-4xl lg:text-[42px] font-medium leading-[1.6] text-black relative">
          <VariableProximity
            label="Discover thoughtfully curated outfits that bring together"
            className="inline"
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={inlineTextRef}
            radius={100}
            falloff="linear"
          />
          <span className="inline-block w-[80px] md:w-[100px] h-[40px] md:h-[50px] mx-2 align-middle rounded-full overflow-hidden border border-black/10">
            <img src={PILL_1} className="w-full h-full object-cover" alt="Clothing" />
          </span>
          <VariableProximity
            label="clothing, footwear, and"
            className="inline"
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={inlineTextRef}
            radius={100}
            falloff="linear"
          />
          <span className="inline-block w-[80px] md:w-[100px] h-[40px] md:h-[50px] mx-2 align-middle rounded-full overflow-hidden border border-black/10">
            <img src={PILL_2} className="w-full h-full object-cover" alt="Accessories" />
          </span>
          <VariableProximity
            label="accessories into complete looks tailored to your style—so you spend less time searching and more time dressing with"
            className="inline"
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={inlineTextRef}
            radius={100}
            falloff="linear"
          />
          <span className="inline-block w-[80px] md:w-[100px] h-[40px] md:h-[50px] mx-2 align-middle rounded-full overflow-hidden border border-black/10">
            <img src={PILL_3} className="w-full h-full object-cover" alt="Confidence" />
          </span>
          <VariableProximity
            label="confidence."
            className="inline font-bold"
            fromFontVariationSettings="'wght' 700, 'opsz' 14"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={inlineTextRef}
            radius={100}
            falloff="linear"
          />
        </div>
      </section>



      {/* 5. Feature Banner */}
      <section className="bg-white py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative">
            <div
              className="w-full h-[500px] overflow-hidden relative shadow-md"
              style={{ borderRadius: "200px 200px 24px 24px" }}
            >
              <img src={FEAT_IMG} className="w-full h-full object-cover object-center" alt="Featured Woman" />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Scalloped Premium Leather Stamp Seal Badge */}
            <div className="absolute top-6 -right-8 md:-right-14 w-36 h-36 md:w-44 md:h-44 -rotate-12 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)] z-20 pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full text-[#38231C]">
                  <defs>
                    <radialGradient id="stampGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#4A2E24" />
                      <stop offset="70%" stopColor="#331E17" />
                      <stop offset="100%" stopColor="#24140F" />
                    </radialGradient>
                    <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F5D089" />
                      <stop offset="50%" stopColor="#C6A15B" />
                      <stop offset="100%" stopColor="#E5B969" />
                    </linearGradient>
                    <filter id="emboss">
                      <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Scalloped Outer Leather Edges (24 smooth points) */}
                  <path
                    d="M 60,6 C 63,6 66,9 69,9 C 72,9 75,6 78,7 C 81,8 83,11 86,12 C 89,13 92,11 95,13 C 98,15 99,18 101,20 C 103,22 106,24 107,27 C 108,30 107,33 108,36 C 109,39 113,42 113,45 C 113,48 110,51 110,54 C 110,57 113,60 113,63 C 113,66 109,69 108,72 C 107,75 108,78 107,81 C 106,84 103,86 101,88 C 99,90 98,93 95,95 C 92,97 89,95 86,96 C 83,97 81,100 78,101 C 75,102 72,99 69,99 C 66,99 63,102 60,102 C 57,102 54,99 51,99 C 48,99 45,102 42,101 C 39,100 37,97 34,96 C 31,95 28,97 25,95 C 22,93 21,90 19,88 C 17,86 14,84 13,81 C 12,78 13,75 12,72 C 11,69 7,66 7,63 C 7,60 10,57 10,54 C 10,51 7,48 7,45 C 7,42 11,39 12,36 C 13,33 12,30 13,27 C 14,24 17,22 19,20 C 21,18 22,15 25,13 C 28,11 31,13 34,12 C 37,11 39,8 42,7 C 45,6 48,9 51,9 C 54,9 57,6 60,6 Z"
                    fill="url(#stampGradient)"
                    stroke="#1E100B"
                    strokeWidth="1.5"
                  />

                  {/* Outer Gold Border */}
                  <circle cx="60" cy="60" r="48" fill="none" stroke="url(#goldStroke)" strokeWidth="1.8" />

                  {/* Dashed Stitched Inner Border */}
                  <circle cx="60" cy="60" r="43" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="4 2.5" opacity="0.85" />

                  {/* Arc Text: Weavly ATELIER */}
                  <path id="stampTextArcTop" fill="transparent" d="M 22 60 A 38 38 0 1 1 98 60" />
                  <text className="text-[8px] font-bold uppercase tracking-[0.25em]" fill="#F5D089" filter="url(#emboss)">
                    <textPath href="#stampTextArcTop" startOffset="50%" textAnchor="middle">
                      Weavly ATELIER
                    </textPath>
                  </text>

                  {/* Arc Text: SARTORIAL EDIT */}
                  <path id="stampTextArcBottom" fill="transparent" d="M 98 60 A 38 38 0 0 1 22 60" />
                  <text className="text-[7.5px] font-semibold uppercase tracking-[0.2em]" fill="#F5D089" opacity="0.9">
                    <textPath href="#stampTextArcBottom" startOffset="50%" textAnchor="middle">
                      SARTORIAL EDIT
                    </textPath>
                  </text>

                  {/* Decorative Stars */}
                  <text x="28" y="62" textAnchor="middle" fill="#F5D089" fontSize="6">★</text>
                  <text x="92" y="62" textAnchor="middle" fill="#F5D089" fontSize="6">★</text>
                </svg>

                {/* Inner Core Box with Refined Typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 z-10 pointer-events-none">
                  <div className="border-t border-b border-[#F5D089]/60 py-1 px-2">
                    <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.15em] text-white leading-tight block drop-shadow-md font-sans">
                      BEST
                    </span>
                    <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#F5D089] leading-none block mt-0.5">
                      COLLECTION
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-start max-w-md">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8B8B8B] mb-4">Limited Edition</span>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight mb-4 text-black">
              Everyone deserves
            </h2>
            <p className="text-[14px] text-[#4A4A4A] mb-2 font-medium">Top Quality Materials</p>
            <p className="text-2xl font-bold text-black mb-8">₹2,289</p>

            <div className="flex gap-4 mb-6">
              <span className="text-[12px] font-bold text-black">Description</span>
              <span className="text-[12px] font-medium text-[#8B8B8B] cursor-pointer">Details</span>
              <span className="text-[12px] font-medium text-[#8B8B8B] cursor-pointer">Sizing</span>
              <span className="text-[12px] font-medium text-[#8B8B8B] cursor-pointer">Shipping</span>
            </div>

            <p className="text-[#666666] text-[13px] leading-relaxed mb-8">
              Crafted from the finest blends of natural fibers, this piece offers an unparalleled softness against the skin. Its tailored fit ensures a flattering silhouette while maintaining absolute comfort throughout the day.
            </p>

            <button
              onClick={() => triggerAuth("login")}
              className="w-full py-4 rounded-full border border-black text-black font-bold uppercase tracking-widest text-[12px] hover:bg-black hover:text-white transition-colors cursor-pointer"
            >
              Explore Style
            </button>
          </div>
        </div>
      </section>

      {/* ═══ MEET ZERA — Premium Magazine Section ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap');
        .zera-font { font-family: 'Inter Tight', 'SF Pro Display', Inter, system-ui, sans-serif; }
        .zera-cta-link { position: relative; display: inline-flex; align-items: center; gap: 8px; }
        .zera-cta-link::after { content: ''; position: absolute; bottom: -3px; left: 0; width: 100%; height: 2px; background: #2563EB; }
        .zera-cta-link:hover::after { background: #1D4ED8; }
      `}</style>

      <section id="meet-zera" className="zera-font bg-white py-[120px] px-[24px] md:px-[100px] relative overflow-hidden" style={{ maxWidth: '100%' }}>
        {/* Interactive Dotted Net Background scoped to Meet Zera section */}
        <AnimatedDottedMeshBackground />
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>

          {/* ── TWO COLUMN: Left 42% · Right 58% ── */}
          <div className="flex flex-col lg:flex-row items-start gap-0 mb-[100px]">

            {/* ─── LEFT 42% ─── */}
            <div className="w-full lg:w-[42%] flex flex-col items-start pt-8">

              {/* Eyebrow */}
              <div className="mb-7">
                <span style={{
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: '#3B82F6',
                  display: 'block',
                  marginBottom: 10,
                }}>Meet Zyra</span>
                <div style={{ width: 30, height: 2, background: '#3B82F6', borderRadius: 1 }} />
              </div>

              {/* Main heading */}
              <h2 style={{
                fontSize: 'clamp(52px, 5.5vw, 72px)',
                fontWeight: 700,
                lineHeight: '78px',
                letterSpacing: '-0.045em',
                color: '#111111',
                maxWidth: 520,
                marginBottom: 40,
              }}>
                Meet Zyra.<br />
                Your Personal<br />
                Style Companion.
              </h2>

              {/* Paragraph */}
              <p style={{
                fontSize: 22,
                fontWeight: 400,
                lineHeight: '42px',
                color: '#686868',
                maxWidth: 460,
                marginBottom: 48,
              }}>
                Zyra understands your style, explores thousands of designers, and curates complete outfits—not individual products.
              </p>

              {/* Inline CTA — not a button */}
              <button
                onClick={() => triggerAuth("login")}
                className="zera-cta-link cursor-pointer bg-transparent border-0 p-0"
                style={{
                  fontSize: 22,
                  fontWeight: 600,
                  color: '#2563EB',
                  letterSpacing: '-0.01em',
                }}
              >
                Explore Zyra
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* ─── RIGHT 58% — Zera + floating doodles ─── */}
            <div className="w-full lg:w-[58%] flex items-center justify-center relative" style={{ minHeight: 520 }}>

              {/* Zera Dynamic Interactive Mascot — 404 Inspired Eyes & Expressions */}
              <ZeraInteractiveEyesMascot />

              {/* ── Doodle: Search (top-center-left) ── */}
              <div style={{ position: 'absolute', top: 40, left: '18%', opacity: 0.32, zIndex: 3 }}>
                <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
                  <circle cx="22" cy="22" r="12" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M31 31L42 42" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" />
                  {/* sparkle above */}
                  <path d="M36 8l1 3M36 8l-1 3M36 8l3 1M36 8l-3 1" stroke="#2F6DFF" strokeWidth="1.4" strokeLinecap="round" />
                </svg>
              </div>

              {/* ── Doodle: Shirt/Hanger (top-right) ── */}
              <div style={{ position: 'absolute', top: 32, right: '10%', opacity: 0.30, zIndex: 3 }}>
                <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                  {/* hanger hook */}
                  <path d="M34 10 C34 6 38 6 38 10 C38 14 34 14 34 18" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  {/* hanger bar */}
                  <path d="M10 26 L34 18 L58 26" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" />
                  {/* shirt body */}
                  <path d="M10 26 L14 54 L54 54 L58 26" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* sparkle */}
                  <path d="M56 14l1 2.5M56 14l-1 2.5M56 14l2.5 1M56 14l-2.5 1" stroke="#2F6DFF" strokeWidth="1.4" strokeLinecap="round" />
                  {/* light blue dot accent */}
                  <circle cx="55" cy="18" r="6" fill="#EFF6FF" opacity="0.9" />
                </svg>
              </div>

              {/* ── Doodle: Heart (bottom-left) ── */}
              <div style={{ position: 'absolute', bottom: 64, left: '12%', opacity: 0.30, zIndex: 3 }}>
                <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
                  <path d="M28 44 C28 44 8 32 8 20 C8 14 13 10 18 10 C22 10 25 12 28 16 C31 12 34 10 38 10 C43 10 48 14 48 20 C48 32 28 44 28 44Z" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="46" cy="16" r="5" fill="#EFF6FF" opacity="0.9" />
                  <path d="M44 10l1 2M44 10l-1 2M44 10l2 1M44 10l-2 1" stroke="#2F6DFF" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </div>

              {/* ── Doodle: Sparkle (bottom-right) ── */}
              <div style={{ position: 'absolute', bottom: 72, right: '12%', opacity: 0.28, zIndex: 3 }}>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M24 4 L26 20 L42 24 L26 28 L24 44 L22 28 L6 24 L22 20 Z" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="38" cy="36" r="5" fill="#EFF6FF" opacity="0.9" />
                </svg>
              </div>

              {/* ── Dashed curved path connecting doodles ── */}
              <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 1 }} viewBox="0 0 600 520" fill="none">
                <path
                  d="M 130 80 Q 200 180 300 260 Q 380 320 460 400"
                  stroke="#2F6DFF"
                  strokeWidth="1.5"
                  strokeDasharray="8 8"
                  opacity="0.18"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 460 90 Q 360 180 300 260 Q 200 330 140 400"
                  stroke="#2F6DFF"
                  strokeWidth="1.5"
                  strokeDasharray="8 8"
                  opacity="0.14"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

            </div>
          </div>

          {/* ── PROCESS FLOW — horizontal 4-step with dashed connectors ── */}
          <div id="how-zera-works">


            <div className="flex flex-col md:flex-row items-start gap-0 w-full">
              {[
                {
                  num: '01',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                      <circle cx="12" cy="13" r="3" />
                    </svg>
                  ),
                  title: 'Show Yourself',
                  desc: 'Upload 3 to 4 photos to begin your style journey.',
                },
                {
                  num: '02',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ),
                  title: 'Style, Understood',
                  desc: 'Zyra studies your proportions, colors, and personal aesthetic.',
                },
                {
                  num: '03',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z" />
                    </svg>
                  ),
                  title: 'Curated For You',
                  desc: 'Complete outfits are assembled from designers that match your style—not random recommendations.',
                },
                {
                  num: '04',
                  icon: (
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ),
                  title: 'Wear With Confidence',
                  desc: 'Save, refine, and shop looks designed specifically for you.',
                },
              ].map((step, i) => (
                <div key={step.num} className="flex flex-row md:flex-col items-start md:items-start flex-1">
                  {/* Step column */}
                  <div className="flex flex-col items-start" style={{ minWidth: 220 }}>
                    {/* Number */}
                    <span style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#2563EB',
                      letterSpacing: '0.04em',
                      marginBottom: 16,
                      fontFamily: 'monospace',
                    }}>{step.num}</span>

                    {/* Icon circle + dashed connector row */}
                    <div className="flex flex-row items-center w-full mb-6">
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        background: '#EFECE6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        {step.icon}
                      </div>
                      {/* Dashed connector — only between steps, not after last */}
                      {i < 3 && (
                        <div className="hidden md:flex flex-1 items-center" style={{ marginLeft: 8, marginRight: 8 }}>
                          <svg width="100%" height="16" viewBox="0 0 120 16" fill="none" preserveAspectRatio="none">
                            <line x1="4" y1="8" x2="108" y2="8" stroke="#2F6DFF" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.28" strokeLinecap="round" />
                            {/* Arrow */}
                            <path d="M104 4 L112 8 L104 12" stroke="#2F6DFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Text */}
                    <h4 style={{
                      fontSize: 20,
                      fontWeight: 600,
                      color: '#111111',
                      lineHeight: '28px',
                      marginBottom: 8,
                      maxWidth: 200,
                    }}>{step.title}</h4>
                    <p style={{
                      fontSize: 16,
                      fontWeight: 400,
                      color: '#686868',
                      lineHeight: '28px',
                      maxWidth: 200,
                    }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══ SHARED DOTTED BACKGROUND WRAPPER — spans CTA → Gallery ═══ */}
      <div className="relative bg-white">
        {/* Single canvas behind all sections below */}
        <AnimatedDottedMeshBackground />

      {/* ─── Explore With Zyra CTA Banner ─── */}
      <section className="relative py-36 px-6 md:px-16 overflow-hidden flex items-center justify-center text-center w-full min-h-[460px]">


        <div className="relative z-20 max-w-3xl flex flex-col items-center gap-8 py-6">
          <h2 className="text-[32px] md:text-[52px] font-semibold tracking-tight text-[#1D1D1F] leading-[1.15]">
            Finding your next favourite outfit should feel effortless.
          </h2>
          <button
            onClick={() => triggerAuth("login")}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-9 py-4 rounded-full text-[15px] font-medium flex items-center gap-3 shadow-md hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
          >
            Explore With Zyra <span>→</span>
          </button>
        </div>
      </section>

      {/* ─── ZYRA COLLECTIONS ─── */}

      <section id="zera-collections" className="relative py-24 px-8 md:px-16">

        <div className="max-w-7xl mx-auto relative z-20">

          {/* Header */}
          <div className="mb-16 text-center">
            <h2 className="text-[52px] md:text-[72px] font-bold tracking-tighter text-[#1D1D1F] mb-8 leading-none flex flex-wrap justify-center items-center gap-4">
              Zyra
              <RotatingText
                texts={['Collections', 'Edits', 'Looks', 'Styles']}
                mainClassName="bg-[#1D1D1F] text-white overflow-hidden px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 md:py-2.5 items-center justify-center rounded-2xl inline-flex leading-tight whitespace-nowrap text-3xl sm:text-4xl md:text-5xl"
                staggerFrom={"last"}
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden px-1.5 py-1"
                elementLevelClassName="px-[0.5px]"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={3000}
              />
            </h2>
            <p className="text-[#37352F] text-[22px] md:text-[28px] leading-[1.55] max-w-3xl mx-auto font-normal">
              Once you sign in, Zyra studies your taste and crafts personalised outfit combinations just for you — called <strong className="font-bold">Zyra Collections</strong>. Not products. Complete curated looks.
            </p>
          </div>

          {/* 3 Mock Collection Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
            {[
              {
                label: 'Your Summer Edit',
                desc: '6 looks · Casual & Coastal',
                color: '#F0EDE8',
                accent: '#C6A15B',
                lock: true,
              },
              {
                label: 'Office-Ready Mix',
                desc: '8 looks · Smart-Casual',
                color: '#EAE8F0',
                accent: '#6B5CE7',
                lock: true,
              },
              {
                label: 'Weekend Capsule',
                desc: '5 looks · Relaxed Luxury',
                color: '#E8F0EA',
                accent: '#2D7D46',
                lock: true,
              },
            ].map((col, i) => (
              <div
                key={i}
                className="relative rounded-3xl overflow-hidden"
                style={{ background: col.color, minHeight: 260, padding: '32px 28px' }}
              >
                {/* Zera Z mark */}
                <div className="absolute top-5 right-5 opacity-10">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <text x="4" y="42" fontSize="48" fontWeight="900" fontFamily="system-ui" fill={col.accent}>Z</text>
                  </svg>
                </div>

                {/* Lock icon */}
                <div className="w-10 h-10 rounded-full bg-white/60 flex items-center justify-center mb-5">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={col.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>

                <h3 className="text-[18px] font-bold text-[#1D1D1F] mb-1">{col.label}</h3>
                <p className="text-[13px]" style={{ color: col.accent }}>{col.desc}</p>

                <div className="absolute bottom-5 left-7 right-7">
                  <div className="h-px bg-black/10 mb-4" />
                  <span className="text-[12px] font-semibold text-[#37352F]/50 uppercase tracking-widest">Unlocks on sign in</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => triggerAuth('register')}
              className="bg-black text-white px-8 py-3.5 rounded-full text-[13px] font-semibold hover:bg-black/85 transition-all cursor-pointer"
            >
              Sign up to unlock Collections
            </button>
            <span className="text-[13px] text-[#9B9B9B]">
              Already have an account?{' '}
              <button onClick={() => triggerAuth('login')} className="text-[#F07020] font-semibold bg-transparent border-none cursor-pointer hover:underline">Sign in</button>
            </span>
          </div>
        </div>
      </section>

      {/* Thin divider */}
      <div className="w-full h-px bg-black/5 max-w-7xl mx-auto my-12" />

      {/* ─── CURATED STYLES (MASONRY GALLERY) ─── */}
      <section className="py-24 px-8 md:px-16 max-w-7xl mx-auto zera-font relative z-20">
        <div className="mb-16 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] mb-4">
            Curated Styles
          </h2>
          <p className="text-[#666666] text-[15px] max-w-xl mx-auto">
            A glimpse into the premium pieces waiting for you. 
            Sign up to unlock thousands of items and get personalized outfits created just for you.
          </p>
        </div>
        
        <ChromaGrid 
          items={CHROMA_ITEMS} 
          radius={350}
          onItemClick={() => triggerAuth('register')}
        />
        
        <div className="mt-16 flex justify-center">
          <button
            onClick={() => triggerAuth('register')}
            className="bg-[#1D1D1F] text-white px-10 py-4 rounded-full text-[14px] font-semibold hover:bg-black hover:shadow-lg transition-all cursor-pointer shadow-md flex items-center gap-2"
          >
            Sign up to shop the collection <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ─── FOR DESIGNERS ─── */}
      <section id="for-designers" className="relative py-24 px-8 md:px-16">

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative z-20">

          {/* Left — Copy */}
          <div>
            <p className="text-[20px] font-black uppercase tracking-[0.15em] text-[#F07020] block mb-4">For Creators</p>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] mb-6 leading-tight">
              Publish your designs.
              <br />Set your own price.
            </h2>
            <p className="text-[#666666] text-[15px] leading-relaxed mb-8 max-w-md">
              Weavly is built for independent designers who want to reach a discerning audience without middlemen. Upload your collection, set your pricing, and let Zyra match your work to the customers who'll love it most.
            </p>

            <div className="flex flex-col gap-4 mb-10">
              {[
                { icon: '✦', text: 'Upload your designs — photos, descriptions, sizing' },
                { icon: '✦', text: 'Set your own price for every piece' },
                { icon: '✦', text: 'Zyra surfaces your work to matched customers' },
                { icon: '✦', text: 'Build your brand directly on Weavly' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-[#F07020] text-[12px] mt-1 font-bold">{item.icon}</span>
                  <span className="text-[14px] text-[#37352F] leading-relaxed">{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => triggerAuth('register')}
              className="bg-[#1D1D1F] text-white px-8 py-3.5 rounded-full text-[13px] font-semibold hover:bg-[#1D1D1F]/85 transition-all cursor-pointer"
            >
              Apply as a Designer →
            </button>
          </div>

          {/* Right — Animated CardSwap of independent designer cards */}
          <div className="relative flex items-center justify-center w-full min-h-[420px]">
            <CardSwap
              width={280}
              height={330}
              cardDistance={35}
              verticalDistance={35}
              delay={4500}
              pauseOnHover={true}
            >
              {[
                {
                  designer: 'Aria Chen',
                  brand: '@chen_studio',
                  location: 'Paris, France',
                  img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
                  piece: 'Plissé Atelier Dress',
                },
                {
                  designer: 'Marcus Thorne',
                  brand: '@thorne_sartorial',
                  location: 'London, UK',
                  img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&q=80',
                  piece: 'Sculptural Wool Trench',
                },
                {
                  designer: 'Elena Vance',
                  brand: '@elena_atelier',
                  location: 'Milan, Italy',
                  img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
                  piece: 'Hand-Draped Silk Ensemble',
                },
              ].map((card, i) => (
                <Card key={i} className="cursor-pointer hover:shadow-2xl transition-shadow">
                  <div className="w-full h-44 rounded-2xl overflow-hidden mb-3 relative">
                    <img src={card.img} alt={card.designer} className="w-full h-full object-cover" />
                    <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold text-white uppercase tracking-wider">
                      Verified Creator
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[14px] font-bold text-[#1D1D1F]">{card.designer}</span>
                    <span className="text-[12px] font-semibold text-[#F07020] font-mono">{card.brand}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#9B9B9B] font-medium">
                    <span>{card.piece}</span>
                    <span>{card.location}</span>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>
      </section>

      {/* Thin divider */}

      {/* ─── BUYER PROTECTION / ESCROW ─── */}
      <section className="relative py-24 px-8 md:px-16">
        <div className="max-w-7xl mx-auto relative z-20">

          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#1D1D1F] mb-4">
              Your money is safe. Always.
            </h2>
            <p className="text-[#666666] text-[15px] max-w-lg mx-auto leading-relaxed">
              Weavly holds every payment in secure escrow. Designers only get paid after you receive your order and confirm satisfaction. No exceptions.
            </p>
          </div>

          {/* 3-Step Escrow Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'You Place the Order',
                desc: 'Payment is captured and held securely by Weavly — the designer receives nothing yet.',
                badgeBg: 'bg-[#F07020]/10 text-[#F07020] border-[#F07020]/20',
                icon: (
                  <div className="w-14 h-14 rounded-2xl bg-[#FFF7F2] border border-[#F07020]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#F07020] transition-all duration-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F07020" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors duration-300">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                      <path d="M6 15h4" />
                      <rect x="15" y="13.5" width="5" height="4" rx="1" />
                      <path d="M16.5 13.5v-1a1 1 0 0 1 2 0v1" />
                    </svg>
                  </div>
                ),
              },
              {
                step: '02',
                title: 'Order Delivered',
                desc: 'Your order arrives. You have a window to inspect it and confirm everything is as expected.',
                badgeBg: 'bg-[#C6A15B]/10 text-[#C6A15B] border-[#C6A15B]/20',
                icon: (
                  <div className="w-14 h-14 rounded-2xl bg-[#FFFDF5] border border-[#C6A15B]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#C6A15B] transition-all duration-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C6A15B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors duration-300">
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </div>
                ),
              },
              {
                step: '03',
                title: 'Designer Gets Paid',
                desc: 'Only after your confirmation, funds are released to the designer. Dispute? We step in.',
                badgeBg: 'bg-[#2D7D46]/10 text-[#2D7D46] border-[#2D7D46]/20',
                icon: (
                  <div className="w-14 h-14 rounded-2xl bg-[#F4FAF5] border border-[#2D7D46]/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#2D7D46] transition-all duration-300">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2D7D46" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-white transition-colors duration-300">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" strokeWidth="2.2" />
                    </svg>
                  </div>
                ),
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="group relative flex flex-col items-start text-left p-8 rounded-[28px] bg-white/80 backdrop-blur-md border border-[#EBE8E1] shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-full flex items-center justify-between mb-4">
                  {item.icon}
                  <span className={`text-[12px] font-extrabold font-mono px-3 py-1 rounded-full border ${item.badgeBg}`}>
                    {item.step}
                  </span>
                </div>
                <h3 className="text-[20px] font-bold text-[#1D1D1F] mb-2 tracking-tight">{item.title}</h3>
                <p className="text-[14px] text-[#666666] leading-relaxed font-normal">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Bottom note */}
          <div className="mt-16 flex items-center justify-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9B9B9B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span className="text-[13px] text-[#9B9B9B]">
              Funds held by Weavly until order is confirmed satisfied — protecting both buyers and honest designers.
            </span>
          </div>
        </div>
      </section>

      {/* 6. Made To Raise Your Standards */}
      <section className="py-24 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold mb-4">Made To Raise Your Standards</h2>
          <p className="text-[#666666] text-[14px] max-w-lg mx-auto">
            We strive to provide superior quality in every piece we make, using high-performance yarns woven to perfection for longevity and comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col gap-4">
            <div className="w-full h-[360px] rounded-[32px] overflow-hidden bg-gray-100">
              <img src={KNIT_1} className="w-full h-full object-cover" alt="Top Knit Outside" />
            </div>
            <div className="px-4">
              <h3 className="font-bold text-[16px]">Top Knit Outside</h3>
              <p className="text-[12px] text-[#666666]">Soft Cashmere Blend</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="w-full h-[440px] rounded-[32px] overflow-hidden relative shadow-lg">
              <img src={KNIT_2} className="w-full h-full object-cover" alt="Middle Knit" />
              <div className="absolute inset-0 bg-black/20" />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="w-full h-[360px] rounded-[32px] overflow-hidden bg-gray-100">
              <img src={KNIT_3} className="w-full h-full object-cover" alt="Top Knit Pants" />
            </div>
            <div className="px-4">
              <h3 className="font-bold text-[16px]">Top Knit Pants</h3>
              <p className="text-[12px] text-[#666666]">Comfortable Ribbed Fit</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Styles That Welcome Sunshine's Return (3D Circular Gallery) */}
      <section className="py-20 overflow-hidden relative">
        <div className="text-center mb-10 px-8 relative z-20">
          <h2 className="text-4xl md:text-5xl font-semibold mb-4">Styles That Welcome Sunshine's Return</h2>
          <p className="text-[#666666] text-[14px] max-w-xl mx-auto">
            As the days grow longer and the sun shines brighter, refresh your wardrobe with pieces designed to embrace the warmth and vibrant energy of the season.
          </p>
        </div>

        <div style={{ height: '520px', position: 'relative', width: '100%' }}>
          <CircularGallery
            bend={3}
            textColor="#1D1D1F"
            borderRadius={0.06}
            scrollEase={0.03}
            scrollSpeed={2.5}
            items={[
              { image: GAL_1, text: "Summer Denim" },
              { image: GAL_2, text: "Sheer Evening" },
              { image: GAL_3, text: "Active Movement" },
              { image: GAL_4, text: "Breezy Linen" },
              { image: GAL_5, text: "Sunset Coastal" },
              { image: GAL_6, text: "Athletic Chic" }
            ]}
          />
        </div>
      </section>

      </div>{/* end shared dotted background wrapper */}

      <Footer 
        requireAuth={true}
        onRequireAuth={() => triggerAuth("login")}
        onShopNow={() => triggerAuth("login")}
      />

      {/* Auth Modal (only rendered if not handled by parent AppShell) */}
      {!onOpenAuth && (
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialView={authInitialView}
        />
      )}
    </div>
  );
}
