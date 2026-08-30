"use client";

// src/auth/VerifyOtpPage.jsx
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyOtp, resendOtp } from "@/modules/auth/services/authService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp) { setErrorMsg("Missing email or OTP verification code."); return; }
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await verifyOtp(email.trim().toLowerCase(), otp);
      setSuccessMsg("Account verified successfully! Redirecting you to login page...");
      setTimeout(() => router.push("/?openLogin=true"), 2000);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Invalid OTP code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      await resendOtp(email.trim().toLowerCase());
      setSuccessMsg("A new verification code has been sent to your email.");
      setTimer(60);
      setCanResend(false);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Failed to resend code. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#18181B] flex items-center justify-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="auth-surface w-full max-w-[440px] rounded-2xl p-8 sm:p-10 text-center flex flex-col gap-6 bg-white border border-[#ECECEC] shadow-sm">
        <div className="auth-content flex flex-col gap-6">

        <div className="flex flex-col items-center">
          <button onClick={() => router.push("/?openLogin=true")} className="cursor-pointer flex items-center justify-center border-none bg-transparent p-0 select-none" aria-label="Weavly home">
            <img src="/logo.png" alt="Zyra Symbol" className="h-10 w-auto object-contain" />
          </button>
          <h2 className="text-[28px] font-bold text-[#18181B] mt-5 tracking-tight">Verify Account</h2>
          <p className="text-[12.5px] text-[#515154] font-medium leading-relaxed mt-2 max-w-[280px]">
            Enter the 6-digit verification code sent to <strong className="text-[#0D1B2A]">{email}</strong>.
          </p>
        </div>

        {errorMsg && (
          <div className="auth-alert p-3.5 bg-red-50 border border-red-200 rounded-xl text-left">
            <p className="text-[11.5px] text-red-600 font-bold leading-normal">{errorMsg}</p>
          </div>
        )}
        {successMsg && (
          <div className="auth-alert p-3.5 bg-green-50 border border-green-200 rounded-xl text-left">
            <p className="text-[11.5px] text-green-600 font-bold leading-normal">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-view flex flex-col gap-5 text-left">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider">Verification Code</label>
            <input
              required
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="e.g. 123456"
              className="auth-input px-4 text-[15px] font-black tracking-[0.2em] text-center placeholder:tracking-normal"
            />
          </div>
          <button type="submit" disabled={loading || successMsg.includes("Redirecting")} className="auth-cta w-full border-none flex items-center justify-center mt-2">
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="text-[12.5px] font-semibold text-[#515154] mt-2 border-t border-[#E7E3DD]/40 pt-4 flex flex-col gap-2 items-center">
          <p>
            Didn't receive the code?{" "}
            <button
              onClick={handleResend}
              disabled={!canResend || loading}
              className={`font-bold pl-1 bg-transparent border-none outline-none cursor-pointer ${canResend ? "text-[#FF6A00] hover:underline" : "text-[#86868B] cursor-not-allowed"}`}
            >
              {canResend ? "Resend OTP" : `Resend in ${timer}s`}
            </button>
          </p>
        </div>

        </div>
      </div>
    </div>
  );
}
