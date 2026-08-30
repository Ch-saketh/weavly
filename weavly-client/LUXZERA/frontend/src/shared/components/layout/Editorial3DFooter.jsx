"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as THREE from "three";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import branding from "@/config/branding";
import { Globe, ArrowUp, Sparkles, ShieldCheck, ArrowRight, Check } from "lucide-react";

export default function Editorial3DFooter({ onShopNow, onBetaClick, requireAuth, onRequireAuth }) {
  const router = RouterSafe();
  const currentYear = new Date().getFullYear();
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const canvasRef = useRef(null);
  const threeContainerRef = useRef(null);

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

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setTimeout(() => {
      setEmail("");
      setSubscribed(false);
    }, 4000);
  };

  // ═══ THREE.JS 3D CHARACTERS SITTING & INTERACTING WITH FOOTER CARD ═══
  useEffect(() => {
    if (!canvasRef.current || !threeContainerRef.current) return;

    let animationFrameId;
    const container = threeContainerRef.current;
    const canvas = canvasRef.current;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    const width = container.clientWidth;
    const height = container.clientHeight;

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 100);
    camera.position.set(0, 0.75, 5.6);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. High-Fashion Studio Lighting
    const ambientLight = new THREE.AmbientLight(0x282830, 2.0);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 4.5);
    keyLight.position.set(-3, 6, 4.5);
    keyLight.castShadow = true;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb0b8c8, 2.6);
    fillLight.position.set(2.5, 3.5, 3.5);
    scene.add(fillLight);

    const rimLightRight = new THREE.DirectionalLight(0xe8eeff, 6.5);
    rimLightRight.position.set(4, 4.5, -3);
    scene.add(rimLightRight);

    const rimLightLeft = new THREE.DirectionalLight(0xc5d0e5, 4.5);
    rimLightLeft.position.set(-4, 3.5, -3);
    scene.add(rimLightLeft);

    // 3. Materials
    const skinTone = new THREE.MeshStandardMaterial({
      color: 0x3d2b20,
      roughness: 0.48,
      metalness: 0.1,
    });
    const skinToneLight = new THREE.MeshStandardMaterial({
      color: 0xd8ad88,
      roughness: 0.44,
      metalness: 0.1,
    });
    const blackHairMat = new THREE.MeshStandardMaterial({
      color: 0x09090b,
      roughness: 0.7,
      metalness: 0.2,
    });
    const matteBlackFabric = new THREE.MeshStandardMaterial({
      color: 0x121215,
      roughness: 0.8,
      metalness: 0.15,
    });
    const woolCoatMat = new THREE.MeshStandardMaterial({
      color: 0x18181c,
      roughness: 0.75,
      metalness: 0.18,
    });
    const whiteShoeMat = new THREE.MeshStandardMaterial({
      color: 0xf4f4f6,
      roughness: 0.25,
      metalness: 0.1,
    });
    const leatherBootMat = new THREE.MeshStandardMaterial({
      color: 0x0c0c0e,
      roughness: 0.2,
      metalness: 0.7,
    });
    const whitePrintMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const characters = [];

    // Model Builder
    function buildCharacter({ type = "sitting", position = [0, 0, 0], rotationY = 0, outfit = "hoodie", skin = skinTone }) {
      const root = new THREE.Group();
      root.position.set(...position);
      root.rotation.y = rotationY;

      const animatedNodes = {
        group: root,
        chest: null,
        head: null,
        leftArm: null,
        rightArm: null,
        leftLeg: null,
        rightLeg: null,
        type,
        baseY: position[1],
        idlePhase: Math.random() * Math.PI * 2,
      };

      const garmentMat = outfit === "trench" ? woolCoatMat : matteBlackFabric;

      // Pelvis
      const pelvisGeo = new THREE.BoxGeometry(0.38, 0.22, 0.26);
      const pelvisMesh = new THREE.Mesh(pelvisGeo, matteBlackFabric);
      pelvisMesh.castShadow = true;

      if (type === "sitting") {
        pelvisMesh.position.set(0, 0.28, 0);
      } else {
        pelvisMesh.position.set(0, 0.75, 0);
      }
      root.add(pelvisMesh);

      // Chest Rig
      const chestRig = new THREE.Group();
      chestRig.position.set(0, 0.13, 0);
      pelvisMesh.add(chestRig);
      animatedNodes.chest = chestRig;

      const chestGeo = new THREE.CylinderGeometry(0.25, 0.19, 0.48, 16);
      const chestMesh = new THREE.Mesh(chestGeo, garmentMat);
      chestMesh.position.set(0, 0.24, 0);
      chestMesh.castShadow = true;
      chestRig.add(chestMesh);

      if (outfit === "hoodie") {
        // Hood
        const hoodGeo = new THREE.SphereGeometry(0.19, 14, 14, 0, Math.PI * 2, 0, Math.PI * 0.75);
        const hoodMesh = new THREE.Mesh(hoodGeo, matteBlackFabric);
        hoodMesh.position.set(0, 0.34, -0.12);
        hoodMesh.rotation.x = Math.PI * 0.8;
        hoodMesh.castShadow = true;
        chestRig.add(hoodMesh);

        // Weavly Typographic Badge on Chest
        const logoBadgeGeo = new THREE.PlaneGeometry(0.16, 0.038);
        const logoBadgeMesh = new THREE.Mesh(logoBadgeGeo, whitePrintMat);
        logoBadgeMesh.position.set(0, 0.3, 0.225);
        chestRig.add(logoBadgeMesh);
      } else if (outfit === "trench") {
        // Structured Lapels
        const lapelGeo = new THREE.BoxGeometry(0.42, 0.38, 0.14);
        const lapelMesh = new THREE.Mesh(lapelGeo, woolCoatMat);
        lapelMesh.position.set(0, 0.28, 0.14);
        lapelMesh.castShadow = true;
        chestRig.add(lapelMesh);

        // Flaps extending down
        const coatFlapGeo = new THREE.CylinderGeometry(0.27, 0.42, 0.76, 16, 1, true);
        const coatFlapMesh = new THREE.Mesh(coatFlapGeo, woolCoatMat);
        coatFlapMesh.position.set(0, -0.32, 0);
        coatFlapMesh.castShadow = true;
        pelvisMesh.add(coatFlapMesh);
      }

      // Head & Neck
      const neckGeo = new THREE.CylinderGeometry(0.075, 0.085, 0.16, 14);
      const neckMesh = new THREE.Mesh(neckGeo, skin);
      neckMesh.position.set(0, 0.54, 0);
      chestRig.add(neckMesh);

      const headRig = new THREE.Group();
      headRig.position.set(0, 0.13, 0);
      neckMesh.add(headRig);
      animatedNodes.head = headRig;

      const headGeo = new THREE.SphereGeometry(0.135, 18, 18);
      headGeo.scale(0.88, 1.18, 1.02);
      const headMesh = new THREE.Mesh(headGeo, skin);
      headMesh.castShadow = true;
      headRig.add(headMesh);

      const hairGeo = new THREE.SphereGeometry(0.142, 18, 18, 0, Math.PI * 2, 0, Math.PI * 0.58);
      hairGeo.scale(0.92, 1.18, 1.06);
      const hairMesh = new THREE.Mesh(hairGeo, blackHairMat);
      hairMesh.position.set(0, 0.03, -0.015);
      headRig.add(hairMesh);

      // Arms
      const upperArmGeo = new THREE.CylinderGeometry(0.068, 0.058, 0.34, 14);
      const forearmGeo = new THREE.CylinderGeometry(0.058, 0.048, 0.32, 14);
      const handGeo = new THREE.SphereGeometry(0.048, 10, 10);

      // Left Arm
      const leftArmRig = new THREE.Group();
      leftArmRig.position.set(-0.27, 0.42, 0);
      chestRig.add(leftArmRig);
      animatedNodes.leftArm = leftArmRig;

      const leftUpperMesh = new THREE.Mesh(upperArmGeo, garmentMat);
      leftUpperMesh.position.set(0, -0.17, 0);
      leftUpperMesh.castShadow = true;
      leftArmRig.add(leftUpperMesh);

      const leftForearmRig = new THREE.Group();
      leftForearmRig.position.set(0, -0.34, 0);
      leftArmRig.add(leftForearmRig);

      const leftForearmMesh = new THREE.Mesh(forearmGeo, garmentMat);
      leftForearmMesh.position.set(0, -0.15, 0);
      leftForearmMesh.castShadow = true;
      leftForearmRig.add(leftForearmMesh);

      const leftHandMesh = new THREE.Mesh(handGeo, skin);
      leftHandMesh.position.set(0, -0.32, 0);
      leftForearmRig.add(leftHandMesh);

      // Right Arm
      const rightArmRig = new THREE.Group();
      rightArmRig.position.set(0.27, 0.42, 0);
      chestRig.add(rightArmRig);
      animatedNodes.rightArm = rightArmRig;

      const rightUpperMesh = new THREE.Mesh(upperArmGeo, garmentMat);
      rightUpperMesh.position.set(0, -0.17, 0);
      rightUpperMesh.castShadow = true;
      rightArmRig.add(rightUpperMesh);

      const rightForearmRig = new THREE.Group();
      rightForearmRig.position.set(0, -0.34, 0);
      rightArmRig.add(rightForearmRig);

      const rightForearmMesh = new THREE.Mesh(forearmGeo, garmentMat);
      rightForearmMesh.position.set(0, -0.15, 0);
      rightForearmMesh.castShadow = true;
      rightForearmRig.add(rightForearmMesh);

      const rightHandMesh = new THREE.Mesh(handGeo, skin);
      rightHandMesh.position.set(0, -0.32, 0);
      rightForearmRig.add(rightHandMesh);

      // Arm Poses
      if (type === "sitting") {
        leftArmRig.rotation.set(0.35, 0, 0.22);
        leftForearmRig.rotation.set(0.75, 0, 0);
        rightArmRig.rotation.set(-0.25, 0, -0.28);
        rightForearmRig.rotation.set(0.45, 0, 0);
      } else {
        leftArmRig.rotation.set(0.18, 0, 0.12);
        leftForearmRig.rotation.set(0.65, -0.22, 0);
        rightArmRig.rotation.set(0.08, 0, -0.12);
        rightForearmRig.rotation.set(0.12, 0, 0);
      }

      // Legs
      const thighGeo = new THREE.CylinderGeometry(0.09, 0.075, 0.44, 14);
      const calfGeo = new THREE.CylinderGeometry(0.075, 0.06, 0.44, 14);
      const shoeMat = outfit === "hoodie" ? whiteShoeMat : leatherBootMat;
      const shoeGeo = new THREE.BoxGeometry(0.13, 0.11, 0.26);

      // Left Leg
      const leftLegRig = new THREE.Group();
      leftLegRig.position.set(-0.13, -0.1, 0);
      pelvisMesh.add(leftLegRig);
      animatedNodes.leftLeg = leftLegRig;

      const leftThighMesh = new THREE.Mesh(thighGeo, matteBlackFabric);
      leftThighMesh.position.set(0, -0.22, 0);
      leftThighMesh.castShadow = true;
      leftLegRig.add(leftThighMesh);

      const leftCalfRig = new THREE.Group();
      leftCalfRig.position.set(0, -0.44, 0);
      leftLegRig.add(leftCalfRig);

      const leftCalfMesh = new THREE.Mesh(calfGeo, matteBlackFabric);
      leftCalfMesh.position.set(0, -0.22, 0);
      leftCalfMesh.castShadow = true;
      leftCalfRig.add(leftCalfMesh);

      const leftShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
      leftShoeMesh.position.set(0, -0.46, 0.06);
      leftShoeMesh.castShadow = true;
      leftCalfRig.add(leftShoeMesh);

      // Right Leg
      const rightLegRig = new THREE.Group();
      rightLegRig.position.set(0.13, -0.1, 0);
      pelvisMesh.add(rightLegRig);
      animatedNodes.rightLeg = rightLegRig;

      const rightThighMesh = new THREE.Mesh(thighGeo, matteBlackFabric);
      rightThighMesh.position.set(0, -0.22, 0);
      rightThighMesh.castShadow = true;
      rightLegRig.add(rightThighMesh);

      const rightCalfRig = new THREE.Group();
      rightCalfRig.position.set(0, -0.44, 0);
      rightLegRig.add(rightCalfRig);

      const rightCalfMesh = new THREE.Mesh(calfGeo, matteBlackFabric);
      rightCalfMesh.position.set(0, -0.22, 0);
      rightCalfMesh.castShadow = true;
      rightCalfRig.add(rightCalfMesh);

      const rightShoeMesh = new THREE.Mesh(shoeGeo, shoeMat);
      rightShoeMesh.position.set(0, -0.46, 0.06);
      rightShoeMesh.castShadow = true;
      rightCalfRig.add(rightShoeMesh);

      // Poses: Sitting figure has legs forward (+Z) dangling over the white card ledge!
      if (type === "sitting") {
        leftLegRig.rotation.set(1.45, 0.16, 0);
        leftCalfRig.rotation.set(-1.48, 0, 0);
        rightLegRig.rotation.set(1.36, -0.1, 0);
        rightCalfRig.rotation.set(-1.38, 0, 0);
      } else {
        leftLegRig.rotation.set(-0.04, 0, -0.05);
        rightLegRig.rotation.set(0.04, 0, 0.07);
      }

      root.scale.set(0.95, 0.95, 0.95);
      scene.add(root);
      characters.push(animatedNodes);
      return root;
    }

    // ── CHARACTER 1: SITTING ON TOP-RIGHT LEDGE OF FLOATING CARD ──
    buildCharacter({
      type: "sitting",
      position: [0.05, -0.22, 0.45],
      rotationY: -0.15,
      outfit: "hoodie",
      skin: skinTone,
    });

    // ── CHARACTER 2: STANDING CONFIDENTLY NEXT TO / BEHIND THE CARD ──
    buildCharacter({
      type: "standing",
      position: [1.25, -0.65, -0.35],
      rotationY: -0.3,
      outfit: "trench",
      skin: skinToneLight,
    });

    // 4. Mouse Tracking & Parallax
    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.targetY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 5. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      if (!prefersReducedMotion) {
        camera.position.x = mouse.x * 0.3;
        camera.position.y = 0.75 + mouse.y * 0.18;
        camera.lookAt(0.1, 0.4, 0);
      }

      characters.forEach((char) => {
        const time = elapsedTime + char.idlePhase;
        if (prefersReducedMotion) return;

        // Breathing
        const breath = Math.sin(time * 1.8) * 0.015;
        if (char.chest) {
          char.chest.scale.set(1 + breath * 0.5, 1 + breath, 1 + breath * 0.7);
        }

        // Head tracking
        if (char.head) {
          const headTurnX = Math.sin(time * 0.9) * 0.04 + mouse.x * 0.14;
          const headTurnY = Math.cos(time * 0.7) * 0.03 + mouse.y * 0.08;
          char.head.rotation.y = headTurnX;
          char.head.rotation.x = -headTurnY;
        }

        // Sitting dangling leg micro-motion
        if (char.type === "sitting" && char.rightLeg) {
          char.rightLeg.rotation.x = 1.36 + Math.sin(time * 1.2) * 0.018;
        }
        if (char.type === "standing") {
          char.group.position.y = char.baseY + Math.sin(time * 1.8) * 0.004;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <footer className="relative w-full bg-[#08080A] text-white font-sans select-none overflow-hidden pt-16 sm:pt-24 pb-12 sm:pb-16 border-t border-[#1C1C20]">
      
      {/* ═══ 1. ASYMMETRIC MONOCHROME STUDIO BACKGROUND & GRAIN ═══ */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 95% 85% at 30% 15%, #18181D 0%, #0E0E11 45%, #050507 90%)",
        }}
      />

      {/* Atmospheric Charcoal Blooms */}
      <div className="absolute top-10 left-10 w-[550px] h-[400px] rounded-full blur-[160px] pointer-events-none opacity-20 bg-[#27272A]" />
      <div className="absolute bottom-20 right-10 w-[600px] h-[450px] rounded-full blur-[180px] pointer-events-none opacity-15 bg-[#3F3F46]" />

      {/* Fine-Grain Tactile Texture Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Dot Matrix Accent (Top-Right) */}
      <div className="absolute top-8 right-8 sm:right-16 grid grid-cols-6 gap-2.5 opacity-20 pointer-events-none">
        {Array.from({ length: 24 }).map((_, i) => (
          <div key={i} className="w-1.5 h-1.5 rounded-full bg-white" />
        ))}
      </div>

      {/* ═══ 2. OVERSIZED ARCHITECTURAL WEAVLY WORDMARK (BEHIND CARD) ═══ */}
      <div className="absolute -bottom-10 left-0 right-0 w-full overflow-hidden select-none pointer-events-none leading-none text-center z-0 opacity-40">
        <span
          style={{
            fontFamily: "'Mochiy Pop One', cursive, sans-serif",
            fontSize: "clamp(4rem, 20vw, 380px)",
            lineHeight: 0.75,
            letterSpacing: "-0.04em",
          }}
          className="block w-full text-center bg-gradient-to-b from-white/[0.09] via-white/[0.02] to-transparent bg-clip-text text-transparent transform translate-y-[15%]"
        >
          {branding.name}
        </span>
      </div>

      {/* ═══ 3. MAIN COMPOSITION: EDITORIAL HEADLINE + FLOATING WHITE CARD ═══ */}
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-8 lg:px-12 flex flex-col gap-10">
        
        {/* Left Editorial Headline & Subtitle Outside the Card */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pt-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#18181D]/90 border border-[#27272A] text-[#E4E4E7] text-[11px] font-semibold uppercase tracking-[0.25em]">
              <Sparkles size={11} className="text-white" />
              <span>Weavly Atelier • 2026 Collection</span>
            </div>
            
            <h2 
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
                letterSpacing: "-0.04em",
              }}
              className="text-4xl sm:text-6xl lg:text-[68px] font-black uppercase text-white tracking-tight leading-[0.98]"
            >
              Details <br />
              <span className="text-[#A1A1AA]">that matter.</span>
            </h2>

            <div className="pt-2 max-w-sm space-y-2">
              <p className="text-xs sm:text-[13px] text-[#A1A1AA] leading-relaxed font-normal">
                Clean. Functional. Curated for effortless sartorial connection.
              </p>
              <div className="w-12 h-[2px] bg-white" />
            </div>
          </div>
        </div>

        {/* ═══ 4. LARGE FLOATING ROUNDED WHITE CONTENT PANEL (INTERACTIVE 3D CHARACTERS) ═══ */}
        <div className="relative w-full bg-white text-[#18181B] rounded-[32px] sm:rounded-[44px] shadow-[0_35px_90px_rgba(0,0,0,0.6)] border border-white/20 p-8 sm:p-12 lg:p-14 overflow-visible">
          
          {/* ═══ 3D WEBGL OVERLAY: CHARACTER SITTING ON LEDGE & STANDING ═══ */}
          <div
            ref={threeContainerRef}
            className="absolute -top-[140px] sm:-top-[170px] lg:-top-[200px] right-[-10px] sm:right-[10px] lg:right-[30px] w-[260px] sm:w-[380px] lg:w-[460px] h-[360px] sm:h-[480px] lg:h-[540px] pointer-events-none z-30 select-none overflow-visible"
          >
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain pointer-events-auto cursor-grab active:cursor-grabbing"
            />
          </div>

          {/* TOP ROW: Logo & Bio (Left) + VIP Newsletter Dispatch (Middle) + Right Column Space for 3D Character */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative z-10 pr-0 lg:pr-80">
            
            {/* LEFT: Branding */}
            <div className="lg:col-span-5 space-y-4">
              <div
                onClick={() => handleLinkClick("/")}
                className="inline-flex items-center gap-2 cursor-pointer p-0 select-none hover:opacity-90 transition-opacity"
                role="button"
                tabIndex={0}
              >
                <WeavlyLogo size="md" showBeta={true} allBlack={true} onBetaClick={onBetaClick} />
              </div>

              <p className="text-[13px] sm:text-[14px] text-[#52525B] leading-relaxed max-w-sm font-normal">
                {branding.description || "The next-generation curated fashion marketplace connecting visionary independent designers with discerning collectors worldwide."}
              </p>
            </div>

            {/* MIDDLE: VIP Newsletter */}
            <div className="lg:col-span-7 space-y-3 max-w-sm">
              <h4 className="text-[14px] sm:text-[15px] font-bold text-black tracking-tight leading-snug">
                Subscribe to our atelier dispatch to get early access to limited collections
              </h4>

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full sm:flex-1 px-4 py-2.5 rounded-full bg-[#F4F4F6] border border-[#E4E4E7] text-black placeholder:text-[#A1A1AA] text-xs focus:outline-none focus:border-black transition-colors"
                />
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-black text-white text-[11px] font-bold uppercase tracking-wider hover:bg-[#27272A] active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                >
                  {subscribed ? (
                    <>
                      <Check size={12} className="text-white" />
                      <span>Subscribed</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe</span>
                      <ArrowRight size={12} />
                    </>
                  )}
                </button>
              </form>

              <p className="text-[11px] text-[#71717A]">
                You will be able to unsubscribe at any time. Read our{" "}
                <span onClick={() => handleLinkClick("/privacy")} className="text-black font-semibold underline cursor-pointer">
                  policy here
                </span>.
              </p>
            </div>

          </div>

          {/* DIVIDER LINE */}
          <div className="w-full h-[1px] bg-[#E4E4E7] my-8 sm:my-10 relative z-10" />

          {/* 4 MULTI-COLUMN NAVIGATION LINKS */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 sm:gap-6 text-xs relative z-10">
            
            {/* Column 1: PRODUCT */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]">
                Product
              </h4>
              <ul className="space-y-2 font-medium p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/market")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    All Products
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/men")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Men's Sartorial
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/women")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Women's Atelier
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/unisex")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Unisex Drops
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/new-arrivals")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    New Arrivals
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 2: ATELIER */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]">
                Atelier
              </h4>
              <ul className="space-y-2 font-medium p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/designers")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Discover Designers
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designs")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Creator Lookbooks
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/custom-design")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Commission Garment
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/designer-studio")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Designer Studio
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/become-designer")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Become a Designer
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: WARDROBE */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]">
                Wardrobe
              </h4>
              <ul className="space-y-2 font-medium p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/wardrobe")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left flex items-center gap-1.5 text-xs group">
                    <Sparkles size={11} className="text-black group-hover:scale-125 transition-transform" />
                    <span>Zyra Wardrobe</span>
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/account")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    My Account
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/orders")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/bag")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Shopping Bag
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: POLICIES */}
            <div className="space-y-3.5">
              <h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#18181B]">
                Policies
              </h4>
              <ul className="space-y-2 font-medium p-0 m-0 list-none text-xs">
                <li>
                  <button onClick={() => handleLinkClick("/privacy")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/terms")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Terms of Service
                  </button>
                </li>
                <li>
                  <button onClick={() => handleLinkClick("/faq")} className="text-[#52525B] hover:text-black hover:translate-x-1 transition-all duration-200 border-none bg-transparent cursor-pointer p-0 text-left block text-xs">
                    Help & FAQs
                  </button>
                </li>
                <li>
                  <span className="text-[#71717A] text-xs flex items-center gap-1.5 pt-0.5">
                    <ShieldCheck size={12} className="text-black" />
                    <span>Verified Atelier</span>
                  </span>
                </li>
              </ul>
            </div>

          </div>

          {/* BOTTOM BAR INSIDE THE WHITE PANEL */}
          <div className="pt-8 mt-10 border-t border-[#E4E4E7] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#71717A] relative z-10">
            
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Language Selector */}
              <button
                onClick={() => {}}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F4F4F6] hover:bg-[#E4E4E7] border border-[#E4E4E7] text-[#18181B] text-[11px] font-medium transition-colors cursor-pointer"
              >
                <Globe size={12} className="text-[#52525B]" />
                <span>English (US)</span>
                <span className="text-[9px] text-[#71717A]">▾</span>
              </button>

              <button onClick={() => handleLinkClick("/privacy")} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-[#71717A]">
                Privacy Policy
              </button>
              <button onClick={() => handleLinkClick("/terms")} className="hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0 text-xs text-[#71717A]">
                Terms of Service
              </button>
            </div>

            <div className="flex items-center gap-6">
              <span>&copy; {currentYear} {branding.name}. All rights reserved.</span>

              <button
                onClick={scrollToTop}
                className="flex items-center gap-1 text-[#18181B] hover:text-black transition-colors border-none bg-transparent cursor-pointer p-0 font-medium group"
              >
                <span>Back to top</span>
                <ArrowUp size={12} className="group-hover:-translate-y-0.5 transition-transform duration-200" />
              </button>
            </div>

          </div>

        </div>

      </div>

    </footer>
  );
}
