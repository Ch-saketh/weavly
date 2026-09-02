"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import branding from "@/config/branding";
import { Globe, ArrowUp, ShieldCheck } from "lucide-react";
import WarpText from "@/shared/components/ui/WarpText";

/**
 * 3D Isometric Architectural Voxel Typography (WEAVLY) with React Bits Fluid Warp Distortion
 * Combines mathematical 3D isometric voxel typography with a real-time WebGL fluid glass
 * distortion shader pass (cursor lensing, ripple refraction, chromatic aberration).
 */
const warpVertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const warpFragmentShader = `
precision highp float;

uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform float uPointerActive;
uniform float uTime;
uniform float uWarpStrength;
uniform float uWarpScale;
uniform float uSpeed;
uniform float uPointerInfluence;
uniform float uPointerStrength;
uniform float uRefraction;
uniform float uRipple;
uniform float uMotion;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += amplitude * noise(p);
    p *= 2.02;
    amplitude *= 0.5;
  }
  return value;
}

vec4 sampleScene(vec2 uv) {
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    return vec4(0.0, 0.0, 0.0, 1.0);
  }
  return texture2D(tDiffuse, uv);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float time = uTime * uSpeed;
  float scale = max(uWarpScale, 0.001);

  vec2 drift = vec2(time * 0.055, -time * 0.045);
  float n1 = fbm(uv * scale * 3.1 + drift);
  float n2 = fbm((uv + 19.17) * scale * 3.4 - drift.yx);
  vec2 ambient = (vec2(n1, n2) - 0.5) * uWarpStrength * 0.045 * uMotion;

  vec2 pointerDelta = uv - uPointer;
  vec2 aspectDelta = vec2(pointerDelta.x * aspect, pointerDelta.y);
  float dist = length(aspectDelta);
  float radius = max(uPointerInfluence, 0.001);
  float t = clamp(dist / radius, 0.0, 1.0);
  float lens = smoothstep(radius, 0.0, dist) * uPointerActive;
  float bulge = t * (1.0 - t) * (1.0 - t) * 6.75 * uPointerActive;
  vec2 dir = dist > 0.0001 ? vec2(aspectDelta.x / aspect, aspectDelta.y) / dist : vec2(0.0);

  float rippleWave = sin(dist * 28.0 - time * 4.2) * 0.5 + 0.5;
  float rippleRing = (rippleWave - 0.5) * uRipple;
  vec2 pointerWarp = -dir * bulge * uPointerStrength * 0.045;
  pointerWarp += dir * rippleRing * bulge * uPointerStrength * 0.016;

  vec2 displaced = uv + ambient + pointerWarp;
  vec2 splitDir = ambient + pointerWarp;
  float splitLen = length(splitDir);
  splitDir = splitLen > 0.00001 ? splitDir / splitLen : vec2(0.7071, 0.7071);
  vec2 split = splitDir * uRefraction * 0.16 * (0.35 + lens * 1.65);

  vec4 base = sampleScene(displaced);
  float r = sampleScene(displaced + split).r;
  float g = base.g;
  float b = sampleScene(displaced - split).b;
  float a = max(max(sampleScene(displaced + split).a, base.a), sampleScene(displaced - split).a);

  vec3 color = vec3(r, g, b) + lens * base.a * 0.055;
  gl_FragColor = vec4(color, a);
}
`;

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

    const getDimensions = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 460;
      return { w, h };
    };

    let { w: width, h: height } = getDimensions();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const aspect = width / height;
    
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

    const scene = new THREE.Scene();
    scene.background = null;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(dpr);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;

    // ═══ OFF-SCREEN RENDER TARGET FOR POST-PROCESSING WARP SHADER ═══
    let renderTarget = new THREE.WebGLRenderTarget(
      Math.max(1, Math.floor(width * dpr)),
      Math.max(1, Math.floor(height * dpr)),
      {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBAFormat,
      }
    );

    const postScene = new THREE.Scene();
    const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const quadGeo = new THREE.PlaneGeometry(2, 2);

    const warpUniforms = {
      tDiffuse: { value: renderTarget.texture },
      uResolution: { value: new THREE.Vector2(width * dpr, height * dpr) },
      uPointer: { value: new THREE.Vector2(0.5, 0.5) },
      uPointerActive: { value: 0.0 },
      uTime: { value: 0.0 },
      uWarpStrength: { value: 0.08 },
      uWarpScale: { value: 1.7 },
      uSpeed: { value: 0.55 },
      uPointerInfluence: { value: 0.42 },
      uPointerStrength: { value: 0.38 },
      uRefraction: { value: 0.018 },
      uRipple: { value: 1.0 },
      uMotion: { value: prefersReducedMotion ? 0.0 : 1.0 },
    };

    const warpMaterial = new THREE.ShaderMaterial({
      vertexShader: warpVertexShader,
      fragmentShader: warpFragmentShader,
      uniforms: warpUniforms,
      depthTest: false,
      depthWrite: false,
    });

    const quadMesh = new THREE.Mesh(quadGeo, warpMaterial);
    postScene.add(quadMesh);

    // ═══ LUMINOUS WHITE STUDIO LIGHTING & GLOW ═══
    const ambientLight = new THREE.AmbientLight(0x484c5c, 2.5);
    scene.add(ambientLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 6.2);
    topLight.position.set(0, 80, 20);
    scene.add(topLight);

    const frontLeftLight = new THREE.DirectionalLight(0xf0f4ff, 4.5);
    frontLeftLight.position.set(-45, 30, 45);
    scene.add(frontLeftLight);

    const rightRimLight = new THREE.DirectionalLight(0xdce5ff, 3.2);
    rightRimLight.position.set(55, 15, 35);
    scene.add(rightRimLight);

    const cursorPointLight = new THREE.PointLight(0xffffff, 6.0, 40, 1.0);
    cursorPointLight.position.set(0, 4, 15);
    scene.add(cursorPointLight);

    // ═══ COMPREHENSIVE ISOMETRIC VOXEL ALPHABET ═══
    const voxelDictionary = {
      W: { width: 4, coords: [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 1], [1, 0], [2, 3], [2, 2], [2, 1], [2, 0], [3, 1], [3, 0], [4, 4], [4, 3], [4, 2], [4, 1], [4, 0]] },
      E: { width: 3, coords: [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 4], [2, 4], [3, 4], [1, 2], [2, 2], [1, 0], [2, 0], [3, 0]] },
      A: { width: 3, coords: [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 4], [2, 4], [3, 4], [3, 3], [3, 2], [3, 1], [3, 0], [1, 2], [2, 2]] },
      V: { width: 4, coords: [[0, 4], [0, 3], [0, 2], [1, 1], [1, 0], [2, 0], [3, 1], [3, 0], [4, 4], [4, 3], [4, 2]] },
      L: { width: 3, coords: [[0, 4], [0, 3], [0, 2], [0, 1], [0, 0], [1, 0], [2, 0], [3, 0]] },
      Y: { width: 2, coords: [[0, 4], [0, 3], [2, 4], [2, 3], [1, 2], [1, 1], [1, 0]] },
    };

    const lettersOrder = word.toUpperCase().split("");
    const letterSpacing = 1.2;
    const S = 0.96;
    const sqrt2_over_2 = Math.SQRT2 / 2;
    const blockGeo = new THREE.BoxGeometry(S, S, S);
    const edgesGeo = new THREE.EdgesGeometry(blockGeo);

    const blockMaterial = new THREE.MeshStandardMaterial({ color: 0x757a8c, roughness: 0.24, metalness: 0.18 });
    const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x1e2028, linewidth: 1, transparent: true, opacity: 0.8 });

    const rootGroup = new THREE.Group();
    const ISOMETRIC_PITCH = Math.atan(1 / Math.SQRT2);
    rootGroup.rotation.x = ISOMETRIC_PITCH;
    rootGroup.position.y = -2.6;

    const allBlocks = [];
    let totalWordWidth = 0;
    lettersOrder.forEach((char, idx) => {
      const data = voxelDictionary[char] || voxelDictionary.E;
      totalWordWidth += data.width * sqrt2_over_2 * S + (idx < lettersOrder.length - 1 ? letterSpacing : 0);
    });

    let currentX = -totalWordWidth / 2;
    lettersOrder.forEach((char) => {
      const data = voxelDictionary[char] || voxelDictionary.E;
      data.coords.forEach(([v, y]) => {
        const posX = currentX + v * sqrt2_over_2 * S;
        const posZ = v * sqrt2_over_2 * S;
        const posY = y * S;
        const mesh = new THREE.Mesh(blockGeo, blockMaterial);
        mesh.rotation.y = Math.PI / 4;
        mesh.position.set(posX, posY, posZ);
        mesh.add(new THREE.LineSegments(edgesGeo, edgeMaterial));
        rootGroup.add(mesh);
        allBlocks.push({ mesh, baseY: posY, baseX: posX });
      });
      currentX += data.width * sqrt2_over_2 * S + letterSpacing;
    });
    scene.add(rootGroup);

    const pointer = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, active: 0, activeTarget: 0 };
    let targetRotX = ISOMETRIC_PITCH, targetRotY = 0, currentRotX = ISOMETRIC_PITCH, currentRotY = 0, targetLightX = 0, targetLightY = 4;

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      pointer.tx = (e.clientX - rect.left) / rect.width;
      pointer.ty = 1 - (e.clientY - rect.top) / rect.height;
      pointer.activeTarget = 1;
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = normX * 0.04;
      targetRotX = ISOMETRIC_PITCH - normY * 0.03;
      targetLightX = normX * (totalWordWidth / 1.8);
      targetLightY = 3 + normY * 5;
    };

    const handlePointerLeave = () => { pointer.activeTarget = 0; };
    container.addEventListener("pointermove", handlePointerMove, { passive: true });
    container.addEventListener("pointerleave", handlePointerLeave, { passive: true });

    const startTime = performance.now();
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = (performance.now() - startTime) / 1000;
      currentRotX += (targetRotX - currentRotX) * 0.06;
      currentRotY += (targetRotY - currentRotY) * 0.06;
      rootGroup.rotation.x = currentRotX;
      rootGroup.rotation.y = currentRotY;
      cursorPointLight.position.x += (targetLightX - cursorPointLight.position.x) * 0.08;
      cursorPointLight.position.y += (targetLightY - cursorPointLight.position.y) * 0.08;
      if (!prefersReducedMotion) {
        allBlocks.forEach((b) => { b.mesh.position.y = b.baseY + Math.sin(elapsed * 1.5 + b.baseX * 0.4) * 0.04; });
      }
      const idleX = 0.5 + Math.sin(elapsed * 0.33) * 0.12;
      const idleY = 0.5 + Math.cos(elapsed * 0.27) * 0.1;
      pointer.x += ((pointer.activeTarget > 0 ? pointer.tx : idleX) - pointer.x) * (pointer.activeTarget > 0 ? 0.12 : 0.035);
      pointer.y += ((pointer.activeTarget > 0 ? pointer.ty : idleY) - pointer.y) * (pointer.activeTarget > 0 ? 0.12 : 0.035);
      pointer.active += ((pointer.activeTarget > 0 ? 1 : 0.18) - pointer.active) * 0.06;
      renderer.setRenderTarget(renderTarget);
      renderer.clear();
      renderer.render(scene, camera);
      renderer.setRenderTarget(null);
      warpUniforms.uPointer.value.set(pointer.x, pointer.y);
      warpUniforms.uPointerActive.value = prefersReducedMotion ? pointer.active * 0.35 : pointer.active;
      warpUniforms.uTime.value = prefersReducedMotion ? 0.0 : elapsed;
      renderer.render(postScene, postCamera);
    };
    animate();

    const handleResize = () => {
      const { w, h } = getDimensions();
      const newAspect = w / h;
      const newViewSize = calculateViewSize(w, word.length);
      camera.left = (-newViewSize * newAspect) / 2;
      camera.right = (newViewSize * newAspect) / 2;
      camera.top = newViewSize / 2;
      camera.bottom = -newViewSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderTarget.setSize(Math.max(1, Math.floor(w * dpr)), Math.max(1, Math.floor(h * dpr)));
      warpUniforms.uResolution.value.set(w * dpr, h * dpr);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("pointermove", handlePointerMove);
      container.removeEventListener("pointerleave", handlePointerLeave);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      renderTarget.dispose();
      quadGeo.dispose();
      warpMaterial.dispose();
      blockGeo.dispose();
      edgesGeo.dispose();
      blockMaterial.dispose();
      edgeMaterial.dispose();
      scene.clear();
      postScene.clear();
    };
  }, [word]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[300px] sm:h-[380px] md:h-[440px] lg:h-[500px] overflow-hidden select-none cursor-pointer"
    >
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

            {/* Privacy & Data Protection Note */}
            <div className="pt-2 border-t border-white/10 space-y-2 max-w-sm">
              <div className="flex items-center gap-1.5 text-[#CCCCCC] text-[11px] font-semibold tracking-wide uppercase">
                <ShieldCheck size={13} className="text-[#38BDF8]" />
                <span>Privacy &amp; Data Security Vow</span>
              </div>
              <p className="text-[11px] text-[#8E8E93] leading-relaxed font-normal">
                Your body measurements, fitting uploads, and styling history are strictly confidential. We never sell your personal data or biometric vectors to third-party advertisers.
              </p>
              <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                <button
                  onClick={() => handleLinkClick("/privacy")}
                  className="text-[#38BDF8] hover:underline transition-all cursor-pointer border-none bg-transparent p-0 font-medium"
                >
                  Privacy Policy
                </button>
                <span className="text-[#52525B]">•</span>
                <button
                  onClick={() => handleLinkClick("/terms")}
                  className="text-[#CCCCCC] hover:text-white underline transition-colors cursor-pointer border-none bg-transparent p-0"
                >
                  Terms of Service
                </button>
              </div>
            </div>

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
                  <button onClick={() => handleLinkClick("/become-designer")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Become a Designer
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/how-to-publish")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    How to Publish Design
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/creator-guide")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Creator Handbook
                  </button>
                </li>
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
                    <img src="/zyra.png" alt="Zyra" className="w-3.5 h-3.5 object-contain group-hover:scale-110 transition-transform" />
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

            {/* Column 4: POLICIES & PRIVACY */}
            <div className="space-y-4">
              <h4 className="text-[12px] font-semibold text-[#8E8E93] tracking-normal">
                Legal &amp; Privacy
              </h4>
              <ul className="space-y-2.5 font-normal p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] flex items-center gap-1.5 group">
                    <ShieldCheck size={13} className="text-[#38BDF8] group-hover:scale-110 transition-transform" />
                    <span className="font-medium text-white">Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/terms")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/privacy")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Data Rights &amp; GDPR
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/faq")} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0 text-left text-[#CCCCCC] block">
                    Help &amp; FAQs
                  </button>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </div>

      {/* ═══ BOTTOM SECTION: 3D ISOMETRIC ARCHITECTURAL VOXEL TYPOGRAPHY WITH FLUID WARP DISTORTION ═══ */}
      <div className="relative w-full">
        <IsometricWeavly3D word="WEAVLY" />
      </div>

    </footer>
  );
}