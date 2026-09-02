"use client";

// src/modules/designer/pages/DesignerForgotPasswordPage.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ShieldCheck, ArrowRight, Check, AlertCircle, Scissors, ArrowLeft, KeyRound } from "lucide-react";
import { forgotPassword, resetPassword } from "@/modules/auth/services/authService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function DesignerForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await forgotPassword(email.trim().toLowerCase());
      setSuccessMsg("Verification code dispatched! Please check your designer email inbox.");
      setStep(2);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Unable to send verification code. Please verify your designer email."));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim() || !newPassword) return;

    if (newPassword !== confirmPassword) {
      setErrorMsg("New passwords do not match. Please re-enter.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
      setSuccessMsg("Password reset successfully! Redirecting you to Designer Studio sign in...");
      setTimeout(() => {
        router.push("/designer/login");
      }, 2000);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Invalid or expired verification code. Please check and try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] flex items-center justify-center p-6 text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white">
      <div className="w-full max-w-md border border-[#183B56] bg-white p-8 sm:p-10 shadow-xs space-y-6">
        
        {/* Header Module */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 border border-[#183B56] bg-[#DFE7ED] text-[#183B56] flex items-center justify-center mx-auto mb-2">
            <Scissors size={20} />
          </div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-[#5A7184] bg-[#F5EFEB] border border-[#183B56] px-2.5 py-0.5 inline-block">
            DESIGNER CREDENTIALS
          </span>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
            Reset Password
          </h1>
          <p className="text-xs text-[#5A7184] leading-relaxed">
            {step === 1
              ? "Enter your registered designer email to receive a secure 6-digit verification code."
              : "Enter the 6-digit verification code sent to your inbox and set your new password."}
          </p>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3.5 bg-red-50 text-red-700 text-xs border border-red-300 font-medium flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 bg-[#F5EFEB] text-[#183B56] text-xs border border-[#183B56] font-medium flex items-center gap-2">
            <Check size={15} className="shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} className="space-y-4 text-xs font-medium">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                Designer Email
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A7184]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="designer@domain.com"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#183B56] text-xs font-semibold text-[#183B56] outline-none placeholder-[#5A7184]/50 focus:ring-1 focus:ring-[#183B56]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? "Sending Code..." : "Send Verification Code"}</span>
              <ArrowRight size={13} />
            </button>
          </form>
        )}

        {/* STEP 2: Enter OTP & New Password */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4 text-xs font-medium">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#183B56]">
                  6-Digit Verification Code
                </label>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-[10px] text-[#5A7184] hover:text-[#183B56] underline cursor-pointer bg-transparent border-none p-0"
                >
                  Change email
                </button>
              </div>
              <div className="relative">
                <KeyRound size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A7184]" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#183B56] text-xs font-mono font-bold tracking-widest text-[#183B56] outline-none placeholder-[#5A7184]/50 focus:ring-1 focus:ring-[#183B56]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A7184]" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#183B56] text-xs font-semibold text-[#183B56] outline-none placeholder-[#5A7184]/50 focus:ring-1 focus:ring-[#183B56]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#183B56] mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5A7184]" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-[#183B56] text-xs font-semibold text-[#183B56] outline-none placeholder-[#5A7184]/50 focus:ring-1 focus:ring-[#183B56]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider border border-[#183B56] cursor-pointer shadow-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{loading ? "Updating Password..." : "Update Password & Sign In"}</span>
              <Check size={14} />
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="pt-4 border-t border-[#183B56]/20 text-center space-y-2 text-xs text-[#5A7184]">
          <div>
            Remember your credentials?{" "}
            <button
              onClick={() => router.push("/designer/login")}
              className="font-bold text-[#183B56] hover:underline cursor-pointer border-none bg-transparent p-0"
            >
              Sign In to Designer Studio
            </button>
          </div>

          <div className="text-[11px] text-[#5A7184]">
            Need help? Contact concierge at{" "}
            <a href="mailto:chokkapusaketh@gmail.com" className="font-semibold text-[#183B56] underline">
              chokkapusaketh@gmail.com
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
