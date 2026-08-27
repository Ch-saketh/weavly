"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail } from "lucide-react";
import WeavlyLogo from "@/shared/components/ui/WeavlyLogo";
import branding from "@/config/branding";

export default function BetaNoticeModal({ isOpen, onClose }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-[460px] bg-white rounded-2xl p-7 shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col text-left border border-[#ECECEC]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#FAFAF9] hover:bg-[#F4F4F5] flex items-center justify-center text-[#71717A] hover:text-[#1D1D1F] transition-colors border border-[#ECECEC] cursor-pointer"
          aria-label="Close modal"
        >
          <X size={16} strokeWidth={1.5} />
        </button>

        {/* Logo & Header */}
        <div className="flex items-center gap-2 mb-4">
          <WeavlyLogo size="md" showBeta={true} />
        </div>

        <h3 className="text-xl font-medium tracking-tight text-[#1D1D1F] mb-3">
          {branding.name} is currently in Beta.
        </h3>

        <div className="space-y-3.5 text-[13px] text-[#515154] leading-relaxed font-normal">
          <p>
            You're exploring an early version of the platform while we continue building new features and refining the overall experience. Some functionality may be incomplete, change over time, or behave unexpectedly.
          </p>

          <p>
            We're continuously improving {branding.name}, and your feedback plays an important role in shaping the platform.
          </p>

          <div className="pt-2 border-t border-[#ECECEC] space-y-1.5">
            <h4 className="text-[12px] font-semibold text-[#1D1D1F] uppercase tracking-wider">
              Contact
            </h4>
            <p>
              If you'd like to report a bug, share feedback, or learn more about {branding.name}, feel free to reach out.
            </p>
            <div className="flex items-center gap-2 pt-1 font-medium text-[#1D1D1F]">
              <Mail size={14} className="text-[#F07020]" />
              <a href={`mailto:${branding.contactEmail}`} className="text-[#F07020] hover:underline">
                {branding.contactEmail}
              </a>
            </div>
          </div>

          <p className="text-[12px] text-[#86868B] italic pt-1">
            Thank you for being one of our early users and supporting {branding.name} during its beta journey.
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button
            onClick={onClose}
            className="w-full h-11 rounded-lg bg-[#1D1D1F] hover:bg-[#2B2B2B] text-white text-[12px] font-medium transition-colors cursor-pointer border-none"
          >
            Understood &amp; Continue
          </button>
        </div>

      </div>
    </div>
  );

  if (typeof window === "undefined" || !document.body) return null;
  return createPortal(modalContent, document.body);
}
