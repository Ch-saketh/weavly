"use client";

// src/pages/RegisterPage.jsx
import { useState } from "react";
import { useRouter } from "next/navigation";
import { register } from "@/modules/auth/services/authService";
import { formatErrorMessage } from "@/shared/utils/errorUtils";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !firstName || !lastName || !email || !password) return;

    setLoading(true);
    setErrorMsg("");
    try {
      await register(username, firstName, lastName, email, password);
      // Success: Navigate to Verify OTP Page with email prefilled in search params
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setErrorMsg(formatErrorMessage(err, "Registration failed. Please check your credentials."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#18181B] flex items-center justify-center p-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="auth-surface w-full max-w-[440px] rounded-2xl p-8 sm:p-10 text-center flex flex-col gap-6 bg-white border border-[#ECECEC] shadow-sm">
        <div className="auth-content flex flex-col gap-6">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <button onClick={() => router.push("/")} className="cursor-pointer flex items-center justify-center border-none bg-transparent p-0 select-none" aria-label="Weavly home">
            <WeavlyLogo showBeta={false} size="lg" />
          </button>
          <h2 className="text-[28px] font-bold text-[#18181B] mt-5 tracking-tight">Create Account</h2>
          <p className="text-[12.5px] text-[#515154] font-medium leading-relaxed mt-1.5">
            Join Weavly Designer Studio to launch your collections worldwide.
          </p>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="auth-alert p-3.5 bg-red-50 border border-red-200 rounded-xl text-left">
            <p className="text-[11.5px] text-red-600 font-bold leading-normal">{errorMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-view flex flex-col gap-4 text-left">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider">First Name</label>
              <input
                required
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. John"
                className="auth-input px-4"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider">Last Name</label>
              <input
                required
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Doe"
                className="auth-input px-4"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider">Username</label>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a unique username"
              className="auth-input px-4"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider">Email Address</label>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="auth-input px-4"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-extrabold text-[#0D1B2A] uppercase tracking-wider">Password</label>
            <input
              required
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a secure password"
              className="auth-input px-4"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-cta w-full border-none flex items-center justify-center mt-2"
          >
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <div className="text-[12.5px] font-semibold text-[#515154] mt-2 border-t border-[#E7E3DD]/40 pt-4">
          <p>
            Already have an account?{" "}
            <span 
              onClick={() => router.push("/?openLogin=true")}
              className="text-[#FF6A00] hover:underline cursor-pointer font-bold pl-1"
            >
              Sign In
            </span>
          </p>
        </div>

        </div>
      </div>
    </div>
  );
}
