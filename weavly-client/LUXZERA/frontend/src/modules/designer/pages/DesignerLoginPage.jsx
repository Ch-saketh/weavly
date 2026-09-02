"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, Scissors } from "lucide-react";
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
    <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center p-6 text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white">
      <div className="w-full max-w-md border border-[#183B56] bg-[#F5EFEB] p-8 sm:p-10 shadow-xs space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border border-[#183B56] bg-white text-[#183B56] flex items-center justify-center mx-auto mb-2">
            <Scissors size={20} />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-0.5 inline-block">
            Designer Portal
          </span>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
            Designer Studio Sign In
          </h1>
          <p className="text-xs text-[#5A7184] leading-relaxed">
            Access your creator lookbooks, portfolio, and custom commission requests.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs border border-red-300 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-medium">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
              Designer Email
            </label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7184]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="designer@domain.com"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#183B56]">
                Password
              </label>
              <button
                type="button"
                onClick={() => router.push("/designer/forgot-password")}
                className="text-[10px] font-bold uppercase tracking-wider text-[#5A7184] hover:text-[#183B56] hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7184]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#183B56] text-xs font-normal text-[#183B56] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.16em] border border-[#183B56] cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 pt-2"
          >
            <span>{submitting ? "Signing in..." : "Enter Designer Studio"}</span>
            <ArrowRight size={13} />
          </button>
        </form>

        <div className="pt-4 border-t border-[#183B56]/30 text-center text-xs text-[#5A7184]">
          Want to showcase your designs on Weavly?{" "}
          <button
            onClick={() => router.push("/designer/register")}
            className="font-bold text-[#183B56] hover:underline cursor-pointer border-none bg-transparent p-0"
          >
            Apply for Designer Pass
          </button>
        </div>
      </div>
    </div>
  );
}
