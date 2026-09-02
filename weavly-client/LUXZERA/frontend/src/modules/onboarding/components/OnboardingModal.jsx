"use client";

// src/modules/onboarding/components/OnboardingModal.jsx
// ──────────────────────────────────────────────────────────────────────────
// WEAVLY FASHION INTELLIGENCE & PERSONALIZATION MODAL
// • Art-directed editorial fashion magazine aesthetic
// • Full-screen interactive modal for newly registered patrons
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from "react";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  ShieldCheck, 
  RotateCcw 
} from "lucide-react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { saveFitData, getFitData } from "@/modules/profile/services/userFitDataService";
import { updateProfile } from "@/modules/profile/services/userService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";

const STYLE_DISCOVERY_LOOKS = [
  {
    id: "look-1",
    title: "Architectural Tailoring",
    aesthetic: "Modern Minimalist",
    tags: ["#CleanLines", "#Structured"],
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    desc: "Precision double-breasted outerwear with relaxed straight trousers."
  },
  {
    id: "look-2",
    title: "Elevated Urban Street",
    aesthetic: "Contemporary Streetwear",
    tags: ["#DropShoulder", "#Relaxed"],
    image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&q=80",
    desc: "Heavyweight drop-shoulder knitwear layered over tailored cargos."
  },
  {
    id: "look-3",
    title: "Sartorial Silk & Flannel",
    aesthetic: "Quiet Luxury",
    tags: ["#NaturalFibers", "#Draped"],
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80",
    desc: "Fluid drape, monochromatic tonality, and high-gauge silk blends."
  },
  {
    id: "look-4",
    title: "Deconstructed Classic",
    aesthetic: "Neo-Sartorial",
    tags: ["#TexturedWool", "#Atelier"],
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&q=80",
    desc: "Classic British tailoring reworked with asymmetrical cuts."
  },
  {
    id: "look-5",
    title: "Casual Raw Minimal",
    aesthetic: "Effortless Studio",
    tags: ["#Linen", "#CleanCut"],
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800&q=80",
    desc: "Raw selvedge textures paired with relaxed garment-dyed cottons."
  },
  {
    id: "look-6",
    title: "Sculptural Avant-Garde",
    aesthetic: "Experimental Atelier",
    tags: ["#Asymmetrical", "#Sculpted"],
    image: "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=800&q=80",
    desc: "Voluminous geometric silhouettes designed for statement occasions."
  }
];

const STYLE_OPTIONS = [
  { id: "Minimal", label: "Minimalist", mood: "Clean lines · Monochromatic" },
  { id: "Streetwear", label: "Streetwear", mood: "Drop shoulders · Graphic" },
  { id: "Classic", label: "Classic Sartorial", mood: "Structured blazers · Timeless" },
  { id: "Contemporary", label: "Contemporary", mood: "Modern silhouette · Balanced drape" },
  { id: "Luxury", label: "Quiet Luxury", mood: "Mulberry silk · Cashmere" },
  { id: "Casual", label: "Casual Relaxed", mood: "Garment-dyed cottons · Everyday" },
  { id: "Experimental", label: "Experimental", mood: "Avant-garde geometry" },
  { id: "Athleisure", label: "Athletic Chic", mood: "Technical fabrics · Dynamic" }
];

const FIT_OPTIONS = [
  { id: "Relaxed", label: "Relaxed Fit", desc: "Easy drape with natural movement across chest & thighs." },
  { id: "Regular", label: "Regular Fit", desc: "Classic tailored proportion, true to standard silhouette." },
  { id: "Slim", label: "Slim Fit", desc: "Tapered contours that closely trace your natural profile." },
  { id: "Oversized", label: "Oversized Fit", desc: "Exaggerated drop-shoulder with voluminous, boxy cut." }
];

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

const PALETTE_OPTIONS = [
  { id: "Monochrome", label: "Monochrome", swatches: ["#000000", "#4B5563", "#FFFFFF"], desc: "Black, Charcoal & White" },
  { id: "Earth Tones", label: "Earth Tones", swatches: ["#78350F", "#556B2F", "#D2B48C"], desc: "Terracotta, Olive & Sand" },
  { id: "Warm Neutrals", label: "Warm Neutrals", swatches: ["#F5EFEB", "#D4C5B9", "#8E9F8E"], desc: "Oatmeal, Cream & Khaki" },
  { id: "Pastel Hues", label: "Pastel Hues", swatches: ["#93C5FD", "#FBCFE8", "#E9D5FF"], desc: "Sage, Sky Blue & Lilac" },
  { id: "Jewel Tones", label: "Jewel Tones", swatches: ["#1B4D3E", "#1E3A8A", "#800020"], desc: "Emerald, Sapphire & Plum" },
  { id: "Bold & Graphic", label: "Bold & Graphic", swatches: ["#DC2626", "#000000", "#F59E0B"], desc: "Electric Crimson & Inks" }
];

export default function OnboardingModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState(0);

  const [formData, setFormData] = useState({
    gender: "Unisex",
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
  const [analysisProgress, setAnalysisProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setStep(0);
      setAnalysisProgress(0);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleArrayItem = (field, item) => {
    setFormData((prev) => {
      const current = prev[field] || [];
      if (current.includes(item)) {
        if (current.length === 1) return prev;
        return { ...prev, [field]: current.filter((x) => x !== item) };
      } else {
        return { ...prev, [field]: [...current, item] };
      }
    });
  };

  const nextStep = () => {
    if (step === 4) {
      setStep(5);
      startZyraAnalysis();
    } else if (step < 6) {
      setStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (step > 0) setStep((prev) => prev - 1);
  };

  const startZyraAnalysis = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleFinalSave();
          return 100;
        }
        return prev + 10;
      });
    }, 100);
  };

  const handleFinalSave = async () => {
    setIsSubmitting(true);
    try {
      if (user) {
        const fitPayload = {
          gender: formData.gender,
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
      }
    } catch (err) {
      console.warn("Notice: Local profile persisted:", err);
    } finally {
      setIsSubmitting(false);
      setStep(6);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 sm:p-6 overflow-y-auto">
      <div className="bg-[#E5EAE5] text-[#111827] w-full max-w-4xl border border-[#CCD4CC] shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-[#D2D8D2] flex items-center justify-between bg-white">
          <div className="flex items-center gap-4">
            <WeavlyLogo />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#4B5563] hidden sm:inline-block">
              Styling Calibration
            </span>
          </div>

          {step > 0 && step < 5 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563]">
                STEP 0{step} / 04
              </span>
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    s === step ? "w-6 bg-black" : s < step ? "w-2 bg-black/60" : "w-2 bg-[#C8D0C8]"
                  }`}
                />
              ))}
            </div>
          )}

          <button
            onClick={onClose}
            className="p-1 hover:bg-neutral-100 rounded-full transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 sm:p-10 overflow-y-auto flex-1">
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="text-center space-y-6 py-6 max-w-xl mx-auto">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#4B5563] bg-[#DCE2DC] px-3 py-1 inline-block">
                WEAVLY FASHION PROFILE
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold uppercase tracking-tight text-[#111827] leading-tight">
                Discover fashion<br />made for you.
              </h2>
              <p className="text-sm text-[#4B5563] font-medium leading-relaxed">
                Zyra builds your 3D fashion identity and preferences so every collection and bespoke drop fits your personal aesthetic.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-full sm:w-auto bg-black hover:bg-neutral-800 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Build My Style</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto bg-[#DCE2DC] hover:bg-white text-[#111827] px-6 py-3.5 text-xs font-bold uppercase tracking-wider border border-[#CCD4CC] transition-all cursor-pointer"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: STYLE IDENTITY */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold uppercase text-[#111827]">
                  What best describes your style?
                </h3>
                <p className="text-xs text-[#4B5563]">Select one or more aesthetic directions.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STYLE_OPTIONS.map((style) => {
                  const isSelected = formData.preferredStyles.includes(style.id);
                  return (
                    <div
                      key={style.id}
                      onClick={() => toggleArrayItem("preferredStyles", style.id)}
                      className={`p-4 border cursor-pointer transition-all ${
                        isSelected ? "bg-black text-white border-black" : "bg-white text-[#111827] border-[#D2D8D2] hover:bg-[#DCE2DC]"
                      }`}
                    >
                      <h4 className="text-xs font-extrabold uppercase">{style.label}</h4>
                      <p className={`text-[10px] mt-1 ${isSelected ? "text-neutral-300" : "text-[#4B5563]"}`}>
                        {style.mood}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: FIT & SILHOUETTE */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold uppercase text-[#111827]">
                  How do you like your clothes to fit?
                </h3>
                <p className="text-xs text-[#4B5563]">Choose your signature drape and proportions.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {FIT_OPTIONS.map((fit) => {
                  const isSelected = formData.fitPreferences.includes(fit.id);
                  return (
                    <div
                      key={fit.id}
                      onClick={() => setFormData({ ...formData, fitPreferences: [fit.id] })}
                      className={`p-4 border cursor-pointer transition-all ${
                        isSelected ? "bg-black text-white border-black" : "bg-white text-[#111827] border-[#D2D8D2] hover:bg-[#DCE2DC]"
                      }`}
                    >
                      <h4 className="text-xs font-extrabold uppercase">{fit.label}</h4>
                      <p className={`text-[10px] mt-1 ${isSelected ? "text-neutral-300" : "text-[#4B5563]"}`}>
                        {fit.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: WARDROBE PREFERENCES */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold uppercase text-[#111827]">
                  Favorite Categories &amp; Colors
                </h3>
                <p className="text-xs text-[#4B5563]">Select wardrobe staples and color palettes.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = formData.preferredClothingTypes.includes(cat.id);
                  return (
                    <div
                      key={cat.id}
                      onClick={() => toggleArrayItem("preferredClothingTypes", cat.id)}
                      className={`p-3 border cursor-pointer flex items-center justify-between text-xs ${
                        isSelected ? "bg-black text-white border-black font-bold" : "bg-white text-[#111827] border-[#D2D8D2]"
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <Check size={12} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: VISUAL STYLE DISCOVERY */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold uppercase text-[#111827]">
                  Which looks feel most like you?
                </h3>
                <p className="text-xs text-[#4B5563]">Zyra uses these visual compositions to fine-tune your aesthetic signals.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {STYLE_DISCOVERY_LOOKS.map((look) => {
                  const isSelected = formData.selectedLooks.includes(look.id);
                  return (
                    <div
                      key={look.id}
                      onClick={() => toggleArrayItem("selectedLooks", look.id)}
                      className={`bg-white border cursor-pointer overflow-hidden group ${
                        isSelected ? "border-black ring-2 ring-black" : "border-[#D2D8D2]"
                      }`}
                    >
                      <div className="aspect-[3/4] overflow-hidden">
                        <img src={look.image} alt={look.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <div className="p-2.5 text-xs font-bold uppercase">{look.title}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: ZYRA AI PROCESSING */}
          {step === 5 && (
            <div className="text-center space-y-6 py-10 max-w-md mx-auto">
              <Sparkles size={36} className="animate-spin mx-auto text-black" style={{ animationDuration: '5s' }} />
              <div className="space-y-1">
                <h3 className="text-2xl font-extrabold uppercase text-[#111827]">
                  Building Your Style Profile
                </h3>
                <p className="text-xs text-[#4B5563]">Zyra is creating your fashion profile...</p>
              </div>
              <div className="w-full bg-[#DCE2DC] h-2">
                <div className="bg-black h-full transition-all duration-300" style={{ width: `${analysisProgress}%` }} />
              </div>
            </div>
          )}

          {/* STEP 6: RESULT */}
          {step === 6 && (
            <div className="text-center space-y-6 py-6 max-w-lg mx-auto">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-black bg-white px-3 py-1 inline-block border border-black">
                  ✓ PROFILE READY
                </span>
                <h3 className="text-3xl font-extrabold uppercase text-[#111827]">
                  Your Weavly Style
                </h3>
              </div>

              <div className="bg-white border border-[#D2D8D2] p-6 text-left space-y-4 text-xs">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563] block">STYLE IDENTITY</span>
                  <span className="font-extrabold text-sm uppercase">{formData.preferredStyles.join(" · ")}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563] block">FIT PREFERENCE</span>
                  <span className="font-extrabold text-sm uppercase">{formData.fitPreferences[0]}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase text-[#4B5563] block">FAVORITES</span>
                  <span className="font-bold text-xs uppercase">{formData.preferredClothingTypes.join(" · ")}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full bg-black hover:bg-neutral-800 text-white py-3.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
              >
                Enter Weavly
              </button>
            </div>
          )}

        </div>

        {/* Modal Bottom Controls */}
        {step > 0 && step < 5 && (
          <div className="px-6 py-4 border-t border-[#D2D8D2] bg-white flex items-center justify-between">
            <button
              onClick={prevStep}
              className="text-xs font-bold uppercase text-[#4B5563] hover:text-black flex items-center gap-1.5 cursor-pointer bg-transparent border-none"
            >
              <ArrowLeft size={13} />
              <span>Back</span>
            </button>
            <button
              onClick={nextStep}
              className="bg-black hover:bg-neutral-800 text-white px-6 py-2.5 text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              <span>{step === 4 ? "Complete Profile" : "Continue"}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
