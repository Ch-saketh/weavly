"use client";

// src/modules/onboarding/pages/OnboardingPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// Weavly / Zyra V2 — Editorial Patron Onboarding & Silhouette Calibration
// • Signature Warm Stone (#F5EFEB) and Architectural Navy (#183B56) Theme
// • End-to-end 6-Step Silhouette, Sizing, Aesthetic, Palette & AI Vector Pipeline
// ──────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Check,
  Upload,
  Trash2,
  Plus,
  Sparkles,
  User,
  Image as ImageIcon,
  Ruler,
  Palette,
  Compass,
  AlertCircle,
  ShieldCheck,
  Camera,
  CheckCircle2,
  ArrowRight,
  Lock,
  Scissors,
  Layers,
  Heart
} from "lucide-react";
import { useAuth } from "@/modules/auth/store/useAuth";
import { saveFitData, getFitData } from "@/modules/profile/services/userFitDataService";
import { updateProfile } from "@/modules/profile/services/userService";
import {
  uploadRecommendationImage,
  deleteRecommendationImage,
  getRecommendationImages
} from "@/modules/profile/services/recommendationImageService";
import {
  HEIGHT_RANGES,
  WEIGHT_RANGES,
  STANDARD_SIZES,
  NUMERIC_SIZES,
  FIT_PREFERENCES,
  FASHION_STYLES,
  CLOTHING_TYPES,
  COLOR_OPTIONS,
  AVOIDED_COLOR_OPTIONS,
  OCCASIONS,
  BUDGET_RANGES,
  SHOPPING_PRIORITIES,
  FASHION_GOALS,
} from "../data/questionnaireConstants";
import { formatErrorMessage } from "@/shared/utils/errorUtils";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // ── Form State for UserFitData (15 Areas) ──────────────────────────────────
  const [formData, setFormData] = useState({
    // Q0: Gender & Identity
    gender: user?.gender || "Women",
    displayName: user?.name || user?.displayName || "",
    // Q1: Height
    heightRange: "",
    exactHeightCm: "",
    // Q2: Weight
    weightRange: "",
    exactWeightKg: "",
    // Q3: Clothing Size
    clothingSize: "",
    customClothingSize: "",
    // Q4: Fit Preferences
    fitPreferences: [],
    customFitPreference: "",
    // Q5: Preferred Styles
    preferredStyles: [],
    customPreferredStyle: "",
    // Q6: Avoided Styles
    avoidedStyles: [],
    customAvoidedStyle: "",
    // Q7: Preferred Clothing Types
    preferredClothingTypes: [],
    customPreferredClothingType: "",
    // Q8: Avoided Clothing Types
    avoidedClothingTypes: [],
    customAvoidedClothingType: "",
    // Q9: Preferred Colors
    preferredColors: [],
    customPreferredColor: "",
    // Q10: Avoided Colors
    avoidedColors: [],
    customAvoidedColor: "",
    // Q11: Occasions
    occasions: [],
    customOccasion: "",
    // Q12: Primary Occasion
    primaryOccasion: "",
    // Q13: Budget Range
    budgetRange: "",
    // Q14: Shopping Priorities (Max 3)
    shoppingPriorities: [],
    // Q15: Fashion Goals
    fashionGoals: [],
    customFashionGoal: "",
  });

  // ── Primary Profile Picture State ──────────────────────────────────────────
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(
    user?.profilePicture || user?.avatarUrl || null
  );

  // ── Recommendation Analysis Photos (Max 3) ─────────────────────────────────
  const [existingRecImages, setExistingRecImages] = useState([]);
  const [recImageFiles, setRecImageFiles] = useState([]); // [{ file, preview }]

  // ── Flow & Submitting State ────────────────────────────────────────────────
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successStep, setSuccessStep] = useState(false);

  // File Input Refs
  const profileInputRef = useRef(null);
  const recImagesInputRef = useRef(null);

  // ── Fetch existing profile & fit data on mount ────────────────────────────
  useEffect(() => {
    let mounted = true;
    const loadExistingData = async () => {
      setLoadingInitial(true);
      try {
        if (user) {
          setFormData((prev) => ({
            ...prev,
            gender: user.gender || prev.gender,
            displayName: user.name || user.displayName || prev.displayName
          }));
          if (user.profilePicture || user.avatarUrl) {
            setProfileImagePreview(user.profilePicture || user.avatarUrl);
          }
        }

        const [fitRes, recImgsRes] = await Promise.allSettled([
          getFitData(),
          getRecommendationImages()
        ]);

        if (fitRes.status === "fulfilled" && fitRes.value && mounted) {
          const d = fitRes.value;
          setFormData((prev) => ({
            ...prev,
            gender: d.gender || prev.gender,
            heightRange: d.heightRange || prev.heightRange,
            exactHeightCm: d.exactHeightCm ? String(d.exactHeightCm) : prev.exactHeightCm,
            weightRange: d.weightRange || prev.weightRange,
            exactWeightKg: d.exactWeightKg ? String(d.exactWeightKg) : prev.exactWeightKg,
            clothingSize: d.clothingSize || prev.clothingSize,
            customClothingSize: d.customClothingSize || prev.customClothingSize,
            fitPreferences: Array.isArray(d.fitPreferences) ? d.fitPreferences : prev.fitPreferences,
            preferredStyles: Array.isArray(d.preferredStyles) ? d.preferredStyles : prev.preferredStyles,
            avoidedStyles: Array.isArray(d.avoidedStyles) ? d.avoidedStyles : prev.avoidedStyles,
            preferredClothingTypes: Array.isArray(d.preferredClothingTypes) ? d.preferredClothingTypes : prev.preferredClothingTypes,
            avoidedClothingTypes: Array.isArray(d.avoidedClothingTypes) ? d.avoidedClothingTypes : prev.avoidedClothingTypes,
            preferredColors: Array.isArray(d.preferredColors) ? d.preferredColors : prev.preferredColors,
            avoidedColors: Array.isArray(d.avoidedColors) ? d.avoidedColors : prev.avoidedColors,
            occasions: Array.isArray(d.occasions) ? d.occasions : prev.occasions,
            primaryOccasion: d.primaryOccasion || prev.primaryOccasion,
            budgetRange: d.budgetRange || prev.budgetRange,
            shoppingPriorities: Array.isArray(d.shoppingPriorities) ? d.shoppingPriorities : prev.shoppingPriorities,
            fashionGoals: Array.isArray(d.fashionGoals) ? d.fashionGoals : prev.fashionGoals,
          }));
        }

        if (recImgsRes.status === "fulfilled" && Array.isArray(recImgsRes.value) && mounted) {
          setExistingRecImages(recImgsRes.value);
        }
      } catch (err) {
        console.warn("Notice: Initial onboarding fit data pre-fetch:", err);
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    };

    loadExistingData();
    return () => { mounted = false; };
  }, [user]);

  // ── Handlers for Form Fields ───────────────────────────────────────────────
  const handleSingleSelect = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleMultiToggle = (field, value, maxCount = null) => {
    setFormData((prev) => {
      const currentList = prev[field] || [];
      const exists = currentList.includes(value);
      if (exists) {
        return { ...prev, [field]: currentList.filter((item) => item !== value) };
      }
      if (maxCount && currentList.length >= maxCount) {
        return prev;
      }
      return { ...prev, [field]: [...currentList, value] };
    });
  };

  // ── Profile Photo Selection ────────────────────────────────────────────────
  const handleProfilePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfileImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setProfileImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // ── Recommendation Analysis Photos Selection (Max 3) ───────────────────────
  const handleRecPhotosChange = (e) => {
    const files = Array.from(e.target.files || []);
    const availableSlots = 3 - (existingRecImages.length + recImageFiles.length);
    const toAdd = files.slice(0, availableSlots);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        setRecImageFiles((prev) => [...prev, { file, preview: reader.result }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveNewRecImage = (index) => {
    setRecImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingRecImage = async (imageId) => {
    try {
      await deleteRecommendationImage(imageId);
      setExistingRecImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      console.error("Failed to delete recommendation image:", err);
    }
  };

  // ── Step Navigation & Validation ───────────────────────────────────────────
  const handleNext = () => {
    setErrorMsg("");
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      handleSubmitOnboarding();
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // ── Final Submit Handler ───────────────────────────────────────────────────
  const handleSubmitOnboarding = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Update Core Profile Information (Gender, Name, Avatar)
      const profileUpdates = {
        gender: formData.gender,
        displayName: formData.displayName
      };
      if (profileImageFile) {
        profileUpdates.avatarFile = profileImageFile;
      }
      await updateProfile(profileUpdates);

      // 2. Persist 15-Area UserFitData
      const fitPayload = {
        gender: formData.gender,
        heightRange: formData.heightRange,
        exactHeightCm: formData.exactHeightCm ? parseFloat(formData.exactHeightCm) : null,
        weightRange: formData.weightRange,
        exactWeightKg: formData.exactWeightKg ? parseFloat(formData.exactWeightKg) : null,
        clothingSize: formData.clothingSize,
        customClothingSize: formData.customClothingSize,
        fitPreferences: formData.fitPreferences,
        customFitPreference: formData.customFitPreference,
        preferredStyles: formData.preferredStyles,
        customPreferredStyle: formData.customPreferredStyle,
        avoidedStyles: formData.avoidedStyles,
        customAvoidedStyle: formData.customAvoidedStyle,
        preferredClothingTypes: formData.preferredClothingTypes,
        customPreferredClothingType: formData.customPreferredClothingType,
        avoidedClothingTypes: formData.avoidedClothingTypes,
        customAvoidedClothingType: formData.customAvoidedClothingType,
        preferredColors: formData.preferredColors,
        customPreferredColor: formData.customPreferredColor,
        avoidedColors: formData.avoidedColors,
        customAvoidedColor: formData.customAvoidedColor,
        occasions: formData.occasions,
        customOccasion: formData.customOccasion,
        primaryOccasion: formData.primaryOccasion || (formData.occasions?.[0] || ""),
        budgetRange: formData.budgetRange,
        shoppingPriorities: formData.shoppingPriorities,
        fashionGoals: formData.fashionGoals,
        customFashionGoal: formData.customFashionGoal,
        profileCompleted: true
      };
      await saveFitData(fitPayload);

      // 3. Upload Any Selected Recommendation Analysis Photos
      if (recImageFiles.length > 0) {
        for (const item of recImageFiles) {
          try {
            await uploadRecommendationImage(item.file);
          } catch (err) {
            console.warn("Photo upload warning:", err);
          }
        }
      }

      // 4. Update Local User Profile State
      await refreshUser();

      // 5. Trigger Success Celebration Screen
      setSuccessStep(true);
      setTimeout(() => {
        router.push("/");
      }, 2500);

    } catch (err) {
      console.error("Onboarding submission failure:", err);
      setErrorMsg(formatErrorMessage(err, "Failed to save your calibration profile. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      
      {/* ── Top Brand Header ── */}
      <header className="border-b border-[#183B56]/15 bg-white/90 backdrop-blur-xs sticky top-0 z-40 py-4 px-6 sm:px-12">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="border-none bg-transparent cursor-pointer p-0 select-none flex items-center gap-2"
            >
              <WeavlyLogo className="h-6 w-auto text-[#183B56]" />
            </button>
            <span className="text-[#183B56]/40 hidden sm:inline">|</span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#5A7184] hidden sm:inline">
              Zyra V2 Silhouette Calibration
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#183B56] bg-[#F5EFEB] border border-[#183B56]/20 px-3 py-1.5 rounded-full">
            <span>Step {currentStep} of {totalSteps}</span>
          </div>
        </div>
      </header>

      {/* ── Progress Indicator Bar ── */}
      <div className="w-full bg-[#183B56]/10 h-1.5">
        <div 
          className="bg-[#183B56] h-1.5 transition-all duration-300 ease-out"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>

      {/* ── Main Onboarding Form Container ── */}
      <main className="max-w-4xl mx-auto px-6 sm:px-12 py-10 sm:py-14">
        
        {/* SUCCESS STATE */}
        {successStep ? (
          <div className="bg-white border border-[#183B56] p-10 sm:p-16 rounded-2xl shadow-sm text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-[#183B56] text-white flex items-center justify-center mx-auto shadow-md">
              <Sparkles size={36} className="text-[#38BDF8]" />
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#183B56]">
                Calibration Complete
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
                Zyra AI Stylist Activated.
              </h2>
              <p className="text-sm text-[#5A7184] max-w-md mx-auto leading-relaxed font-medium">
                Your 3D silhouette embeddings, fit tolerances, and aesthetic affinities have been compiled into your private styling profile.
              </p>
            </div>
            <div className="pt-4 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#183B56]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Redirecting to your Curated Wardrobe...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">

            {/* Error Notice */}
            {errorMsg && (
              <div className="p-4 bg-red-50 border border-red-300 text-red-700 text-xs font-semibold rounded-lg flex items-center gap-2.5">
                <AlertCircle size={16} className="shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── STEP 1: IDENTITY & PROFILE PHOTO ── */}
            {currentStep === 1 && (
              <div className="bg-white border border-[#183B56] p-6 sm:p-10 rounded-2xl shadow-xs space-y-8 animate-in fade-in duration-150">
                <div className="space-y-2 border-b border-[#183B56]/15 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                    <User size={13} />
                    <span>01 • Identity &amp; Silhouette</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                    Tell us about your sartorial identity.
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#5A7184] font-medium leading-relaxed">
                    Set your silhouette preference and profile representation to customize how Zyra AI curates drops.
                  </p>
                </div>

                {/* Gender / Department Selection */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Primary Silhouette Department *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {["Women", "Men", "Unisex"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => handleSingleSelect("gender", g)}
                        className={`py-4 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer flex flex-col items-center justify-center gap-1.5
                          ${formData.gender === g
                            ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                            : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                      >
                        <span className="text-sm">{g === "Women" ? "♀" : g === "Men" ? "♂" : "⚧"}</span>
                        <span>{g}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Display Name */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Patron Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="e.g. Elena Rostova"
                    className="w-full px-4 py-3 bg-[#F5EFEB] border border-[#183B56]/30 text-sm font-medium text-[#183B56] rounded-xl focus:outline-none focus:border-[#183B56]"
                  />
                </div>

                {/* Profile Photo Upload */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Patron Profile Portrait
                  </label>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-2xl border-2 border-[#183B56] bg-[#DFE7ED] overflow-hidden flex items-center justify-center relative shrink-0">
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <User size={28} className="text-[#5A7184]" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <input
                        ref={profileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfilePhotoChange}
                      />
                      <button
                        type="button"
                        onClick={() => profileInputRef.current?.click()}
                        className="px-4 py-2 bg-[#183B56] text-white hover:bg-[#102A43] text-xs font-bold uppercase tracking-wider rounded-lg border-none cursor-pointer flex items-center gap-1.5"
                      >
                        <Camera size={13} />
                        <span>Upload Photo</span>
                      </button>
                      <p className="text-[11px] text-[#5A7184] font-medium">JPEG, PNG or WebP under 5MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: BODY PROPORTIONS & SIZING ── */}
            {currentStep === 2 && (
              <div className="bg-white border border-[#183B56] p-6 sm:p-10 rounded-2xl shadow-xs space-y-8 animate-in fade-in duration-150">
                <div className="space-y-2 border-b border-[#183B56]/15 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                    <Ruler size={13} />
                    <span>02 • Proportions &amp; Sizing</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                    Calibrate your precise sizing.
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#5A7184] font-medium leading-relaxed">
                    Zyra uses height, weight, and sizing tolerances to calibrate drape recommendations and made-to-measure bespoke fits.
                  </p>
                </div>

                {/* Height Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Height Range
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {HEIGHT_RANGES.map((h) => (
                      <button
                        key={h}
                        type="button"
                        onClick={() => handleSingleSelect("heightRange", h)}
                        className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer
                          ${formData.heightRange === h
                            ? "bg-[#183B56] text-white border-[#183B56]"
                            : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Weight Selector */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Weight Range
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {WEIGHT_RANGES.map((w) => (
                      <button
                        key={w}
                        type="button"
                        onClick={() => handleSingleSelect("weightRange", w)}
                        className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer
                          ${formData.weightRange === w
                            ? "bg-[#183B56] text-white border-[#183B56]"
                            : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Standard Size */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Standard Apparel Size
                  </label>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                    {STANDARD_SIZES.map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => handleSingleSelect("clothingSize", sz)}
                        className={`py-3 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer
                          ${formData.clothingSize === sz
                            ? "bg-[#183B56] text-white border-[#183B56]"
                            : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fit Preference Multi-Select */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Preferred Fit Silhouettes (Select all that apply)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {FIT_PREFERENCES.map((fit) => {
                      const isSelected = formData.fitPreferences?.includes(fit);
                      return (
                        <button
                          key={fit}
                          type="button"
                          onClick={() => handleMultiToggle("fitPreferences", fit)}
                          className={`py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1.5
                            ${isSelected
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{fit}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 3: STYLE & AESTHETIC AFFINITIES ── */}
            {currentStep === 3 && (
              <div className="bg-white border border-[#183B56] p-6 sm:p-10 rounded-2xl shadow-xs space-y-8 animate-in fade-in duration-150">
                <div className="space-y-2 border-b border-[#183B56]/15 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                    <Compass size={13} />
                    <span>03 • Style &amp; Aesthetics</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                    Define your design vocabulary.
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#5A7184] font-medium leading-relaxed">
                    Select the aesthetics you gravitate toward, and specify any silhouettes you prefer to avoid.
                  </p>
                </div>

                {/* Preferred Styles */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Preferred Fashion Styles
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {FASHION_STYLES.map((st) => {
                      const isSelected = formData.preferredStyles?.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleMultiToggle("preferredStyles", st)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1.5
                            ${isSelected
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Avoided Styles */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#800020]">
                    Styles to Avoid / Exclude
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {FASHION_STYLES.map((st) => {
                      const isSelected = formData.avoidedStyles?.includes(st);
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => handleMultiToggle("avoidedStyles", st)}
                          className={`py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1.5
                            ${isSelected
                              ? "bg-[#800020] text-white border-[#800020]"
                              : "bg-[#F5EFEB] text-[#800020]/80 border-[#800020]/20 hover:border-[#800020]"}`}
                        >
                          {isSelected && <X size={12} />}
                          <span>{st}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 4: PALETTE & CLOTHING TYPES ── */}
            {currentStep === 4 && (
              <div className="bg-white border border-[#183B56] p-6 sm:p-10 rounded-2xl shadow-xs space-y-8 animate-in fade-in duration-150">
                <div className="space-y-2 border-b border-[#183B56]/15 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                    <Palette size={13} />
                    <span>04 • Palette &amp; Garments</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                    Select your color palettes.
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#5A7184] font-medium leading-relaxed">
                    Zyra balances color harmonics against your seasonal tone and preferences.
                  </p>
                </div>

                {/* Preferred Colors */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Preferred Color Swatches
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {COLOR_OPTIONS.map((c) => {
                      const isSelected = formData.preferredColors?.includes(c.name);
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => handleMultiToggle("preferredColors", c.name)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer flex items-center gap-2.5
                            ${isSelected
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                        >
                          <span 
                            className="w-4 h-4 rounded-full border border-black/20 shrink-0" 
                            style={{ backgroundColor: c.hex }} 
                          />
                          <span className="truncate">{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Preferred Clothing Types */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Core Garment Essentials
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CLOTHING_TYPES.map((ct) => {
                      const isSelected = formData.preferredClothingTypes?.includes(ct);
                      return (
                        <button
                          key={ct}
                          type="button"
                          onClick={() => handleMultiToggle("preferredClothingTypes", ct)}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1.5
                            ${isSelected
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{ct}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 5: OCCASIONS, BUDGET & GOALS ── */}
            {currentStep === 5 && (
              <div className="bg-white border border-[#183B56] p-6 sm:p-10 rounded-2xl shadow-xs space-y-8 animate-in fade-in duration-150">
                <div className="space-y-2 border-b border-[#183B56]/15 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                    <Layers size={13} />
                    <span>05 • Occasions &amp; Priorities</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                    Where do you wear your pieces?
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#5A7184] font-medium leading-relaxed">
                    Tell Zyra which life moments you are curating for, and your primary shopping criteria.
                  </p>
                </div>

                {/* Occasions */}
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Frequent Occasions
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {OCCASIONS.map((occ) => {
                      const isSelected = formData.occasions?.includes(occ);
                      return (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => handleMultiToggle("occasions", occ)}
                          className={`p-3 rounded-xl text-xs font-bold transition-all border cursor-pointer text-left flex items-center justify-between
                            ${isSelected
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                        >
                          <span>{occ}</span>
                          {isSelected && <Check size={12} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget Range */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                    Target Garment Investment
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {BUDGET_RANGES.map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => handleSingleSelect("budgetRange", b)}
                        className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer
                          ${formData.budgetRange === b
                            ? "bg-[#183B56] text-white border-[#183B56]"
                            : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shopping Priorities (Max 3) */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                      Key Shopping Priorities
                    </label>
                    <span className="text-[11px] font-mono text-[#5A7184]">
                      {formData.shoppingPriorities?.length || 0}/3 Selected
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SHOPPING_PRIORITIES.map((sp) => {
                      const isSelected = formData.shoppingPriorities?.includes(sp);
                      return (
                        <button
                          key={sp}
                          type="button"
                          onClick={() => handleMultiToggle("shoppingPriorities", sp, 3)}
                          className={`py-2 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer flex items-center gap-1.5
                            ${isSelected
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:border-[#183B56]"}`}
                        >
                          {isSelected && <Check size={12} />}
                          <span>{sp}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 6: ZYRA AI CALIBRATION PHOTOS (OPTIONAL) ── */}
            {currentStep === 6 && (
              <div className="bg-white border border-[#183B56] p-6 sm:p-10 rounded-2xl shadow-xs space-y-8 animate-in fade-in duration-150">
                <div className="space-y-2 border-b border-[#183B56]/15 pb-6">
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                    <Sparkles size={13} className="text-[#38BDF8]" />
                    <span>06 • Zyra AI Calibration</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                    Upload Silhouette &amp; Posture Photos.
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#5A7184] font-medium leading-relaxed">
                    Upload up to 3 full-length outfit photos for Zyra to extract shoulder-to-hip drape vectors and refine 3D bespoke tailoring. (Optional)
                  </p>
                </div>

                {/* Privacy Guarantee Strip */}
                <div className="p-4 bg-[#F5EFEB] border border-[#183B56]/15 rounded-xl flex items-start gap-3">
                  <ShieldCheck size={18} className="text-[#183B56] shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs text-[#183B56]">
                    <span className="font-bold uppercase tracking-wider text-[10px] block">
                      Encrypted In-Memory Processing:
                    </span>
                    <span className="text-[#5A7184] font-medium">
                      All images are processed into mathematical vector embeddings and never shared with third parties or ad-brokers.
                    </span>
                  </div>
                </div>

                {/* Photos Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Existing Photos */}
                  {existingRecImages.map((img) => (
                    <div key={img.id} className="aspect-[3/4] bg-[#DFE7ED] border border-[#183B56] rounded-xl overflow-hidden relative group">
                      <img src={img.imageUrl} alt="Analysis" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingRecImage(img.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {/* New Selected Photos */}
                  {recImageFiles.map((item, idx) => (
                    <div key={idx} className="aspect-[3/4] bg-[#DFE7ED] border border-[#183B56] rounded-xl overflow-hidden relative group">
                      <img src={item.preview} alt="New upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewRecImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-none"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  {/* Upload Add Slot (if under 3) */}
                  {existingRecImages.length + recImageFiles.length < 3 && (
                    <div
                      onClick={() => recImagesInputRef.current?.click()}
                      className="aspect-[3/4] bg-[#F5EFEB] border-2 border-dashed border-[#183B56]/30 hover:border-[#183B56] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors space-y-2 group"
                    >
                      <div className="w-10 h-10 rounded-full bg-white border border-[#183B56]/20 flex items-center justify-center text-[#183B56] group-hover:scale-110 transition-transform">
                        <Plus size={18} />
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                        Add Silhouette Photo
                      </span>
                      <span className="text-[10px] text-[#5A7184] font-medium">
                        {3 - (existingRecImages.length + recImageFiles.length)} slots left
                      </span>
                    </div>
                  )}
                </div>

                <input
                  ref={recImagesInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleRecPhotosChange}
                />
              </div>
            )}

            {/* ── Navigation Actions Footer ── */}
            <div className="flex items-center justify-between pt-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={isSubmitting}
                  className="px-6 py-3.5 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-xs font-bold uppercase tracking-wider rounded-lg border border-[#183B56]/30 cursor-pointer transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="px-8 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider rounded-lg border border-[#183B56] cursor-pointer shadow-xs transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Activating Zyra AI...</span>
                  </>
                ) : currentStep === totalSteps ? (
                  <>
                    <span>Complete &amp; Generate Wardrobe</span>
                    <Sparkles size={14} className="text-[#38BDF8]" />
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ChevronRight size={14} />
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
