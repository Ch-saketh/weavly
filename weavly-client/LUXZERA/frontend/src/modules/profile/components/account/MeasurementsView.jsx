import React, { useState, useEffect } from "react";
import { Sliders, Sparkles, Check, ChevronDown, ChevronUp } from "lucide-react";
import { getFitData, saveFitData } from "@/modules/profile/services/userFitDataService";
import Loader from "@/shared/components/ui/Loader";
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

const MeasurementsView = ({ userId, onSaveSuccess }) => {
  const [formData, setFormData] = useState({
    heightRange: "",
    exactHeightCm: "",
    weightRange: "",
    exactWeightKg: "",
    clothingSize: "",
    customClothingSize: "",
    fitPreferences: [],
    customFitPreference: "",
    preferredStyles: [],
    customPreferredStyle: "",
    avoidedStyles: [],
    customAvoidedStyle: "",
    preferredClothingTypes: [],
    customPreferredClothingType: "",
    avoidedClothingTypes: [],
    customAvoidedClothingType: "",
    preferredColors: [],
    customPreferredColor: "",
    avoidedColors: [],
    customAvoidedColor: "",
    occasions: [],
    customOccasion: "",
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
  const [openSections, setOpenSections] = useState({
    sizing: true,
    fit: true,
    styles: false,
    clothing: false,
    colors: false,
    lifestyle: false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  useEffect(() => {
    const fetchFitData = async () => {
      if (!userId || String(userId).startsWith("customer_dev_")) {
        setLoading(false);
        return;
      }
      try {
        const data = await getFitData(userId);
        if (data) {
          const isStandardSize = STANDARD_SIZES.includes(data.clothingSize) || NUMERIC_SIZES.includes(data.clothingSize);
          setFormData({
            heightRange: data.heightRange || "",
            exactHeightCm: data.exactHeightCm ? String(data.exactHeightCm) : "",
            weightRange: data.weightRange || "",
            exactWeightKg: data.exactWeightKg ? String(data.exactWeightKg) : "",
            clothingSize: isStandardSize ? data.clothingSize : (data.clothingSize ? "Custom" : ""),
            customClothingSize: isStandardSize ? "" : (data.clothingSize || ""),
            fitPreferences: data.fitPreferences || [],
            customFitPreference: "",
            preferredStyles: data.preferredStyles || [],
            customPreferredStyle: "",
            avoidedStyles: data.avoidedStyles || [],
            customAvoidedStyle: "",
            preferredClothingTypes: data.preferredClothingTypes || [],
            customPreferredClothingType: "",
            avoidedClothingTypes: data.avoidedClothingTypes || [],
            customAvoidedClothingType: "",
            preferredColors: data.preferredColors || [],
            customPreferredColor: "",
            avoidedColors: data.avoidedColors || [],
            customAvoidedColor: "",
            occasions: data.occasions || [],
            customOccasion: "",
            primaryOccasion: data.primaryOccasion || "",
            budgetRange: data.budgetRange || "",
            shoppingPriorities: data.shoppingPriorities || [],
            fashionGoals: data.fashionGoals || [],
            customFashionGoal: "",
          });
        }
      } catch (err) {
        console.error("Failed to load fit data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFitData();
  }, [userId]);

  const toggleMultiSelect = (field, value, max = null) => {
    setFormData((prev) => {
      const list = prev[field] || [];
      if (list.includes(value)) {
        return { ...prev, [field]: list.filter((item) => item !== value) };
      } else {
        if (max && list.length >= max) {
          setErrorMsg(`You can select a maximum of ${max} items for this preference.`);
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
        return { ...prev, [field]: [...list, val], [customField]: "" };
      }
      return { ...prev, [customField]: "" };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    setErrorMsg("");

    const effectiveClothingSize = formData.clothingSize === "Custom"
      ? (formData.customClothingSize?.trim() || "Custom")
      : (formData.customClothingSize?.trim() || formData.clothingSize);

    const payload = {
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

    try {
      if (userId && !String(userId).startsWith("customer_dev_")) {
        await saveFitData(userId, payload);
      }
      setSuccess(true);
      onSaveSuccess?.(payload);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      console.error("Save fit data error:", err);
      setErrorMsg(err.message || "Failed to save fit preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 select-none">
        <Loader size="w-12 h-12" />
        <div className="text-[10px] tracking-[0.45em] font-semibold text-slate-400/80 mt-5 uppercase animate-pulse pl-[0.45em]">
          Weavly
        </div>
      </div>
    );
  }

  return (
    <div className="relative font-['Plus_Jakarta_Sans',sans-serif]">
      {saving && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-20">
          <Loader size="w-10 h-10" />
        </div>
      )}

      <div className="pb-6 border-b border-slate-100 mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#2D3436] tracking-tight">Fashion Fit & Style Preferences</h2>
          <p className="text-xs text-slate-400 mt-1">
            Configure your sizing, aesthetic styles, colors, and wardrobe goals for Zyra intelligence.
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-[#F07020] rounded-full text-xs font-semibold">
          <Sparkles size={14} />
          <span>Zyra V1 Powered</span>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-red-600">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Section 1: Body Sizing & Dimensions ──────────────────────── */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("sizing")}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-[#2D3436]"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold text-slate-700">1</span>
              Physical Dimensions & Sizing
            </span>
            {openSections.sizing ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.sizing && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Height Range</label>
                <select
                  value={formData.heightRange}
                  onChange={(e) => setFormData({ ...formData, heightRange: e.target.value })}
                  className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                >
                  <option value="">Select Height Range</option>
                  {HEIGHT_RANGES.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exact Height (cm)</label>
                <input
                  type="number"
                  placeholder="e.g. 175"
                  value={formData.exactHeightCm}
                  onChange={(e) => setFormData({ ...formData, exactHeightCm: e.target.value })}
                  className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Weight Range</label>
                <select
                  value={formData.weightRange}
                  onChange={(e) => setFormData({ ...formData, weightRange: e.target.value })}
                  className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                >
                  <option value="">Select Weight Range</option>
                  {WEIGHT_RANGES.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Exact Weight (kg)</label>
                <input
                  type="number"
                  placeholder="e.g. 70"
                  value={formData.exactWeightKg}
                  onChange={(e) => setFormData({ ...formData, exactWeightKg: e.target.value })}
                  className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Clothing Size</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[...STANDARD_SIZES, ...NUMERIC_SIZES, "Custom"].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFormData({ ...formData, clothingSize: size })}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        formData.clothingSize === size
                          ? "bg-[#2D3436] text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {formData.clothingSize === "Custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom clothing size (e.g. 33L, Medium Tall)"
                    value={formData.customClothingSize}
                    onChange={(e) => setFormData({ ...formData, customClothingSize: e.target.value })}
                    className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2 text-sm outline-none"
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Section 2: Fit Preferences ───────────────────────────────── */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("fit")}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-[#2D3436]"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold text-slate-700">2</span>
              Fit & Silhouette
            </span>
            {openSections.fit ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.fit && (
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
              <p className="text-xs text-slate-400">Select all fit profiles you feel most comfortable wearing:</p>
              <div className="flex flex-wrap gap-2">
                {FIT_PREFERENCES.map((fit) => {
                  const selected = formData.fitPreferences.includes(fit);
                  return (
                    <button
                      key={fit}
                      type="button"
                      onClick={() => toggleMultiSelect("fitPreferences", fit)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        selected
                          ? "bg-[#FF8C33] text-white shadow-sm"
                          : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {selected && <Check size={12} />}
                      <span>{fit}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Section 3: Styles & Aesthetics ──────────────────────────── */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("styles")}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-[#2D3436]"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold text-slate-700">3</span>
              Preferred & Avoided Styles
            </span>
            {openSections.styles ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.styles && (
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-5">
              <div>
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">Preferred Aesthetics</p>
                <div className="flex flex-wrap gap-2">
                  {FASHION_STYLES.map((style) => {
                    const selected = formData.preferredStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleMultiSelect("preferredStyles", style)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selected
                            ? "bg-emerald-600 text-white font-semibold"
                            : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {selected && "✓ "}
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2">Styles to Avoid</p>
                <div className="flex flex-wrap gap-2">
                  {FASHION_STYLES.map((style) => {
                    const selected = formData.avoidedStyles.includes(style);
                    return (
                      <button
                        key={style}
                        type="button"
                        onClick={() => toggleMultiSelect("avoidedStyles", style)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selected
                            ? "bg-rose-500 text-white font-semibold"
                            : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {selected && "✕ "}
                        {style}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 4: Color Palettes ───────────────────────────────── */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("colors")}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-[#2D3436]"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold text-slate-700">4</span>
              Color Palette Preferences
            </span>
            {openSections.colors ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.colors && (
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-5">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Preferred Colors</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map((c) => {
                    const selected = formData.preferredColors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleMultiSelect("preferredColors", c.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition border ${
                          selected
                            ? "border-[#FF8C33] bg-orange-50/50 text-[#2D3436] font-semibold"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full shrink-0 border border-slate-300" style={{ backgroundColor: c.hex }} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Colors to Avoid</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {AVOIDED_COLOR_OPTIONS.map((c) => {
                    const selected = formData.avoidedColors.includes(c.name);
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => toggleMultiSelect("avoidedColors", c.name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition border ${
                          selected
                            ? "border-rose-400 bg-rose-50 text-rose-800 font-semibold"
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-600"
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full shrink-0 border border-slate-300" style={{ backgroundColor: c.hex }} />
                        <span className="truncate">{c.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Section 5: Occasions, Priorities & Goals ────────────────── */}
        <div className="border border-slate-200/80 rounded-2xl p-5 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => toggleSection("lifestyle")}
            className="w-full flex items-center justify-between text-left font-bold text-sm text-[#2D3436]"
          >
            <span className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-100 text-xs flex items-center justify-center font-bold text-slate-700">5</span>
              Occasions, Priorities & Fashion Goals
            </span>
            {openSections.lifestyle ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>

          {openSections.lifestyle && (
            <div className="mt-5 pt-4 border-t border-slate-100 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Primary Dressing Occasion</label>
                <select
                  value={formData.primaryOccasion}
                  onChange={(e) => setFormData({ ...formData, primaryOccasion: e.target.value })}
                  className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                >
                  <option value="">Select Primary Occasion</option>
                  {OCCASIONS.map((occ) => <option key={occ} value={occ}>{occ}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Typical Clothing Budget</label>
                <select
                  value={formData.budgetRange}
                  onChange={(e) => setFormData({ ...formData, budgetRange: e.target.value })}
                  className="w-full border border-slate-200 focus:border-[#FF8C33] bg-white rounded-xl px-4 py-2.5 text-sm outline-none transition"
                >
                  <option value="">Select Budget Range</option>
                  {BUDGET_RANGES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Shopping Priorities <span className="text-[#F07020] font-normal">(Select up to 3)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {SHOPPING_PRIORITIES.map((pri) => {
                    const selected = formData.shoppingPriorities.includes(pri);
                    return (
                      <button
                        key={pri}
                        type="button"
                        onClick={() => toggleMultiSelect("shoppingPriorities", pri, 3)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selected
                            ? "bg-[#2D3436] text-white font-semibold"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {selected && "✓ "}
                        {pri}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">Fashion Goals</p>
                <div className="flex flex-wrap gap-2">
                  {FASHION_GOALS.map((g) => {
                    const selected = formData.fashionGoals.includes(g);
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => toggleMultiSelect("fashionGoals", g)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                          selected
                            ? "bg-[#FF8C33] text-white font-semibold"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {selected && "✓ "}
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-3">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 ${
              success
                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/10"
                : "bg-[#FF8C33] hover:bg-[#e67e2e] disabled:bg-slate-300 text-white shadow-orange-500/10"
            }`}
          >
            {saving ? (
              <span>Saving Preferences...</span>
            ) : success ? (
              <>
                <Check size={16} />
                <span>Preferences Saved</span>
              </>
            ) : (
              "Save Fit & Style Preferences"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeasurementsView;
