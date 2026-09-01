"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Camera
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
import Loader from "@/shared/components/ui/Loader";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";

export default function OnboardingModal({ isOpen, onClose }) {
  const { user, refreshUser } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // ── Form State for UserFitData (15 Areas) ──────────────────────────────────
  const [formData, setFormData] = useState({
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

  // ── Fetch Existing Fit Data on Open ────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    async function loadPreferences() {
      setLoadingInitial(true);
      setErrorMsg("");
      try {
        const [fitRes, recRes] = await Promise.allSettled([
          getFitData(),
          getRecommendationImages(),
        ]);

        if (!isMounted) return;

        if (fitRes.status === "fulfilled" && fitRes.value) {
          const d = fitRes.value;
          setFormData((prev) => ({
            ...prev,
            heightRange: d.heightRange || "",
            exactHeightCm: d.exactHeightCm ? String(d.exactHeightCm) : "",
            weightRange: d.weightRange || "",
            exactWeightKg: d.exactWeightKg ? String(d.exactWeightKg) : "",
            clothingSize: d.clothingSize || "",
            customClothingSize: d.customClothingSize || "",
            fitPreferences: Array.isArray(d.fitPreferences) ? d.fitPreferences : [],
            preferredStyles: Array.isArray(d.preferredStyles) ? d.preferredStyles : [],
            avoidedStyles: Array.isArray(d.avoidedStyles) ? d.avoidedStyles : [],
            preferredClothingTypes: Array.isArray(d.preferredClothingTypes) ? d.preferredClothingTypes : [],
            avoidedClothingTypes: Array.isArray(d.avoidedClothingTypes) ? d.avoidedClothingTypes : [],
            preferredColors: Array.isArray(d.preferredColors) ? d.preferredColors : [],
            avoidedColors: Array.isArray(d.avoidedColors) ? d.avoidedColors : [],
            occasions: Array.isArray(d.occasions) ? d.occasions : [],
            primaryOccasion: d.primaryOccasion || "",
            budgetRange: d.budgetRange || "",
            shoppingPriorities: Array.isArray(d.shoppingPriorities) ? d.shoppingPriorities : [],
            fashionGoals: Array.isArray(d.fashionGoals) ? d.fashionGoals : [],
          }));
        }

        if (recRes.status === "fulfilled" && Array.isArray(recRes.value)) {
          setExistingRecImages(recRes.value);
        }

        if (user?.profilePicture || user?.avatarUrl) {
          setProfileImagePreview(user.profilePicture || user.avatarUrl);
        }
      } catch (err) {
        console.warn("Could not preload fit preferences:", err);
      } finally {
        if (isMounted) setLoadingInitial(false);
      }
    }

    loadPreferences();
    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  if (!isOpen) return null;

  // ── Array Toggle Helpers ───────────────────────────────────────────────────
  const toggleArrayItem = (key, item, maxLimit = null) => {
    setFormData((prev) => {
      const current = prev[key] || [];
      if (current.includes(item)) {
        return { ...prev, [key]: current.filter((x) => x !== item) };
      }
      if (maxLimit && current.length >= maxLimit) {
        return prev;
      }
      return { ...prev, [key]: [...current, item] };
    });
  };

  const addCustomItem = (arrayKey, customKey) => {
    const val = (formData[customKey] || "").trim();
    if (!val) return;
    setFormData((prev) => {
      const current = prev[arrayKey] || [];
      if (!current.includes(val)) {
        return {
          ...prev,
          [arrayKey]: [...current, val],
          [customKey]: "",
        };
      }
      return { ...prev, [customKey]: "" };
    });
  };

  // ── Image Handlers ─────────────────────────────────────────────────────────
  const handleProfileImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Profile picture must be less than 10MB");
      return;
    }
    setProfileImageFile(file);
    setProfileImagePreview(URL.createObjectURL(file));
    setErrorMsg("");
  };

  const handleRecImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const remainingSlots = 3 - (existingRecImages.length + recImageFiles.length);
    if (remainingSlots <= 0) {
      setErrorMsg("You can upload a maximum of 3 recommendation images.");
      return;
    }

    const validNew = [];
    for (const file of files.slice(0, remainingSlots)) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("Each image must be less than 10MB");
        continue;
      }
      validNew.push({
        file,
        preview: URL.createObjectURL(file),
      });
    }

    setRecImageFiles((prev) => [...prev, ...validNew]);
    setErrorMsg("");
  };

  const removePendingRecImage = (index) => {
    setRecImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingRecImage = async (id) => {
    try {
      await deleteRecommendationImage(id);
      setExistingRecImages((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      setErrorMsg("Failed to remove image. Please try again.");
    }
  };

  // ── Step Navigation ────────────────────────────────────────────────────────
  const handleNext = () => {
    setErrorMsg("");
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinalSubmit();
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // ── Final Submission ───────────────────────────────────────────────────────
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      // 1. Prepare and Save Fit Data
      const fitPayload = {
        heightRange: formData.heightRange || null,
        exactHeightCm: formData.exactHeightCm ? parseFloat(formData.exactHeightCm) : null,
        weightRange: formData.weightRange || null,
        exactWeightKg: formData.exactWeightKg ? parseFloat(formData.exactWeightKg) : null,
        clothingSize: formData.customClothingSize || formData.clothingSize || null,
        customClothingSize: formData.customClothingSize || null,
        fitPreferences: formData.fitPreferences,
        preferredStyles: formData.preferredStyles,
        avoidedStyles: formData.avoidedStyles,
        preferredClothingTypes: formData.preferredClothingTypes,
        avoidedClothingTypes: formData.avoidedClothingTypes,
        preferredColors: formData.preferredColors,
        avoidedColors: formData.avoidedColors,
        occasions: formData.occasions,
        primaryOccasion: formData.primaryOccasion || null,
        budgetRange: formData.budgetRange || null,
        shoppingPriorities: formData.shoppingPriorities,
        fashionGoals: formData.fashionGoals,
      };

      await saveFitData(user?.id, fitPayload);

      // 2. Upload Profile Picture if selected
      if (profileImageFile) {
        try {
          await updateProfile(user?.id, {}, profileImageFile);
        } catch (imgErr) {
          console.warn("Profile image upload skipped or non-blocking:", imgErr);
        }
      }

      // 3. Upload Recommendation Analysis Images
      if (recImageFiles.length > 0) {
        for (const item of recImageFiles) {
          try {
            await uploadRecommendationImage(user?.id, item.file);
          } catch (recImgErr) {
            console.warn("Recommendation image upload skipped:", recImgErr);
          }
        }
      }

      // 4. Mark Profile as completed in auth context
      if (refreshUser) {
        await refreshUser();
      } else {
        if (user) {
          user.profileCompleted = true;
          user.fitData = fitPayload;
        }
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("weavly:profileUpdated"));
      }

      setSuccessStep(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to complete onboarding. Please try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onboardingMessage =
    user?.onboardingMessage ||
    "Complete your architectural style blueprint for precision tailored outfit curation.";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#183B56]/50 backdrop-blur-sm transition-all">
      <div 
        className="w-full max-w-2xl bg-[#F5EFEB] border border-[#183B56] shadow-2xl overflow-hidden flex flex-col max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] animate-scale-up"
      >
        {/* ── Modal Header & Blueprint Progress ── */}
        <div className="px-6 sm:px-8 pt-5 pb-4 border-b border-[#183B56] bg-[#F5EFEB] sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-6 h-6 border border-[#183B56] bg-[#183B56] text-white text-[11px] font-mono font-bold">
                {currentStep}
              </div>
              <div className="text-left">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block leading-none">
                  Blueprint Phase {currentStep} of {totalSteps}
                </span>
                <span className="text-xs font-bold text-[#183B56] uppercase tracking-wide">
                  {currentStep === 1 && "Dimensions & Measurements"}
                  {currentStep === 2 && "Aesthetic Silhouette"}
                  {currentStep === 3 && "Garment Architecture"}
                  {currentStep === 4 && "Color Spectrum"}
                  {currentStep === 5 && "Occasions & Budget"}
                  {currentStep === 6 && "Fit Calibration Photos"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.15em] text-[#183B56] border border-[#183B56] px-2 py-0.5 bg-white">
                STYLE BLUEPRINT
              </span>
            </div>
          </div>

          {/* Blueprint Progress Bar */}
          <div className="w-full h-1 bg-[#183B56]/15 overflow-hidden">
            <div 
              className="h-full bg-[#183B56] transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Blueprint Calibration Notice */}
          <div className="mt-2.5 text-[11px] text-[#5A7184] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-[#183B56]" />
            <span>{onboardingMessage}</span>
          </div>
        </div>

        {/* ── Modal Content Area ── */}
        <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 text-left space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 rounded-none text-xs text-red-700 font-medium flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loadingInitial ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader size="lg" text="CALIBRATING FIT PROFILE" />
            </div>
          ) : (
            <>
              {/* ══════════════════════════════════════════════════════════════
                  STEP 1: SIZING & FIT BASICS (Q1, Q2, Q3, Q4)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#183B56] uppercase tracking-tight mb-1">
                      Body & Sizing Dimensions
                    </h2>
                    <p className="text-xs text-[#5A7184]">
                      Enter your approximate measurements so every curated piece fits your proportions with bespoke precision.
                    </p>
                  </div>

                  {/* Q1: Height */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      1. Height Range
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HEIGHT_RANGES.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setFormData({ ...formData, heightRange: range })}
                          className={`py-2 px-3 rounded-full text-xs font-semibold border transition-all ${
                            formData.heightRange === range
                              ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                              : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                          }`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Exact Height (cm)"
                        value={formData.exactHeightCm}
                        onChange={(e) => setFormData({ ...formData, exactHeightCm: e.target.value })}
                        className="w-full sm:w-48 h-9 px-3 border border-[#183B56]/40 bg-white text-xs text-[#183B56] focus:border-[#183B56] focus:ring-1 focus:ring-[#183B56] outline-none"
                      />
                      <span className="text-xs text-[#5A7184]">Optional cm</span>
                    </div>
                  </div>

                  {/* Q2: Approximate Weight */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      2. Approximate Weight
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {WEIGHT_RANGES.map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() => setFormData({ ...formData, weightRange: w })}
                          className={`py-2 px-3 rounded-full text-xs font-semibold border transition-all ${
                            formData.weightRange === w
                              ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                              : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                          }`}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                    <div className="pt-1 flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Exact Weight (kg)"
                        value={formData.exactWeightKg}
                        onChange={(e) => setFormData({ ...formData, exactWeightKg: e.target.value })}
                        className="w-full sm:w-48 h-9 px-3 border border-[#183B56]/40 bg-white text-xs text-[#183B56] focus:border-[#183B56] focus:ring-1 focus:ring-[#183B56] outline-none"
                      />
                      <span className="text-xs text-[#5A7184]">Optional kg</span>
                    </div>
                  </div>

                  {/* Q3: Clothing Size */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      3. Standard Garment Size
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {STANDARD_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({ ...formData, clothingSize: size, customClothingSize: "" })}
                            className={`min-w-[44px] py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                              formData.clothingSize === size && !formData.customClothingSize
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#5A7184] pt-1">Waist & Numeric Sizes:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {NUMERIC_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({ ...formData, clothingSize: size, customClothingSize: "" })}
                            className={`min-w-[44px] py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                              formData.clothingSize === size && !formData.customClothingSize
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      <div className="pt-1 flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Custom Size (e.g. 38R, Tall L)"
                          value={formData.customClothingSize}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              customClothingSize: e.target.value,
                              clothingSize: e.target.value,
                            })
                          }
                          className="w-full sm:w-60 h-9 px-3 border border-[#183B56]/40 bg-white text-xs text-[#183B56] focus:border-[#183B56] focus:ring-1 focus:ring-[#183B56] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Q4: Fit Preferences */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      4. Silhouette & Fit Preference
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FIT_PREFERENCES.map((fit) => {
                        const isSelected = formData.fitPreferences.includes(fit);
                        return (
                          <button
                            key={fit}
                            type="button"
                            onClick={() => toggleArrayItem("fitPreferences", fit)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={2.5} />}
                            <span>{fit}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 2: STYLE AESTHETICS (Q5, Q6)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#183B56] uppercase tracking-tight mb-1">
                      Aesthetic Style Profile
                    </h2>
                    <p className="text-xs text-[#5A7184]">
                      Select the fashion movements that match your personal expression, and what you prefer to avoid.
                    </p>
                  </div>

                  {/* Q5: Preferred Styles */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      5. Preferred Aesthetic Styles
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FASHION_STYLES.map((st) => {
                        const isSelected = formData.preferredStyles.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => toggleArrayItem("preferredStyles", st)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={2.5} />}
                            <span>{st}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q6: Avoided Styles */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      6. Styles You Prefer to Avoid
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FASHION_STYLES.map((st) => {
                        const isSelected = formData.avoidedStyles.includes(st);
                        return (
                          <button
                            key={st}
                            type="button"
                            onClick={() => toggleArrayItem("avoidedStyles", st)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-red-800 text-white border-red-800 shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {isSelected && <X size={13} strokeWidth={2.5} />}
                            <span>{st}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 3: CLOTHING TYPES (Q7, Q8)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#183B56] uppercase tracking-tight mb-1">
                      Garment Archetypes
                    </h2>
                    <p className="text-xs text-[#5A7184]">
                      Specify which wardrobe pieces you wear frequently and which silhouettes you want filtered out.
                    </p>
                  </div>

                  {/* Q7: Preferred Clothing Types */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      7. Preferred Garment Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_TYPES.map((type) => {
                        const isSelected = formData.preferredClothingTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleArrayItem("preferredClothingTypes", type)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={2.5} />}
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q8: Avoided Clothing Types */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      8. Garment Types to Avoid
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_TYPES.map((type) => {
                        const isSelected = formData.avoidedClothingTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleArrayItem("avoidedClothingTypes", type)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-red-800 text-white border-red-800 shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {isSelected && <X size={13} strokeWidth={2.5} />}
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 4: COLOR PALETTE (Q9, Q10)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#183B56] uppercase tracking-tight mb-1">
                      Color Palette Curation
                    </h2>
                    <p className="text-xs text-[#5A7184]">
                      Select shades that complement your skin tone and personal color spectrum.
                    </p>
                  </div>

                  {/* Q9: Preferred Colors */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      9. Preferred Color Tones
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {COLOR_OPTIONS.map((c) => {
                        const isSelected = formData.preferredColors.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => toggleArrayItem("preferredColors", c.name)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all text-left ${
                              isSelected
                                ? "border-[#183B56] bg-white ring-2 ring-[#183B56] shadow-xs"
                                : "border-[#183B56]/30 bg-white hover:border-[#183B56]"
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-[#183B56] truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q10: Avoided Colors */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      10. Avoided Colors
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {AVOIDED_COLOR_OPTIONS.map((c) => {
                        const isSelected = formData.avoidedColors.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => toggleArrayItem("avoidedColors", c.name)}
                            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all text-left ${
                              isSelected
                                ? "border-red-800 bg-red-50 ring-2 ring-red-800"
                                : "border-[#183B56]/30 bg-white hover:border-[#183B56]"
                            }`}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-black/10 shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="text-[#183B56] truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 5: OCCASIONS & BUDGET (Q11, Q12, Q13)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#183B56] uppercase tracking-tight mb-1">
                      Lifestyle, Occasions & Budget
                    </h2>
                    <p className="text-xs text-[#5A7184]">
                      Tell us about the events you dress for and your investment range per piece.
                    </p>
                  </div>

                  {/* Q11: Occasions */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      11. Occasions You Dress For
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((occ) => {
                        const isSelected = formData.occasions.includes(occ);
                        return (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => toggleArrayItem("occasions", occ)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                                : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={2.5} />}
                            <span>{occ}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q12: Primary Occasion */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      12. Primary Lifestyle Focus
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {OCCASIONS.map((occ) => (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setFormData({ ...formData, primaryOccasion: occ })}
                          className={`py-2.5 px-3 rounded-full text-xs font-semibold border transition-all ${
                            formData.primaryOccasion === occ
                              ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                              : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                          }`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q13: Budget Range */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      13. Budget Tier Per Item
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {BUDGET_RANGES.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({ ...formData, budgetRange: b })}
                          className={`py-2.5 px-4 rounded-xl text-xs font-semibold border text-left transition-all ${
                            formData.budgetRange === b
                              ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                              : "bg-white text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-[#DFE7ED]/30"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 6: PROFILE PICTURE & FIT CALIBRATION PHOTOS
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#183B56] uppercase tracking-tight mb-1">
                      Visual Calibration & Photos
                    </h2>
                    <p className="text-xs text-[#5A7184]">
                      Uploading photos helps our neural styling engine analyze posture, proportions, and drape to suggest flawless outfits.
                    </p>
                  </div>

                  {/* Primary Profile Avatar */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                      Account Profile Picture
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full border-2 border-[#183B56] overflow-hidden bg-white flex items-center justify-center shrink-0">
                        {profileImagePreview ? (
                          <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                        ) : (
                          <User size={24} className="text-[#5A7184]" />
                        )}
                      </div>
                      <div>
                        <input
                          ref={profileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleProfileImageSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => profileInputRef.current?.click()}
                          className="px-4 py-2 border border-[#183B56] bg-white text-[#183B56] text-xs font-bold uppercase tracking-wider hover:bg-[#183B56] hover:text-white transition-colors"
                        >
                          {profileImagePreview ? "Change Photo" : "Upload Avatar"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Images (Max 3) */}
                  <div className="space-y-2 pt-4 border-t border-[#183B56]/15">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#183B56]">
                        Fit Reference Images ({existingRecImages.length + recImageFiles.length}/3)
                      </label>
                      <span className="text-[11px] text-[#5A7184] font-medium">Optional • Private</span>
                    </div>

                    <p className="text-xs text-[#5A7184]">
                      Full-body or outfit photos help calibrate silhouette drape and precision fit recommendations.
                    </p>

                    {existingRecImages.length + recImageFiles.length < 3 && (
                      <div
                        onClick={() => recImagesInputRef.current?.click()}
                        className="border border-dashed border-[#183B56]/50 bg-white hover:bg-[#DFE7ED]/20 p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        <input
                          ref={recImagesInputRef}
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleRecImagesSelect}
                          className="hidden"
                        />
                        <Camera size={24} className="text-[#183B56]" />
                        <span className="text-xs font-bold text-[#183B56] uppercase tracking-wider">
                          Select Photos from Device
                        </span>
                        <span className="text-[11px] text-[#5A7184]">PNG, JPG, WEBP up to 10MB</span>
                      </div>
                    )}

                    {/* Image Previews */}
                    {(existingRecImages.length > 0 || recImageFiles.length > 0) && (
                      <div className="grid grid-cols-3 gap-3 pt-2">
                        {/* Existing Stored Images */}
                        {existingRecImages.map((img) => (
                          <div key={img.id} className="relative group aspect-square border border-[#183B56] overflow-hidden bg-white">
                            <img src={img.imageUrl} alt="Analysis photo" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingRecImage(img.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-800 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Delete photo"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Pending Upload Files */}
                        {recImageFiles.map((item, idx) => (
                          <div key={idx} className="relative group aspect-square border border-[#183B56] overflow-hidden bg-white">
                            <img src={item.preview} alt="New upload" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePendingRecImage(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-[#183B56] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Remove photo"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Modal Footer Buttons ── */}
        <div className="px-6 sm:px-8 py-4 border-t border-[#183B56] bg-[#F5EFEB] flex items-center justify-between sticky bottom-0 z-20">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="h-10 px-5 border border-[#183B56] text-[#183B56] text-xs font-bold uppercase tracking-wider bg-white hover:bg-[#183B56] hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <ChevronLeft size={15} /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Optional Skip for Image Steps */}
            {currentStep === 6 && (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="text-xs font-bold uppercase tracking-wider text-[#5A7184] hover:text-[#183B56] transition-colors cursor-pointer"
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || loadingInitial}
              className="h-10 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-[#183B56] shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader size="xs" />
                  <span>Saving Blueprint...</span>
                </>
              ) : successStep ? (
                <>
                  <Check size={15} />
                  <span>Welcome to Weavly</span>
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <span>Complete Blueprint</span>
                  <ChevronRight size={15} />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight size={15} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
