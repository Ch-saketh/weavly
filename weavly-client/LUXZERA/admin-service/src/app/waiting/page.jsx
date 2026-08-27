"use client";

import { useRouter } from "next/navigation";
import { Clock, ShieldAlert, ArrowLeft } from "lucide-react";
import LuxZeraLogo from "@/components/LuxZeraLogo";

export default function AdminWaitingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#18181B] text-white flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#27272A] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
        <button onClick={() => router.push("/login")} className="border-none bg-transparent cursor-pointer">
          <LuxZeraLogo />
        </button>

        <div className="size-16 bg-[#F07020]/20 text-[#F07020] rounded-full flex items-center justify-center mx-auto border border-[#F07020]/30">
          <Clock size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white">Application Under Review</h1>
          <p className="text-xs text-white/70 leading-relaxed">
            Your candidate onboarding application is currently pending Super Admin review. Upon approval, 2FA credentials will be granted to your email.
          </p>
        </div>

        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-left space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#F07020]">
            <ShieldAlert size={14} />
            <span>Verification Status: PENDING</span>
          </div>
          <p className="text-[11px] text-white/50">
            For urgent access requests, contact <span className="text-white font-mono">chokkapusaketh@gmail.com</span>
          </p>
        </div>

        <button
          onClick={() => router.push("/login")}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border-none cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Login</span>
        </button>
      </div>
    </div>
  );
}
