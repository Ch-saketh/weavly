"use client";

import React, { useState, useRef } from "react";
import {
  X,
  Upload,
  Image as ImageIcon,
  Palette,
  Scissors,
  Check,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  Plus,
  ShieldCheck,
  Sparkles
} from "lucide-react";

const APPAREL_CATEGORIES = [
  "Eveningwear & Gowns",
  "Bespoke Suiting & Blazers",
  "Dresses & Jumpsuits",
  "Shirts, Blouses & Kurtas",
  "Outerwear, Coats & Trench",
  "Artisanal Knitwear",
  "Tailored Trousers & Pants",
  "Festive & Ceremonial Couture"
];

const FASHION_STYLES = [
  "Minimalist Architecture",
  "Classic Bespoke Tailoring",
  "Avant-Garde & Sculptural",
  "Modern Streetwear",
  "Contemporary Heritage",
  "Quiet Luxury"
];

const SILHOUETTE_FITS = [
  "Slim Tailored",
  "Relaxed Fluid",
  "Structured Oversized",
  "Sculpted Hourglass",
  "Draped A-Line"
];

const STANDARD_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const FABRIC_SUGGESTIONS = [
  "100% Mulberry Silk Faille",
  "Super 130s Merino Wool & Cupro",
  "Organic Raw Linen & Cotton",
  "Handwoven Khadi Matka Silk",
  "Heavyweight Japanese Cotton Twill",
  "Double-Faced Cashmere Blend"
];

export default function PublishGarmentModal({ isOpen, onClose, onCreated }) {
  const fileInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [form, setForm] = useState({
    title: "",
    category: "Bespoke Suiting & Blazers",
    targetAudience: "Women",
    style: "Classic Bespoke Tailoring",
    estimatedPrice: "",
    materials: "100% Mulberry Silk Faille",
    fitType: "Slim Tailored",
    selectedSizes: ["S", "M", "L"],
    isCustomizable: true,
    careInstructions: "Dry clean only by garment care specialists",
    leadTimeDays: "10–14 Business Days",
    description: "",
    primaryImageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80",
    galleryImageUrls: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80"
    ],
    status: "PUBLISHED"
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [previewTab, setPreviewTab] = useState(false);

  if (!isOpen) return null;

  // Handle local file upload for Primary Image
  const handlePrimaryFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMsg("Please upload a valid image file (JPG, PNG, WEBP).");
      return;
    }

    setUploadingImage(true);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = (event) => {
      setForm((prev) => ({
        ...prev,
        primaryImageUrl: event.target.result
      }));
      setUploadingImage(false);
    };
    reader.onerror = () => {
      setErrorMsg("Failed to read image file.");
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Handle local file upload for Gallery Images
  const handleGalleryFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        setForm((prev) => ({
          ...prev,
          galleryImageUrls: [...prev.galleryImageUrls, event.target.result].slice(0, 5)
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeGalleryImage = (idx) => {
    setForm((prev) => ({
      ...prev,
      galleryImageUrls: prev.galleryImageUrls.filter((_, i) => i !== idx)
    }));
  };

  const toggleSize = (size) => {
    setForm((prev) => {
      const exists = prev.selectedSizes.includes(size);
      return {
        ...prev,
        selectedSizes: exists
          ? prev.selectedSizes.filter((s) => s !== size)
          : [...prev.selectedSizes, size]
      };
    });
  };

  const handleSubmit = async (targetStatus) => {
    if (!form.title.trim()) {
      setErrorMsg("Please provide a garment title.");
      return;
    }
    if (!form.estimatedPrice || parseFloat(form.estimatedPrice) <= 0) {
      setErrorMsg("Please provide a valid retail price in INR.");
      return;
    }
    if (!form.primaryImageUrl) {
      setErrorMsg("Please provide or upload a primary front photo.");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        title: form.title.trim(),
        description: [
          form.description.trim(),
          `\n\n• Fit: ${form.fitType}`,
          `• Sizing: ${form.selectedSizes.join(", ")}`,
          `• Care: ${form.careInstructions}`,
          `• Production Lead Time: ${form.leadTimeDays}`
        ].join(" "),
        category: form.category,
        style: form.style,
        targetAudience: form.targetAudience,
        primaryImageUrl: form.primaryImageUrl,
        galleryImageUrls: form.galleryImageUrls,
        materials: form.materials,
        estimatedPrice: parseFloat(form.estimatedPrice),
        isCustomizable: form.isCustomizable,
        status: targetStatus || form.status
      };

      await onCreated(payload);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "Failed to publish garment lookbook.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-[#183B56] w-full max-w-3xl my-auto max-h-[92vh] flex flex-col shadow-2xl text-[#183B56] font-sans">
        
        {/* ── MODAL HEADER ── */}
        <div className="p-5 sm:p-6 border-b border-[#183B56] bg-[#F5EFEB] flex items-center justify-between shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                CATALOG DRAFTING BOARD
              </span>
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.2 border border-[#183B56] bg-white text-[#183B56]">
                CLOTHING ONLY
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
              Publish New Garment Lookbook
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewTab(!previewTab)}
              className="px-3 py-1.5 bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] border border-[#183B56] text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1"
            >
              <Eye size={12} />
              <span>{previewTab ? "Edit Form" : "Preview Look"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 border border-[#183B56]/30 hover:border-[#183B56] hover:bg-white cursor-pointer transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── MODAL BODY ── */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-xs flex-1">
          {errorMsg && (
            <div className="p-3.5 bg-red-50 text-red-700 border border-red-300 font-semibold flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {previewTab ? (
            /* ── PREVIEW CARD TAB ── */
            <div className="space-y-6">
              <div className="border border-[#183B56] bg-[#F5EFEB] p-4 text-center space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-[#5A7184]">
                  CATALOG CARD PREVIEW
                </span>
                <p className="text-xs text-[#183B56] font-medium">
                  This is how patrons and clients will discover your piece in the curated Weavly lookbook feed.
                </p>
              </div>

              <div className="max-w-sm mx-auto border border-[#183B56] bg-white overflow-hidden shadow-md">
                <div className="aspect-[3/3.8] bg-[#DFE7ED] border-b border-[#183B56] relative overflow-hidden">
                  <img
                    src={form.primaryImageUrl || "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80"}
                    alt={form.title || "Garment"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-[#183B56] text-white border border-[#183B56] px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider">
                    {form.targetAudience} • {form.category}
                  </div>
                  <div className="absolute bottom-3 right-3 bg-white/95 border border-[#183B56] px-2.5 py-1 text-xs font-bold text-[#183B56]">
                    ₹{Number(form.estimatedPrice || 0).toLocaleString()}
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#5A7184] block">
                    {form.style}
                  </span>
                  <h3 className="text-sm font-bold uppercase text-[#183B56]">
                    {form.title || "Untitled Garment"}
                  </h3>
                  <p className="text-[11px] text-[#5A7184] leading-relaxed">
                    {form.materials}
                  </p>
                  <div className="pt-2 border-t border-[#183B56]/15 flex items-center justify-between text-[10px] font-mono text-[#183B56]">
                    <span>SIZES: {form.selectedSizes.join(", ")}</span>
                    <span className="font-bold text-emerald-700">100% ESCROW</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── FULL FORM TAB ── */
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit("PUBLISHED"); }} className="space-y-6">

              {/* 1. Garment Identity (Clothing Only) */}
              <div className="border border-[#183B56] p-5 bg-[#F5EFEB]/30 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-2">
                  <Scissors size={14} className="text-[#183B56]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183B56]">
                    1. Apparel Classification
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Garment Name / Product Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sculpted Double-Breasted Wool Blazer"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full h-10 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Audience / Gender *
                    </label>
                    <select
                      value={form.targetAudience}
                      onChange={(e) => setForm({ ...form, targetAudience: e.target.value })}
                      className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                    >
                      <option value="Women">Women</option>
                      <option value="Men">Men</option>
                      <option value="Unisex">Unisex</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Clothing Category *
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                    >
                      {APPAREL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Fashion Style Aesthetic *
                    </label>
                    <select
                      value={form.style}
                      onChange={(e) => setForm({ ...form, style: e.target.value })}
                      className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                    >
                      {FASHION_STYLES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. Visual Drape & Photo Upload */}
              <div className="border border-[#183B56] p-5 bg-[#F5EFEB]/30 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-2">
                  <ImageIcon size={14} className="text-[#183B56]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183B56]">
                    2. Garment Photography &amp; Drapes (Upload or URL)
                  </span>
                </div>

                {/* Primary Front Photo */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                  <div className="sm:col-span-1">
                    <div className="aspect-[3/3.8] border border-[#183B56] bg-[#DFE7ED] relative overflow-hidden flex items-center justify-center">
                      {form.primaryImageUrl ? (
                        <img
                          src={form.primaryImageUrl}
                          alt="Primary preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-[10px] font-bold uppercase text-[#5A7184]">
                          No Photo
                        </span>
                      )}
                      {uploadingImage && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <Loader2 size={20} className="animate-spin text-[#183B56]" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2 space-y-3">
                    <div>
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                        Primary Front Drape Photo *
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-[11px] font-bold uppercase tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
                        >
                          <Upload size={13} />
                          <span>Upload From Device</span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handlePrimaryFileSelect}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#5A7184] mb-1">
                        Or Paste High-Resolution Image URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={form.primaryImageUrl}
                        onChange={(e) => setForm({ ...form, primaryImageUrl: e.target.value })}
                        className="w-full h-9 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                      />
                    </div>

                    {/* Additional Gallery Photos */}
                    <div className="pt-2 border-t border-[#183B56]/15 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#183B56]">
                          Additional Gallery Angles ({form.galleryImageUrls.length}/5)
                        </span>
                        <button
                          type="button"
                          onClick={() => galleryInputRef.current?.click()}
                          className="text-[10px] font-bold uppercase text-[#183B56] hover:underline cursor-pointer border-none bg-transparent p-0 flex items-center gap-1"
                        >
                          <Plus size={11} />
                          <span>Add Photo</span>
                        </button>
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleGalleryFileSelect}
                        />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {form.galleryImageUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className="w-16 h-16 border border-[#183B56] bg-[#DFE7ED] relative overflow-hidden group/img"
                          >
                            <img src={url} alt={`Angle ${idx}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeGalleryImage(idx)}
                              className="absolute inset-0 bg-red-900/70 text-white opacity-0 group-hover/img:opacity-100 flex items-center justify-center cursor-pointer transition-opacity"
                              title="Remove Photo"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Textile & Tailoring Blueprint */}
              <div className="border border-[#183B56] p-5 bg-[#F5EFEB]/30 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-2">
                  <Palette size={14} className="text-[#183B56]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183B56]">
                    3. Textile Composition &amp; Sizing Specs
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Fabric Composition &amp; Textile Origin *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 100% Mulberry Silk Faille, Bemberg Cupro Lining"
                    value={form.materials}
                    onChange={(e) => setForm({ ...form, materials: e.target.value })}
                    className="w-full h-10 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                  />
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {FABRIC_SUGGESTIONS.map((fab) => (
                      <button
                        key={fab}
                        type="button"
                        onClick={() => setForm({ ...form, materials: fab })}
                        className="text-[9px] font-mono uppercase px-2 py-0.5 bg-white border border-[#183B56]/30 hover:border-[#183B56] text-[#5A7184] hover:text-[#183B56] cursor-pointer"
                      >
                        + {fab}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Silhouette Fit Cut *
                    </label>
                    <select
                      value={form.fitType}
                      onChange={(e) => setForm({ ...form, fitType: e.target.value })}
                      className="w-full h-10 px-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                    >
                      {SILHOUETTE_FITS.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Production &amp; Drape Lead Time
                    </label>
                    <input
                      type="text"
                      value={form.leadTimeDays}
                      onChange={(e) => setForm({ ...form, leadTimeDays: e.target.value })}
                      className="w-full h-10 px-3.5 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none"
                    />
                  </div>
                </div>

                {/* Available Sizes */}
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1.5">
                    Available Standard Sizes
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SIZES.map((size) => {
                      const selected = form.selectedSizes.includes(size);
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => toggleSize(size)}
                          className={`w-11 h-9 font-mono font-bold text-xs border cursor-pointer transition-all ${
                            selected
                              ? "bg-[#183B56] text-white border-[#183B56]"
                              : "bg-white text-[#183B56] border-[#183B56]/40 hover:border-[#183B56]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Made to Measure Toggle */}
                <div className="pt-2 border-t border-[#183B56]/15 flex items-center justify-between">
                  <div>
                    <span className="block text-xs font-bold uppercase text-[#183B56]">
                      Accept Made-to-Measure Bespoke Requests
                    </span>
                    <span className="text-[11px] text-[#5A7184]">
                      Clients can submit exact body measurements for 1-of-1 pattern drafting.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={form.isCustomizable}
                    onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                    className="w-4 h-4 accent-[#183B56] cursor-pointer"
                  />
                </div>
              </div>

              {/* 4. Pricing & Escrow */}
              <div className="border border-[#183B56] p-5 bg-[#F5EFEB]/30 space-y-4">
                <div className="flex items-center gap-2 border-b border-[#183B56]/15 pb-2">
                  <ShieldCheck size={14} className="text-[#183B56]" />
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#183B56]">
                    4. Pricing &amp; Milestone Escrow Security
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                      Retail Price (₹ INR) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#183B56]">₹</span>
                      <input
                        type="number"
                        required
                        placeholder="e.g. 18500"
                        value={form.estimatedPrice}
                        onChange={(e) => setForm({ ...form, estimatedPrice: e.target.value })}
                        className="w-full h-10 pl-8 pr-3.5 border border-[#183B56] bg-white text-xs font-bold text-[#183B56] outline-none"
                      />
                    </div>
                  </div>

                  <div className="border border-emerald-300 bg-emerald-50/70 p-3 space-y-1">
                    <span className="text-[9px] font-mono font-bold uppercase text-emerald-900 block">
                      100% ESCROW GUARANTEED
                    </span>
                    <p className="text-[10px] text-emerald-800 leading-tight">
                      When a client purchases this piece, their payment is locked in the vault before you begin cutting fabric.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Description & Story */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                  Garment Craftsmanship Story &amp; Drape Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Detail the silhouette cut, lapel angles, interior lining, and occasion suitability..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-3 border border-[#183B56] bg-white text-xs font-semibold text-[#183B56] outline-none resize-none leading-relaxed"
                />
              </div>

            </form>
          )}
        </div>

        {/* ── MODAL FOOTER ── */}
        <div className="p-4 sm:p-5 border-t border-[#183B56] bg-[#F5EFEB] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-white hover:bg-[#F5EFEB] border border-[#183B56]/40 text-[#5A7184] hover:text-[#183B56] text-xs font-bold uppercase cursor-pointer transition-all"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("DRAFT")}
              className="px-5 py-2.5 bg-white hover:bg-[#F5EFEB] text-[#183B56] border border-[#183B56] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-2xs"
            >
              Save as Draft
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSubmit("PUBLISHED")}
              className="px-6 py-2.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider cursor-pointer transition-all shadow-xs flex items-center gap-1.5"
            >
              {submitting ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              <span>{submitting ? "Publishing..." : "Publish Lookbook"}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
