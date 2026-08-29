"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Scissors,
  ShieldCheck,
  CheckCircle2,
  ChevronLeft,
  Upload,
} from "lucide-react";
import { getPublicDesigners, submitCustomizationRequest } from "../services/designerService";
import { useAuth } from "@/modules/auth/store/useAuth";

export default function CustomDesignRequestPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [designers, setDesigners] = useState([]);
  const [loadingDesigners, setLoadingDesigners] = useState(true);

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(null);
  const [formError, setFormError] = useState(null);

  const [formData, setFormData] = useState({
    designerId: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    description: "",
    referenceImage: "",
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
    getPublicDesigners()
      .then((data) => {
        setDesigners(data || []);
        if (data && data.length > 0) {
          setFormData((prev) => ({ ...prev, designerId: data[0].designerId }));
        }
      })
      .catch((err) => console.warn("Failed to load designers:", err))
      .finally(() => setLoadingDesigners(false));
  }, []);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: user.name || user.displayName || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.designerId) {
      setFormError("Please select a designer atelier.");
      return;
    }

    setFormSubmitting(true);
    setFormError(null);

    try {
      const measurements = {
        bust: formData.bust ? Number(formData.bust) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        hips: formData.hips ? Number(formData.hips) : null,
        height: formData.height || null,
      };

      const refImages = formData.referenceImage ? [formData.referenceImage.trim()] : [];

      const payload = {
        designerId: formData.designerId,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone || null,
        description: formData.description,
        referenceImageUrls: refImages,
        preferredColor: formData.preferredColor || null,
        preferredFabric: formData.preferredFabric || null,
        measurementsJson: JSON.stringify(measurements),
        budget: formData.budget ? Number(formData.budget) : null,
        requestedCompletionDate: formData.requestedDate || null,
      };

      const res = await submitCustomizationRequest(payload);
      setRequestSuccess(res);
    } catch (err) {
      setFormError(err.message || "Failed to submit custom request");
    } finally {
      setFormSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] text-[#1D1D1F] pt-28 pb-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs text-[#86868B] hover:text-[#1D1D1F] mb-6 font-medium transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        {requestSuccess ? (
          <div className="bg-white rounded-3xl border border-[#ECECEC] p-10 sm:p-14 text-center shadow-xl space-y-5">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-3xl font-bold font-serif text-[#1D1D1F]">
              Custom Garment Request Submitted!
            </h1>
            <p className="text-sm text-[#6E6E73] max-w-md mx-auto leading-relaxed">
              Your bespoke commission has been dispatched to the selected designer atelier.
            </p>
            <div className="font-mono text-base font-bold bg-[#FAFAF9] border border-[#ECECEC] py-3 px-6 rounded-2xl inline-block text-[#1D1D1F]">
              Reference ID: {requestSuccess.requestId}
            </div>
            <p className="text-xs text-[#86868B] max-w-sm mx-auto">
              We have forwarded confirmation to <strong className="text-[#1D1D1F]">{formData.customerEmail}</strong>. The designer will review your specifications and follow up.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => router.push("/designers")}
                className="px-6 py-2.5 rounded-full bg-[#1D1D1F] text-white text-xs font-medium"
              >
                Browse Designers
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#ECECEC] p-8 sm:p-12 shadow-xl">
            <div className="mb-8 pb-6 border-b border-[#ECECEC]">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F07020]/10 text-[#F07020] text-xs font-semibold uppercase tracking-wider mb-3">
                <Sparkles size={13} /> Bespoke Commission
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#1D1D1F]">
                Commission a Custom Garment
              </h1>
              <p className="text-xs sm:text-sm text-[#86868B] mt-1.5 leading-relaxed">
                Have a dream outfit in mind? Describe your vision, choose a verified creator, and have your piece tailored exclusively for you.
              </p>
            </div>

            {formError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-xs border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs">
              {/* Select Designer */}
              <div>
                <label className="block font-semibold text-[#1D1D1F] mb-2">
                  Select Designer Atelier *
                </label>
                {loadingDesigners ? (
                  <div className="h-12 bg-[#FAFAF9] rounded-xl border border-[#ECECEC] animate-pulse" />
                ) : designers.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {designers.map((d) => (
                      <label
                        key={d.designerId}
                        className={`p-3.5 rounded-2xl border cursor-pointer flex items-center gap-3 transition-all ${
                          formData.designerId === d.designerId
                            ? "border-[#1D1D1F] bg-[#FAFAF9] shadow-sm ring-1 ring-[#1D1D1F]"
                            : "border-[#ECECEC] hover:border-[#86868B]/50"
                        }`}
                      >
                        <input
                          type="radio"
                          name="designer"
                          value={d.designerId}
                          checked={formData.designerId === d.designerId}
                          onChange={(e) => setFormData({ ...formData, designerId: e.target.value })}
                          className="sr-only"
                        />
                        <div className="w-10 h-10 rounded-full bg-[#E5E5E5] overflow-hidden shrink-0 flex items-center justify-center font-bold text-xs">
                          {d.profileImageUrl ? (
                            <img src={d.profileImageUrl} alt={d.displayName} className="w-full h-full object-cover" />
                          ) : (
                            <span>{(d.displayName || "D")[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[#1D1D1F] truncate">{d.displayName}</span>
                            <ShieldCheck size={12} className="text-[#F07020] shrink-0" />
                          </div>
                          <span className="text-[10px] text-[#86868B] block truncate">
                            {d.specialization || d.brandName || "Custom Tailoring"}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#86868B]">No designers available right now.</p>
                )}
              </div>

              {/* Customer Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1.5">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="e.g. Sophia Vance"
                    className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    placeholder="sophia@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Vision Description */}
              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1.5">
                  Garment Vision & Styling Details *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the silhouette, neckline, sleeve style, fabric weight, occasion, or any specific details..."
                  className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs leading-relaxed"
                />
              </div>

              {/* Reference Image URL */}
              <div>
                <label className="block font-medium text-[#1D1D1F] mb-1.5">
                  Reference Image URL (Optional)
                </label>
                <input
                  type="url"
                  value={formData.referenceImage}
                  onChange={(e) => setFormData({ ...formData, referenceImage: e.target.value })}
                  placeholder="https://example.com/dress-inspiration.jpg"
                  className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                />
              </div>

              {/* Color & Fabric */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1.5">Preferred Color</label>
                  <input
                    type="text"
                    value={formData.preferredColor}
                    onChange={(e) => setFormData({ ...formData, preferredColor: e.target.value })}
                    placeholder="e.g. Midnight Black"
                    className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1.5">Preferred Fabric</label>
                  <input
                    type="text"
                    value={formData.preferredFabric}
                    onChange={(e) => setFormData({ ...formData, preferredFabric: e.target.value })}
                    placeholder="e.g. Mulberry Silk Velvet"
                    className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Body Measurements */}
              <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#ECECEC] space-y-3">
                <span className="block font-semibold text-[#1D1D1F]">Custom Body Measurements (Inches, Optional)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#86868B] mb-1">Bust</label>
                    <input
                      type="number"
                      placeholder="36"
                      value={formData.bust}
                      onChange={(e) => setFormData({ ...formData, bust: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#ECECEC] bg-white text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#86868B] mb-1">Waist</label>
                    <input
                      type="number"
                      placeholder="28"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#ECECEC] bg-white text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#86868B] mb-1">Hips</label>
                    <input
                      type="number"
                      placeholder="38"
                      value={formData.hips}
                      onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#ECECEC] bg-white text-xs text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#86868B] mb-1">Height</label>
                    <input
                      type="text"
                      placeholder="5'7"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-[#ECECEC] bg-white text-xs text-center"
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Target Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1.5">Estimated Budget (₹)</label>
                  <input
                    type="number"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    placeholder="e.g. 20000"
                    className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                  />
                </div>
                <div>
                  <label className="block font-medium text-[#1D1D1F] mb-1.5">Target Completion Date</label>
                  <input
                    type="date"
                    value={formData.requestedDate}
                    onChange={(e) => setFormData({ ...formData, requestedDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-6 border-t border-[#ECECEC] flex items-center justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 rounded-full hover:bg-[#F0F0F0] text-[#6E6E73] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-8 py-3 rounded-full bg-[#F07020] hover:bg-[#e06214] text-white font-medium text-xs shadow-lg shadow-[#F07020]/25 flex items-center gap-2 disabled:opacity-60"
                >
                  {formSubmitting ? "Dispatching Request..." : "Send Request to Designer"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
