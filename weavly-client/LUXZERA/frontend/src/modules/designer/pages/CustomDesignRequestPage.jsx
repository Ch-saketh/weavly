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
  ArrowRight,
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
        customerPhone: user.phone || prev.customerPhone,
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formData.designerId) {
      setFormError("Please select a designer atelier.");
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Please describe your custom design requirement.");
      return;
    }
    if (!formData.customerEmail.trim()) {
      setFormError("Please provide your contact email.");
      return;
    }

    setFormSubmitting(true);

    try {
      const payload = {
        ...formData,
        budget: formData.budget ? Number(formData.budget) : null,
        bust: formData.bust ? Number(formData.bust) : null,
        waist: formData.waist ? Number(formData.waist) : null,
        hips: formData.hips ? Number(formData.hips) : null,
        height: formData.height ? Number(formData.height) : null,
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
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white py-12 pb-28">
      <div className="max-w-4xl mx-auto px-6 sm:px-12">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#183B56] hover:underline mb-6 cursor-pointer border-none bg-transparent p-0"
        >
          <ChevronLeft size={16} /> Back to Studio
        </button>

        {requestSuccess ? (
          <div className="border border-[#183B56] bg-[#F5EFEB] p-10 sm:p-14 text-center shadow-xs space-y-6">
            <div className="w-16 h-16 rounded-full border border-[#183B56] bg-white text-[#2E7D32] flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h1 className="text-3xl font-bold text-[#183B56]">
              Custom Commission Dispatched!
            </h1>
            <p className="text-xs sm:text-sm text-[#5A7184] max-w-md mx-auto leading-relaxed">
              Your bespoke garment brief has been received by the selected atelier. The couturier will review your specifications and contact you.
            </p>
            <div className="font-mono text-sm font-bold bg-white border border-[#183B56] py-2.5 px-6 inline-block text-[#183B56]">
              Reference ID: {requestSuccess.requestId || "REQ-COMMISSION-OK"}
            </div>
            <div className="pt-4 flex justify-center gap-3">
              <button
                onClick={() => router.push("/designer-studio")}
                className="py-3 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border-none cursor-pointer"
              >
                Return to Designer Studio
              </button>
            </div>
          </div>
        ) : (
          <div className="border border-[#183B56] bg-[#F5EFEB] p-8 sm:p-12 shadow-xs space-y-8">
            <div className="pb-6 border-b border-[#183B56]">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#183B56] text-[10px] font-bold uppercase tracking-[0.2em] text-[#183B56] mb-3">
                <Scissors size={12} />
                <span>Bespoke Commission Brief</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#183B56] tracking-tight">
                Commission a Custom Garment
              </h1>
              <p className="text-xs sm:text-sm text-[#5A7184] mt-1.5 leading-relaxed font-normal">
                Describe your dream silhouette, select a verified creator, and have a one-of-a-kind piece handcrafted to your exact body measurements.
              </p>
            </div>

            {formError && (
              <div className="p-4 bg-red-50 text-red-700 text-xs border border-red-300 font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6 text-xs font-medium">
              {/* Select Designer */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-2">
                  Select Atelier Couturier *
                </label>
                {loadingDesigners ? (
                  <div className="h-12 bg-white border border-[#183B56]/30 animate-pulse" />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {designers.map((d) => (
                      <label
                        key={d.designerId}
                        className={`p-3.5 border cursor-pointer flex items-center gap-3 transition-all ${
                          formData.designerId === d.designerId
                            ? "border-[#183B56] bg-white shadow-xs"
                            : "border-[#183B56]/30 bg-transparent hover:border-[#183B56]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="designer"
                          value={d.designerId}
                          checked={formData.designerId === d.designerId}
                          onChange={(e) => setFormData({ ...formData, designerId: e.target.value })}
                          className="accent-[#183B56]"
                        />
                        <div>
                          <div className="font-bold text-[#183B56]">{d.displayName}</div>
                          <div className="text-[10px] text-[#5A7184]">{d.brandName || "Independent Studio"} • {d.specialization || "Couture"}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                  Garment Vision & Design Brief *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe the occasion, silhouette style, neckline, draping, and any specific inspiration..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none resize-none"
                />
              </div>

              {/* Fabric, Color, Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Preferred Fabric
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mulberry Silk, Wool Faille"
                    value={formData.preferredFabric}
                    onChange={(e) => setFormData({ ...formData, preferredFabric: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Color Palette
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Midnight Navy, Ivory, Olive"
                    value={formData.preferredColor}
                    onChange={(e) => setFormData({ ...formData, preferredColor: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                    Estimated Budget (INR ₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000"
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full py-2.5 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
                  />
                </div>
              </div>

              {/* Measurements (Optional) */}
              <div className="border border-[#183B56]/30 p-4 bg-white/50 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#183B56]">
                  Body Measurements (Inches — Optional)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] text-[#5A7184] mb-1">Bust / Chest</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="36"
                      value={formData.bust}
                      onChange={(e) => setFormData({ ...formData, bust: e.target.value })}
                      className="w-full py-2 px-2.5 bg-white border border-[#183B56] text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5A7184] mb-1">Waist</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="30"
                      value={formData.waist}
                      onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                      className="w-full py-2 px-2.5 bg-white border border-[#183B56] text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5A7184] mb-1">Hips</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="38"
                      value={formData.hips}
                      onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                      className="w-full py-2 px-2.5 bg-white border border-[#183B56] text-xs outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#5A7184] mb-1">Height (cm)</label>
                    <input
                      type="number"
                      placeholder="175"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full py-2 px-2.5 bg-white border border-[#183B56] text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="w-full py-3.5 px-6 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.18em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  <span>{formSubmitting ? "Dispatching Brief to Atelier..." : "Submit Bespoke Commission"}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
