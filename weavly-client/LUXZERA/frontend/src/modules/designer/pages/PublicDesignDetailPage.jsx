"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Sparkles,
  Scissors,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronLeft,
} from "lucide-react";
import { getPublicDesignById, submitCustomizationRequest } from "../services/designerService";
import { useAuth } from "@/modules/auth/store/useAuth";

export default function PublicDesignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const designId = params?.id;

  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(null);

  // Customization Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    description: "",
    preferredColor: "",
    preferredFabric: "",
    budget: "",
    bust: "",
    waist: "",
    hips: "",
    height: "",
    requestedDate: "",
  });

  useEffect(() => {
    if (!designId) return;
    setLoading(true);
    getPublicDesignById(designId)
      .then((data) => {
        setDesign(data);
        setActiveImage(data.primaryImageUrl);
      })
      .catch((err) => setError(err.message || "Failed to load design"))
      .finally(() => setLoading(false));
  }, [designId]);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || user.displayName || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
      }));
    }
  }, [user]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      const measurements = {
        bust: formData.bust ? Number(formData.bust) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        hips: formData.hips ? Number(formData.hips) : null,
        height: formData.height || null,
      };

      const payload = {
        designerId: design.designerId,
        designId: design.designId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || null,
        description: formData.description,
        preferredColor: formData.preferredColor || null,
        preferredFabric: formData.preferredFabric || null,
        measurementsJson: JSON.stringify(measurements),
        budget: formData.budget ? Number(formData.budget) : (design.estimatedPrice || null),
        requestedCompletionDate: formData.requestedDate || null,
      };

      const res = await submitCustomizationRequest(payload);
      setRequestSuccess(res);
    } catch (err) {
      setFormError(err.message || "Failed to submit request");
    } finally {
      setFormSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#1D1D1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !design) {
    return (
      <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl border border-[#ECECEC] text-center max-w-md">
          <h2 className="text-lg font-bold text-[#1D1D1F] mb-2 font-serif">Design Not Found</h2>
          <p className="text-xs text-[#86868B] mb-6">{error || "This creation is currently unavailable."}</p>
          <button
            onClick={() => router.push("/designs")}
            className="px-5 py-2 rounded-full bg-[#1D1D1F] text-white text-xs font-medium"
          >
            Browse Lookbook
          </button>
        </div>
      </div>
    );
  }

  const allImages = [design.primaryImageUrl, ...(design.galleryImageUrls || [])].filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#1D1D1F] pt-28 pb-28">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[3/4] bg-[#F4F1EC] rounded-3xl overflow-hidden border border-[#ECECEC] shadow-sm">
              <img
                src={activeImage || design.primaryImageUrl}
                alt={design.title}
                className="w-full h-full object-cover"
              />
            </div>

            {allImages.length > 1 && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={`aspect-square rounded-xl overflow-hidden border transition-all ${
                      activeImage === img
                        ? "border-[#1D1D1F] shadow-md scale-105"
                        : "border-[#ECECEC] opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Design Specs & Commission CTA */}
          <div className="lg:col-span-5 space-y-6">
            {/* Category & Designer Link */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider bg-[#F4F1EC] text-[#8C827A] px-2.5 py-1 rounded-md">
                {design.category}
              </span>
              <span className="text-xs text-[#86868B] font-mono">{design.designId}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#1D1D1F]">
              {design.title}
            </h1>

            {/* Designer Atelier Card */}
            <div
              onClick={() => router.push(`/designers/${design.designerId}`)}
              className="p-4 rounded-2xl bg-white border border-[#ECECEC] hover:border-[#1D1D1F]/30 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-[#FAFAF9] border border-[#ECECEC] overflow-hidden flex items-center justify-center font-bold text-sm text-[#1D1D1F]">
                  {design.designerProfileImage ? (
                    <img src={design.designerProfileImage} alt={design.designerName} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(design.designerName || "D")[0]}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-[#1D1D1F] group-hover:text-[#F07020] transition-colors">
                      {design.designerName || "Independent Atelier"}
                    </span>
                    <ShieldCheck size={13} className="text-[#F07020]" />
                  </div>
                  <span className="text-[11px] text-[#86868B] block">
                    {design.designerBrand || "Verified Weavly Creator"}
                  </span>
                </div>
              </div>

              <span className="text-xs text-[#F07020] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Visit Atelier <ArrowRight size={13} />
              </span>
            </div>

            {/* Estimated Price */}
            <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#ECECEC] flex items-baseline justify-between">
              <span className="text-xs text-[#86868B]">Estimated Base Price</span>
              <span className="text-xl font-bold text-[#1D1D1F]">
                {design.estimatedPrice ? `₹${design.estimatedPrice.toLocaleString()}` : "Price upon request"}
              </span>
            </div>

            {/* Description */}
            {design.description && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#86868B] mb-2">Design Concept</h3>
                <p className="text-xs text-[#52525B] leading-relaxed whitespace-pre-line">
                  {design.description}
                </p>
              </div>
            )}

            {/* Materials & Styling Specs */}
            <div className="space-y-3 pt-4 border-t border-[#ECECEC] text-xs">
              {design.materials && (
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Materials</span>
                  <span className="font-medium text-[#1D1D1F]">{design.materials}</span>
                </div>
              )}
              {design.style && (
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Style</span>
                  <span className="font-medium text-[#1D1D1F]">{design.style}</span>
                </div>
              )}
              {design.targetAudience && (
                <div className="flex justify-between">
                  <span className="text-[#86868B]">Audience</span>
                  <span className="font-medium text-[#1D1D1F]">{design.targetAudience}</span>
                </div>
              )}
            </div>

            {/* Main Action Button */}
            <div className="pt-6">
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-4 rounded-2xl bg-[#F07020] hover:bg-[#e06214] text-white font-medium text-sm transition-all shadow-xl shadow-[#F07020]/25 flex items-center justify-center gap-2"
              >
                <Sparkles size={16} /> Customize This Garment
              </button>
              <p className="text-[11px] text-center text-[#86868B] mt-2.5">
                Handcrafted directly by {design.designerName || "the designer"} to your body measurements.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Customization Request Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#ECECEC] w-full max-w-xl p-6 sm:p-8 shadow-2xl relative my-8">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F0F0F0] text-[#6E6E73] transition-colors"
            >
              <X size={18} />
            </button>

            {requestSuccess ? (
              <div className="py-10 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-xl font-bold font-serif text-[#1D1D1F]">
                  Customization Request Submitted!
                </h3>
                <p className="text-xs text-[#6E6E73] max-w-md mx-auto leading-relaxed">
                  Your request for <strong className="text-[#1D1D1F]">"{design.title}"</strong> has been sent to {design.designerName}.
                </p>
                <div className="font-mono text-sm font-bold bg-[#FAFAF9] border border-[#ECECEC] py-2 px-4 rounded-xl inline-block text-[#1D1D1F]">
                  {requestSuccess.requestId}
                </div>
                <p className="text-xs text-[#86868B]">
                  The designer will review your measurements and reach out to {formData.customerEmail}.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F07020]">
                    Bespoke Customization Request
                  </span>
                  <h3 className="text-xl font-bold font-serif text-[#1D1D1F] mt-1">
                    Customize "{design.title}"
                  </h3>
                  <p className="text-xs text-[#86868B] mt-1">
                    Atelier: {design.designerName}
                  </p>
                </div>

                {formError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
                    {formError}
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.customerName}
                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                        placeholder="e.g. Sophia Vance"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="sophia@example.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-[#1D1D1F] mb-1">Customization Requirements *</label>
                    <textarea
                      required
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Specify neckline changes, hemlines, sleeve adjustments, or custom color requirements..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Preferred Color</label>
                      <input
                        type="text"
                        value={formData.preferredColor}
                        onChange={(e) => setFormData({ ...formData, preferredColor: e.target.value })}
                        placeholder="e.g. Royal Blue"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Preferred Fabric</label>
                      <input
                        type="text"
                        value={formData.preferredFabric}
                        onChange={(e) => setFormData({ ...formData, preferredFabric: e.target.value })}
                        placeholder={design.materials || "e.g. Italian Wool"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  {/* Body Measurements (Optional) */}
                  <div className="pt-2 border-t border-[#ECECEC]">
                    <span className="block font-semibold text-[#1D1D1F] mb-2">Body Measurements (Inches, Optional)</span>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        type="number"
                        placeholder="Bust"
                        value={formData.bust}
                        onChange={(e) => setFormData({ ...formData, bust: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Waist"
                        value={formData.waist}
                        onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Hips"
                        value={formData.hips}
                        onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                      />
                      <input
                        type="text"
                        placeholder="Height (5'7)"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        className="w-full px-2.5 py-2 rounded-lg border border-[#ECECEC] bg-[#FAFAF9] text-center text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Target Budget (₹)</label>
                      <input
                        type="number"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        placeholder={design.estimatedPrice ? String(design.estimatedPrice) : "15000"}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-[#1D1D1F] mb-1">Needed By</label>
                      <input
                        type="date"
                        value={formData.requestedDate}
                        onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="px-5 py-2.5 rounded-full hover:bg-[#F0F0F0] text-[#6E6E73] font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={formSubmitting}
                      className="px-6 py-2.5 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white font-medium shadow-md flex items-center gap-1.5 disabled:opacity-60"
                    >
                      {formSubmitting ? "Submitting..." : "Send Request"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
