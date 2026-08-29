"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { useDesignerAuth } from "../store/useDesignerAuth";

export default function DesignerRegisterPage() {
  const router = useRouter();
  const { register } = useDesignerAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    brandName: "",
    phone: "",
    location: "",
    specialization: "Custom Fashion & Couture",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await register(formData);
      router.push("/designer-studio");
    } catch (err) {
      setError(err.message || "Failed to register designer account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-4 pt-24 pb-24 text-[#1D1D1F]">
      <div className="w-full max-w-lg bg-white rounded-3xl border border-[#ECECEC] p-8 sm:p-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1D1D1F] text-[#F07020] flex items-center justify-center mx-auto mb-4 shadow-md">
            <Sparkles size={22} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F07020]">
            Atelier Registration
          </span>
          <h1 className="text-2xl font-bold font-serif text-[#1D1D1F] mt-1">
            Register as a Verified Designer
          </h1>
          <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
            Create your designer identity, receive a unique Designer ID, and showcase lookbooks.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#1D1D1F] mb-1">Display Name *</label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g. Elena Vance"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D1D1F] mb-1">Atelier / Brand Name</label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. Vance Couture"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#1D1D1F] mb-1">Designer Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="atelier@domain.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
            />
          </div>

          <div>
            <label className="block font-medium text-[#1D1D1F] mb-1">Password * (min 6 chars)</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-[#1D1D1F] mb-1">Location / City</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mumbai, India"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
              />
            </div>
            <div>
              <label className="block font-medium text-[#1D1D1F] mb-1">Primary Specialization</label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Bridal & Haute Couture"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 rounded-xl bg-[#F07020] hover:bg-[#e06214] text-white font-medium text-xs transition-all shadow-lg shadow-[#F07020]/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? "Creating Atelier..." : "Create Designer Account"} <ArrowRight size={14} />
            </button>
          </div>
        </form>

        <div className="mt-8 pt-6 border-t border-[#ECECEC] text-center text-xs text-[#86868B]">
          Already have a designer account?{" "}
          <button
            onClick={() => router.push("/designer/login")}
            className="font-semibold text-[#1D1D1F] hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
