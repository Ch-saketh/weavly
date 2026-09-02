"use client";

// src/modules/designer/pages/CreatorGuidePage.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Scissors,
  Sparkles,
  Upload,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Layers,
  Zap,
  Globe,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Ruler,
  Clock,
  HelpCircle,
  FileCheck,
  Award,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function CreatorGuidePage({ initialTab = "become-creator" }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);

  const BECOME_CREATOR_STEPS = [
    {
      stepNumber: "01",
      title: "Submit Your Atelier Application",
      headline: "Showcase your craftsmanship and unique aesthetic",
      description: "Complete our streamlined designer registration. Share your brand story, past collection lookbooks, Instagram/portfolio links, and design specialty (e.g., Haute Couture, Modern Streetwear, Festive Ethnic, Avant-Garde Minimal).",
      details: [
        "Portfolio & Lookbook Upload (minimum 3 sample garments/sketches)",
        "Atelier location, production capacity & tailoring specialty",
        "Fabric sourcing philosophy and craftsmanship standards"
      ],
      tip: "Ateliers with clear garment construction details and fabric composition notes are approved 3x faster.",
      icon: Scissors
    },
    {
      stepNumber: "02",
      title: "Curation Committee Review",
      headline: "48-Hour quality and authenticity audit",
      description: "Our fashion board reviews every applicant for design originality, fabric durability, and atelier reliability. We ensure all creators meet our luxury patron expectations.",
      details: [
        "Design originality and brand uniqueness verification",
        "Production capability & tailoring timeline commitment",
        "Agreement to Weavly 100% Milestone Escrow & Fit Integrity Standard"
      ],
      tip: "We accept both established luxury houses and emerging avant-garde artisans with proven tailoring skill.",
      icon: Award
    },
    {
      stepNumber: "03",
      title: "Atelier Studio Onboarding & KYC",
      headline: "Configure your digital storefront & payout gateway",
      description: "Once approved, unlock your personalized Designer Studio dashboard. Set up your verified bio, atelier banner, currency preferences, and secure direct-deposit bank payouts.",
      details: [
        "Direct bank payout integration (automated multi-currency disbursements)",
        "Atelier profile customization with badges, lookbooks, and patron reviews",
        "Access to bespoke commission queue and Zyra AI style mapping"
      ],
      tip: "You retain 100% copyright ownership of all your lookbooks and proprietary garment designs.",
      icon: UserCheck
    },
    {
      stepNumber: "04",
      title: "Launch & Receive Global Commissions",
      headline: "Reach high-intent luxury buyers worldwide",
      description: "Your collections go live instantly on the Weavly Marketplace and are automatically integrated into Zyra's AI stylist recommendations for high-intent patrons across 100+ countries.",
      details: [
        "Featured on 'Discover Designers' and 'Curated Lookbooks'",
        "Live patron custom commission requests with full measurement specs",
        "Complimentary Weavly luxury garment covers and packaging boxes"
      ],
      tip: "Funds for every custom order are locked safely in escrow before you ever touch a piece of fabric.",
      icon: Globe
    }
  ];

  const PUBLISH_DESIGN_STEPS = [
    {
      stepNumber: "01",
      title: "Open Designer Studio & Create New Design",
      headline: "Start your new lookbook garment draft",
      description: "Navigate to your Designer Studio dashboard and click '+ Publish New Design'. Select the primary department (Women, Men, Unisex, Capsule) and fashion category (e.g., Couture Gown, Kurta Set, Blazer, Overcoat).",
      details: [
        "Give your design an evocative, luxury title and collection name",
        "Write a compelling narrative: the inspiration, drape silhouette, and tailoring philosophy",
        "Select occasion affinity (Wedding, Formal, Party, College, Casual, Sport)"
      ],
      tip: "Assigning accurate occasion affinities ensures Zyra AI recommends your garment to the right patrons.",
      icon: Palette
    },
    {
      stepNumber: "02",
      title: "Upload High-Resolution Renders & Lookbooks",
      headline: "Visuals that captivate luxury patrons",
      description: "Upload clean, high-resolution photography, 3D model renders, or editorial sketches. We recommend providing full-length front, back, drape detail, and fabric texture close-ups.",
      details: [
        "Minimum 1200x1600px crisp PNG/JPEG on clean studio backgrounds",
        "Showcase front, back, silhouette movement, and garment lining",
        "Optional 360-degree video or runway video loop"
      ],
      tip: "Garments with clean neutral studio backdrops achieve 45% higher patron commission conversions.",
      icon: ImageIcon
    },
    {
      stepNumber: "03",
      title: "Define Fabric Composition & Artisan Specs",
      headline: "Transparency in materials and craftsmanship",
      description: "Specify the exact textile composition, GSM fabric weight, weave pattern, lining materials, and artisan care instructions. Luxury patrons value material integrity.",
      details: [
        "Fabric composition (e.g., 100% Mulberry Silk, Raw Linen, Heavyweight 450GSM Wool)",
        "Hand-embroidery, block print, or custom hardware specifications",
        "Dry-cleaning & preservation guidelines"
      ],
      tip: "Highlighting sustainable, organic, or heirloom fabrics increases brand prestige on patron feeds.",
      icon: Layers
    },
    {
      stepNumber: "04",
      title: "Configure Pricing, Ready Sizes & Bespoke Options",
      headline: "Give patrons flexibility between ready-to-wear and made-to-measure",
      description: "Set your pricing structure. You can offer ready-to-wear standard sizes (XS through XXL) and enable the 'Custom Made-to-Measure' toggle to receive custom patron body measurements.",
      details: [
        "Set standard retail price and optional bespoke tailoring premium",
        "Enable 'Made-to-Measure' toggle to accept custom bust/waist/hip/shoulder specs",
        "Specify crafting timeline (e.g., 7–14 business days for bespoke tailoring)"
      ],
      tip: "Offering custom measurement options allows Zyra AI to match your design to patrons seeking perfect fit.",
      icon: Ruler
    },
    {
      stepNumber: "05",
      title: "Publish Live & Track Milestone Payouts",
      headline: "Instant indexing and automated escrow fulfillment",
      description: "Hit 'Publish'. Your design is indexed across Weavly catalogs immediately. When an order arrives, follow structured milestones (Order Confirmed → Cutting → Sewing → Shipped) and receive instant bank payouts upon client receipt.",
      details: [
        "Instant storefront display across marketplace lookbooks",
        "Milestone-based patron progress updates with photo check-ins",
        "Automated 100% escrow release to your bank upon delivery verification"
      ],
      tip: "Keeping patrons updated at tailoring milestones earns you Top Atelier badges on Weavly.",
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      
      {/* ── Editorial Hero Header ── */}
      <div className="relative border-b border-[#183B56]/15 bg-gradient-to-b from-white/60 to-[#F5EFEB] pt-20 pb-16 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A7184]">
              <button 
                onClick={() => router.push("/")} 
                className="hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer p-0"
              >
                Weavly
              </button>
              <span>/</span>
              <button 
                onClick={() => router.push("/designer-studio")} 
                className="hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer p-0"
              >
                Designer Studio
              </button>
              <span>/</span>
              <span className="text-[#183B56]">Creator Handbook</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183B56]/10 border border-[#183B56]/20 text-[#183B56] text-[11px] font-semibold">
              <Award size={13} className="text-[#183B56]" />
              <span>Official Atelier Creator Handbook</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-[#183B56]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#183B56]">
                  Atelier Enablement &amp; Publishing Guide
                </p>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#183B56] leading-[0.92]">
                Creator Handbook &amp;<br />
                <span className="font-serif italic font-normal lowercase text-[#183B56]/90">publishing standard.</span>
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#5A7184] leading-relaxed max-w-2xl font-medium pt-2">
                Everything you need to know about joining the Weavly verified creator network, publishing your custom lookbooks, configuring bespoke sizing, and managing milestone escrow payouts.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={() => router.push("/become-designer")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs rounded-xs cursor-pointer border border-[#183B56]"
              >
                <span>Apply as Designer</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => router.push("/designer/login")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-xs font-bold uppercase tracking-wider transition-all border border-[#183B56]/30 shadow-2xs rounded-xs cursor-pointer"
              >
                <span>Open Designer Studio</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Interactive Workflow Switcher ── */}
      <div className="border-b border-[#183B56]/15 bg-white/80 backdrop-blur-xs sticky top-0 z-30 py-4 px-6 sm:px-12 shadow-2xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("become-creator")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border flex items-center gap-2
                ${activeTab === "become-creator"
                  ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                  : "bg-white text-[#5A7184] border-[#183B56]/20 hover:border-[#183B56] hover:text-[#183B56]"}`}
            >
              <UserCheck size={14} />
              <span>1. How to Become a Creator</span>
            </button>

            <button
              onClick={() => setActiveTab("publish-design")}
              className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all cursor-pointer border flex items-center gap-2
                ${activeTab === "publish-design"
                  ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                  : "bg-white text-[#5A7184] border-[#183B56]/20 hover:border-[#183B56] hover:text-[#183B56]"}`}
            >
              <Palette size={14} />
              <span>2. How to Publish Your Design</span>
            </button>
          </div>

          <div className="text-[11px] text-[#5A7184] font-medium hidden sm:block">
            {activeTab === "become-creator" ? "4-Step Onboarding Workflow" : "5-Step Publishing Blueprint"}
          </div>
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16">
        
        {/* TAB 1: HOW TO BECOME A CREATOR */}
        {activeTab === "become-creator" && (
          <div className="space-y-16 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                <span className="w-2 h-2 rounded-full bg-[#183B56]" />
                <span>Path to Verification</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
                How to Become a Verified Creator on Weavly
              </h2>
              <p className="text-[14px] text-[#5A7184] font-medium leading-relaxed">
                Join our international community of premier fashion designers, master couturiers, and artisanal tailoring studios. Here is the straightforward 4-step path from application to verified storefront.
              </p>
            </div>

            {/* Steps Timeline Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {BECOME_CREATOR_STEPS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="border border-[#183B56]/20 rounded-2xl p-8 bg-white shadow-xs hover:border-[#183B56]/50 transition-all flex flex-col justify-between space-y-6 group"
                  >
                    <div className="space-y-4">
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div className="w-12 h-12 rounded-xl bg-[#183B56] text-white flex items-center justify-center font-bold font-mono text-base border border-[#183B56]">
                          {item.stepNumber}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[#E2EAEF] text-[#183B56] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent size={20} />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-tight text-[#183B56] mt-2">
                          {item.title}
                        </h3>
                        <p className="text-xs font-semibold text-[#183B56] mt-1">
                          {item.headline}
                        </p>
                        <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium mt-3">
                          {item.description}
                        </p>
                      </div>

                      {/* Checklist */}
                      <div className="pt-2 border-t border-[#183B56]/10 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#183B56]">Key Requirements:</p>
                        <ul className="space-y-1.5 p-0 m-0 list-none text-xs text-[#5A7184] font-medium">
                          {item.details.map((d, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2">
                              <CheckCircle2 size={13} className="text-emerald-600 mt-0.5 shrink-0" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pro Tip Box */}
                    <div className="p-3.5 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 text-[11px] text-[#183B56] leading-relaxed">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-[#183B56] block mb-0.5">✦ Pro-Tip:</span>
                      {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Banner */}
            <div className="bg-[#183B56] text-white rounded-3xl p-8 sm:p-12 shadow-md flex flex-col lg:flex-row items-center justify-between gap-8">
              <div className="space-y-3 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold">
                  <Sparkles size={13} className="text-[#38BDF8]" />
                  <span>Zero Upfront Membership Fees</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                  Ready to launch your atelier on Weavly?
                </h3>
                <p className="text-xs sm:text-[13px] text-white/80 leading-relaxed font-normal">
                  Applications take under 5 minutes to submit. Our curation team evaluates submissions within 48 hours.
                </p>
              </div>

              <button
                onClick={() => router.push("/become-designer")}
                className="shrink-0 px-8 py-4 bg-white text-[#183B56] hover:bg-[#F5EFEB] text-xs font-bold uppercase tracking-wider transition-all shadow-sm rounded-xs cursor-pointer border-none flex items-center gap-2"
              >
                <span>Start Creator Application</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

        {/* TAB 2: HOW TO PUBLISH YOUR DESIGN */}
        {activeTab === "publish-design" && (
          <div className="space-y-16 animate-in fade-in duration-200">
            
            <div className="max-w-3xl space-y-3">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
                <span className="w-2 h-2 rounded-full bg-[#183B56]" />
                <span>Lookbook &amp; Design Architecture</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-[#183B56]">
                How to Publish Your Design in the Designer Studio
              </h2>
              <p className="text-[14px] text-[#5A7184] font-medium leading-relaxed">
                Publishing garments on Weavly connects your bespoke pieces to high-intent luxury shoppers and integrates your lookbooks directly into Zyra AI's virtual styling engine.
              </p>
            </div>

            {/* 5-Step Publishing Timeline */}
            <div className="space-y-8">
              {PUBLISH_DESIGN_STEPS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className="border border-[#183B56]/20 rounded-2xl p-8 bg-white shadow-xs hover:border-[#183B56]/50 transition-all grid grid-cols-1 lg:grid-cols-12 gap-8 items-start group"
                  >
                    {/* Step Number & Title */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-[#183B56] text-white flex items-center justify-center font-bold font-mono text-sm border border-[#183B56]">
                          {item.stepNumber}
                        </span>
                        <div className="w-8 h-8 rounded-full bg-[#E2EAEF] text-[#183B56] flex items-center justify-center group-hover:scale-110 transition-transform">
                          <IconComponent size={16} />
                        </div>
                      </div>

                      <h3 className="text-xl font-bold uppercase tracking-tight text-[#183B56]">
                        {item.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#183B56]">
                        {item.headline}
                      </p>
                      <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
                        {item.description}
                      </p>
                    </div>

                    {/* Step Details & Pro-Tip */}
                    <div className="lg:col-span-7 space-y-4 lg:border-l lg:border-[#183B56]/15 lg:pl-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#183B56]">Action Checklist:</p>
                        <ul className="space-y-2 p-0 m-0 list-none text-xs text-[#5A7184] font-medium">
                          {item.details.map((d, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2.5">
                              <CheckCircle2 size={14} className="text-emerald-600 mt-0.5 shrink-0" />
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 text-[11px] text-[#183B56] leading-relaxed">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-[#183B56] block mb-0.5">✦ Curation Best Practice:</span>
                        {item.tip}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Studio Action Strip */}
            <div className="border border-[#183B56]/30 bg-white rounded-2xl p-8 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-base font-bold uppercase text-[#183B56]">Ready to draft your next collection piece?</h4>
                <p className="text-xs text-[#5A7184] font-medium mt-1">Open your Designer Studio dashboard to begin uploading garments, sketches, and bespoke options.</p>
              </div>
              <button
                onClick={() => router.push("/designer/login")}
                className="shrink-0 px-6 py-3.5 bg-[#183B56] text-white hover:bg-[#102A43] text-xs font-bold uppercase tracking-wider transition-all rounded-xs cursor-pointer border-none flex items-center gap-2"
              >
                <span>Launch Designer Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
