"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import branding from "@/config/branding";
import { Globe, ArrowUp, Sparkles, ShieldCheck } from "lucide-react";

/**
 * 3D Isometric Architectural Voxel Typography (WEAVLY / DECIMAL)
 * Exact mathematical recreation of Decimal AI's iconic isometric extruded typography.
 * Features:
 * - Monumental horizontal letter alignment spanning the footer base
 * - 45° rotated voxel cubes on an isometric (u, v, y) grid
 * - Complete voxel alphabet dictionary (A-Z)
 * - Exact 35.264° axonometric elevation angle
 * - High-contrast studio lighting (silver top diamonds, medium-gray left facets, deep-charcoal right facets)
 * - Interactive cursor spotlight tracking across letters with smooth spring physics
 */
function IsometricWeavly3D({ word = "WEAVLY" }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId;
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const getDimensions = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 460;
      return { w, h };
    };

    let { w: width, h: height } = getDimensions();

    // Orthographic Camera looking directly from the front
    const aspect = width / height;
    
    // Frustum view size scaled responsively for monumental scale
    const calculateViewSize = (w, wordLength) => {
      const baseScale = wordLength <= 6 ? 10.5 : 12.0;
      if (w < 480) return baseScale * 1.6;
      if (w < 768) return baseScale * 1.35;
      if (w < 1200) return baseScale * 1.15;
      return baseScale;
    };

    let viewSize = calculateViewSize(width, word.length);
    const camera = new THREE.OrthographicCamera(
      (-viewSize * aspect) / 2,
      (viewSize * aspect) / 2,
      viewSize / 2,
      -viewSize / 2,
      -200,
      1000
    );

    camera.position.set(0, 0, 100);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;

    // ═══ LUMINOUS WHITE STUDIO LIGHTING & GLOW ═══
    // Ambient Light: lifts shadow tones to keep all facets clearly visible
    const ambientLight = new THREE.AmbientLight(0x484c5c, 2.5);
    scene.add(ambientLight);

    // Top Key Light: bright, crisp pure white illumination on diamond top faces
    const topLight = new THREE.DirectionalLight(0xffffff, 6.2);
    topLight.position.set(0, 80, 20);
    scene.add(topLight);

    // Front-Left White Key Light: sharp, bright white illumination across front facets
    const frontLeftLight = new THREE.DirectionalLight(0xf0f4ff, 4.5);
    frontLeftLight.position.set(-45, 30, 45);
    scene.add(frontLeftLight);

    // Right-Side White Rim Light: crisp edge definition and fill
    const rightRimLight = new THREE.DirectionalLight(0xdce5ff, 3.2);
    rightRimLight.position.set(55, 15, 35);
    scene.add(rightRimLight);

    // Interactive Cursor Spotlight: glides across blocks with vivid white radiance
    const cursorPointLight = new THREE.PointLight(0xffffff, 6.0, 40, 1.0);
    cursorPointLight.position.set(0, 4, 15);
    scene.add(cursorPointLight);

    // ═══ COMPREHENSIVE ISOMETRIC VOXEL ALPHABET ═══
    // Coordinates: (v, y) on 30° isometric down-right grid (y = 0..4)
    const voxelDictionary = {
      W: {
        width: 4,
        coords: [
          [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
          [1, 1], [1, 0],
          [2, 3], [2, 2], [2, 1], [2, 0],
          [3, 1], [3, 0],
          [4, 4], [4, 3], [4, 2], [4, 1], [4, 0],
        ],
      },
      E: {
        width: 3,
        coords: [
          [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
          [1, 4], [2, 4], [3, 4],
          [1, 2], [2, 2],
          [1, 0], [2, 0], [3, 0],
        ],
      },
      A: {
        width: 3,
        coords: [
          [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
          [1, 4], [2, 4],
          [3, 4], [3, 3], [3, 2], [3, 1], [3, 0],
          [1, 2], [2, 2],
        ],
      },
      V: {
        width: 4,
        coords: [
          [0, 4], [0, 3], [0, 2],
          [1, 1], [1, 0],
          [2, 0],
          [3, 1], [3, 0],
          [4, 4], [4, 3], [4, 2],
        ],
      },
      L: {
        width: 3,
        coords: [
          [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
          [1, 0], [2, 0], [3, 0],
        ],
      },
      Y: {
        width: 2,
        coords: [
          [0, 4], [0, 3],
          [2, 4], [2, 3],
          [1, 2],
          [1, 1], [1, 0],
        ],
      },
      D: {
        width: 3,
        coords: [
          [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
          [1, 4], [2, 4],
          [3, 4], [3, 3], [3, 2], [3, 1], [3, 0],
          [1, 0], [2, 0],
        ],
      },
      C: {
        width: 3,
        coords: [
          [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
          [1, 4], [2, 4], [3, 4],
          [1, 0], [2, 0], [3, 0],
        ],
      },
      I: {
        width: 2,
        coords: [
          [0, 4], [1, 4], [2, 4],
          [1, 3], [1, 2], [1, 1],
          [0, 0], [1, 0], [2, 0],
        ],
      },
      M: {
        width: 4,
        coords: [
          [0, 4], [0, 3], [0, 2], [0, 1], [0, 0],
          [1, 3],
          [2, 2],
          [3, 3],
          [4, 4], [4, 3], [4, 2], [4, 1], [4, 0],
        ],
      },
    };

    const lettersOrder = word.toUpperCase().split("");
    const letterSpacing = 1.2;

    const S = 0.96; // Block size
    const sqrt2_over_2 = Math.SQRT2 / 2; // ~0.7071
    const blockGeo = new THREE.BoxGeometry(S, S, S);
    const edgesGeo = new THREE.EdgesGeometry(blockGeo);

    // Uniform Architectural Titanium Material (Crisp White Highlights)
    const blockMaterial = new THREE.MeshStandardMaterial({
      color: 0x757a8c,
      roughness: 0.24,
      metalness: 0.18,
    });

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x1e2028,
      linewidth: 1,
      transparent: true,
      opacity: 0.8,
    });

    const rootGroup = new THREE.Group();
    // Decimal axonometric pitch angle: 35.264°
    const ISOMETRIC_PITCH = Math.atan(1 / Math.SQRT2); // 0.6154797 rad (~35.264°)
    rootGroup.rotation.x = ISOMETRIC_PITCH;
    rootGroup.position.y = -2.6; // Anchor bottom row firmly to footer base

    const allBlocks = [];

    // Calculate total word screen width for centering
    let totalWordWidth = 0;
    lettersOrder.forEach((char, idx) => {
      const data = voxelDictionary[char] || voxelDictionary.E;
      const charWidth = data.width * sqrt2_over_2 * S;
      totalWordWidth += charWidth;
      if (idx < lettersOrder.length - 1) {
        totalWordWidth += letterSpacing;
      }
    });

    let currentX = -totalWordWidth / 2;

    lettersOrder.forEach((char) => {
      const data = voxelDictionary[char] || voxelDictionary.E;
      const coords = data.coords;
      const charWidth = data.width * sqrt2_over_2 * S;

      coords.forEach(([v, y]) => {
        // Single uniform material across all blocks
        const mesh = new THREE.Mesh(blockGeo, blockMaterial);
        
        // Rotate each cube 45° on Y to reveal front diamond vertex & isometric facets
        mesh.rotation.y = Math.PI / 4;

        // Position on isometric grid
        const posX = currentX + v * sqrt2_over_2 * S;
        const posZ = v * sqrt2_over_2 * S;
        const posY = y * S;

        mesh.position.set(posX, posY, posZ);

        const wireframe = new THREE.LineSegments(edgesGeo, edgeMaterial);
        mesh.add(wireframe);

        rootGroup.add(mesh);
        allBlocks.push({
          mesh,
          baseX: posX,
          baseY: posY,
          baseZ: posZ,
        });
      });

      currentX += charWidth + letterSpacing;
    });

    scene.add(rootGroup);

    // ═══ INTERACTIVE CURSOR SPOTLIGHT & SUBTLE TILT ═══
    let targetRotX = ISOMETRIC_PITCH;
    let targetRotY = 0;
    let currentRotX = ISOMETRIC_PITCH;
    let currentRotY = 0;
    let targetLightX = 0;
    let targetLightY = 4;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      if (
        e.clientX < rect.left - 200 ||
        e.clientX > rect.right + 200 ||
        e.clientY < rect.top - 200 ||
        e.clientY > rect.bottom + 200
      ) {
        return;
      }

      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Micro-tilt responsive to cursor
      targetRotY = normX * 0.04;
      targetRotX = ISOMETRIC_PITCH - normY * 0.03;

      // Spotlight glides across letters
      targetLightX = normX * (totalWordWidth / 1.8);
      targetLightY = 3 + normY * 5;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // ═══ ANIMATION LOOP ═══
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Smooth lerp for interactive tilt
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;

      rootGroup.rotation.x = currentRotX;
      rootGroup.rotation.y = currentRotY;

      // Cursor spotlight smoothing
      cursorPointLight.position.x += (targetLightX - cursorPointLight.position.x) * 0.08;
      cursorPointLight.position.y += (targetLightY - cursorPointLight.position.y) * 0.08;

      // Subtle architectural breathing wave
      if (!prefersReducedMotion) {
        allBlocks.forEach((b) => {
          b.mesh.position.y =
            b.baseY + Math.sin(elapsed * 1.5 + b.baseX * 0.4) * 0.04;
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const { w, h } = getDimensions();
      const newAspect = w / h;
      const newViewSize = calculateViewSize(w, word.length);

      camera.left = (-newViewSize * newAspect) / 2;
      camera.right = (newViewSize * newAspect) / 2;
      camera.top = newViewSize / 2;
      camera.bottom = -newViewSize / 2;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      blockGeo.dispose();
      edgesGeo.dispose();
      blockMaterial.dispose();
      edgeMaterial.dispose();
      scene.clear();
    };
  }, [word]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] lg:h-[500px] overflow-hidden select-none"
    >
      {/* Soft atmospheric white ambient glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_75%_60%_at_50%_88%,rgba(255,255,255,0.06),rgba(255,255,255,0.015)_50%,transparent_80%)]" />
      <canvas ref={canvasRef} className="relative z-10 w-full h-full block" />
    </div>
  );
}

export default function Footer({ onShopNow, onBetaClick, requireAuth, onRequireAuth }) {
  const router = RouterSafe();
  const currentYear = new Date().getFullYear();

  function RouterSafe() {
    try {
      return useRouter();
    } catch {
      return { push: () => {} };
    }
  }

  const handleLinkClick = (path) => {
    if (requireAuth) {
      if (onRequireAuth) onRequireAuth(path);
      return;
    }
    if (path === "/market" && onShopNow) {
      onShopNow();
    } else {
      router.push(path);
    }
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="relative w-full bg-[#000000] text-white font-sans select-none overflow-hidden pt-16 sm:pt-24 pb-4">
      
      {/* ═══ TOP SECTION: DECIMAL-STYLE MINIMALIST GRID ═══ */}
      <div className="w-full max-w-[1400px] mx-auto px-6 sm:px-12 lg:px-16 mb-12 sm:mb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 sm:gap-16 items-start">
          
          {/* LEFT: Logo + Copyright Notice */}
          <div className="lg:col-span-5 space-y-4">
            <div
              onClick={() => handleLinkClick("/")}
              className="hover:opacity-90 transition-opacity inline-flex items-center gap-2 cursor-pointer p-0 select-none"
              role="button"
              tabIndex={0}
              aria-label={`${branding.name} home`}
            >
              <WeavlyLogo size="md" showBeta={true} allWhite={true} onBetaClick={onBetaClick} />
            </div>

            <p className="text-xs text-[#71717A] max-w-sm leading-relaxed font-normal">
              &copy; {currentYear} {branding.name}, Inc.
            </p>

            <div className="flex items-center gap-3 pt-2 text-xs text-[#52525B]">
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1.5 text-xs text-[#71717A] hover:text-white transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                <Globe size={12} className="text-[#52525B]" />
                <span>English (US)</span>
              </button>
              <span>•</span>
              <button
                onClick={scrollToTop}
                className="inline-flex items-center gap-1 text-xs text-[#71717A] hover:text-white transition-colors cursor-pointer border-none bg-transparent p-0"
              >
                <span>Back to top</span>
                <ArrowUp size={11} />
              </button>
            </div>
          </div>

          {/* RIGHT: 4 Clean Minimal Navigation Columns */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-10 text-xs">
            
            {/* Column 1: PRODUCT */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-semibold text-[#8E8E93] tracking-normal">
                Product
              </h4>
              <ul className="space-y-2.5 font-normal p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/market")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/men")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Men's Sartorial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/women")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Women's Atelier
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/unisex")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Unisex Drops
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/new-arrivals")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    New Arrivals
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: ATELIER */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-semibold text-[#8E8E93] tracking-normal">
                Atelier
              </h4>
              <ul className="space-y-2.5 font-normal p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/designers")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Discover Designers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designs")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Creator Lookbooks
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/custom-design")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Commission Garment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designer-studio")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Designer Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/become-designer")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Become a Designer
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: WARDROBE */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-semibold text-[#8E8E93] tracking-normal">
                Wardrobe
              </h4>
              <ul className="space-y-2.5 font-normal p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/wardrobe")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] flex items-center gap-1.5 group">
                    <Sparkles size={11} className="text-white group-hover:scale-125 transition-transform" />
                    <span>Zyra Wardrobe</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/account")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    My Account
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/orders")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/bag")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Shopping Bag
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: POLICIES */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-semibold text-[#8E8E93] tracking-normal">
                Company
              </h4>
              <ul className="space-y-2.5 font-normal p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/terms")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/faq")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Help & FAQs
                  </button>
                </li>
                <li>
                  <span className="text-[#71717A] text-xs flex items-center gap-1.5 pt-1">
                    <ShieldCheck size={12} className="text-white/80" />
                    <span>Verified Atelier</span>
                  </span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* ═══ BOTTOM SECTION: 3D ISOMETRIC ARCHITECTURAL VOXEL TYPOGRAPHY (DECIMAL STYLE) ═══ */}
      <div className="relative w-full">
        <IsometricWeavly3D />
      </div>

    </footer>
  );
}