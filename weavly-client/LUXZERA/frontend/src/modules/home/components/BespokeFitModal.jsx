"use client";

import React, { useState, useRef } from "react";
import { X, Sparkles, Upload, Check, Camera, Trash2, ArrowRight, ShieldCheck, Shirt, Palette, User, HelpCircle } from "lucide-react";
import { uploadRecommendationImage } from "@/modules/profile/services/recommendationImageService";
import { saveFitData } from "@/modules/profile/services/userFitDataService";
import { generateUserRecommendations } from "@/modules/recommendations/services/recommendationService";
import { useAuth } from "@/modules/auth/store/useAuth";

const FIT_TYPES = [
  { id: "Slim", label: "Slim Fit", desc: "Closer to body, structured silhouette" },
  { id: "Tailored", label: "Tailored Regular", desc: "Classic proportioned drape" },
  { id: "Relaxed", label: "Relaxed / Oversized", desc: "Easy, contemporary loose fit" },
  { id: "Athletic", label: "Athletic Cut", desc: "Broader chest & tapered waist" },
];

const OCCASIONS = [
  { id: "casual", label: "Everyday Casual" },
  { id: "work", label: "Work & Office" },
  { id: "party", label: "Party & Night Out" },
  { id: "formal", label: "Formal & Evening" },
  { id: "college", label: "College Campus" },
  { id: "date", label: "Date & Dinner" },
];

const HEIGHT_PRESETS = ["< 5'4\" (162 cm)", "5'4\" - 5'7\" (163-170 cm)", "5'8\" - 5'11\" (171-180 cm)", "6'0\" - 6'3\" (181-190 cm)", "> 6'3\" (191+ cm)"];

export default function BespokeFitModal({ isOpen, onClose, onGenerated }) {
  const { user } = useAuth();
  const fileInputRef = useRef(null);

  const [activeStep, setActiveStep] = useState(1);
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedFit, setSelectedFit] = useState("Tailored");
  const [selectedOccasion, setSelectedOccasion] = useState("casual");
  const [selectedHeight, setSelectedHeight] = useState("5'8\" - 5'11\" (171-180 cm)");
  const [gender, setGender] = useState("Unisex");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setErrorMsg("");

    try {
      for (const file of files) {
        if (user?.id && !String(user.id).startsWith("customer_dev_")) {
          const uploaded = await uploadRecommendationImage(user.id, file);
          setUploadedPhotos((prev) => [uploaded, ...prev]);
        } else {
          const localMock = {
            id: "fit_" + Date.now() + "_" + Math.random().toString(36).substring(7),
            imageUrl: URL.createObjectURL(file),
            name: file.name,
          };
          setUploadedPhotos((prev) => [localMock, ...prev]);
        }
      }
    } catch (err) {
      setErrorMsg(err.message || "Failed to upload photo.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (id) => {
    setUploadedPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setErrorMsg("");

    try {
      const fitPayload = {
        heightRange: selectedHeight,
        fitPreferences: [selectedFit],
        primaryOccasion: selectedOccasion,
        occasions: [selectedOccasion],
        fashionGoals: ["Flattering Silhouette", "Color Harmony"],
      };

      if (user?.id && !String(user.id).startsWith("customer_dev_")) {
        await saveFitData(user.id, fitPayload);
      }

      // Trigger Zyra AI generation
      try {
        await generateUserRecommendations({
          occasion: selectedOccasion,
          topK: 20,
        });
      } catch (genErr) {
        console.warn("Zyra generation notice:", genErr);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        if (onGenerated) onGenerated();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || "Failed to process fit preferences.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#183B56]/50 backdrop-blur-xs animate-fadeIn">
      
      {/* ── ARCHITECTURAL BLUEPRINT MODAL CONTAINER ── */}
      <div 
        className="w-full max-w-2xl bg-[#F5EFEB] border border-[#183B56] shadow-2xl text-[#183B56] flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between py-4 px-6 border-b border-[#183B56] bg-[#F5EFEB] shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-[#183B56]" />
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#183B56]">
              Zyra Bespoke Fit & Style Studio
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-[#183B56] bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="grid grid-cols-2 divide-x divide-[#183B56] border-b border-[#183B56] text-center shrink-0">
          <button
            onClick={() => setActiveStep(1)}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none ${
              activeStep === 1 ? "bg-[#183B56] text-white" : "bg-transparent text-[#183B56] hover:bg-[#183B56]/5"
            }`}
          >
            1. Why Photos? & Upload
          </button>
          <button
            onClick={() => setActiveStep(2)}
            className={`py-3 px-4 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border-none ${
              activeStep === 2 ? "bg-[#183B56] text-white" : "bg-transparent text-[#183B56] hover:bg-[#183B56]/5"
            }`}
          >
            2. Fit & Silhouette Settings
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-300 text-xs font-bold text-red-800 text-center shadow-xs">
              {errorMsg}
            </div>
          )}

          {success && (
            <div className="p-4 bg-[#DFE7ED] border border-[#183B56] text-xs font-bold text-[#183B56] text-center flex items-center justify-center gap-2 shadow-xs">
              <Check size={16} strokeWidth={2.5} />
              <span>Bespoke Profile Configured! Tailoring your personal catalog...</span>
            </div>
          )}

          {/* ════ STEP 1: EXPLANATION & PHOTO UPLOAD ════ */}
          {activeStep === 1 && (
            <div className="space-y-6">
              
              {/* Value Proposition Explanation Box */}
              <div className="border border-[#183B56] bg-[#DFE7ED]/40 p-5 shadow-xs space-y-3">
                <div className="flex items-center gap-2">
                  <Shirt size={16} className="text-[#183B56]" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.16em] text-[#183B56]">
                    How Visual AI Chooses Clothes That Truly Flatter You
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px] leading-snug text-[#5A7184]">
                  <div className="border border-[#183B56]/30 bg-[#F5EFEB] p-3 space-y-1">
                    <span className="font-bold text-[#183B56] block">1. Proportions</span>
                    <span>Analyzes shoulder-to-hip ratio & torso length for balanced sleeve & hem lengths.</span>
                  </div>
                  <div className="border border-[#183B56]/30 bg-[#F5EFEB] p-3 space-y-1">
                    <span className="font-bold text-[#183B56] block">2. Undertone Harmony</span>
                    <span>Extracts skin undertones to recommend fabrics & colors that brighten your look.</span>
                  </div>
                  <div className="border border-[#183B56]/30 bg-[#F5EFEB] p-3 space-y-1">
                    <span className="font-bold text-[#183B56] block">3. Zero Guesswork</span>
                    <span>No more awkward fits or return hassles. Outfits match your real-life frame.</span>
                  </div>
                </div>
              </div>

              {/* Photo Upload Dropzone */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#183B56] block">
                  Upload Full-Body Photo or Outfit Inspiration (Optional)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border border-dashed border-[#183B56] bg-[#DFE7ED]/25 hover:bg-[#DFE7ED]/50 p-8 text-center cursor-pointer transition-all shadow-xs group"
                >
                  <div className="w-12 h-12 bg-white border border-[#183B56] flex items-center justify-center mx-auto mb-3 shadow-xs group-hover:scale-105 transition-transform">
                    <Camera size={20} className="text-[#183B56]" />
                  </div>
                  <p className="text-xs font-bold text-[#183B56]">
                    Click to select photo or drag and drop
                  </p>
                  <p className="text-[11px] text-[#5A7184] mt-1">
                    Supports JPG, PNG, WEBP. Your photos are private and used solely for AI fit analysis.
                  </p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>

              {/* Uploaded Photos Preview List */}
              {uploadedPhotos.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#183B56]">
                    Uploaded Visual Cues ({uploadedPhotos.length})
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {uploadedPhotos.map((photo) => (
                      <div key={photo.id} className="relative aspect-[3/4] border border-[#183B56] bg-[#DFE7ED] overflow-hidden shadow-xs group">
                        <img src={photo.imageUrl} alt="Fit cue" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white border border-[#183B56] text-[#183B56] flex items-center justify-center p-0 cursor-pointer shadow-xs hover:bg-[#183B56] hover:text-white transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* ════ STEP 2: SILHOUETTE & PROPORTIONS SETTINGS ════ */}
          {activeStep === 2 && (
            <div className="space-y-6">
              
              {/* Height Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#183B56] block">
                  1. Approximate Height
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {HEIGHT_PRESETS.map((ht) => (
                    <button
                      key={ht}
                      type="button"
                      onClick={() => setSelectedHeight(ht)}
                      className={`p-2.5 text-xs font-bold border transition-all cursor-pointer text-center ${
                        selectedHeight === ht
                          ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                          : "bg-white text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                      }`}
                    >
                      {ht}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fit Silhouette Preference */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#183B56] block">
                  2. Preferred Garment Silhouette & Cut
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {FIT_TYPES.map((fit) => (
                    <div
                      key={fit.id}
                      onClick={() => setSelectedFit(fit.id)}
                      className={`p-3.5 border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedFit === fit.id
                          ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                          : "bg-white text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider">{fit.label}</span>
                        {selectedFit === fit.id && <Check size={14} />}
                      </div>
                      <p className={`text-[10.5px] mt-1 ${selectedFit === fit.id ? "text-white/80" : "text-[#5A7184]"}`}>
                        {fit.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Primary Occasion */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#183B56] block">
                  3. Primary Styling Occasion
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {OCCASIONS.map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setSelectedOccasion(occ.id)}
                      className={`p-2.5 text-xs font-bold border transition-all cursor-pointer text-center ${
                        selectedOccasion === occ.id
                          ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                          : "bg-white text-[#183B56] border-[#183B56] hover:bg-[#183B56]/5"
                      }`}
                    >
                      {occ.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="p-4 sm:p-6 border-t border-[#183B56] bg-[#F5EFEB] flex items-center justify-between gap-4 shrink-0">
          {activeStep === 1 ? (
            <button
              type="button"
              onClick={() => setActiveStep(2)}
              className="w-full sm:w-auto px-6 py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 ml-auto"
            >
              <span>Continue to Fit Settings</span>
              <ArrowRight size={13} />
            </button>
          ) : (
            <div className="flex items-center justify-between w-full gap-4">
              <button
                type="button"
                onClick={() => setActiveStep(1)}
                className="px-4 py-3 bg-transparent text-[#183B56] hover:bg-[#183B56]/5 text-xs font-bold uppercase tracking-wider border border-[#183B56] cursor-pointer"
              >
                ← Back
              </button>

              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={submitting}
                className="px-8 py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.2em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-transform hover:scale-[1.01] disabled:opacity-50"
              >
                <Sparkles size={14} />
                <span>{submitting ? "Analyzing & Tailoring..." : "Generate My Bespoke Catalog ✦"}</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
