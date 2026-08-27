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
  Loader2
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
  const profileFileInputRef = useRef(null);

  // ── Recommendation Images State ────────────────────────────────────────────
  const [recImageFiles, setRecImageFiles] = useState([]); // pending new files
  const [existingRecImages, setExistingRecImages] = useState([]); // already on server
  const recFileInputRef = useRef(null);

  // ── UI States ──────────────────────────────────────────────────────────────
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successStep, setSuccessStep] = useState(false);

  // Pre-load existing fit data if user has partial data
  useEffect(() => {
    if (!isOpen || !user?.id || String(user.id).startsWith("customer_dev_")) return;

    const loadData = async () => {
      try {
        setLoadingInitial(true);
        const fitData = await getFitData(user.id);
        if (fitData) {
          setFormData((prev) => ({
            ...prev,
            heightRange: fitData.heightRange || "",
            exactHeightCm: fitData.exactHeightCm ? String(fitData.exactHeightCm) : "",
            weightRange: fitData.weightRange || "",
            exactWeightKg: fitData.exactWeightKg ? String(fitData.exactWeightKg) : "",
            clothingSize: fitData.clothingSize || "",
            fitPreferences: fitData.fitPreferences || [],
            preferredStyles: fitData.preferredStyles || [],
            avoidedStyles: fitData.avoidedStyles || [],
            preferredClothingTypes: fitData.preferredClothingTypes || [],
            avoidedClothingTypes: fitData.avoidedClothingTypes || [],
            preferredColors: fitData.preferredColors || [],
            avoidedColors: fitData.avoidedColors || [],
            occasions: fitData.occasions || [],
            primaryOccasion: fitData.primaryOccasion || "",
            budgetRange: fitData.budgetRange || "",
            shoppingPriorities: fitData.shoppingPriorities || [],
            fashionGoals: fitData.fashionGoals || [],
          }));
        }

        const images = await getRecommendationImages(user.id);
        if (Array.isArray(images)) {
          setExistingRecImages(images);
        }
      } catch (err) {
        // Fresh onboarding, no existing record is normal
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, [isOpen, user?.id]);

  if (!isOpen) return null;

  // ── Multi-select helpers ───────────────────────────────────────────────────
  const toggleMultiSelect = (field, value, max = null) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter((item) => item !== value) };
      } else {
        if (max && list.length >= max) {
          setErrorMsg(`You can select a maximum of ${max} items for this question.`);
          setTimeout(() => setErrorMsg(""), 3000);
          return prev;
        }
        return { ...prev, [field]: [...list, value] };
      }
    });
  };

  const addCustomItem = (field, customField) => {
    const val = formData[customField]?.trim();
    if (!val) return;
    setFormData((prev) => {
      const list = prev[field] || [];
      if (!list.includes(val)) {
        return {
          ...prev,
          [field]: [...list, val],
          [customField]: "",
        };
      }
      return { ...prev, [customField]: "" };
    });
  };

  // ── Primary Profile Image handlers ─────────────────────────────────────────
  const handleProfileImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfileImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview(null);
    if (profileFileInputRef.current) {
      profileFileInputRef.current.value = "";
    }
  };

  // ── Recommendation Images handlers ─────────────────────────────────────────
  const handleRecImagesSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newItems = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setRecImageFiles((prev) => [...prev, ...newItems]);
    }
  };

  const removePendingRecImage = (index) => {
    setRecImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingRecImage = async (imageId) => {
    try {
      if (user?.id && !String(user.id).startsWith("customer_dev_")) {
        await deleteRecommendationImage(user.id, imageId);
      }
      setExistingRecImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setErrorMsg("Failed to delete recommendation image.");
    }
  };

  // ── Validation per Step ────────────────────────────────────────────────────
  const validateStep = (step) => {
    setErrorMsg("");
    if (step === 1) {
      // Step 1: Body & Sizing
      const hasHeight = formData.heightRange || formData.exactHeightCm;
      const hasSize = formData.clothingSize || formData.customClothingSize;
      if (!hasHeight && !hasSize) {
        setErrorMsg("Please select your height or clothing size to proceed.");
        return false;
      }
    }
    if (step === 4) {
      // Step 4: Priorities max 3 validation
      if (formData.shoppingPriorities.length > 3) {
        setErrorMsg("Please select at most 3 shopping priorities.");
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep((prev) => prev + 1);
      } else {
        handleSubmitAll();
      }
    }
  };

  const handleBack = () => {
    setErrorMsg("");
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // ── Final Submission ───────────────────────────────────────────────────────
  const handleSubmitAll = async () => {
    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const effectiveClothingSize = formData.customClothingSize?.trim() || formData.clothingSize;

      // 1. Submit UserFitData to Spring Boot
      const fitPayload = {
        heightRange: formData.heightRange || null,
        exactHeightCm: formData.exactHeightCm ? Number(formData.exactHeightCm) : null,
        weightRange: formData.weightRange || null,
        exactWeightKg: formData.exactWeightKg ? Number(formData.exactWeightKg) : null,
        clothingSize: effectiveClothingSize || null,
        fitPreferences: formData.fitPreferences,
        preferredStyles: formData.preferredStyles,
        avoidedStyles: formData.avoidedStyles,
        preferredClothingTypes: formData.preferredClothingTypes,
        avoidedClothingTypes: formData.avoidedClothingTypes,
        preferredColors: formData.preferredColors,
        avoidedColors: formData.avoidedColors,
        occasions: formData.occasions,
        primaryOccasion: formData.primaryOccasion || (formData.occasions[0] || null),
        budgetRange: formData.budgetRange || null,
        shoppingPriorities: formData.shoppingPriorities.slice(0, 3),
        fashionGoals: formData.fashionGoals,
      };

      if (user?.id && !String(user.id).startsWith("customer_dev_")) {
        await saveFitData(user.id, fitPayload);

        // 2. Upload Profile Image if selected
        if (profileImageFile) {
          await updateProfile(user.id, {
            phoneNumber: user.phoneNumber || "",
            gender: user.gender || "",
            dateOfBirth: user.dateOfBirth || "",
            bio: user.bio || ""
          }, profileImageFile);
        }

        // 3. Upload Recommendation Images if selected
        for (const item of recImageFiles) {
          if (item.file) {
            await uploadRecommendationImage(user.id, item.file);
          }
        }

        // 4. Refresh canonical profile from Spring Boot
        await refreshUser();
      } else {
        // Local dev mock session
        if (refreshUser) {
          user.profileCompleted = true;
          user.fitData = fitPayload;
        }
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
    "Please complete your profile to get great outfit recommendations.";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E7E3DD] overflow-hidden flex flex-col max-h-[92vh] font-['Plus_Jakarta_Sans',sans-serif] animate-scale-up"
      >
        {/* ── Modal Header & Progress ── */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-[#ECECEC] bg-white sticky top-0 z-20">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#18181B] text-white text-xs font-bold">
                {currentStep}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
                Step {currentStep} of {totalSteps}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#F07020] bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
              <Sparkles size={13} />
              <span>Weavly Style Profile</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-[#F4F4F5] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#18181B] transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>

          {/* Backend Onboarding Notice */}
          <div className="mt-3 text-xs text-[#71717A] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F07020]" />
            <span>{onboardingMessage}</span>
          </div>
        </div>

        {/* ── Modal Content Area ── */}
        <div className="px-6 sm:px-8 py-6 overflow-y-auto flex-1 text-left space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-600 font-medium flex items-center gap-2">
              <AlertCircle size={15} className="flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loadingInitial ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#71717A]">
              <Loader2 size={32} className="animate-spin text-[#18181B] mb-2" />
              <p className="text-sm font-medium">Loading your profile preferences...</p>
            </div>
          ) : (
            <>
              {/* ══════════════════════════════════════════════════════════════
                  STEP 1: SIZING & FIT BASICS (Q1, Q2, Q3, Q4)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#18181B] mb-1">Body & Sizing Basics</h2>
                    <p className="text-xs text-[#71717A]">
                      Tell us your approximate measurements so recommendations fit you perfectly.
                    </p>
                  </div>

                  {/* Q1: Height */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      1. Height Range
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {HEIGHT_RANGES.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => setFormData({ ...formData, heightRange: range })}
                          className={`py-2.5 px-3 rounded-full text-xs font-semibold border transition-all ${
                            formData.heightRange === range
                              ? "bg-[#18181B] text-white border-[#18181B]"
                              : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
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
                        className="w-full sm:w-48 h-9 px-3 rounded-xl border border-[#E7E3DD] bg-[#FAFAF9] text-xs text-[#18181B] focus:border-[#18181B] focus:bg-white outline-none"
                      />
                      <span className="text-xs text-[#71717A]">Optional cm</span>
                    </div>
                  </div>

                  {/* Q2: Approximate Weight */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
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
                              ? "bg-[#18181B] text-white border-[#18181B]"
                              : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
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
                        className="w-full sm:w-48 h-9 px-3 rounded-xl border border-[#E7E3DD] bg-[#FAFAF9] text-xs text-[#18181B] focus:border-[#18181B] focus:bg-white outline-none"
                      />
                      <span className="text-xs text-[#71717A]">Optional kg</span>
                    </div>
                  </div>

                  {/* Q3: Clothing Size */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      3. Usual Clothing Size
                    </label>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1.5">
                        {STANDARD_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({ ...formData, clothingSize: size, customClothingSize: "" })}
                            className={`min-w-[42px] py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                              formData.clothingSize === size && !formData.customClothingSize
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      <div className="text-[11px] font-semibold text-[#71717A] pt-1">Waist / Numeric Sizes:</div>
                      <div className="flex flex-wrap gap-1.5">
                        {NUMERIC_SIZES.map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setFormData({ ...formData, clothingSize: size, customClothingSize: "" })}
                            className={`min-w-[42px] py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                              formData.clothingSize === size && !formData.customClothingSize
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>

                      <div className="pt-1">
                        <input
                          type="text"
                          placeholder="Or enter custom size (e.g. 33, 42L, UK 12)"
                          value={formData.customClothingSize}
                          onChange={(e) => setFormData({ ...formData, customClothingSize: e.target.value })}
                          className="w-full sm:w-72 h-9 px-3 rounded-xl border border-[#E7E3DD] bg-[#FAFAF9] text-xs text-[#18181B] focus:border-[#18181B] focus:bg-white outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Q4: Fit Preferences */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      4. Fit Preference (Multi-select)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FIT_PREFERENCES.map((fit) => {
                        const isSelected = formData.fitPreferences.includes(fit);
                        return (
                          <button
                            key={fit}
                            type="button"
                            onClick={() => toggleMultiSelect("fitPreferences", fit)}
                            className={`py-2 px-4 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            <span>{fit}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 2: FASHION STYLES (Q5, Q6)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#18181B] mb-1">Style Aesthetics</h2>
                    <p className="text-xs text-[#71717A]">
                      Select styles you gravitate towards, and ones you prefer to avoid.
                    </p>
                  </div>

                  {/* Q5: Preferred Styles */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      5. Preferred Fashion Styles (Loved)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FASHION_STYLES.map((style) => {
                        const isSelected = formData.preferredStyles.includes(style);
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => toggleMultiSelect("preferredStyles", style)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            <span>{style}</span>
                          </button>
                        );
                      })}
                    </div>
                    {/* Custom style input */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Add custom style..."
                        value={formData.customPreferredStyle}
                        onChange={(e) => setFormData({ ...formData, customPreferredStyle: e.target.value })}
                        className="h-8 px-3 rounded-lg border border-[#E7E3DD] bg-[#FAFAF9] text-xs text-[#18181B] focus:bg-white outline-none w-48"
                      />
                      <button
                        type="button"
                        onClick={() => addCustomItem("preferredStyles", "customPreferredStyle")}
                        className="h-8 px-3 rounded-lg bg-[#18181B] text-white text-xs font-bold flex items-center gap-1"
                      >
                        <Plus size={13} /> Add
                      </button>
                    </div>
                  </div>

                  {/* Q6: Avoided Styles */}
                  <div className="space-y-2 pt-4 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      6. Avoided Fashion Styles (Disliked)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FASHION_STYLES.map((style) => {
                        const isSelected = formData.avoidedStyles.includes(style);
                        return (
                          <button
                            key={style}
                            type="button"
                            onClick={() => toggleMultiSelect("avoidedStyles", style)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-red-400"
                            }`}
                          >
                            {isSelected && <X size={12} strokeWidth={3} />}
                            <span>{style}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 3: CLOTHING TYPES & COLORS (Q7, Q8, Q9, Q10)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#18181B] mb-1">Wardrobe & Colors</h2>
                    <p className="text-xs text-[#71717A]">
                      Select items you love wearing and your go-to color palette.
                    </p>
                  </div>

                  {/* Q7: Preferred Clothing Types */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      7. Preferred Clothing Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_TYPES.map((type) => {
                        const isSelected = formData.preferredClothingTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleMultiSelect("preferredClothingTypes", type)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q8: Avoided Clothing Types */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      8. Avoided Clothing Types
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {CLOTHING_TYPES.map((type) => {
                        const isSelected = formData.avoidedClothingTypes.includes(type);
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => toggleMultiSelect("avoidedClothingTypes", type)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-red-400"
                            }`}
                          >
                            {isSelected && <X size={12} strokeWidth={3} />}
                            <span>{type}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q9: Preferred Colors */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      9. Preferred Colors
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {COLOR_OPTIONS.map((c) => {
                        const isSelected = formData.preferredColors.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => toggleMultiSelect("preferredColors", c.name)}
                            className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                              isSelected
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            <span 
                              className={`w-4 h-4 rounded-full flex-shrink-0 ${c.border ? "border border-gray-300" : ""}`}
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q10: Avoided Colors */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      10. Avoided Colors
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AVOIDED_COLOR_OPTIONS.map((c) => {
                        const isSelected = formData.avoidedColors.includes(c.name);
                        return (
                          <button
                            key={c.name}
                            type="button"
                            onClick={() => toggleMultiSelect("avoidedColors", c.name)}
                            className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                              isSelected
                                ? "bg-red-600 text-white border-red-600"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-red-400"
                            }`}
                          >
                            <span 
                              className="w-4 h-4 rounded-full flex-shrink-0"
                              style={{ backgroundColor: c.hex }}
                            />
                            <span className="truncate">{c.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 4: OCCASIONS, BUDGET & PRIORITIES (Q11-Q15)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#18181B] mb-1">Lifestyle & Goals</h2>
                    <p className="text-xs text-[#71717A]">
                      Tell us about where you wear your clothes, your budget, and what matters most.
                    </p>
                  </div>

                  {/* Q11: Occasions */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      11. Occasions You Dress For
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {OCCASIONS.map((occ) => {
                        const isSelected = formData.occasions.includes(occ);
                        return (
                          <button
                            key={occ}
                            type="button"
                            onClick={() => toggleMultiSelect("occasions", occ)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            <span>{occ}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q12: Most Important Occasion */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      12. Most Important Occasion (Primary)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {(formData.occasions.length > 0 ? formData.occasions : OCCASIONS).map((occ) => (
                        <button
                          key={occ}
                          type="button"
                          onClick={() => setFormData({ ...formData, primaryOccasion: occ })}
                          className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all ${
                            formData.primaryOccasion === occ
                              ? "bg-[#F07020] text-white border-[#F07020]"
                              : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#F07020]"
                          }`}
                        >
                          {occ}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q13: Clothing Budget */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      13. Typical Clothing Budget (Per Item)
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {BUDGET_RANGES.map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setFormData({ ...formData, budgetRange: b })}
                          className={`py-2 px-3 rounded-full text-xs font-semibold border transition-all ${
                            formData.budgetRange === b
                              ? "bg-[#18181B] text-white border-[#18181B]"
                              : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                          }`}
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Q14: Shopping Priorities (MAX 3) */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                        14. Shopping Priorities
                      </label>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        formData.shoppingPriorities.length === 3 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {formData.shoppingPriorities.length}/3 selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SHOPPING_PRIORITIES.map((p) => {
                        const isSelected = formData.shoppingPriorities.includes(p);
                        const isMaxReached = formData.shoppingPriorities.length >= 3 && !isSelected;
                        return (
                          <button
                            key={p}
                            type="button"
                            disabled={isMaxReached}
                            onClick={() => toggleMultiSelect("shoppingPriorities", p, 3)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : isMaxReached
                                ? "opacity-40 bg-[#FAFAF9] border-[#E7E3DD] cursor-not-allowed"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            <span>{p}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Q15: Fashion Goals */}
                  <div className="space-y-2 pt-2 border-t border-[#F4F4F5]">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      15. Fashion Goals
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {FASHION_GOALS.map((goal) => {
                        const isSelected = formData.fashionGoals.includes(goal);
                        return (
                          <button
                            key={goal}
                            type="button"
                            onClick={() => toggleMultiSelect("fashionGoals", goal)}
                            className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? "bg-[#18181B] text-white border-[#18181B]"
                                : "bg-[#FAFAF9] text-[#18181B] border-[#E7E3DD] hover:border-[#18181B]"
                            }`}
                          >
                            {isSelected && <Check size={12} strokeWidth={3} />}
                            <span>{goal}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 5: PRIMARY PROFILE PICTURE (OPTIONAL 0..1)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 5 && (
                <div className="space-y-6 text-center">
                  <div>
                    <h2 className="text-xl font-bold text-[#18181B] mb-1">Primary Profile Picture</h2>
                    <p className="text-xs text-[#71717A]">
                      Upload your main profile avatar (optional). You can always change it later in settings.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center py-6">
                    <input
                      type="file"
                      ref={profileFileInputRef}
                      onChange={handleProfileImageSelect}
                      accept="image/*"
                      className="hidden"
                    />

                    <div 
                      onClick={() => profileFileInputRef.current?.click()}
                      className="relative group cursor-pointer w-32 h-32 rounded-full border-2 border-dashed border-[#D4D4D8] hover:border-[#18181B] flex items-center justify-center overflow-hidden transition-all bg-[#FAFAF9]"
                    >
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-[#71717A]">
                          <User size={36} strokeWidth={1.5} className="mb-1" />
                          <span className="text-[11px] font-bold uppercase tracking-wider">Add Avatar</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload size={20} />
                      </div>
                    </div>

                    {profileImagePreview && (
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          type="button"
                          onClick={() => profileFileInputRef.current?.click()}
                          className="text-xs font-semibold text-[#18181B] hover:underline"
                        >
                          Replace Photo
                        </button>
                        <span className="text-[#D4D4D8]">|</span>
                        <button
                          type="button"
                          onClick={removeProfileImage}
                          className="text-xs font-semibold text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════════════
                  STEP 6: RECOMMENDATION IMAGES (OPTIONAL 0..N)
              ══════════════════════════════════════════════════════════════ */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-[#18181B] mb-1">Style & Outfit Inspiration</h2>
                    <p className="text-xs text-[#71717A]">
                      Upload photos of outfits or styles you love (optional). Our recommendation engine uses these to curate looks for you.
                    </p>
                  </div>

                  <input
                    type="file"
                    ref={recFileInputRef}
                    onChange={handleRecImagesSelect}
                    accept="image/*"
                    multiple
                    className="hidden"
                  />

                  {/* Upload Box */}
                  <div
                    onClick={() => recFileInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D4D4D8] hover:border-[#18181B] rounded-2xl p-6 text-center cursor-pointer bg-[#FAFAF9] transition-all"
                  >
                    <ImageIcon size={32} className="mx-auto text-[#71717A] mb-2" />
                    <p className="text-xs font-bold text-[#18181B] mb-1">
                      Click to upload inspiration images
                    </p>
                    <p className="text-[11px] text-[#71717A]">
                      PNG, JPG, WebP up to 10MB each (multiple photos supported)
                    </p>
                  </div>

                  {/* Gallery of Uploaded / Existing Images */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#18181B]">
                      Your Style Gallery ({existingRecImages.length + recImageFiles.length} photos)
                    </label>

                    {existingRecImages.length === 0 && recImageFiles.length === 0 ? (
                      <p className="text-xs text-[#71717A] italic py-2">
                        No inspiration photos added yet. You can skip this step or add them later in your Account.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {/* Server Images */}
                        {existingRecImages.map((img) => (
                          <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-[#ECECEC]">
                            <img src={img.imageUrl} alt="Inspiration" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => handleDeleteExistingRecImage(img.id)}
                              className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}

                        {/* Pending Upload Files */}
                        {recImageFiles.map((item, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-[#ECECEC] bg-gray-100">
                            <img src={item.preview} alt="New upload" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removePendingRecImage(idx)}
                              className="absolute top-1.5 right-1.5 p-1 bg-black/70 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="px-6 sm:px-8 py-4 border-t border-[#ECECEC] bg-white flex items-center justify-between sticky bottom-0 z-20">
          <div>
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting}
                className="h-10 px-4 rounded-full border border-[#E7E3DD] text-[#18181B] text-xs font-bold hover:bg-[#FAFAF9] flex items-center gap-1.5 transition-all"
              >
                <ChevronLeft size={15} /> Back
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Optional Skip for Image Steps */}
            {(currentStep === 5 || currentStep === 6) && (
              <button
                type="button"
                onClick={handleNext}
                disabled={isSubmitting}
                className="text-xs font-bold text-[#71717A] hover:text-[#18181B] transition-colors"
              >
                Skip for now
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || loadingInitial}
              className="h-11 px-6 rounded-full bg-[#18181B] hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving Profile...</span>
                </>
              ) : successStep ? (
                <>
                  <Check size={15} />
                  <span>Welcome to Weavly!</span>
                </>
              ) : currentStep === totalSteps ? (
                <>
                  <span>Complete & Enter Store</span>
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
