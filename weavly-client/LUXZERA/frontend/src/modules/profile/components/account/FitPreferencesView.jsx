"use client";

import React, { useState, useEffect } from "react";
import { Check, Plus, AlertCircle, Loader2, Sliders, Sparkles } from "lucide-react";
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
          return prev;
        }
        return { ...prev, [field]: [...list, val] };
      }
    });
  };

  const addCustomItem = (field, customField) => {
    const val = formData[customField]?.trim();
    if (!val) return;
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(val) ? prev[field] : [...prev[field], val],
      [customField]: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccess(false);

    if (formData.shoppingPriorities.length > 3) {
      setErrorMsg("You can select a maximum of 3 shopping priorities.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        heightRange: formData.heightRange,
        exactHeightCm: formData.exactHeightCm ? parseFloat(formData.exactHeightCm) : null,
        weightRange: formData.weightRange,
        exactWeightKg: formData.exactWeightKg ? parseFloat(formData.exactWeightKg) : null,
        clothingSize: formData.customClothingSize.trim() || formData.clothingSize,
        fitPreferences: formData.fitPreferences,
        preferredStyles: formData.preferredStyles,
        avoidedStyles: formData.avoidedStyles,
        preferredClothingTypes: formData.preferredClothingTypes,
        avoidedClothingTypes: formData.avoidedClothingTypes,
        preferredColors: formData.preferredColors,
        avoidedColors: formData.avoidedColors,
        occasions: formData.occasions,
        primaryOccasion: formData.primaryOccasion,
        budgetRange: formData.budgetRange,
        shoppingPriorities: formData.shoppingPriorities,
        fashionGoals: formData.fashionGoals,
      };

      await saveFitData(userId, payload);
      setSuccess(true);
      onSaveSuccess?.();
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error(err);
      setErrorMsg(formatErrorMessage(err, "Failed to save fit preferences."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-[#183B56] bg-white p-12 text-center flex flex-col items-center justify-center space-y-3">
        <Loader2 size={24} className="animate-spin text-[#183B56]" />
        <p className="text-xs font-bold uppercase tracking-wider text-[#5A7184]">
          Calibrating Style &amp; Fit Profile...
        </p>
      </div>
    );
  }

  // Reusable pill classes for architectural styling
  const pillBtnClass = (isSelected, isForbidden = false) => `
    px-3.5 py-2 text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs select-none
    ${
      isSelected
        ? isForbidden
          ? "bg-red-700 text-white border-red-700"
          : "bg-[#183B56] text-white border-[#183B56]"
        : "bg-[#F5EFEB]/50 text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-white"
    }
  `;

  const inputClass =
    "h-10 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] placeholder-[#5A7184]/50 outline-none focus:ring-1 focus:ring-[#183B56]";

  return (
    <div className="space-y-6 text-[#183B56] font-sans">
      {/* ── Main Header ── */}
      <div className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#183B56]/20">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-[#DFE7ED] border border-[#183B56] flex items-center justify-center shrink-0">
              <Sliders size={18} className="text-[#183B56]" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Bespoke Wardrobe Calibration
              </span>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
                Fit &amp; Style Preferences
              </h2>
            </div>
          </div>

          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#183B56] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-1 self-start sm:self-auto">
            15 CALIBRATION MODULES
          </span>
        </div>

        <p className="text-xs text-[#5A7184] font-medium leading-relaxed max-w-2xl">
          Zyra analyzes your exact proportions, color palette, and lifestyle priorities to construct harmonious wardrobe collections from verified independent designers.
        </p>

        {/* Status Alerts */}
        {errorMsg && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-300 text-xs font-bold text-red-700 flex items-center gap-2">
            <AlertCircle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}
        {success && (
          <div className="mt-4 p-3.5 bg-[#F5EFEB] border border-[#183B56] text-xs font-bold text-[#183B56] flex items-center gap-2">
            <Check size={15} strokeWidth={2.5} />
            <span>Preferences updated successfully! Your Zyra recommendation engine is calibrated.</span>
          </div>
        )}
      </div>

      {/* ── 15 Questions Form ── */}
      <form onSubmit={handleSubmit} className="border border-[#183B56] bg-white p-6 sm:p-8 shadow-xs space-y-8">

        {/* Q1: Height Range & Exact Height */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              01
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Height Range &amp; Exact Height
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {HEIGHT_RANGES.map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setFormData({ ...formData, heightRange: range })}
                className={pillBtnClass(formData.heightRange === range)}
              >
                {formData.heightRange === range && <Check size={12} strokeWidth={2.5} />}
                <span>{range}</span>
              </button>
            ))}
          </div>

          <div className="pt-1 flex items-center gap-3">
            <input
              type="number"
              placeholder="Exact Height (cm)"
              value={formData.exactHeightCm}
              onChange={(e) => setFormData({ ...formData, exactHeightCm: e.target.value })}
              className={`w-48 ${inputClass}`}
            />
            <span className="text-xs font-mono text-[#5A7184]">Optional cm</span>
          </div>
        </div>

        {/* Q2: Approximate Weight */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              02
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Approximate Weight
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {WEIGHT_RANGES.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setFormData({ ...formData, weightRange: w })}
                className={pillBtnClass(formData.weightRange === w)}
              >
                {formData.weightRange === w && <Check size={12} strokeWidth={2.5} />}
                <span>{w}</span>
              </button>
            ))}
          </div>

          <div className="pt-1 flex items-center gap-3">
            <input
              type="number"
              placeholder="Exact Weight (kg)"
              value={formData.exactWeightKg}
              onChange={(e) => setFormData({ ...formData, exactWeightKg: e.target.value })}
              className={`w-48 ${inputClass}`}
            />
            <span className="text-xs font-mono text-[#5A7184]">Optional kg</span>
          </div>
        </div>

        {/* Q3: Clothing Size */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              03
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Clothing Size
            </label>
          </div>

          <div className="space-y-2.5">
            <div className="flex flex-wrap gap-2">
              {STANDARD_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, clothingSize: size, customClothingSize: "" })}
                  className={pillBtnClass(formData.clothingSize === size && !formData.customClothingSize)}
                >
                  {formData.clothingSize === size && !formData.customClothingSize && <Check size={12} strokeWidth={2.5} />}
                  <span>{size}</span>
                </button>
              ))}
            </div>

            <div className="text-[11px] font-bold uppercase tracking-wider text-[#5A7184] pt-1">
              Waist / Numeric Sizes:
            </div>
            <div className="flex flex-wrap gap-2">
              {NUMERIC_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, clothingSize: size, customClothingSize: "" })}
                  className={pillBtnClass(formData.clothingSize === size && !formData.customClothingSize)}
                >
                  {formData.clothingSize === size && !formData.customClothingSize && <Check size={12} strokeWidth={2.5} />}
                  <span>{size}</span>
                </button>
              ))}
            </div>

            <div className="pt-1">
              <input
                type="text"
                placeholder="Or enter custom size (e.g. 33, 42L)"
                value={formData.customClothingSize}
                onChange={(e) => setFormData({ ...formData, customClothingSize: e.target.value })}
                className={`w-full sm:w-72 ${inputClass}`}
              />
            </div>
          </div>
        </div>

        {/* Q4: Fit Preferences (Multi-select) */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              04
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Fit Preferences (Multi-select)
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {FIT_PREFERENCES.map((fit) => {
              const isSelected = formData.fitPreferences.includes(fit);
              return (
                <button
                  key={fit}
                  type="button"
                  onClick={() => toggleMulti("fitPreferences", fit)}
                  className={pillBtnClass(isSelected)}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{fit}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q5: Preferred Fashion Styles */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              05
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Preferred Fashion Styles
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {FASHION_STYLES.map((st) => {
              const isSelected = formData.preferredStyles.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => toggleMulti("preferredStyles", st)}
                  className={pillBtnClass(isSelected)}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{st}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-1 max-w-sm">
            <input
              type="text"
              placeholder="Add other style..."
              value={formData.customPreferredStyle}
              onChange={(e) => setFormData({ ...formData, customPreferredStyle: e.target.value })}
              className={`flex-1 ${inputClass}`}
            />
            <button
              type="button"
              onClick={() => addCustomItem("preferredStyles", "customPreferredStyle")}
              className="h-10 px-4 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
            >
              <Plus size={13} />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Q6: Avoided Fashion Styles */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-red-600 bg-red-50 text-red-700">
              06
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Avoided Fashion Styles
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {FASHION_STYLES.map((st) => {
              const isSelected = formData.avoidedStyles.includes(st);
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => toggleMulti("avoidedStyles", st)}
                  className={pillBtnClass(isSelected, true)}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{st}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q7: Preferred Clothing Types */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              07
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Preferred Clothing Types
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {CLOTHING_TYPES.map((type) => {
              const isSelected = formData.preferredClothingTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleMulti("preferredClothingTypes", type)}
                  className={pillBtnClass(isSelected)}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q8: Avoided Clothing Types */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-red-600 bg-red-50 text-red-700">
              08
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Avoided Clothing Types
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {CLOTHING_TYPES.map((type) => {
              const isSelected = formData.avoidedClothingTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleMulti("avoidedClothingTypes", type)}
                  className={pillBtnClass(isSelected, true)}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q9: Preferred Colors */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              09
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Preferred Colors
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map((c) => {
              const isSelected = formData.preferredColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleMulti("preferredColors", c.name)}
                  className={pillBtnClass(isSelected)}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q10: Avoided Colors */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-red-600 bg-red-50 text-red-700">
              10
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Avoided Colors
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {AVOIDED_COLOR_OPTIONS.map((c) => {
              const isSelected = formData.avoidedColors.includes(c.name);
              return (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => toggleMulti("avoidedColors", c.name)}
                  className={pillBtnClass(isSelected, true)}
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0 border border-black/20"
                    style={{ backgroundColor: c.hex }}
                  />
                  <span>{c.name}</span>
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Q11: Occasions You Dress For */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              11
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Occasions You Dress For
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => {
              const isSelected = formData.occasions.includes(occ);
              return (
                <button
                  key={occ}
                  type="button"
                  onClick={() => toggleMulti("occasions", occ)}
                  className={pillBtnClass(isSelected)}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{occ}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q12: Most Important Occasion (Primary) */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              12
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Most Important Occasion (Primary)
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                type="button"
                onClick={() => setFormData({ ...formData, primaryOccasion: occ })}
                className={pillBtnClass(formData.primaryOccasion === occ)}
              >
                {formData.primaryOccasion === occ && <Check size={12} strokeWidth={2.5} />}
                <span>{occ}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Q13: Typical Clothing Budget (Per Item) */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              13
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Typical Clothing Budget (Per Item)
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {BUDGET_RANGES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setFormData({ ...formData, budgetRange: b })}
                className={pillBtnClass(formData.budgetRange === b)}
              >
                {formData.budgetRange === b && <Check size={12} strokeWidth={2.5} />}
                <span>{b}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Q14: Shopping Priorities (Max 3) */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
                14
              </span>
              <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
                Shopping Priorities (Max 3)
              </label>
            </div>

            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
              formData.shoppingPriorities.length === 3
                ? "bg-[#183B56] text-white border-[#183B56]"
                : "bg-[#F5EFEB] text-[#5A7184] border-[#183B56]/30"
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
                  className={`
                    px-3.5 py-2 text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-1.5 select-none
                    ${
                      isSelected
                        ? "bg-[#183B56] text-white border-[#183B56] shadow-xs cursor-pointer"
                        : isMaxReached
                        ? "opacity-35 bg-[#F5EFEB]/30 border-dashed border-[#183B56]/30 cursor-not-allowed"
                        : "bg-[#F5EFEB]/50 text-[#183B56] border-[#183B56]/30 hover:border-[#183B56] hover:bg-white cursor-pointer"
                    }
                  `}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Q15: Fashion Goals */}
        <div className="space-y-3 pt-6 border-t border-[#183B56]/15">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 border border-[#183B56] bg-[#F5EFEB]">
              15
            </span>
            <label className="text-xs font-bold uppercase tracking-wider text-[#183B56]">
              Fashion Goals
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            {FASHION_GOALS.map((goal) => {
              const isSelected = formData.fashionGoals.includes(goal);
              return (
                <button
                  key={goal}
                  type="button"
                  onClick={() => toggleMulti("fashionGoals", goal)}
                  className={pillBtnClass(isSelected)}
                >
                  {isSelected && <Check size={12} strokeWidth={2.5} />}
                  <span>{goal}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-[#183B56]/20 flex justify-start">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50 active:scale-[0.99]"
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Check size={14} />
                <span>Save Fit &amp; Preferences</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
