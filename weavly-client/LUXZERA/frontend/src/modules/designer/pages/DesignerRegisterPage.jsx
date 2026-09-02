"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Scissors, ShieldCheck } from "lucide-react";
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
      router.push("/designer/dashboard");
    } catch (err) {
      setError(err.message || "Failed to register designer account");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center p-6 text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white">
      <div className="w-full max-w-lg border border-[#183B56] bg-white p-8 sm:p-10 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border border-[#183B56] bg-[#DFE7ED] text-[#183B56] flex items-center justify-center mx-auto mb-2">
            <Scissors size={20} />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-0.5 inline-block">
            Designer Registration
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
            Register as a Verified Designer
          </h1>
          <p className="text-xs text-[#5A7184] leading-relaxed">
            Create your designer identity, receive a unique Designer ID, and showcase lookbooks to thousands of clients.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                placeholder="e.g. Elena Vance"
                className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                Atelier / Brand Name
              </label>
              <input
                type="text"
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                placeholder="e.g. Vance Couture"
                className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
              Designer Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="atelier@domain.com"
              className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
              Password * (min 6 chars)
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                Location / City
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Mumbai, India"
                className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                Primary Specialization
              </label>
              <input
                type="text"
                value={formData.specialization}
                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g. Bridal & Haute Couture"
                className="w-full py-2 px-3 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border-none cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{submitting ? "Creating Studio Account..." : "Create Designer Account"}</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#183B56]/30 text-center text-xs text-[#5A7184]">
          Already have a designer account?{" "}
          <button
            onClick={() => router.push("/designer/login")}
            className="font-bold text-[#183B56] hover:underline cursor-pointer border-none bg-transparent p-0"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
