"use client";

// src/modules/onboarding/pages/OnboardingPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// WEAVLY FASHION INTELLIGENCE & PERSONALIZATION ONBOARDING
// • Art-directed editorial fashion magazine aesthetic
// • Asymmetrical layouts, bold oversized typography & organic framing
// • 7-Step Fashion Identity Calibration:
//   Intro → Style Identity → Fit & Silhouette → Fashion Preferences →
//   Visual Style Discovery → Zyra AI Profile Creation → Personalized Style Result
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  SlidersHorizontal,
  ChevronRight,
  User,
  Ruler,
  Palette,
  Compass,
  Layers,
  Heart,
  ShieldCheck,
  RotateCcw,
  Code2,
  Scissors
} from "lucide-react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { saveFitData, getFitData } from "@/modules/profile/services/userFitDataService";
import { updateProfile } from "@/modules/profile/services/userService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import Stepper, { Step } from "@/shared/components/ui/Stepper";
import DeveloperJoinModal from "../components/DeveloperJoinModal";

// ── Editorial Look References for Visual Style Discovery (Step 4) ────────────
const STYLE_DISCOVERY_LOOKS = [
  {
    id: "look-1",
    title: "Architectural Tailoring",
    aesthetic: "Modern Minimalist",
    tags: ["#CleanLines", "#Structured", "#Neutral"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    desc: "Precision double-breasted outerwear with relaxed straight trousers."
  },
  {
    id: "look-2",
    title: "Elevated Urban Street",
    aesthetic: "Contemporary Streetwear",
    tags: ["#DropShoulder", "#Oversized", "#Relaxed"],
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80",
    desc: "Heavyweight drop-shoulder knitwear layered over tailored cargos."
  },
  {
    id: "look-3",
    title: "Sartorial Silk & Flannel",
    aesthetic: "Quiet Luxury",
    tags: ["#NaturalFibers", "#Draped", "#Monochrome"],
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    desc: "Fluid drape, monochromatic tonality, and high-gauge silk blends."
  },
  {
    id: "look-4",
    title: "Deconstructed Classic",
    aesthetic: "Neo-Sartorial",
    tags: ["#TexturedWool", "#HighWaisted", "#Designer"],
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    desc: "Classic tailoring reworked with modern asymmetrical cuts."
  },
  {
    id: "look-5",
    title: "Casual Raw Minimal",
    aesthetic: "Effortless Studio",
    tags: ["#Linen", "#EarthTones", "#CleanCut"],
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
    desc: "Raw textures paired with relaxed garment-dyed cottons."
  },
  {
    id: "look-6",
    title: "Sculptural Avant-Garde",
    aesthetic: "Experimental Designer",
    tags: ["#Asymmetrical", "#Sculpted", "#Bold"],
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80",
    desc: "Voluminous geometric silhouettes designed for statement occasions."
  }
];

// ── Style Identity Visual Options (Step 1) ──────────────────────────────────
const STYLE_OPTIONS = [
  { id: "Minimal", label: "Minimalist", mood: "Clean lines · Monochromatic · Uncluttered" },
  { id: "Streetwear", label: "Streetwear", mood: "Drop shoulders · Graphic · High-top sneakers" },
  { id: "Classic", label: "Classic Sartorial", mood: "Structured blazers · Crisp collars · Timeless" },
  { id: "Contemporary", label: "Contemporary", mood: "Modern silhouette · Balanced drape · Modernist" },
  { id: "Luxury", label: "Quiet Luxury", mood: "Mulberry silk · Cashmere · Tactile textures" },
  { id: "Casual", label: "Casual Relaxed", mood: "Garment-dyed cottons · Breathable · Everyday" },
  { id: "Experimental", label: "Experimental", mood: "Avant-garde geometry · Bold proportions" },
  { id: "Athleisure", label: "Athletic Chic", mood: "Technical fabrics · Dynamic movement" }
];

// ── Fit & Silhouette Options (Step 2) ───────────────────────────────────────
const FIT_OPTIONS = [
  { id: "Relaxed", label: "Relaxed Fit", desc: "Easy drape with natural movement across chest & thighs." },
  { id: "Regular", label: "Regular Fit", desc: "Classic tailored proportion, true to standard silhouette." },
  { id: "Slim", label: "Slim Fit", desc: "Tapered contours that closely trace your natural profile." },
  { id: "Oversized", label: "Oversized Fit", desc: "Exaggerated drop-shoulder with voluminous, boxy cut." }
];

// ── Wardrobe Categories (Step 3) ───────────────────────────────────────────
const CATEGORY_OPTIONS = [
  { id: "Shirts", label: "Shirts & Blouses" },
  { id: "Trousers / Chinos", label: "Trousers & Tailoring" },
  { id: "Jackets / Outerwear", label: "Jackets & Coats" },
  { id: "Dresses", label: "Dresses & Gowns" },
  { id: "Knitwear / Sweaters", label: "Knitwear & Cashmere" },
  { id: "T-shirts", label: "Luxury T-Shirts" },
  { id: "Jeans", label: "Denim & Casuals" },
  { id: "Suits / Blazers", label: "Sartorial Blazers" }
];

// ── Palette Direction Options (Step 3) ──────────────────────────────────────
const PALETTE_OPTIONS = [
  { id: "Monochrome", label: "Monochrome", swatches: ["#000000", "#4B5563", "#FFFFFF"], desc: "Black, Charcoal & Crisp White" },
  { id: "Earth Tones", label: "Earth Tones", swatches: ["#78350F", "#556B2F", "#D2B48C"], desc: "Terracotta, Olive & Warm Sand" },
  { id: "Warm Neutrals", label: "Warm Neutrals", swatches: ["#F5EFEB", "#D4C5B9", "#8E9F8E"], desc: "Oatmeal, Cream & Soft Khaki" },
  { id: "Pastel Hues", label: "Pastel Hues", swatches: ["#93C5FD", "#FBCFE8", "#E9D5FF"], desc: "Sage, Sky Blue & Soft Lilac" },
  { id: "Jewel Tones", label: "Jewel Tones", swatches: ["#1B4D3E", "#1E3A8A", "#800020"], desc: "Emerald, Sapphire & Deep Burgundy" },
  { id: "Bold & Graphic", label: "Bold & High-Contrast", swatches: ["#DC2626", "#000000", "#F59E0B"], desc: "Electric Crimson & Deep Inks" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();

  // ── Step State: 0 = Intro, 1 = Style, 2 = Fit, 3 = Preferences, 4 = Visual Discovery, 5 = Zyra Processing, 6 = Result
  const [step, setStep] = useState(0);
  const [isDevModalOpen, setIsDevModalOpen] = useState(false);

  // ── Form State ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    gender: "FEMALE",
    displayName: user?.name || user?.displayName || "",
    preferredStyles: ["Minimal", "Contemporary"],
    fitPreferences: ["Relaxed"],
    heightRange: "170–179 cm",
    clothingSize: "M",
    preferredClothingTypes: ["Shirts", "Trousers / Chinos", "Jackets / Outerwear"],
    preferredPalette: "Warm Neutrals",
    occasions: ["Everyday / Casual", "Work / Office"],
    selectedLooks: ["look-1", "look-3"]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [activeAnalysisStage, setActiveAnalysisStage] = useState(0);

  // Load existing fit data if available
  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        if (user) {
          const res = await getFitData();
          if (res?.data && mounted) {
            const fit = res.data;
            setFormData((prev) => ({
              ...prev,
              gender: fit.gender || prev.gender,
              displayName: user.name || user.displayName || prev.displayName,
              preferredStyles: fit.preferredStyles?.length ? fit.preferredStyles : prev.preferredStyles,
              fitPreferences: fit.fitPreferences?.length ? fit.fitPreferences : prev.fitPreferences,
              heightRange: fit.heightRange || prev.heightRange,
              clothingSize: fit.clothingSize || prev.clothingSize,
              preferredClothingTypes: fit.preferredClothingTypes?.length ? fit.preferredClothingTypes : prev.preferredClothingTypes,
              occasions: fit.occasions?.length ? fit.occasions : prev.occasions
            }));
          }
        }
      } catch (e) {
        // Guest mode fallback
      }
    };
    loadData();
    return () => { mounted = false; };
  }, [user]);

  // ── Helper to toggle multi-select items ─────────────────────────────────────
  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        if (current.length === 1) return prev; // Keep at least one
        return { ...prev, [field]: current.filter((x) => x !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  // ── Step Navigation ────────────────────────────────────────────────────────
  const nextStep = () => {
    setErrorMsg("");
    if (step === 4) {
      // Transition into Zyra AI Processing Step 5
      setStep(5);
      startZyraAnalysis();
    } else if (step < 6) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const prevStep = () => {
    setErrorMsg("");
    if (step > 0) {
      setStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Zyra AI Simulated Vector Analysis ──────────────────────────────────────
  const startZyraAnalysis = () => {
    setAnalysisProgress(0);
    setActiveAnalysisStage(0);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinalSave();
          return 100;
        }
        if (prev === 25) setActiveAnalysisStage(1);
        if (prev === 55) setActiveAnalysisStage(2);
        if (prev === 85) setActiveAnalysisStage(3);
        return prev + 5;
      });
    }, 100);
  };

  // ── Final Save & Sync ──────────────────────────────────────────────────────
  const handleFinalSave = async () => {
    setIsSubmitting(true);
    try {
      if (user) {
        const canonicalGender = formData.gender === "MALE" || formData.gender === "Men"
          ? "MALE"
          : formData.gender === "FEMALE" || formData.gender === "Women"
            ? "FEMALE"
            : "OTHER";

        // 1. Explicitly persist gender to UserProfile
        try {
          await updateProfile({ gender: canonicalGender });
        } catch (profErr) {
          console.warn("Profile gender update notice:", profErr);
        }

        const fitPayload = {
          gender: canonicalGender,
          heightRange: formData.heightRange,
          clothingSize: formData.clothingSize,
          fitPreferences: formData.fitPreferences,
          preferredStyles: formData.preferredStyles,
          preferredClothingTypes: formData.preferredClothingTypes,
          occasions: formData.occasions,
          primaryOccasion: formData.occasions[0] || "Everyday / Casual",
          profileCompleted: true
        };
        await saveFitData(fitPayload);
        await refreshUser();

        // 3. Emit notification for active UI listeners
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("weavly:profileUpdated"));
          window.dispatchEvent(new CustomEvent("weavly:fitDataUpdated"));
        }
      }
    } catch (err) {
      console.warn("Notice: Local profile persisted without remote sync:", err);
    } finally {
      setIsSubmitting(false);
      setStep(6); // Show Profile Result Step
    }
  };

  const handleFinishOnboarding = () => {
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-[#E5EAE5] text-[#111827] font-sans selection:bg-black selection:text-white flex flex-col justify-between">
      
      {/* ─── TOP EDITORIAL HEADER ─── */}
      <header className="w-full h-20 px-6 sm:px-12 border-b border-[#D2D8D2] flex items-center justify-between bg-[#E5EAE5] sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <WeavlyLogo />
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase tracking-[0.25em] text-[#4B5563] border-l border-[#D2D8D2] pl-6">
            Fashion Intelligence Calibration
          </span>
        </div>

        {/* Step Progress Dots (Steps 1 to 4) */}
        {step > 0 && step < 5 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#4B5563] mr-2">
              STEP 0{step} / 04
            </span>
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  s === step ? "w-8 bg-black" : s < step ? "w-3 bg-black/60" : "w-3 bg-[#C8D0C8]"
                }`}
              />
            ))}
          </div>
        )}

        {/* Skip & Developer options on Intro */}
        {step === 0 && (
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setIsDevModalOpen(true)}
              className="text-xs font-bold uppercase tracking-wider text-[#111827] hover:underline flex items-center gap-1.5 cursor-pointer bg-transparent border-none p-0"
            >
              <Code2 size={13} />
              <span>Join as Developer</span>
            </button>
            <button
              onClick={() => router.push("/")}
              className="text-xs font-bold uppercase tracking-wider text-[#4B5563] hover:text-black transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              Skip for now →
            </button>
          </div>
        )}
      </header>

      {/* ─── MAIN ONBOARDING WORKSPACE ─── */}
      <main className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-10 max-w-7xl mx-auto w-full">

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 0: INTRO SCREEN (Asymmetrical Editorial Fashion Magazine Hero)
            ═══════════════════════════════════════════════════════════════════ */}
        {step === 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Bold Editorial Typography & CTA */}
            <div className="lg:col-span-6 space-y-8">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 bg-[#DCE2DC] border border-[#CCD4CC] px-3.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#111827]">
                  <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
                  <span>YOUR STYLE. REIMAGINED.</span>
                </div>

                <h1 className="text-5xl sm:text-7xl lg:text-[80px] font-extrabold uppercase tracking-tight text-[#111827] leading-[0.92]">
                  Discover<br />
                  fashion<br />
                  made for you.
                </h1>

                <p className="text-base sm:text-lg text-[#4B5563] leading-relaxed max-w-lg font-medium pt-2">
                  Weavly learns your silhouette, aesthetic preferences, and style identity to assemble bespoke collections that actually fit your body and vision.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  onClick={() => setStep(1)}
                  className="bg-black hover:bg-neutral-800 text-white px-8 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center gap-2.5"
                >
                  <span>Build My Style</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => setIsDevModalOpen(true)}
                  className="bg-white hover:bg-[#111827] hover:text-white text-[#111827] px-6 py-4 text-xs font-bold uppercase tracking-wider border border-[#111827] transition-all cursor-pointer shadow-2xs flex items-center gap-2"
                >
                  <Code2 size={14} />
                  <span>Join as Developer</span>
                </button>

                <button
                  type="button"
                  onClick={() => router.push("/become-designer")}
                  className="bg-[#DCE2DC] hover:bg-white text-[#111827] px-6 py-4 text-xs font-bold uppercase tracking-wider border border-[#CCD4CC] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Scissors size={14} />
                  <span>Join as Designer</span>
                </button>

                <button
                  onClick={() => router.push("/")}
                  className="text-xs font-bold uppercase tracking-wider text-[#4B5563] hover:text-[#111827] px-3 py-4 transition-colors cursor-pointer bg-transparent border-none"
                >
                  Skip for now
                </button>
              </div>

              {/* Editorial Guarantee Indicator */}
              <div className="pt-6 border-t border-[#D2D8D2] flex items-center gap-8 text-[11px] font-bold uppercase tracking-wider text-[#4B5563]">
                <span>✦ 3D Vector Fitting</span>
                <span>✦ Non-Clinical Profiling</span>
                <span>✦ 100% Escrow Protected</span>
              </div>
            </div>

            {/* Right Column: Asymmetrical Editorial Photography with Organic Framing */}
            <div className="lg:col-span-6 relative">
              <div className="grid grid-cols-2 gap-4 relative">
                
                {/* Image 1: Main Arch/Organic Frame */}
                <div className="aspect-[3/4] bg-[#DCE2DC] rounded-t-full overflow-hidden border border-[#CCD4CC] shadow-sm relative group">
                  <img
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&q=80"
                    alt="Editorial Model"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 bg-[#183B56] text-white text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1">
                    BESPOKE DESIGNER
                  </div>
                </div>

                {/* Image 2: Secondary Editorial Silhouette */}
                <div className="aspect-[3/4] bg-[#DCE2DC] rounded-b-full overflow-hidden border border-[#CCD4CC] shadow-sm relative group mt-8">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80"
                    alt="Editorial Fashion"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 bg-white text-black text-[9px] font-mono font-bold uppercase tracking-widest px-2.5 py-1 border border-black/10">
                    MADE-TO-MEASURE
                  </div>
                </div>

                {/* Circular Rotating Fashion Badge (From Reference Inspiration) */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-black text-white border-2 border-[#E5EAE5] flex items-center justify-center shadow-lg z-20 pointer-events-none">
                  <div className="text-center font-mono text-[9px] font-extrabold uppercase tracking-widest leading-tight">
                    ✦ WEAVLY ✦<br />ZYRA STYLIST
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEPS 1–4: INTEGRATED STEPPER FORM
            ═══════════════════════════════════════════════════════════════════ */}
        {step >= 1 && step <= 4 && (
          <div className="max-w-5xl mx-auto w-full">
            <Stepper
              initialStep={step}
              onStepChange={(newStep) => {
                setStep(newStep);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              onFinalStepCompleted={() => {
                setStep(5);
                startZyraAnalysis();
              }}
              onBackToStart={() => {
                setStep(0);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              backButtonText="Back"
              nextButtonText="Continue"
              className="w-full"
            >
              {/* ── STEP 1: STYLE IDENTITY ── */}
              <Step>
                <div className="space-y-8 p-1 sm:p-3">
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#DFE7ED] px-2.5 py-1 inline-block border border-[#183B56]/20">
                      01. STYLE IDENTITY
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
                      How would you describe your style?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A7184] font-medium max-w-xl">
                      Select one or more fashion aesthetics that reflect how you dress or aspire to dress.
                    </p>
                  </div>

                  {/* Visual Choice Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    {STYLE_OPTIONS.map((style) => {
                      const isSelected = formData.preferredStyles.includes(style.id);
                      return (
                        <div
                          key={style.id}
                          onClick={() => toggleArrayItem("preferredStyles", style.id)}
                          className={`p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[150px] relative ${
                            isSelected
                              ? "bg-[#183B56] text-white border-[#183B56] shadow-sm scale-[1.01]"
                              : "bg-[#F5EFEB]/50 text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-70">
                              {isSelected ? "SELECTED" : "AESTHETIC"}
                            </span>
                            <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                              isSelected ? "bg-white border-white text-[#183B56]" : "border-[#183B56]/40"
                            }`}>
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                          </div>

                          <div className="space-y-1 mt-3">
                            <h3 className="text-base font-bold uppercase tracking-tight">{style.label}</h3>
                            <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? "text-[#DFE7ED]" : "text-[#5A7184]"}`}>
                              {style.mood}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Gender Expression Filter */}
                  <div className="pt-5 border-t border-[#183B56]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold uppercase text-[#183B56] block">Primary Collection</span>
                      <span className="text-[11px] text-[#5A7184]">Explicitly conditions Zyra catalog and sizing intelligence.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {[
                        { id: "FEMALE", label: "Women" },
                        { id: "MALE", label: "Men" },
                        { id: "OTHER", label: "Unisex / All" }
                      ].map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, gender: g.id })}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                            formData.gender === g.id
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56]"
                          }`}
                        >
                          {g.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Step>

              {/* ── STEP 2: SILHOUETTE & FIT ── */}
              <Step>
                <div className="space-y-8 p-1 sm:p-3">
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#DFE7ED] px-2.5 py-1 inline-block border border-[#183B56]/20">
                      02. SILHOUETTE &amp; FIT
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
                      How do you like your clothes to fit?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A7184] font-medium max-w-xl">
                      We calibrate garment drape and tolerances according to your preferred comfort.
                    </p>
                  </div>

                  {/* 4 Silhouette Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                    {FIT_OPTIONS.map((fit) => {
                      const isSelected = formData.fitPreferences.includes(fit.id);
                      return (
                        <div
                          key={fit.id}
                          onClick={() => setFormData({ ...formData, fitPreferences: [fit.id] })}
                          className={`p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] ${
                            isSelected
                              ? "bg-[#183B56] text-white border-[#183B56] shadow-sm scale-[1.01]"
                              : "bg-[#F5EFEB]/50 text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-white"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider opacity-70">
                              DRAPE
                            </span>
                            <div className={`w-4.5 h-4.5 rounded-full border flex items-center justify-center ${
                              isSelected ? "bg-white border-white text-[#183B56]" : "border-[#183B56]/40"
                            }`}>
                              {isSelected && <Check size={11} strokeWidth={3} />}
                            </div>
                          </div>

                          <div className="space-y-1.5 mt-3">
                            <h3 className="text-base font-bold uppercase tracking-tight">{fit.label}</h3>
                            <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? "text-[#DFE7ED]" : "text-[#5A7184]"}`}>
                              {fit.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Height & Standard Size Profile Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-5 border-t border-[#183B56]/20">
                    <div className="bg-[#F5EFEB]/40 p-5 border border-[#183B56]/30 space-y-3">
                      <span className="text-xs font-bold uppercase text-[#183B56] block">Approximate Height</span>
                      <div className="grid grid-cols-3 gap-2">
                        {["Under 160 cm", "160–169 cm", "170–179 cm", "180–189 cm", "190+ cm"].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => setFormData({ ...formData, heightRange: h })}
                            className={`py-2 px-2 text-[10px] font-bold uppercase tracking-wider transition-all border ${
                              formData.heightRange === h
                                ? "bg-[#183B56] text-white border-[#183B56]"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56]"
                            }`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#F5EFEB]/40 p-5 border border-[#183B56]/30 space-y-3">
                      <span className="text-xs font-bold uppercase text-[#183B56] block">Typical Size</span>
                      <div className="flex flex-wrap gap-2">
                        {["XS", "S", "M", "L", "XL", "XXL", "BESPOKE"].map((sz) => (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => setFormData({ ...formData, clothingSize: sz })}
                            className={`w-12 h-9 text-xs font-bold uppercase transition-all border flex items-center justify-center ${
                              formData.clothingSize === sz
                                ? "bg-[#183B56] text-white border-[#183B56]"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56]"
                            }`}
                          >
                            {sz}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Step>

              {/* ── STEP 3: WARDROBE PREFERENCES ── */}
              <Step>
                <div className="space-y-8 p-1 sm:p-3">
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#DFE7ED] px-2.5 py-1 inline-block border border-[#183B56]/20">
                      03. WARDROBE PREFERENCES
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
                      What do you love wearing?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A7184] font-medium max-w-xl">
                      Choose the pieces you wear most frequently, plus your signature color direction.
                    </p>
                  </div>

                  {/* Category Preferences */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#183B56] block">
                      Favorite Categories (Select All That Apply)
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {CATEGORY_OPTIONS.map((cat) => {
                        const isSelected = formData.preferredClothingTypes.includes(cat.id);
                        return (
                          <div
                            key={cat.id}
                            onClick={() => toggleArrayItem("preferredClothingTypes", cat.id)}
                            className={`p-3.5 border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-xs font-bold"
                                : "bg-[#F5EFEB]/50 text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-white font-medium"
                            }`}
                          >
                            <span className="text-xs uppercase">{cat.label}</span>
                            {isSelected && <Check size={13} />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Color Palette Direction */}
                  <div className="space-y-3 pt-5 border-t border-[#183B56]/20">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#183B56] block">
                      Color Palette Direction
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
                      {PALETTE_OPTIONS.map((pal) => {
                        const isSelected = formData.preferredPalette === pal.id;
                        return (
                          <div
                            key={pal.id}
                            onClick={() => setFormData({ ...formData, preferredPalette: pal.id })}
                            className={`p-4 border transition-all cursor-pointer space-y-2.5 ${
                              isSelected
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-sm scale-[1.01]"
                                : "bg-[#F5EFEB]/50 text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-white"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold uppercase">{pal.label}</span>
                              <div className="flex items-center gap-1.5">
                                {pal.swatches.map((c, i) => (
                                  <span
                                    key={i}
                                    className="w-3.5 h-3.5 rounded-full border border-black/20"
                                    style={{ backgroundColor: c }}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className={`text-[11px] leading-relaxed font-medium ${isSelected ? "text-[#DFE7ED]" : "text-[#5A7184]"}`}>
                              {pal.desc}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Step>

              {/* ── STEP 4: VISUAL STYLE DISCOVERY ── */}
              <Step>
                <div className="space-y-8 p-1 sm:p-3">
                  <div className="space-y-2 text-center sm:text-left">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#DFE7ED] px-2.5 py-1 inline-block border border-[#183B56]/20">
                      04. VISUAL STYLE DISCOVERY
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
                      Which looks feel most like you?
                    </h2>
                    <p className="text-xs sm:text-sm text-[#5A7184] font-medium max-w-xl">
                      Select visual inspirations. Zyra uses these compositions to extract silhouette and aesthetic vector signals.
                    </p>
                  </div>

                  {/* 6 Editorial Look Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {STYLE_DISCOVERY_LOOKS.map((look) => {
                      const isSelected = formData.selectedLooks.includes(look.id);
                      return (
                        <div
                          key={look.id}
                          onClick={() => toggleArrayItem("selectedLooks", look.id)}
                          className={`bg-white border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col justify-between group ${
                            isSelected
                              ? "border-[#183B56] shadow-md ring-2 ring-[#183B56]"
                              : "border-[#183B56]/30 hover:border-[#183B56] shadow-xs"
                          }`}
                        >
                          {/* Look Image with Status Badge */}
                          <div className="relative aspect-[4/3] sm:aspect-[3/4] bg-[#DFE7ED] overflow-hidden">
                            <img
                              src={look.image}
                              alt={look.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1">
                              {look.tags.map((t) => (
                                <span key={t} className="bg-[#183B56]/90 text-white text-[9px] font-mono font-bold px-2 py-0.5">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className={`absolute top-2.5 right-2.5 w-5 h-5 rounded-full border flex items-center justify-center ${
                              isSelected ? "bg-[#183B56] text-white border-[#183B56]" : "bg-white/95 text-[#183B56] border-[#183B56]/30"
                            }`}>
                              {isSelected && <Check size={12} strokeWidth={3} />}
                            </div>
                          </div>

                          {/* Description Strip */}
                          <div className={`p-3.5 border-t transition-colors ${
                            isSelected ? "bg-[#183B56] text-white border-[#183B56]" : "bg-[#F5EFEB]/40 text-[#183B56] border-[#183B56]/20"
                          }`}>
                            <span className="text-[9px] font-mono font-bold uppercase opacity-70 block">
                              {look.aesthetic}
                            </span>
                            <h4 className="text-xs font-bold uppercase tracking-tight mt-0.5">{look.title}</h4>
                            <p className={`text-[11px] font-medium leading-relaxed mt-1 ${isSelected ? "text-[#DFE7ED]" : "text-[#5A7184]"}`}>
                              {look.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Step>
            </Stepper>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 5: ZYRA AI PROFILE CREATION (Smooth Transition & Vector Progress)
            ═══════════════════════════════════════════════════════════════════ */}
        {step === 5 && (
          <div className="max-w-xl mx-auto w-full text-center space-y-10 py-12">
            
            {/* Animated Zyra Emblem */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 bg-black/5 rounded-full animate-ping" />
              <div className="w-28 h-28 rounded-full bg-black text-white flex items-center justify-center shadow-xl border-2 border-black">
                <Sparkles size={40} className="animate-spin text-white" style={{ animationDuration: '6s' }} />
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[11px] font-mono font-bold uppercase tracking-[0.25em] text-[#4B5563] bg-[#DCE2DC] px-3 py-1 inline-block">
                ZYRA STYLIST ENGINE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111827]">
                Synthesizing Your Style Identity
              </h2>
              <p className="text-sm text-[#4B5563] font-medium max-w-md mx-auto">
                Zyra is constructing your 3D dimensional vector, matching color harmonies, and indexing bespoke atelier collections.
              </p>
            </div>

            {/* Progress Bar & Stage Notes */}
            <div className="space-y-4 max-w-md mx-auto bg-white p-6 border border-[#D2D8D2] shadow-xs text-left">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-[#111827]">
                <span>CALIBRATION PROGRESS</span>
                <span>{analysisProgress}%</span>
              </div>
              <div className="w-full bg-[#E5EAE5] h-2 overflow-hidden">
                <div
                  className="bg-black h-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>

              {/* Status checklist */}
              <div className="space-y-2 pt-2 text-[11px] font-medium text-[#4B5563]">
                <div className={`flex items-center gap-2 ${activeAnalysisStage >= 0 ? "text-black font-bold" : "opacity-40"}`}>
                  <Check size={13} />
                  <span>Silhouette tolerances &amp; drape parameters mapped</span>
                </div>
                <div className={`flex items-center gap-2 ${activeAnalysisStage >= 1 ? "text-black font-bold" : "opacity-40"}`}>
                  <Check size={13} />
                  <span>Color palette &amp; tone affinity calibrated</span>
                </div>
                <div className={`flex items-center gap-2 ${activeAnalysisStage >= 2 ? "text-black font-bold" : "opacity-40"}`}>
                  <Check size={13} />
                  <span>Visual lookbook mood vector indexed</span>
                </div>
                <div className={`flex items-center gap-2 ${activeAnalysisStage >= 3 ? "text-black font-bold" : "opacity-40"}`}>
                  <Check size={13} />
                  <span>Personalized Weavly Fashion Profile generated</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            STEP 6: YOUR WEAVLY STYLE PROFILE (Calibrated Result Screen)
            ═══════════════════════════════════════════════════════════════════ */}
        {step === 6 && (
          <div className="max-w-4xl mx-auto w-full space-y-12 py-6">
            
            {/* Celebration Header */}
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-[#DCE2DC] border border-[#CCD4CC] px-3.5 py-1.5 text-[11px] font-mono font-bold uppercase tracking-[0.2em] text-[#111827]">
                <Sparkles size={12} />
                <span>CALIBRATION COMPLETE</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-extrabold uppercase tracking-tight text-[#111827]">
                Your Fashion Blueprint
              </h2>
              <p className="text-sm sm:text-base text-[#4B5563] font-medium max-w-lg mx-auto">
                Zyra has calibrated your unique fashion profile. Here is your style signature:
              </p>
            </div>

            {/* Profile Blueprint Card */}
            <div className="bg-white border border-[#D2D8D2] p-8 sm:p-12 shadow-sm space-y-8">
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pb-8 border-b border-[#D2D8D2]">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563]">PRIMARY AESTHETIC</span>
                  <p className="text-xl font-extrabold uppercase text-[#111827]">
                    {formData.preferredStyles.join(" & ") || "Contemporary Minimal"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563]">SILHOUETTE DRAPE</span>
                  <p className="text-xl font-extrabold uppercase text-[#111827]">
                    {formData.fitPreferences[0] || "Relaxed"} Fit
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563]">SIGNATURE PALETTE</span>
                  <p className="text-xl font-extrabold uppercase text-[#111827]">
                    {formData.preferredPalette}
                  </p>
                </div>
              </div>

              {/* Personalized Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#E5EAE5] p-5 border border-[#D2D8D2] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563] block">
                    WARDROBE FOCUS
                  </span>
                  <p className="text-xs font-bold uppercase text-[#111827]">
                    {formData.preferredClothingTypes.slice(0, 3).join(" • ")}
                  </p>
                </div>

                <div className="bg-[#E5EAE5] p-5 border border-[#D2D8D2] space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563] block">
                    ZYRA ESCROW FIT STATUS
                  </span>
                  <div className="text-xs font-bold uppercase text-[#111827] flex items-center gap-2">
                    <ShieldCheck size={16} className="text-black" />
                    <span>100% Guaranteed Made-to-Measure Protected</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Enter Weavly CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={handleFinishOnboarding}
                className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white px-12 py-4 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md flex items-center justify-center gap-3"
              >
                <span>Enter Weavly</span>
                <ArrowRight size={15} />
              </button>
              <button
                onClick={() => setStep(1)}
                className="w-full sm:w-auto bg-white hover:bg-[#DCE2DC] text-[#111827] px-8 py-4 text-xs font-bold uppercase tracking-wider border border-[#D2D8D2] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <RotateCcw size={13} />
                <span>Edit Profile</span>
              </button>
            </div>

          </div>
        )}

      </main>

      {/* ── DEVELOPER PLATFORM JOIN MODAL ── */}
      <DeveloperJoinModal
        isOpen={isDevModalOpen}
        onClose={() => setIsDevModalOpen(false)}
      />
    </div>
  );
}
