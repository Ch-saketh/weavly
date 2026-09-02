"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import AuthModal from "@/modules/auth/components/AuthModal";
import CircularGallery from "@/shared/components/ui/CircularGallery";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Footer from "@/shared/components/layout/Footer";

// Helper Images
const HERO_IMG_MID = "https://images.unsplash.com/photo-1550639525-c97d455acf70?w=800&q=80";

const KNIT_1 = "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?w=800&q=80";
const KNIT_2 = "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80";
const KNIT_3 = "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&q=80";

const GAL_1 = "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&q=80";
const GAL_2 = "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&q=80";
const GAL_3 = "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=80";
const GAL_4 = "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?w=600&q=80";
const GAL_5 = "https://images.unsplash.com/photo-1514315384763-ba401779410f?w=600&q=80";
const GAL_6 = "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?w=600&q=80";



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
    <div className="min-h-screen bg-[#F5EFEB] font-sans text-[#183B56] selection:bg-[#183B56] selection:text-white">

      {/* ─── 1. ARCHITECTURAL HEADER ─── */}
      <header className="w-full h-20 flex items-center justify-between px-4 sm:px-8 md:px-12 border-b border-[#183B56] bg-white sticky top-0 z-50">
        <WeavlyLogo />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { label: 'Meet Zyra', target: 'meet-zera' },
            { label: 'Collections', target: 'zera-collections' },
            { label: 'For Creators', target: 'for-designers' },
            { label: 'Escrow Fit', target: 'escrow-protection' },
          ].map(({ label, target }) => (
            <button
              key={target}
              onClick={() => {
                const el = document.getElementById(target);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="text-xs font-bold uppercase tracking-wider text-[#5A7184] hover:text-[#183B56] transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerAuth("login");
            }}
            className="bg-[#F5EFEB] text-[#183B56] px-4 sm:px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-white active:scale-95 transition-all cursor-pointer border border-[#183B56]"
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              triggerAuth("register");
            }}
            className="bg-[#183B56] text-white px-5 sm:px-6 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-[#102A43] active:scale-95 transition-all cursor-pointer border border-[#183B56] shadow-xs"
          >
            Join Atelier
          </button>
        </div>
      </header>

      {/* ─── 2. MAIN HERO SECTION (MODULAR BOX MATRIX) ─── */}
      <section className="border-b border-[#183B56] bg-[#F5EFEB]">
        <div className="max-w-7xl mx-auto border-x border-[#183B56] grid grid-cols-1 lg:grid-cols-12">
          
          {/* Left 7 Columns: Headline, Summary & CTAs */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-[#183B56] bg-white space-y-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 border border-[#183B56] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#183B56] bg-[#F5EFEB]">
                <span className="w-2 h-2 rounded-full bg-[#183B56]" />
                <span>AI Style Engine &amp; Made-to-Measure</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-[68px] font-bold tracking-tight text-[#183B56] leading-[1.05] uppercase">
                Find Less.<br />Wear Better.
              </h1>

              <p className="text-sm sm:text-base text-[#5A7184] leading-relaxed max-w-xl font-medium">
                Weavly curates outfits you will actually wear—bringing together luxury garments, bespoke footwear, and handcrafted silhouettes tailored to your exact 3D proportions.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => triggerAuth("register")}
                  className="bg-[#183B56] text-white hover:bg-[#102A43] px-8 py-4 text-xs font-bold uppercase tracking-wider border border-[#183B56] transition-all cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <span>Start Free Calibration</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={() => triggerAuth("login")}
                  className="bg-[#F5EFEB] text-[#183B56] hover:bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider border border-[#183B56] transition-all cursor-pointer"
                >
                  Explore Drops
                </button>
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-3 border-t border-[#183B56] pt-8 divide-x divide-[#183B56]">
              <div className="pr-4">
                <div className="text-2xl sm:text-3xl font-bold text-[#183B56]">100+</div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5A7184] mt-1">Verified Drops</div>
              </div>
              <div className="px-4">
                <div className="text-2xl sm:text-3xl font-bold text-[#183B56]">3D</div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5A7184] mt-1">Vector Fitting</div>
              </div>
              <div className="pl-4">
                <div className="text-2xl sm:text-3xl font-bold text-[#183B56]">100%</div>
                <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#5A7184] mt-1">Escrow Fit</div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: Featured Atelier Card */}
          <div className="lg:col-span-5 bg-[#DFE7ED] flex flex-col justify-between relative overflow-hidden">
            <div className="relative aspect-[3/4] w-full overflow-hidden">
              <img
                src={HERO_IMG_MID}
                alt="Atelier Showcase"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-white/95 border border-[#183B56] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#183B56]">
                Lookbook Edit #01
              </div>
            </div>
            <div className="p-6 bg-[#F5EFEB] border-t border-[#183B56] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7184] block">Featured Sartorial Ensemble</span>
                <span className="text-sm font-bold uppercase text-[#183B56]">Hand-Draped Silk &amp; Flannel Wool</span>
              </div>
              <button
                onClick={() => triggerAuth("register")}
                className="text-xs font-bold uppercase tracking-wider text-[#183B56] hover:underline flex items-center gap-1 cursor-pointer bg-transparent border-none p-0"
              >
                <span>View</span>
                <span>→</span>
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 3. MEET ZYRA AI INTELLIGENCE (2X2 BOX MATRIX) ─── */}
      <section id="meet-zera" className="border-b border-[#183B56] bg-white">
        <div className="max-w-7xl mx-auto border-x border-[#183B56]">
          
          {/* Header Bar */}
          <div className="p-6 sm:p-8 border-b border-[#183B56] bg-[#F5EFEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184] block mb-1">Zyra Virtual Engine</span>
              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                Personalized Style Intelligence
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 border border-[#183B56] bg-white px-3.5 py-1.5 text-xs font-bold text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56] animate-pulse" />
              <span>Vector AI Calibration</span>
            </div>
          </div>

          {/* 2-Column Split: Mascot Panel & Step Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
            
            {/* Left 5 Cols: Mascot & Explainer */}
            <div className="lg:col-span-5 p-8 sm:p-12 flex flex-col justify-between bg-[#F5EFEB] space-y-8">
              <div>
                <h3 className="text-3xl sm:text-4xl font-bold uppercase text-[#183B56] leading-tight mb-4">
                  Curates Outfits.<br />Not Disconnected Items.
                </h3>
                <p className="text-sm text-[#5A7184] leading-relaxed font-medium">
                  Zyra analyzes your exact proportions, color palette, and lifestyle priorities to construct harmonious wardrobe collections from verified couturiers.
                </p>
              </div>

              <div className="bg-white border border-[#183B56] p-6 rounded-xs flex items-center justify-center min-h-[260px] relative shadow-xs">
                <ZeraInteractiveEyesMascot />
              </div>
            </div>

            {/* Right 7 Cols: 4-Step Connected Box Matrix */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x sm:divide-y divide-[#183B56] bg-white">
              {[
                { num: '01', title: 'Silhouette Scan', desc: 'Calibrate your exact height, size, and fit tolerances in under 2 minutes.' },
                { num: '02', title: 'Aesthetic Vectoring', desc: 'Zyra maps your favorite color tones, fabrics, and wardrobe priorities.' },
                { num: '03', title: 'Look Synthesis', desc: 'Complete bespoke outfits assembled from independent couture ateliers.' },
                { num: '04', title: '100% Escrow Guarantee', desc: 'Made-to-measure orders held in escrow until you confirm satisfaction.' },
              ].map((step, idx) => (
                <div
                  key={step.num}
                  className={`p-8 flex flex-col justify-between min-h-[220px] bg-white hover:bg-[#F5EFEB]/50 transition-colors ${
                    idx >= 2 ? 'border-t border-[#183B56]' : ''
                  }`}
                >
                  <span className="text-xs font-mono font-bold text-[#183B56] bg-[#DFE7ED] border border-[#183B56] px-2.5 py-0.5 self-start">
                    STEP {step.num}
                  </span>
                  <div className="mt-6 space-y-2">
                    <h4 className="text-base font-bold uppercase tracking-tight text-[#183B56]">{step.title}</h4>
                    <p className="text-xs text-[#5A7184] leading-relaxed font-medium">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ─── 4. ZYRA CURATED COLLECTIONS (3-COLUMN BOX MATRIX) ─── */}
      <section id="zera-collections" className="border-b border-[#183B56] bg-[#F5EFEB]">
        <div className="max-w-7xl mx-auto border-x border-[#183B56]">
          
          <div className="p-6 sm:p-8 border-b border-[#183B56] bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184] block mb-1">Locked Patron Capsules</span>
              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                Curated Zyra Collections
              </h2>
            </div>
            <button
              onClick={() => triggerAuth("register")}
              className="bg-[#183B56] text-white hover:bg-[#102A43] px-6 py-2.5 text-xs font-bold uppercase tracking-wider border border-[#183B56] transition-all cursor-pointer self-start sm:self-auto"
            >
              Sign Up To Unlock All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#183B56] bg-white">
            {[
              { label: 'Sartorial Summer Edit', desc: '6 complete looks · Coastal Linen & Tailored Silk', pieces: '6 Items' },
              { label: 'Architectural Office Mix', desc: '8 complete looks · Double-Breasted Flannel', pieces: '8 Items' },
              { label: 'Weekend Atelier Capsule', desc: '5 complete looks · Hand-Draped Raw Cottons', pieces: '5 Items' },
            ].map((col, i) => (
              <div key={i} className="p-8 flex flex-col justify-between min-h-[300px] bg-[#F5EFEB] hover:bg-white transition-colors space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A7184] bg-white border border-[#183B56] px-2 py-0.5">
                      {col.pieces}
                    </span>
                    <span className="text-xs font-bold text-[#183B56]">🔒 LOCKED</span>
                  </div>
                  <h3 className="text-xl font-bold uppercase text-[#183B56]">{col.label}</h3>
                  <p className="text-xs text-[#5A7184] font-medium leading-relaxed">{col.desc}</p>
                </div>
                <button
                  onClick={() => triggerAuth("login")}
                  className="w-full py-3 bg-white hover:bg-[#183B56] text-[#183B56] hover:text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer text-center"
                >
                  Sign In to Unlock →
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 5. FOR CREATORS & ATELIERS (12-COL BOX MATRIX) ─── */}
      <section id="for-designers" className="border-b border-[#183B56] bg-white">
        <div className="max-w-7xl mx-auto border-x border-[#183B56] grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#183B56]">
          
          <div className="lg:col-span-6 p-8 sm:p-14 bg-white flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184] bg-[#F5EFEB] border border-[#183B56] px-3 py-1 inline-block">
                For Fashion Creators &amp; Ateliers
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56] leading-tight">
                Publish Your Lookbooks.<br />
                Receive Bespoke Commissions.
              </h2>
              <p className="text-sm text-[#5A7184] font-medium leading-relaxed">
                Weavly connects independent designers directly with patrons worldwide. Set your pricing, configure custom made-to-measure options, and receive guaranteed milestone escrow payouts.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => triggerAuth("register")}
                className="bg-[#183B56] text-white hover:bg-[#102A43] px-7 py-3.5 text-xs font-bold uppercase tracking-wider border border-[#183B56] transition-all cursor-pointer flex items-center gap-2"
              >
                <span>Apply as a Creator</span>
                <ArrowRight size={14} />
              </button>
              <a
                href="/creator-guide"
                className="bg-[#F5EFEB] text-[#183B56] hover:bg-white px-7 py-3.5 text-xs font-bold uppercase tracking-wider border border-[#183B56] transition-all flex items-center gap-2 no-underline"
              >
                <span>Creator Handbook</span>
                <span>→</span>
              </a>
            </div>
          </div>

          <div className="lg:col-span-6 p-8 sm:p-14 bg-[#F5EFEB] flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <h3 className="text-base font-bold uppercase text-[#183B56] border-b border-[#183B56] pb-3">
                Creator Program Privileges
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: '100% Milestone Escrow', desc: 'Funds secured upfront before custom tailoring begins.' },
                  { title: 'Zero Listing Fees', desc: 'No upfront subscriptions or listing charges.' },
                  { title: 'Zyra AI Indexing', desc: 'Direct matching with patrons actively searching your aesthetic.' },
                  { title: 'Atelier Packaging', desc: 'Complimentary luxury bespoke packaging boxes.' },
                ].map((item, idx) => (
                  <div key={idx} className="border border-[#183B56] bg-white p-5 space-y-1">
                    <span className="text-xs font-bold text-[#183B56] uppercase block">{item.title}</span>
                    <p className="text-[11px] text-[#5A7184] font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7184] pt-4 border-t border-[#183B56]">
              Curation audit completed within 48 hours of submission.
            </div>
          </div>

        </div>
      </section>

      {/* ─── 6. ESCROW FIT & SECURITY VAULT (3-COLUMN BOX MATRIX) ─── */}
      <section id="escrow-protection" className="border-b border-[#183B56] bg-[#F5EFEB]">
        <div className="max-w-7xl mx-auto border-x border-[#183B56]">
          
          <div className="p-6 sm:p-8 border-b border-[#183B56] bg-white text-center space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184]">
              Dual Patron &amp; Designer Protection
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
              100% Escrow Fit Guarantee
            </h2>
            <p className="text-xs sm:text-sm text-[#5A7184] max-w-xl mx-auto font-medium">
              Funds remain safely locked in Weavly Escrow Vaults. Artisans only receive payout after you receive the garment and confirm fit.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#183B56] bg-white">
            {[
              { step: '01', title: 'Order Commissioned', desc: 'Payment captured into Weavly Escrow Vault. Artisan starts tailoring.' },
              { step: '02', title: 'Delivery & Fitting Audit', desc: 'Garment arrives in Weavly luxury casing. 72h window for fit inspection.' },
              { step: '03', title: 'Guaranteed Settlement', desc: 'Upon your fit confirmation, escrow funds are released to the designer.' },
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-[#F5EFEB] hover:bg-white transition-colors flex flex-col justify-between min-h-[220px]">
                <span className="text-xs font-mono font-bold text-[#183B56] bg-[#DFE7ED] border border-[#183B56] px-2.5 py-1 self-start">
                  PHASE {item.step}
                </span>
                <div className="mt-6 space-y-2">
                  <h3 className="text-base font-bold uppercase text-[#183B56]">{item.title}</h3>
                  <p className="text-xs text-[#5A7184] font-medium leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ─── 7. CRAFTSMANSHIP & ATELIER STANDARDS ─── */}
      <section className="border-b border-[#183B56] bg-white">
        <div className="max-w-7xl mx-auto border-x border-[#183B56]">
          
          <div className="p-6 sm:p-8 border-b border-[#183B56] bg-[#F5EFEB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184] block mb-1">Couture Specifications</span>
              <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                Crafted Without Compromise
              </h2>
            </div>
            <span className="text-xs font-bold uppercase text-[#183B56]">Mulberry Silk &amp; Flannel Wool</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#183B56] bg-white">
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div className="aspect-[4/5] bg-[#DFE7ED] border border-[#183B56] overflow-hidden">
                <img src={KNIT_1} alt="Mulberry Knit" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold uppercase text-[#183B56]">Mulberry Silk Knit</h4>
                <p className="text-xs text-[#5A7184] font-medium">Soft Cashmere &amp; Silk Blend</p>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between space-y-4">
              <div className="aspect-[4/5] bg-[#DFE7ED] border border-[#183B56] overflow-hidden">
                <img src={KNIT_2} alt="Atelier Ensemble" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold uppercase text-[#183B56]">Hand-Draped Flannel</h4>
                <p className="text-xs text-[#5A7184] font-medium">Architectural Silhouette Cut</p>
              </div>
            </div>

            <div className="p-6 flex flex-col justify-between space-y-4">
              <div className="aspect-[4/5] bg-[#DFE7ED] border border-[#183B56] overflow-hidden">
                <img src={KNIT_3} alt="Sartorial Trousers" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold uppercase text-[#183B56]">Bespoke Sartorial Trousers</h4>
                <p className="text-xs text-[#5A7184] font-medium">Comfortable Ribbed Wool</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── 8. INTERACTIVE CIRCULAR GALLERY BOX ─── */}
      <section className="border-b border-[#183B56] bg-[#F5EFEB] py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto border border-[#183B56] bg-white p-8 sm:p-12 text-center space-y-8 shadow-xs">
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184]">Atelier Showcase</span>
            <h2 className="text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
              Styles That Welcome Sunshine's Return
            </h2>
            <p className="text-xs sm:text-sm text-[#5A7184] max-w-xl mx-auto font-medium">
              Explore season edits designed with natural fibers and bespoke architectural geometry.
            </p>
          </div>

          <div style={{ height: '480px', position: 'relative', width: '100%' }}>
            <CircularGallery
              bend={3}
              textColor="#183B56"
              borderRadius={0.02}
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
        </div>
      </section>

      {/* ─── 9. FOOTER ─── */}
      <Footer 
        requireAuth={true}
        onRequireAuth={() => triggerAuth("login")}
        onShopNow={() => triggerAuth("login")}
      />

      {/* Auth Modal */}
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
