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

const CARD_NAV_ITEMS = [
  {
    label: "Explore Zyra",
    bgColor: "#183B56",
    textColor: "#FFFFFF",
    links: [
      { label: "What is Zyra", href: "#meet-zera", ariaLabel: "What is Zyra" },
      { label: "Curated Styles", href: "#curated-styles", ariaLabel: "Curated Styles" },
      { label: "Escrow Fit Guarantee", href: "#escrow-protection", ariaLabel: "Escrow Fit Guarantee" }
    ]
  },
  {
    label: "Collections",
    bgColor: "#102A43",
    textColor: "#FFFFFF",
    links: [
      { label: "Zyra Edits", href: "#zera-collections", ariaLabel: "Zyra Edits" },
      { label: "Summer Capsule", href: "#zera-collections", ariaLabel: "Summer Capsule" },
      { label: "Atelier Looks", href: "#zera-collections", ariaLabel: "Atelier Looks" }
    ]
  },
  {
    label: "For Creators",
    bgColor: "#183B56",
    textColor: "#FFFFFF",
    links: [
      { label: "Publish Designs", href: "/how-to-publish", ariaLabel: "Publish Designs" },
      { label: "Become a Creator", href: "/how-to-become-creator", ariaLabel: "Become a Creator" },
      { label: "Creator Guide", href: "/creator-guide", ariaLabel: "Creator Guide" }
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
    <div className="min-h-screen bg-[#F5EFEB] font-sans text-[#183B56] overflow-x-hidden relative selection:bg-[#183B56] selection:text-white">

      {/* 1. Dedicated Onboarding Header */}
      <header className="relative z-50 w-full h-20 flex items-center justify-between px-4 sm:px-8 md:px-16 pt-4 border-b border-[#183B56]/15 bg-white/70 backdrop-blur-xs">
        <WeavlyLogo />

        {/* Center Nav Links — desktop only */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Meet Zyra', target: 'meet-zera' },
            { label: 'Zyra Collections', target: 'zera-collections' },
            { label: 'Atelier Designers', target: 'for-designers' },
          ].map(({ label, target }) => (
            <button
              key={target}
              onClick={() => {
                const el = document.getElementById(target);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-[12px] font-bold uppercase tracking-wider text-[#5A7184] hover:text-[#183B56] transition-colors bg-transparent border-none cursor-pointer"
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
          className="relative z-50 bg-[#183B56] text-white px-5 sm:px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#102A43] active:scale-[0.98] transition-all cursor-pointer shadow-xs border border-[#183B56] touch-manipulation"
        >
          Sign In
        </button>
      </header>

      {/* 2. Hero Section */}
      <section className="px-8 md:px-16 pt-16 pb-16 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#183B56]/20 text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56] mb-4">
          <span>AI Virtual Stylist &amp; Bespoke Atelier</span>
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-[72px] font-bold tracking-tight leading-[1.05] mb-6 max-w-4xl text-[#183B56] uppercase">
          Find Less. Wear Better.
        </h1>
        <p className="text-[#5A7184] text-[15px] max-w-2xl mb-16 leading-relaxed font-medium">
          Weavly curates outfits you'll actually want to wear—bringing together luxury garments, bespoke footwear, and handcrafted designer silhouettes tailored to your exact 3D proportions.
        </p>

        {/* Staggered Images */}
        <div className="flex flex-col md:flex-row items-stretch justify-center gap-5 w-full h-auto md:h-[420px]">
          {/* Left Block */}
          <div className="relative w-full md:w-[320px] h-[340px] md:h-[380px] bg-[#183B56] text-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden self-end shadow-md border border-[#183B56]">
            <div>
              <div className="text-3xl font-bold mb-3 tracking-tight uppercase leading-tight">100+ Designer Drops</div>
              <p className="text-[13px] leading-relaxed text-white/80 max-w-[220px] font-normal">
                Curated marketplace for verified couture ateliers and independent fashion creators.
              </p>
            </div>

            <div className="flex justify-between items-end">
              <span className="text-xs font-bold uppercase tracking-wider text-white cursor-pointer hover:underline flex items-center gap-1.5" onClick={() => triggerAuth("login")}>
                <span>Explore Drops</span>
                <span>→</span>
              </span>
            </div>

            {/* Circular Rosette BEST COLLECTION Badge */}
            <div className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-24 h-24 rounded-full bg-[#102A43] border-2 border-white flex flex-col items-center justify-center text-center p-2 shadow-lg z-10">
              <div className="w-full h-full rounded-full border border-dashed border-white/40 flex flex-col items-center justify-center p-1">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#38BDF8] leading-tight">
                  ATELIER<br />CURATED
                </span>
              </div>
            </div>
          </div>

          {/* Middle Main Image */}
          <div
            className="relative w-full md:w-[480px] h-[360px] md:h-[420px] rounded-3xl overflow-hidden self-start shadow-md group cursor-pointer border border-[#183B56]"
          >
            <img src={HERO_IMG_MID} className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700" alt="Main Hero" />
            <div className="absolute inset-0 bg-[#183B56]/35 flex flex-col items-center justify-center text-white text-center p-6">
              <span className="text-3xl md:text-4xl font-extrabold tracking-tight uppercase">Weavly</span>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#38BDF8] mt-1">From Verified Ateliers</span>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full md:w-[300px] h-[340px] md:h-[380px] rounded-3xl overflow-hidden self-center mt-8 md:mt-0 shadow-md group cursor-pointer border border-[#183B56]">
            <img src={HERO_IMG_RIGHT} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="Right Hero" />
            <div className="absolute inset-0 bg-[#183B56]/35 flex flex-col items-center justify-center text-white text-center p-6">
              <span className="text-2xl md:text-3xl font-extrabold tracking-tight uppercase">Weavly</span>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#38BDF8] mt-1">From Verified Ateliers</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Inline Text Section */}
      <section className="py-20 px-8 md:px-16 text-center bg-[#F5EFEB] w-full overflow-hidden border-y border-[#183B56]/15">
        <div ref={inlineTextRef} className="max-w-5xl mx-auto text-2xl md:text-4xl lg:text-[42px] font-medium leading-[1.6] text-[#183B56] relative">
          <VariableProximity
            label="Discover thoughtfully curated outfits that bring together"
            className="inline"
            fromFontVariationSettings="'wght' 400, 'opsz' 9"
            toFontVariationSettings="'wght' 1000, 'opsz' 40"
            containerRef={inlineTextRef}
            radius={100}
            falloff="linear"
          />
          <span className="inline-block w-[80px] md:w-[100px] h-[40px] md:h-[50px] mx-2 align-middle rounded-full overflow-hidden border border-[#183B56]/30">
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
          <span className="inline-block w-[80px] md:w-[100px] h-[40px] md:h-[50px] mx-2 align-middle rounded-full overflow-hidden border border-[#183B56]/30">
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
          <span className="inline-block w-[80px] md:w-[100px] h-[40px] md:h-[50px] mx-2 align-middle rounded-full overflow-hidden border border-[#183B56]/30">
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
      <section className="bg-white py-20 overflow-hidden border-b border-[#183B56]/15">
        <div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2 relative">
            <div
              className="w-full h-[500px] overflow-hidden relative shadow-md border border-[#183B56]"
              style={{ borderRadius: "200px 200px 24px 24px" }}
            >
              <img src={FEAT_IMG} className="w-full h-full object-cover object-center" alt="Featured Woman" />
              <div className="absolute inset-0 bg-black/10" />
            </div>

            {/* Scalloped Premium Leather Stamp Seal Badge */}
            <div className="absolute top-6 -right-8 md:-right-14 w-36 h-36 md:w-44 md:h-44 -rotate-12 filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)] z-20 pointer-events-none">
              <div className="relative w-full h-full flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full text-[#183B56]">
                  <defs>
                    <radialGradient id="stampGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#183B56" />
                      <stop offset="70%" stopColor="#102A43" />
                      <stop offset="100%" stopColor="#0B1D30" />
                    </radialGradient>
                    <linearGradient id="goldStroke" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38BDF8" />
                      <stop offset="50%" stopColor="#F5EFEB" />
                      <stop offset="100%" stopColor="#38BDF8" />
                    </linearGradient>
                    <filter id="emboss">
                      <feDropShadow dx="0.5" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.4" />
                    </filter>
                  </defs>

                  {/* Scalloped Outer Leather Edges (24 smooth points) */}
                  <path
                    d="M 60,6 C 63,6 66,9 69,9 C 72,9 75,6 78,7 C 81,8 83,11 86,12 C 89,13 92,11 95,13 C 98,15 99,18 101,20 C 103,22 106,24 107,27 C 108,30 107,33 108,36 C 109,39 113,42 113,45 C 113,48 110,51 110,54 C 110,57 113,60 113,63 C 113,66 109,69 108,72 C 107,75 108,78 107,81 C 106,84 103,86 101,88 C 99,90 98,93 95,95 C 92,97 89,95 86,96 C 83,97 81,100 78,101 C 75,102 72,99 69,99 C 66,99 63,102 60,102 C 57,102 54,99 51,99 C 48,99 45,102 42,101 C 39,100 37,97 34,96 C 31,95 28,97 25,95 C 22,93 21,90 19,88 C 17,86 14,84 13,81 C 12,78 13,75 12,72 C 11,69 7,66 7,63 C 7,60 10,57 10,54 C 10,51 7,48 7,45 C 7,42 11,39 12,36 C 13,33 12,30 13,27 C 14,24 17,22 19,20 C 21,18 22,15 25,13 C 28,11 31,13 34,12 C 37,11 39,8 42,7 C 45,6 48,9 51,9 C 54,9 57,6 60,6 Z"
                    fill="url(#stampGradient)"
                    stroke="#183B56"
                    strokeWidth="1.5"
                  />

                  {/* Outer Gold Border */}
                  <circle cx="60" cy="60" r="48" fill="none" stroke="url(#goldStroke)" strokeWidth="1.8" />

                  {/* Dashed Stitched Inner Border */}
                  <circle cx="60" cy="60" r="43" fill="none" stroke="#FFFFFF" strokeWidth="1.2" strokeDasharray="4 2.5" opacity="0.85" />

                  {/* Arc Text: Weavly ATELIER */}
                  <path id="stampTextArcTop" fill="transparent" d="M 22 60 A 38 38 0 1 1 98 60" />
                  <text className="text-[8px] font-bold uppercase tracking-[0.25em]" fill="#38BDF8" filter="url(#emboss)">
                    <textPath href="#stampTextArcTop" startOffset="50%" textAnchor="middle">
                      Weavly ATELIER
                    </textPath>
                  </text>

                  {/* Arc Text: SARTORIAL EDIT */}
                  <path id="stampTextArcBottom" fill="transparent" d="M 98 60 A 38 38 0 0 1 22 60" />
                  <text className="text-[7.5px] font-semibold uppercase tracking-[0.2em]" fill="#38BDF8" opacity="0.9">
                    <textPath href="#stampTextArcBottom" startOffset="50%" textAnchor="middle">
                      SARTORIAL EDIT
                    </textPath>
                  </text>

                  {/* Decorative Stars */}
                  <text x="28" y="62" textAnchor="middle" fill="#38BDF8" fontSize="6">★</text>
                  <text x="92" y="62" textAnchor="middle" fill="#38BDF8" fontSize="6">★</text>
                </svg>

                {/* Inner Core Box with Refined Typography */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 z-10 pointer-events-none">
                  <div className="border-t border-b border-[#38BDF8]/60 py-1 px-2">
                    <span className="text-[12px] md:text-[14px] font-black uppercase tracking-[0.15em] text-white leading-tight block drop-shadow-md font-sans">
                      BEST
                    </span>
                    <span className="text-[9px] md:text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#38BDF8] leading-none block mt-0.5">
                      COLLECTION
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 flex flex-col items-start max-w-md space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#5A7184] bg-[#F5EFEB] border border-[#183B56]/20 px-3 py-1">Limited Edition</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-[#183B56] uppercase">
              Heirloom Craftsmanship
            </h2>
            <p className="text-[14px] text-[#5A7184] font-medium">Bespoke Mulberry Silk &amp; Flannel Wool</p>
            <p className="text-2xl font-bold text-[#183B56]">₹2,289</p>

            <div className="flex gap-4 border-b border-[#183B56]/15 pb-3 w-full">
              <span className="text-[12px] font-bold text-[#183B56] uppercase">Description</span>
              <span className="text-[12px] font-medium text-[#5A7184] cursor-pointer hover:text-[#183B56] uppercase">Details</span>
              <span className="text-[12px] font-medium text-[#5A7184] cursor-pointer hover:text-[#183B56] uppercase">Sizing</span>
              <span className="text-[12px] font-medium text-[#5A7184] cursor-pointer hover:text-[#183B56] uppercase">Shipping</span>
            </div>

            <p className="text-[#5A7184] text-[13px] leading-relaxed font-medium">
              Crafted from the finest blends of natural fibers, this piece offers an unparalleled softness against the skin. Its tailored fit ensures a flattering silhouette while maintaining absolute comfort throughout the day.
            </p>

            <button
              onClick={() => triggerAuth("login")}
              className="w-full py-4 bg-[#183B56] text-white hover:bg-[#102A43] font-bold uppercase tracking-wider text-xs border border-[#183B56] transition-colors cursor-pointer shadow-xs"
            >
              Explore Sartorial Style
            </button>
          </div>
        </div>
      </section>

      {/* ═══ MEET ZERA — Premium Magazine Section ═══ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700;800&display=swap');
        .zera-font { font-family: 'Inter Tight', 'SF Pro Display', Inter, system-ui, sans-serif; }
        .zera-cta-link { position: relative; display: inline-flex; align-items: center; gap: 8px; }
        .zera-cta-link::after { content: ''; position: absolute; bottom: -3px; left: 0; width: 100%; height: 2px; background: #183B56; }
        .zera-cta-link:hover::after { background: #102A43; }
      `}</style>

      <section id="meet-zera" className="zera-font bg-[#F5EFEB] py-[100px] px-[24px] md:px-[100px] relative overflow-hidden" style={{ maxWidth: '100%' }}>
        <AnimatedDottedMeshBackground />
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>

          {/* ── TWO COLUMN: Left 42% · Right 58% ── */}
          <div className="flex flex-col lg:flex-row items-start gap-0 mb-[80px]">

            {/* ─── LEFT 42% ─── */}
            <div className="w-full lg:w-[42%] flex flex-col items-start pt-8">

              {/* Eyebrow */}
              <div className="mb-7">
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  color: '#183B56',
                  display: 'block',
                  marginBottom: 10,
                }}>Meet Zyra AI</span>
                <div style={{ width: 30, height: 2, background: '#183B56', borderRadius: 1 }} />
              </div>

              {/* Main heading */}
              <h2 style={{
                fontSize: 'clamp(44px, 5vw, 64px)',
                fontWeight: 700,
                lineHeight: '1.08',
                letterSpacing: '-0.03em',
                color: '#183B56',
                maxWidth: 520,
                marginBottom: 24,
                textTransform: 'uppercase'
              }}>
                Meet Zyra.<br />
                Your Virtual<br />
                Stylist Companion.
              </h2>

              {/* Paragraph */}
              <p style={{
                fontSize: 16,
                fontWeight: 500,
                lineHeight: '28px',
                color: '#5A7184',
                maxWidth: 460,
                marginBottom: 36,
              }}>
                Zyra understands your precise 3D measurements, explores verified couture ateliers, and curates complete outfits—not disconnected products.
              </p>

              {/* Inline CTA */}
              <button
                onClick={() => triggerAuth("login")}
                className="zera-cta-link cursor-pointer bg-transparent border-0 p-0 font-bold uppercase text-sm tracking-wider text-[#183B56]"
              >
                Explore With Zyra →
              </button>
            </div>

            {/* ─── RIGHT 58% — Zera + floating doodles ─── */}
            <div className="w-full lg:w-[58%] flex items-center justify-center relative" style={{ minHeight: 480 }}>
              <ZeraInteractiveEyesMascot />
            </div>
          </div>

          {/* ── PROCESS FLOW — horizontal 4-step ── */}
          <div id="how-zera-works" className="border-t border-[#183B56]/15 pt-12">
            <div className="flex flex-col md:flex-row items-start gap-6 w-full">
              {[
                {
                  num: '01',
                  title: 'Silhouette Scan',
                  desc: 'Calibrate your exact height, size, and fit tolerances.',
                },
                {
                  num: '02',
                  title: 'Aesthetic Mapping',
                  desc: 'Zyra compiles your preferred color tones and styles.',
                },
                {
                  num: '03',
                  title: 'Curated Outfits',
                  desc: 'Complete looks assembled from independent couturiers.',
                },
                {
                  num: '04',
                  title: '100% Escrow Fit',
                  desc: 'Made-to-measure bespoke guarantee on every garment.',
                },
              ].map((step) => (
                <div key={step.num} className="border border-[#183B56]/20 bg-white p-6 rounded-2xl flex-1 shadow-2xs space-y-2">
                  <span className="text-xs font-mono font-bold text-[#183B56] block">{step.num}</span>
                  <h4 className="text-base font-bold uppercase tracking-tight text-[#183B56]">{step.title}</h4>
                  <p className="text-xs text-[#5A7184] leading-relaxed font-medium">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ═══ SHARED DOTTED BACKGROUND WRAPPER ═══ */}
      <div className="relative bg-[#F5EFEB]">
        <AnimatedDottedMeshBackground />

      {/* ─── Explore With Zyra CTA Banner ─── */}
      <section className="relative py-24 px-6 md:px-16 overflow-hidden flex items-center justify-center text-center w-full">
        <div className="relative z-20 max-w-4xl bg-[#183B56] text-white rounded-3xl p-10 sm:p-16 border border-[#183B56] shadow-md space-y-6">
          <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight leading-tight">
            Finding your next favourite outfit should feel effortless.
          </h2>
          <p className="text-xs sm:text-sm text-white/80 max-w-xl mx-auto font-normal">
            Experience bespoke fashion curation engineered to your body silhouette and style affinity.
          </p>
          <button
            onClick={() => triggerAuth("register")}
            className="bg-white text-[#183B56] hover:bg-[#F5EFEB] px-8 py-3.5 text-xs font-bold uppercase tracking-wider rounded-xs border-none transition-all cursor-pointer shadow-xs inline-flex items-center gap-2"
          >
            <span>Start Free Calibration</span>
            <span>→</span>
          </button>
        </div>
      </section>

      {/* ─── ZYRA COLLECTIONS ─── */}
      <section id="zera-collections" className="relative py-20 px-8 md:px-16">
        <div className="max-w-7xl mx-auto relative z-20">
          <div className="mb-14 text-center space-y-3">
            <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#183B56]">
              Zyra Curated Collections
            </h2>
            <p className="text-[#5A7184] text-xs sm:text-sm max-w-2xl mx-auto font-medium">
              Once you sign in, Zyra crafts personalized outfit combinations tailored to your measurements. Complete curated looks from independent designers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[
              { label: 'Sartorial Summer Edit', desc: '6 looks · Coastal Linen & Tailored Silk' },
              { label: 'Architectural Office Mix', desc: '8 looks · Double-Breasted Flannel' },
              { label: 'Weekend Atelier Capsule', desc: '5 looks · Hand-Draped Raw Cottons' },
            ].map((col, i) => (
              <div
                key={i}
                className="relative bg-white border border-[#183B56] rounded-2xl p-8 shadow-xs flex flex-col justify-between space-y-6"
              >
                <div>
                  <div className="w-8 h-8 rounded-lg bg-[#DFE7ED] text-[#183B56] flex items-center justify-center text-xs font-bold mb-4 border border-[#183B56]/20">
                    🔒
                  </div>
                  <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56] mb-1">{col.label}</h3>
                  <p className="text-xs text-[#5A7184] font-medium">{col.desc}</p>
                </div>
                <div className="pt-4 border-t border-[#183B56]/15 text-[11px] font-bold uppercase tracking-wider text-[#183B56]">
                  Unlocks on sign in →
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => triggerAuth('register')}
              className="bg-[#183B56] text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#102A43] transition-all cursor-pointer border border-[#183B56] rounded-xs shadow-xs"
            >
              Sign up to unlock Collections
            </button>
            <button
              onClick={() => triggerAuth('login')}
              className="bg-white text-[#183B56] px-6 py-3.5 text-xs font-bold uppercase tracking-wider hover:bg-[#F5EFEB] transition-all cursor-pointer border border-[#183B56]/30 rounded-xs"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* ─── FOR DESIGNERS ─── */}
      <section id="for-designers" className="relative py-20 px-8 md:px-16 border-t border-[#183B56]/15">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-20">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56] bg-white border border-[#183B56]/20 px-3 py-1 inline-block">
              For Fashion Creators
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56] leading-tight">
              Publish your lookbooks.<br />
              Receive bespoke commissions.
            </h2>
            <p className="text-xs sm:text-sm text-[#5A7184] leading-relaxed font-medium">
              Weavly connects verified independent designers with discerning patrons worldwide. Upload your collection, configure made-to-measure sizing, and receive automated milestone escrow payouts.
            </p>
            <button
              onClick={() => triggerAuth('register')}
              className="bg-[#183B56] text-white px-7 py-3 text-xs font-bold uppercase tracking-wider hover:bg-[#102A43] transition-all cursor-pointer border border-[#183B56] rounded-xs shadow-xs inline-flex items-center gap-2 mt-2"
            >
              <span>Apply as a Designer</span>
              <ArrowRight size={13} />
            </button>
          </div>

          <div className="bg-white border border-[#183B56] p-8 rounded-2xl shadow-xs space-y-4">
            <h3 className="text-base font-bold uppercase text-[#183B56]">Creator Privileges</h3>
            <ul className="space-y-2.5 text-xs text-[#5A7184] font-medium p-0 m-0 list-none">
              <li className="flex items-center gap-2">✦ 100% Upfront Milestone Escrow on all custom orders</li>
              <li className="flex items-center gap-2">✦ Direct Zyra AI Recommendation Indexing across 100+ countries</li>
              <li className="flex items-center gap-2">✦ Complimentary Weavly Luxury Atelier Packaging Supplies</li>
              <li className="flex items-center gap-2">✦ Zero upfront listing or subscription fees</li>
            </ul>
          </div>
        </div>
      </section>

      </div>{/* end shared dotted background wrapper */}

      {/* Thin divider */}

      {/* ─── BUYER PROTECTION / ESCROW ─── */}
      <section id="escrow-protection" className="relative py-24 px-8 md:px-16 bg-white border-y border-[#183B56]/15">
        <div className="max-w-7xl mx-auto relative z-20">

          <div className="text-center mb-16 space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56] bg-[#F5EFEB] border border-[#183B56]/20 px-3 py-1 inline-block">
              Patron &amp; Creator Security
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold uppercase tracking-tight text-[#183B56]">
              Your Investment Is Protected. Always.
            </h2>
            <p className="text-[#5A7184] text-xs sm:text-sm max-w-lg mx-auto leading-relaxed font-medium">
              Weavly holds every custom milestone payment in smart escrow. Designers receive funds only after you confirm your bespoke fit and satisfaction.
            </p>
          </div>

          {/* 3-Step Escrow Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative max-w-6xl mx-auto">
            {[
              {
                step: '01',
                title: 'Order Commissioned',
                desc: 'Payment is captured and held securely in Weavly Escrow vault. Atelier begins crafting.',
                badgeBg: 'bg-[#183B56]/10 text-[#183B56] border-[#183B56]/20',
                icon: (
                  <div className="w-12 h-12 rounded-xl bg-[#DFE7ED] border border-[#183B56]/30 flex items-center justify-center mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#183B56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                      <path d="M6 15h4" />
                    </svg>
                  </div>
                ),
              },
              {
                step: '02',
                title: 'Atelier Delivery & Inspection',
                desc: 'Garment arrives in certified Weavly luxury casing. You have 72 hours for fitting and audit.',
                badgeBg: 'bg-[#183B56]/10 text-[#183B56] border-[#183B56]/20',
                icon: (
                  <div className="w-12 h-12 rounded-xl bg-[#DFE7ED] border border-[#183B56]/30 flex items-center justify-center mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#183B56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m7.5 4.27 9 5.15" />
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="M12 22V12" />
                    </svg>
                  </div>
                ),
              },
              {
                step: '03',
                title: 'Milestone Settlement',
                desc: 'Upon your confirmation, escrow funds are released seamlessly to the artisan.',
                badgeBg: 'bg-[#183B56]/10 text-[#183B56] border-[#183B56]/20',
                icon: (
                  <div className="w-12 h-12 rounded-xl bg-[#DFE7ED] border border-[#183B56]/30 flex items-center justify-center mb-4">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#183B56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <path d="m9 12 2 2 4-4" strokeWidth="2.2" />
                    </svg>
                  </div>
                ),
              },
            ].map((item, i) => (
              <div 
                key={i} 
                className="relative flex flex-col items-start text-left p-8 rounded-2xl bg-[#F5EFEB] border border-[#183B56] shadow-xs"
              >
                <div className="w-full flex items-center justify-between mb-4">
                  {item.icon}
                  <span className={`text-[11px] font-bold font-mono px-3 py-1 rounded-sm border ${item.badgeBg}`}>
                    {item.step}
                  </span>
                </div>
                <h3 className="text-base font-bold uppercase text-[#183B56] mb-2 tracking-tight">{item.title}</h3>
                <p className="text-xs text-[#5A7184] leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2">
            <span className="text-xs text-[#5A7184] font-medium text-center">
              Funds protected under Weavly Escrow Vaults — safeguarding both discerning patrons and independent couture ateliers.
            </span>
          </div>
        </div>
      </section>

      {/* 6. Made To Raise Your Standards */}
      <section className="py-24 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">Crafted Without Compromise</h2>
          <p className="text-[#5A7184] text-xs sm:text-sm max-w-lg mx-auto font-medium">
            Superior quality in every piece, using high-performance natural fibers woven to perfection for longevity and comfort.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="flex flex-col gap-3">
            <div className="w-full h-[360px] rounded-2xl overflow-hidden bg-white border border-[#183B56]">
              <img src={KNIT_1} className="w-full h-full object-cover" alt="Top Knit Outside" />
            </div>
            <div className="px-2">
              <h3 className="font-bold uppercase text-xs text-[#183B56]">Mulberry Silk Knit</h3>
              <p className="text-[11px] text-[#5A7184] font-medium">Soft Cashmere &amp; Silk Blend</p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className="w-full h-[420px] rounded-2xl overflow-hidden relative shadow-md border border-[#183B56]">
              <img src={KNIT_2} className="w-full h-full object-cover" alt="Middle Knit" />
              <div className="absolute inset-0 bg-[#183B56]/20" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <div className="w-full h-[360px] rounded-2xl overflow-hidden bg-white border border-[#183B56]">
              <img src={KNIT_3} className="w-full h-full object-cover" alt="Top Knit Pants" />
            </div>
            <div className="px-2">
              <h3 className="font-bold uppercase text-xs text-[#183B56]">Bespoke Sartorial Trousers</h3>
              <p className="text-[11px] text-[#5A7184] font-medium">Comfortable Ribbed Flannel</p>
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
