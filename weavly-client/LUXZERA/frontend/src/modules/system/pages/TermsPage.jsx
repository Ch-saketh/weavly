"use client";

// src/modules/system/pages/TermsPage.jsx
import React from "react";
import { ArrowLeft, ShieldCheck, FileText, CheckCircle2, Lock, Scale, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans pb-24 select-none">
      {/* ── Header ── */}
      <div className="relative border-b border-[#183B56]/20 py-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="h-px w-5 bg-[#183B56]" />
              <p className="text-[9px] font-bold uppercase tracking-[0.38em] text-[#183B56]">
                Legal & Atelier Standards
              </p>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold uppercase leading-[0.88] tracking-tight text-[#183B56]">
              Terms of<br />
              <span className="text-[#183B56]">Service.</span>
            </h1>
            <p className="mt-8 text-[13px] text-[#5A7184] leading-[1.75] max-w-lg font-medium">
              Transparent, fair, and human-first guidelines governing the Weavly fashion marketplace, custom couture atelier, and Zyra AI styling ecosystem.
            </p>
          </div>

          <div className="relative shrink-0 w-44 h-44 bg-[#E2EAEF] rounded-full border border-[#183B56]/30 flex items-center justify-center">
            <Scale size={64} className="text-[#183B56] opacity-90" />
          </div>
        </div>
      </div>

      {/* ── Core Terms Grid ── */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Section 1 */}
          <div className="border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 shadow-xs space-y-3">
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">01 / Marketplace & Orders</span>
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56]">Fair Commerce &amp; Authenticity</h3>
            <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
              Every garment showcased across Weavly drops and Designer Studios is verified for authentic provenance, craftsmanship standards, and material integrity. Orders are fulfilled directly with verified boutique ateliers.
            </p>
          </div>

          {/* Section 2 */}
          <div className="border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 shadow-xs space-y-3">
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">02 / Privacy &amp; Data Rights</span>
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56]">Zero Data Selling Guarantee</h3>
            <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
              We uphold complete user data sovereignty. Your measurements, body definitions, and fitting uploads remain strictly confidential and are never commoditized or shared with third-party advertising networks.
            </p>
          </div>

          {/* Section 3 */}
          <div className="border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 shadow-xs space-y-3">
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">03 / Custom Commissions</span>
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56]">Couture &amp; Designer Atelier</h3>
            <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
              Commissioned bespoke garments are made-to-measure. Once crafting begins, bespoke designs are protected under artisan milestone commitments to ensure both patron and designer security.
            </p>
          </div>

          {/* Section 4 */}
          <div className="border border-[#183B56]/30 rounded-2xl p-8 bg-white/70 shadow-xs space-y-3">
            <span className="text-[8px] font-bold uppercase tracking-[0.3em] text-[#183B56] bg-[#183B56]/10 border border-[#183B56]/20 px-2.5 py-0.5 rounded-xs">04 / User Account &amp; Safety</span>
            <h3 className="text-lg font-bold uppercase tracking-tight text-[#183B56]">Account Ownership &amp; Control</h3>
            <p className="text-[12px] text-[#5A7184] leading-relaxed font-medium">
              You maintain unilateral control over your account. You can export your curated lookbooks or permanently erase all associated personal profile records at any time.
            </p>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-12 flex items-center justify-between border-t border-[#183B56]/20 pt-8">
          <button
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#183B56] hover:opacity-75 transition-opacity cursor-pointer border-none bg-transparent p-0"
          >
            <ArrowLeft size={14} />
            <span>Return to Boutique</span>
          </button>
          <button
            onClick={() => router.push("/privacy")}
            className="text-xs font-bold uppercase tracking-wider text-[#183B56] underline hover:opacity-75 transition-opacity cursor-pointer border-none bg-transparent p-0"
          >
            <span>View Privacy Policy Vow →</span>
          </button>
        </div>
      </section>
    </div>
  );
}
