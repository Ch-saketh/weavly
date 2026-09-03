"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, ShieldAlert, RefreshCw, ArrowLeft, MailCheck, CheckCircle2 } from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";

export default function AdminWaitingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");

  const handleCheckStatus = () => {
    setChecking(true);
    setStatusNotice("");
    setTimeout(() => {
      setChecking(false);
      setStatusNotice("Your application status is still PENDING. Super admin approval is required.");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#1D1D1F] text-white flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#F07020]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#C6A15B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#252836]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-center space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <button onClick={() => router.push("/")} className="border-none bg-transparent p-0 cursor-pointer select-none">
            <WeavlyLogo />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F07020]/20 border border-[#F07020]/40 text-[#F07020] text-[10px] font-extrabold uppercase tracking-widest mt-5">
            <Clock size={12} />
            Application Pending Room
          </div>
        </div>

        {/* Animated Clock / Lock Icon */}
        <div className="w-20 h-20 rounded-full bg-[#F07020]/15 border border-[#F07020]/30 flex items-center justify-center mx-auto text-[#F07020]">
          <ShieldAlert size={38} className="animate-pulse" />
        </div>

        {/* Status Content */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Application Pending Approval
          </h1>
          <p className="text-[13.5px] text-white/70 leading-relaxed">
            Your candidate application is currently in the review queue. Super Admin approval is required before executive 2FA privileges are granted.
          </p>
        </div>

        {/* Notice box */}
        {statusNotice && (
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-[12px] font-medium flex items-center justify-center gap-2">
            <Clock size={15} />
            <span>{statusNotice}</span>
          </div>
        )}

        <div className="bg-white/5 p-4 rounded-2xl border border-white/10 text-left space-y-2 text-[12.5px]">
          <div className="flex items-center justify-between text-white/70">
            <span>Approval Authority:</span>
            <span className="font-semibold text-white">Super Admin (saketh@admin.Weavly)</span>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>2FA Resend Status:</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Ready upon approval
            </span>
          </div>
          <div className="flex items-center justify-between text-white/70">
            <span>Identity Provisioning:</span>
            <span className="text-white/90 font-medium">Invited / Verification Required</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-2">
          <button
            onClick={handleCheckStatus}
            disabled={checking}
            className="w-full h-12 rounded-xl bg-[#F07020] hover:bg-[#d95e14] active:scale-[0.98] text-white font-bold text-[14px] transition-all cursor-pointer border-none flex items-center justify-center gap-2 shadow-lg shadow-[#F07020]/25 touch-manipulation disabled:opacity-50"
          >
            <RefreshCw size={16} className={checking ? "animate-spin" : ""} />
            <span>{checking ? "Checking Status..." : "Refresh Approval Status"}</span>
          </button>

          <button
            onClick={() => router.push("/admin/login")}
            className="w-full h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-[13px] transition-all cursor-pointer border-none flex items-center justify-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Admin Login</span>
          </button>
        </div>
      </div>
    </div>
  );
}
