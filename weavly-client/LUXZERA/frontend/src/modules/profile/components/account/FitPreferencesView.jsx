"use client";

import React, { useState, useEffect } from "react";
import { Check, Plus, AlertCircle, Loader2 } from "lucide-react";
import { getFitData, saveFitData } from "@/modules/profile/services/userFitDataService";
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
} from "@/modules/onboarding/data/questionnaireConstants";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function FitPreferencesView({ userId, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    heightRange: "",
    exactHeightCm: "",
    weightRange: "",
    exactWeightKg: "",
    clothingSize: "",
    customClothingSize: "",
    fitPreferences: [],
    preferredStyles: [],
    customPreferredStyle: "",
    avoidedStyles: [],
    customAvoidedStyle: "",
    preferredClothingTypes: [],
    avoidedClothingTypes: [],
    preferredColors: [],
    avoidedColors: [],
    occasions: [],
    primaryOccasion: "",
    budgetRange: "",
    shoppingPriorities: [],
    fashionGoals: [],
    customFashionGoal: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchFit = async () => {
      if (!userId || String(userId).startsWith("customer_dev_")) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getFitData(userId);
        if (data) {
          setFormData((prev) => ({
            ...prev,
            heightRange: data.heightRange || "",
            exactHeightCm: data.exactHeightCm ? String(data.exactHeightCm) : "",
            weightRange: data.weightRange || "",
            exactWeightKg: data.exactWeightKg ? String(data.exactWeightKg) : "",
            clothingSize: data.clothingSize || "",
            fitPreferences: data.fitPreferences || [],
            preferredStyles: data.preferredStyles || [],
            avoidedStyles: data.avoidedStyles || [],
            preferredClothingTypes: data.preferredClothingTypes || [],
            avoidedClothingTypes: data.avoidedClothingTypes || [],
            preferredColors: data.preferredColors || [],
            avoidedColors: data.avoidedColors || [],
            occasions: data.occasions || [],
            primaryOccasion: data.primaryOccasion || "",
            budgetRange: data.budgetRange || "",
            shoppingPriorities: data.shoppingPriorities || [],
            fashionGoals: data.fashionGoals || [],
          }));
        }
      } catch (err) {
        console.warn("No existing fit data or error fetching fit data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFit();
  }, [userId]);

  const toggleMulti = (field, val, max = null) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (list.includes(val)) {
        return { ...prev, [field]: list.filter((item) => item !== val) };
      } else {
        if (max && list.length >= max) {
          setErrorMsg(`Maximum ${max} options allowed.`);
          setTimeout(() => setErrorMsg(""), 3000);
          return prev;
        }
        return { ...prev, [field]: [...list, val] };
      }
    });
  };

  const addCustom = (field, customField) => {
    const val = formData[customField]?.trim();
    if (!val) return;
    setFormData((prev) => {
      const list = prev[field] || [];
      if (!list.includes(val)) {
        return { ...prev, [field]: [...list, val], [customField]: "" };
      }
      return { ...prev, [customField]: "" };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.shoppingPriorities.length > 3) {
      setErrorMsg("Shopping priorities cannot exceed 3 selections.");
      return;
    }

    setSaving(true);
    setErrorMsg("");
    setSuccess(false);

    try {
      const effectiveSize = formData.customClothingSize?.trim() || formData.clothingSize;
      const payload = {
        heightRange: formData.heightRange || null,
        exactHeightCm: formData.exactHeightCm ? Number(formData.exactHeightCm) : null,
        weightRange: formData.weightRange || null,
        exactWeightKg: formData.exactWeightKg ? Number(formData.exactWeightKg) : null,
        clothingSize: effectiveSize || null,
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

      if (userId && !String(userId).startsWith("customer_dev_")) {
        await saveFitData(userId, payload);
      }
      setSuccess(true);
      onSaveSuccess?.(payload);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to save style preferences."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#8C8C8C]">
        <Loader2 size={28} className="animate-spin text-[#1A1A1A] mb-2" />
        <p className="text-xs font-semibold">Loading fit & style preferences...</p>
      </div>
    );
  }

  return (
    <div className="relative font-['Plus_Jakarta_Sans',sans-serif] text-left">
      {errorMsg && (
        <div className="px-5 py-3 mb-6 bg-red-50 border border-red-100 rounded-xl text-[12.5px] text-red-600 font-medium flex items-center gap-2">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {success && (
        <div className="px-5 py-3 mb-6 bg-emerald-50 border border-emerald-100 rounded-xl text-[12.5px] text-emerald-700 font-semibold flex items-center gap-2">
          <Check size={15} />
          <span>Preferences updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Q1: Height */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
            1. Height Range & Exact Height
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {HEIGHT_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setFormData({ ...formData, heightRange: range })}
                className={`py-2 px-3 rounded-full text-xs font-semibold border transition-all duration-200 ${
                  formData.heightRange === range
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
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
              className="w-48 h-9 px-3 rounded-xl border border-[#E8E5E0] bg-[#FAFAF9] text-xs text-[#1A1A1A] focus:border-[#C8702A] focus:bg-white outline-none transition-all duration-200"
            />
            <span className="text-xs text-[#8C8C8C]">Optional cm</span>
          </div>
        </div>

        {/* Q2: Approximate Weight */}
        <div className="space-y-2 pt-4 border-t border-[#EDEBE8]">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
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
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
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
              className="w-48 h-9 px-3 rounded-xl border border-[#E8E5E0] bg-[#FAFAF9] text-xs text-[#1A1A1A] focus:border-[#1A1A1A] focus:bg-white outline-none"
            />
            <span className="text-xs text-[#8C8C8C]">Optional kg</span>
          </div>
        </div>

        {/* Q3: Clothing Size */}
        <div className="space-y-2 pt-4 border-t border-[#EDEBE8]">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
            3. Clothing Size
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
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-semibold text-[#8C8C8C] pt-1">Waist / Numeric Sizes:</div>
            <div className="flex flex-wrap gap-1.5">
              {NUMERIC_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, clothingSize: size, customClothingSize: "" })}
                  className={`min-w-[42px] py-1.5 px-3 rounded-full text-xs font-bold border transition-all ${
                    formData.clothingSize === size && !formData.customClothingSize
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="text"
                placeholder="Or enter custom size (e.g. 33, 42L)"
                value={formData.customClothingSize}
                onChange={(e) => setFormData({ ...formData, customClothingSize: e.target.value })}
                className="w-full sm:w-72 h-9 px-3 rounded-xl border border-[#E8E5E0] bg-[#FAFAF9] text-xs text-[#1A1A1A] focus:bg-white outline-none"
              />
            </div>
          </div>
        </div>

        {/* Q4: Fit Preferences */}
        <div className="space-y-2 pt-4 border-t border-[#EDEBE8]">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
            4. Fit Preferences (Multi-select)
          </label>
          <div className="flex flex-wrap gap-2">
            {FIT_PREFERENCES.map((fit) => {
              const isSelected = formData.fitPreferences.includes(fit);
              return (
                <button
                  key={fit}
                  type="button"
                  onClick={() => toggleMulti("fitPreferences", fit)}
                  className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                  <span>{fit}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q5 & Q6: Styles */}
        <div className="space-y-4 pt-4 border-t border-[#EDEBE8]">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              5. Preferred Fashion Styles
            </label>
            <div className="flex flex-wrap gap-2">
              {FASHION_STYLES.map((st) => {
                const isSelected = formData.preferredStyles.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleMulti("preferredStyles", st)}
                    className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-2 pt-2">
              <input
                type="text"
                placeholder="Add custom style..."
                value={formData.customPreferredStyle}
                onChange={(e) => setFormData({ ...formData, customPreferredStyle: e.target.value })}
                className="h-8 px-3 rounded-lg border border-[#E8E5E0] bg-[#FAFAF9] text-xs text-[#1A1A1A] focus:bg-white outline-none w-48"
              />
              <button
                type="button"
                onClick={() => addCustom("preferredStyles", "customPreferredStyle")}
                className="h-8 px-3 rounded-lg bg-[#1A1A1A] text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus size={13} /> Add
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              6. Avoided Fashion Styles
            </label>
            <div className="flex flex-wrap gap-2">
              {FASHION_STYLES.map((st) => {
                const isSelected = formData.avoidedStyles.includes(st);
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleMulti("avoidedStyles", st)}
                    className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-red-400"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{st}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Q7 & Q8: Clothing Types */}
        <div className="space-y-4 pt-4 border-t border-[#EDEBE8]">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              7. Preferred Clothing Types
            </label>
            <div className="flex flex-wrap gap-2">
              {CLOTHING_TYPES.map((ct) => {
                const isSelected = formData.preferredClothingTypes.includes(ct);
                return (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => toggleMulti("preferredClothingTypes", ct)}
                    className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{ct}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              8. Avoided Clothing Types
            </label>
            <div className="flex flex-wrap gap-2">
              {CLOTHING_TYPES.map((ct) => {
                const isSelected = formData.avoidedClothingTypes.includes(ct);
                return (
                  <button
                    key={ct}
                    type="button"
                    onClick={() => toggleMulti("avoidedClothingTypes", ct)}
                    className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-red-400"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{ct}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Q9 & Q10: Colors */}
        <div className="space-y-4 pt-4 border-t border-[#EDEBE8]">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              9. Preferred Colors
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = formData.preferredColors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleMulti("preferredColors", c.name)}
                    className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
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

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              10. Avoided Colors
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {AVOIDED_COLOR_OPTIONS.map((c) => {
                const isSelected = formData.avoidedColors.includes(c.name);
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => toggleMulti("avoidedColors", c.name)}
                    className={`p-2 rounded-xl text-xs font-medium border flex items-center gap-2 transition-all ${
                      isSelected
                        ? "bg-red-600 text-white border-red-600"
                        : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-red-400"
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

        {/* Q11 & Q12: Occasions */}
        <div className="space-y-4 pt-4 border-t border-[#EDEBE8]">
          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              11. Occasions You Dress For
            </label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => {
                const isSelected = formData.occasions.includes(occ);
                return (
                  <button
                    key={occ}
                    type="button"
                    onClick={() => toggleMulti("occasions", occ)}
                    className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                        : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                    }`}
                  >
                    {isSelected && <Check size={12} strokeWidth={3} />}
                    <span>{occ}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
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
                      : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#F07020]"
                  }`}
                >
                  {occ}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Q13: Budget Range */}
        <div className="space-y-2 pt-4 border-t border-[#EDEBE8]">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
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
                    ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                    : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Q14: Shopping Priorities */}
        <div className="space-y-2 pt-4 border-t border-[#EDEBE8]">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
              14. Shopping Priorities (Max 3)
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
                  onClick={() => toggleMulti("shoppingPriorities", p, 3)}
                  className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : isMaxReached
                      ? "opacity-40 bg-[#FAFAF9] border-[#E8E5E0] cursor-not-allowed"
                      : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
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
        <div className="space-y-2 pt-4 border-t border-[#EDEBE8]">
          <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-800">
            15. Fashion Goals
          </label>
          <div className="flex flex-wrap gap-2">
            {FASHION_GOALS.map((goal) => {
              const isSelected = formData.fashionGoals.includes(goal);
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleMulti("fashionGoals", goal)}
                  className={`py-2 px-3.5 rounded-full text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-[#1A1A1A] text-white border-[#1A1A1A]"
                      : "bg-[#FAFAF9] text-[#1A1A1A] border-[#E8E5E0] hover:border-[#1A1A1A]"
                  }`}
                >
                  {isSelected && <Check size={12} strokeWidth={3} />}
                  <span>{goal}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 flex justify-start">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-8 rounded-xl bg-[#1A1A1A] hover:bg-black text-white text-[13px] font-semibold flex items-center gap-2 shadow-sm transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <span>Save Fit & Preferences</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
