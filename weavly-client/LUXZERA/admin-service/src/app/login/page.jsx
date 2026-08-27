"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import LuxZeraLogo from "@/components/LuxZeraLogo";
import { adminLogin, verifyAdminOtp } from "@/services/adminService";
import { setToken } from "@/utils/token";
import { formatErrorMessage } from "@/utils/errorUtils";

export default function AdminLoginPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Step 1: POST /api/auth/admin/login { email, password }
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await adminLogin(email.trim().toLowerCase(), password);

      setSuccessMsg(`2FA Security Code sent to ${email.trim().toLowerCase()}. Check your email inbox!`);
      setStep(2);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Invalid admin email or password. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: POST /api/auth/admin/verify-otp { email, otp }
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setErrorMsg("Please enter a valid 6-digit OTP verification code.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await verifyAdminOtp(email.trim().toLowerCase(), otpCode.trim());
      // Extract the real JWT string from response
      const token = response?.accessToken || response?.token || response?.data?.accessToken || response?.data?.token;

      if (token && typeof token === "string" && !token.startsWith("dev_")) {
        setToken(token);
        setSuccessMsg("2FA verified! Real JWT Token saved. Redirecting to Executive Admin Dashboard...");
        setTimeout(() => router.push("/dashboard"), 800);
      } else if (token) {
        setToken(token);
        setSuccessMsg("2FA verified! Accessing Super Admin Dashboard...");
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        throw new Error("Backend response did not return a valid accessToken JWT string.");
      }
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Invalid or expired OTP code. Please check your email."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-white text-[#18181B] font-sans">
      {/* Left Column: Form & Header */}
      <div className="flex flex-col gap-4 p-6 md:p-10 justify-between">
        <div className="flex justify-center md:justify-start">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2.5 font-medium border-none bg-transparent cursor-pointer p-0 select-none"
          >
            <LuxZeraLogo />
            <span className="text-[11px] font-bold uppercase tracking-wider bg-[#18181B] text-white px-2.5 py-0.5 rounded-full ml-1">
              Admin
            </span>
          </button>
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm space-y-6">
            <div className="flex flex-col gap-1 text-center md:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-[#18181B]">
                {step === 1 ? "Login to your Admin account" : "Security 2FA Verification"}
              </h1>
              <p className="text-sm text-balance text-[#71717A]">
                {step === 1
                  ? "Enter your executive email below to login to your account"
                  : `Enter the 6-digit OTP code sent to ${email || "your email"}`}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 text-xs font-medium">
                <AlertCircle size={15} className="shrink-0 text-red-500" />
                <span>{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-700 text-xs font-medium">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium leading-none text-[#18181B]">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="chokkapusaketh@gmail.com"
                    className="flex h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F07020] focus-visible:ring-offset-2 transition-all"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium leading-none text-[#18181B]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert("Contact Super Admin Security to reset credentials.")}
                      className="text-xs text-[#71717A] underline-offset-4 hover:underline bg-transparent border-none cursor-pointer p-0"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="flex h-10 w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F07020] focus-visible:ring-offset-2 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F07020] focus-visible:ring-offset-2 bg-[#18181B] text-white hover:bg-[#F07020] active:scale-[0.99] h-10 px-4 py-2 w-full mt-2 cursor-pointer border-none disabled:opacity-50"
                >
                  {loading ? "Authenticating..." : "Login"}
                </button>

                <div className="text-center text-xs text-[#71717A] mt-2">
                  Don&apos;t have an admin account?{" "}
                  <button
                    type="button"
                    onClick={() => router.push("/apply")}
                    className="font-medium text-[#18181B] underline underline-offset-4 bg-transparent border-none cursor-pointer p-0"
                  >
                    Sign up
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtpSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2 text-center">
                  <label htmlFor="otp" className="text-sm font-medium leading-none text-[#18181B]">
                    6-Digit Security OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter OTP from email / backend console"
                    className="flex h-12 w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-lg font-bold tracking-[0.3em] text-center placeholder:text-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F07020] focus-visible:ring-offset-2 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md text-sm font-semibold ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F07020] focus-visible:ring-offset-2 bg-[#F07020] text-white hover:bg-[#e05f0f] active:scale-[0.99] h-10 px-4 py-2 w-full mt-2 cursor-pointer border-none disabled:opacity-50"
                >
                  {loading ? "Verifying Token..." : "Verify & Launch Studio"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="text-center text-xs text-[#71717A] underline-offset-4 hover:underline bg-transparent border-none cursor-pointer mt-1"
                >
                  ← Back to Credentials
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center md:text-left text-xs text-[#A1A1AA]">
          LuxZera Executive Admin Service &copy; {new Date().getFullYear()}
        </div>
      </div>

      {/* Right Column: High-End Fashion Image */}
      <div className="relative hidden bg-[#18181B] lg:block">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&q=80"
          alt="LuxZera Executive Studio Editorial"
          className="absolute inset-0 h-full w-full object-cover brightness-[0.85] contrast-[1.05]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-12 text-white">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#F07020] mb-2">
            Executive Control Studio
          </span>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-2">
            LuxZera Admin Portal
          </h2>
          <p className="text-sm text-white/70 max-w-md">
            Manage haute couture catalog moderation, designer onboarding applications, dispute resolutions, and inventory operations.
          </p>
        </div>
      </div>
    </div>
  );
}
