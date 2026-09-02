"use client";

// src/modules/designer/pages/CreatorGuidePage.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Palette,
  Scissors,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Globe,
  DollarSign,
  TrendingUp,
  Image as ImageIcon,
  Ruler,
  Check,
  CheckCircle2,
  Award,
  ChevronRight,
  UserCheck,
  HelpCircle,
  Package,
  Clock,
  BookOpen
} from "lucide-react";

export default function CreatorGuidePage({ initialTab = "become-creator" }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(initialTab);

  const BECOME_CREATOR_STEPS = [
    {
      stepNumber: "01",
      title: "Submit 3 Photos or Sketches",
      headline: "Simple 5-minute designer application",
      description: "Tell us your brand name and upload 3 photos or drawings of your clothing (dresses, suits, shirts, or jackets). Share your Instagram or website portfolio link so we can see your style.",
      details: [
        "Brand name, location, and your personal design specialty",
        "Upload at least 3 photos or sketches of your past work",
        "Zero joining fee — 100% free to apply and join"
      ],
      tip: "Clear photos taken in good natural lighting on a clean background get approved the quickest!",
      icon: Scissors
    },
    {
      stepNumber: "02",
      title: "Fast 48-Hour Review",
      headline: "Our curation team approves your brand",
      description: "Our fashion curators review your application within 48 hours to ensure genuine craftsmanship and quality. Once approved, you receive an invitation email with your verified Designer ID.",
      details: [
        "Authenticity & quality check within 2 business days",
        "Confirmation of your tailoring turnaround time (e.g. 7–14 days)",
        "Direct acceptance into the verified Weavly creator network"
      ],
      tip: "We welcome both established luxury boutiques and passionate independent fashion creators.",
      icon: Award
    },
    {
      stepNumber: "03",
      title: "Set Up Your Bank & Profile",
      headline: "Get ready to receive direct payouts",
      description: "Log into your Designer Studio. Add your brand logo, a short bio explaining your style, and link your bank account so your earnings are deposited automatically.",
      details: [
        "Link your bank account for secure automated payouts",
        "Customize your public storefront with your banner & story",
        "Access your live commission queue and patron measurement sheets"
      ],
      tip: "You keep 100% copyright ownership of your designs and photos at all times.",
      icon: UserCheck
    },
    {
      stepNumber: "04",
      title: "Publish & Get Paid via Escrow",
      headline: "Receive orders from patrons worldwide",
      description: "Publish your lookbooks. When a buyer commissions an outfit, 100% of the money is locked safely in the Weavly Escrow Vault before you cut fabric. Payout is released directly to you upon delivery!",
      details: [
        "Your designs appear in 'Discover Designers' and member lookbooks",
        "Buyers submit their exact measurements for bespoke fit",
        "Complimentary Weavly luxury presentation boxes & garment covers"
      ],
      tip: "Funds are 100% guaranteed in escrow upfront — zero non-payment risk, zero chargeback worry.",
      icon: Globe
    }
  ];

  const PUBLISH_DESIGN_STEPS = [
    {
      stepNumber: "01",
      title: "Pick Your Category & Title",
      headline: "Start your new lookbook garment draft",
      description: "Go to your Designer Studio dashboard and click '+ Publish New Design'. Pick the department (Women, Men, Unisex) and clothing type (e.g., Blazer, Dress, Tuxedo, Casual Overcoat).",
      details: [
        "Give your outfit an elegant, distinctive title",
        "Write a short description: the inspiration, fit, and silhouette",
        "Pick the occasion (Formal, Office, Wedding, Everyday, Party)"
      ],
      tip: "Accurate occasion tags ensure Zyra recommends your outfit to buyers searching for that exact event.",
      icon: Palette
    },
    {
      stepNumber: "02",
      title: "Upload Clear Outfit Photos",
      headline: "Crisp photography that showcases your tailoring",
      description: "Upload clean, sharp photos of your outfit. We recommend providing a front view, back view, and a close-up showing the fabric texture and fine stitching detail.",
      details: [
        "High-resolution photos on clean, simple backgrounds",
        "Show front, back, silhouette movement, and lining",
        "Natural daylight or studio lighting works best"
      ],
      tip: "Outfits on neutral, uncluttered backdrops receive 45% more bespoke order commissions.",
      icon: ImageIcon
    },
    {
      stepNumber: "03",
      title: "Enter Fabric & Crafting Specs",
      headline: "Explain what your garment is made of",
      description: "List the fabric materials (e.g. 100% Linen, Mulberry Silk, Structured Wool), the care instructions (Dry clean only or hand wash), and how many days it takes you to stitch.",
      details: [
        "Textile composition (Silk, Linen, Wool, Cotton, Raw Blends)",
        "Hand-embroidery, custom buttons, or special hardware notes",
        "Care instructions & preservation booklet details"
      ],
      tip: "Highlighting natural and organic fabrics builds trust and attracts high-intent buyers.",
      icon: Layers
    },
    {
      stepNumber: "04",
      title: "Set Price & Bespoke Sizing",
      headline: "Offer ready-to-wear sizes or custom measurements",
      description: "Set your price. You can offer standard sizes (XS to XXL) and flip the 'Made-to-Measure' switch on so buyers can submit their exact body measurements for a 1-of-1 bespoke fit.",
      details: [
        "Set your standard retail price in your local currency",
        "Enable 'Made-to-Measure' to accept custom client proportions",
        "Specify your crafting timeline (typically 7–14 business days)"
      ],
      tip: "Enabling made-to-measure allows Zyra to match your design to clients looking for guaranteed perfect fit.",
      icon: Ruler
    },
    {
      stepNumber: "05",
      title: "Publish Live & Track Milestone Payouts",
      headline: "Instant publishing and guaranteed escrow payout",
      description: "Click 'Publish'. Your lookbook goes live immediately. When an order arrives, follow simple milestone check-ins (Confirmed → Cutting → Sewing → Shipped), and receive guaranteed payment on delivery.",
      details: [
        "Instant storefront display across global lookbooks",
        "Simple progress updates for your customer with milestone check-ins",
        "Automated bank payout release upon client receipt"
      ],
      tip: "Updating patrons at key milestones earns you Top Designer badges and repeat commissions!",
      icon: TrendingUp
    }
  ];

  const QUICK_LINKS = [
    { label: "Creator Handbook", path: "/creator-guide", active: true },
    { label: "Apply as Designer", path: "/become-designer" },
    { label: "Designer Registration", path: "/designer/register" },
    { label: "Designer Studio Login", path: "/designer/login" },
    { label: "Browse Verified Designers", path: "/designers" }
  ];

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      
      {/* ── BREADCRUMBS & TOP SUBNAV BAR ── */}
      <div className="border-b border-[#183B56]/20 bg-white/70 backdrop-blur-xs sticky top-0 z-40 px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-3.5">
        <div className="max-w-[1360px] mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#5A7184]">
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

          {/* Quick Subnav Hub Links */}
          <div className="flex items-center gap-2 flex-wrap">
            {QUICK_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => router.push(link.path)}
                className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer border ${
                  link.active
                    ? "bg-[#183B56] text-white border-[#183B56] shadow-2xs"
                    : "bg-white text-[#5A7184] border-[#183B56]/20 hover:border-[#183B56] hover:text-[#183B56]"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

        </div>
      </div>

      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-12 sm:space-y-16">

        {/* ── 1. ARCHITECTURAL HERO BANNER ── */}
        <section className="border border-[#183B56] bg-white p-8 sm:p-12 lg:p-16 shadow-xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            <div className="lg:col-span-8 space-y-5">
              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#5A7184] bg-[#F5EFEB] border border-[#183B56] px-3 py-1 inline-block">
                  Designer Enablement &amp; Publishing Standard
                </span>
                <span className="text-[10px] font-mono font-bold text-[#183B56] bg-[#DFE7ED] border border-[#183B56] px-2.5 py-1">
                  OFFICIAL GUIDE
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold uppercase tracking-tight text-[#183B56] leading-[1.02]">
                Creator Handbook &amp;<br />
                <span className="text-[#5A7184]">Publishing Standard.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#5A7184] leading-relaxed max-w-2xl font-medium">
                Everything you need to know about joining the Weavly verified creator network, publishing your custom lookbooks, configuring bespoke sizing, and managing milestone escrow payouts.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => router.push("/become-designer")}
                  className="px-7 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-wider transition-all border border-[#183B56] cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <span>Apply as a Designer</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => router.push("/designer/login")}
                  className="px-7 py-3.5 bg-[#F5EFEB] hover:bg-white text-[#183B56] text-xs font-bold uppercase tracking-wider transition-all border border-[#183B56] cursor-pointer shadow-xs flex items-center gap-2"
                >
                  <span>Open Designer Studio</span>
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* 4 Pillars Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#183B56]/20">
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#5A7184] uppercase block">COST TO JOIN</span>
                  <div className="font-bold text-sm text-[#183B56]">Zero Fees</div>
                  <div className="text-[11px] text-[#5A7184]">100% free application</div>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#5A7184] uppercase block">PAYMENT SAFETY</span>
                  <div className="font-bold text-sm text-[#183B56]">100% Escrow</div>
                  <div className="text-[11px] text-[#5A7184]">Guaranteed deposits</div>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#5A7184] uppercase block">TAILORING SIZING</span>
                  <div className="font-bold text-sm text-[#183B56]">Bespoke Drape</div>
                  <div className="text-[11px] text-[#5A7184]">Exact measurements</div>
                </div>
                <div>
                  <span className="text-[9px] font-mono font-bold text-[#5A7184] uppercase block">WORLDWIDE REACH</span>
                  <div className="font-bold text-sm text-[#183B56]">Global Patrons</div>
                  <div className="text-[11px] text-[#5A7184]">100+ countries</div>
                </div>
              </div>
            </div>

            {/* Right Editorial Lookbook Card */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-sm aspect-[4/5] bg-[#DFE7ED] border border-[#183B56] relative overflow-hidden shadow-xs group">
                <img
                  src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80"
                  alt="Designer Studio Craftsmanship"
                  className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500"
                />

                <div className="absolute top-3 left-3 bg-white/95 border border-[#183B56] px-3 py-1 shadow-xs">
                  <div className="text-[9px] uppercase tracking-wider text-[#5A7184] font-bold">VERIFIED DESIGNER</div>
                  <div className="text-xs font-bold text-[#183B56]">Creator Standard</div>
                </div>

                <div className="absolute bottom-3 right-3 bg-[#183B56] text-white px-3.5 py-1.5 shadow-xs text-right">
                  <div className="text-[9px] uppercase tracking-wider text-[#DFE7ED] font-mono">ESCROW VAULT</div>
                  <div className="text-xs font-bold">100% Protected Payouts</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── 2. WORKFLOW TAB SWITCHER BAR ── */}
        <section className="border border-[#183B56] bg-white p-2 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={() => setActiveTab("become-creator")}
              className={`flex-1 py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2.5 border ${
                activeTab === "become-creator"
                  ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                  : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:bg-white hover:border-[#183B56]"
              }`}
            >
              <UserCheck size={16} />
              <span>Guide 1: How to Become a Verified Creator (4 Steps)</span>
            </button>

            <button
              onClick={() => setActiveTab("publish-design")}
              className={`flex-1 py-3.5 px-6 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2.5 border ${
                activeTab === "publish-design"
                  ? "bg-[#183B56] text-white border-[#183B56] shadow-xs"
                  : "bg-[#F5EFEB] text-[#183B56] border-[#183B56]/20 hover:bg-white hover:border-[#183B56]"
              }`}
            >
              <Palette size={16} />
              <span>Guide 2: How to Publish a Design in Your Studio (5 Steps)</span>
            </button>
          </div>
        </section>

        {/* ── 3. GUIDE 1: HOW TO BECOME A CREATOR ── */}
        {activeTab === "become-creator" && (
          <section className="space-y-8 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#183B56] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                  Path to Verification
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                  How to Become a Verified Designer on Weavly
                </h2>
              </div>
              <span className="text-xs font-mono text-[#5A7184]">
                4 STRAIGHTFORWARD STEPS • ZERO UPFRONT FEES
              </span>
            </div>

            {/* 4 Steps Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BECOME_CREATOR_STEPS.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.stepNumber}
                    className="border border-[#183B56] bg-white p-7 sm:p-8 flex flex-col justify-between space-y-6 shadow-xs hover:bg-[#F5EFEB]/20 transition-colors"
                  >
                    <div className="space-y-4">
                      {/* Step Number & Icon */}
                      <div className="flex items-center justify-between">
                        <div className="w-10 h-10 border border-[#183B56] bg-[#183B56] text-white flex items-center justify-center font-mono font-bold text-sm">
                          {step.stepNumber}
                        </div>
                        <div className="w-10 h-10 border border-[#183B56] bg-[#DFE7ED] text-[#183B56] flex items-center justify-center">
                          <StepIcon size={18} />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
                          {step.title}
                        </h3>
                        <p className="text-xs font-bold text-[#5A7184] uppercase tracking-wider mt-0.5">
                          {step.headline}
                        </p>
                        <p className="text-xs text-[#5A7184] leading-relaxed font-medium mt-3">
                          {step.description}
                        </p>
                      </div>

                      {/* Checklist */}
                      <div className="pt-3 border-t border-[#183B56]/15 space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#183B56]">
                          What to Expect:
                        </p>
                        <ul className="space-y-1.5 p-0 m-0 list-none text-xs text-[#5A7184] font-medium">
                          {step.details.map((detail, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2">
                              <CheckCircle2 size={13} className="text-[#183B56] mt-0.5 shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Pro Tip Box */}
                    <div className="p-3.5 bg-[#F5EFEB] border border-[#183B56] text-[11px] text-[#183B56] leading-relaxed">
                      <span className="font-bold uppercase tracking-wider text-[9px] text-[#183B56] block mb-0.5">
                        ✦ Simple Tip:
                      </span>
                      {step.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Step 1 Action Strip */}
            <div className="border border-[#183B56] bg-[#183B56] text-white p-8 sm:p-12 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-[#DFE7ED] bg-white/10 px-2 py-0.5">
                  FAST ONBOARDING
                </span>
                <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                  Ready to launch your clothing brand on Weavly?
                </h3>
                <p className="text-xs text-white/80 leading-relaxed">
                  Applications take under 5 minutes. Our curation team evaluates submissions within 48 hours with guaranteed response.
                </p>
              </div>

              <button
                onClick={() => router.push("/become-designer")}
                className="px-8 py-4 bg-white hover:bg-[#F5EFEB] text-[#183B56] border border-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2 shrink-0"
              >
                <span>Start Creator Application</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </section>
        )}

        {/* ── 4. GUIDE 2: HOW TO PUBLISH A DESIGN ── */}
        {activeTab === "publish-design" && (
          <section className="space-y-8 animate-fadeIn">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#183B56] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                  Studio Blueprint
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#183B56]">
                  How to Publish Your Design in the Designer Studio
                </h2>
              </div>
              <span className="text-xs font-mono text-[#5A7184]">
                5 STEP BLUEPRINT • STEP-BY-STEP WORKFLOW
              </span>
            </div>

            {/* 5 Steps Stack */}
            <div className="space-y-6">
              {PUBLISH_DESIGN_STEPS.map((step) => {
                const StepIcon = step.icon;
                return (
                  <div
                    key={step.stepNumber}
                    className="border border-[#183B56] bg-white p-7 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
                  >
                    {/* Left 5 Cols: Step Header & Description */}
                    <div className="lg:col-span-5 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 border border-[#183B56] bg-[#183B56] text-white flex items-center justify-center font-mono font-bold text-sm">
                          {step.stepNumber}
                        </span>
                        <div className="w-10 h-10 border border-[#183B56] bg-[#DFE7ED] text-[#183B56] flex items-center justify-center">
                          <StepIcon size={18} />
                        </div>
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold uppercase tracking-tight text-[#183B56]">
                        {step.title}
                      </h3>
                      <p className="text-xs font-bold text-[#5A7184] uppercase tracking-wider">
                        {step.headline}
                      </p>
                      <p className="text-xs text-[#5A7184] leading-relaxed font-medium">
                        {step.description}
                      </p>
                    </div>

                    {/* Right 7 Cols: Checklist & Curation Tip */}
                    <div className="lg:col-span-7 space-y-4 lg:border-l lg:border-[#183B56]/20 lg:pl-8">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#183B56]">
                          Checklist Items:
                        </p>
                        <ul className="space-y-1.5 p-0 m-0 list-none text-xs text-[#5A7184] font-medium">
                          {step.details.map((detail, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-2">
                              <CheckCircle2 size={13} className="text-[#183B56] mt-0.5 shrink-0" />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 bg-[#F5EFEB] border border-[#183B56] text-[11px] text-[#183B56] leading-relaxed">
                        <span className="font-bold uppercase tracking-wider text-[9px] text-[#183B56] block mb-0.5">
                          ✦ Best Practice:
                        </span>
                        {step.tip}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Launch Strip */}
            <div className="border border-[#183B56] bg-white p-8 sm:p-10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h4 className="text-base font-bold uppercase text-[#183B56]">
                  Ready to draft your next collection piece?
                </h4>
                <p className="text-xs text-[#5A7184] font-medium mt-1">
                  Open your Designer Studio dashboard to begin uploading garments, sketches, and bespoke options.
                </p>
              </div>

              <button
                onClick={() => router.push("/designer/login")}
                className="px-8 py-3.5 bg-[#183B56] hover:bg-[#102A43] text-white border border-[#183B56] text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-xs flex items-center gap-2 shrink-0"
              >
                <span>Launch Designer Studio</span>
                <ArrowRight size={14} />
              </button>
            </div>

          </section>
        )}

        {/* ── 5. CREATOR HUB DIRECTORY OF LINKS ── */}
        <section className="border border-[#183B56] bg-[#F5EFEB] p-8 sm:p-12 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#183B56]/20 pb-4">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#5A7184] block">
                Creator Ecosystem
              </span>
              <h3 className="text-xl font-bold uppercase text-[#183B56]">
                All Creator Hub Pages &amp; Direct Portals
              </h3>
            </div>
            <span className="text-xs font-mono text-[#5A7184]">
              OFFICIAL HUB DIRECTORY
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: "Apply as a Designer",
                path: "/become-designer",
                desc: "Learn about the Designer Pass, zero listing fees, and submit your portfolio.",
                icon: Scissors
              },
              {
                title: "Creator Registration",
                path: "/designer/register",
                desc: "Direct registration portal for approved fashion artisans and brands.",
                icon: UserCheck
              },
              {
                title: "Designer Studio Portal",
                path: "/designer/login",
                desc: "Manage live orders, lookbooks, commission queues, and bank payouts.",
                icon: Palette
              },
              {
                title: "Verified Designers Directory",
                path: "/designers",
                desc: "Explore all verified fashion creators and their bespoke collections.",
                icon: Globe
              },
              {
                title: "Creator Guide (This Page)",
                path: "/creator-guide",
                desc: "Official handbook and publishing standard for all Weavly creators.",
                icon: BookOpen
              },
              {
                title: "Concierge & Support",
                path: "/account",
                desc: "Direct contact with founder concierge at chokkapusaketh@gmail.com.",
                icon: ShieldCheck
              }
            ].map((portal, idx) => {
              const PortalIcon = portal.icon;
              return (
                <div
                  key={idx}
                  onClick={() => router.push(portal.path)}
                  className="border border-[#183B56] bg-white p-5 flex flex-col justify-between space-y-3 cursor-pointer hover:bg-[#183B56] hover:text-white group transition-all shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="w-8 h-8 border border-[#183B56] bg-[#DFE7ED] group-hover:bg-white flex items-center justify-center text-[#183B56]">
                      <PortalIcon size={16} />
                    </div>
                    <h4 className="text-sm font-bold uppercase group-hover:text-white text-[#183B56]">
                      {portal.title}
                    </h4>
                    <p className="text-xs text-[#5A7184] group-hover:text-[#DFE7ED] font-medium leading-relaxed">
                      {portal.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#183B56]/15 group-hover:border-white/20 text-[10px] font-bold uppercase tracking-wider flex items-center justify-between text-[#183B56] group-hover:text-white">
                    <span>Visit Page</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </main>
    </div>
  );
}
