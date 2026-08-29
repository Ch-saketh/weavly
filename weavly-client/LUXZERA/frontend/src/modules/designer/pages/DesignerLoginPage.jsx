"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, ShieldCheck } from "lucide-react";
import { useDesignerAuth } from "../store/useDesignerAuth";

export default function DesignerLoginPage() {
  const router = useRouter();
  const { login } = useDesignerAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login({ email, password });
      router.push("/designer-studio");
    } catch (err) {
      setError(err.message || "Invalid designer email or password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center p-4 pt-24 pb-24 text-[#1D1D1F]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#ECECEC] p-8 sm:p-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1D1D1F] text-[#F07020] flex items-center justify-center mx-auto mb-4 shadow-md">
            <Sparkles size={22} />
          </div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#F07020]">
            Designer Portal
          </span>
          <h1 className="text-2xl font-bold font-serif text-[#1D1D1F] mt-1">
            Designer Studio Sign In
          </h1>
          <p className="text-xs text-[#86868B] mt-1.5 leading-relaxed">
            Access your creator lookbooks, portfolio, and custom commission requests.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-50 text-red-600 text-xs border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-[#1D1D1F] mb-1.5">Designer Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="atelier@domain.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-[#1D1D1F] mb-1.5">Password</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A1A1AA]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#ECECEC] bg-[#FAFAF9] outline-none focus:border-[#1D1D1F] focus:bg-white text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-[#1D1D1F] hover:bg-[#2C2C2E] text-white font-medium text-xs transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-60 mt-2"
          >
            {submitting ? "Signing in..." : "Enter Designer Studio"} <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#ECECEC] text-center text-xs text-[#86868B]">
          Want to showcase your designs on Weavly?{" "}
          <button
            onClick={() => router.push("/designer/register")}
            className="font-semibold text-[#F07020] hover:underline"
          >
            Apply for Atelier Pass
          </button>
        </div>
      </div>
    </div>
  );
}
