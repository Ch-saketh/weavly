"use client";

// src/modules/designer/pages/BecomeDesignerPage.jsx
// ──────────────────────────────────────────────────────────────────────────
// Weavly Designer Pass — Become a Verified Designer
// • Signature Warm Stone (#F5EFEB) and Architectural Navy (#183B56) Theme
// • Bespoke Measurement Integration, 100% Escrow & Global Client Reach
// ──────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight, Check, ChevronDown, ShieldCheck, Sparkles, Scissors,
  DollarSign, Globe, Package, Zap, Lock, Award, Eye, Layers, TrendingUp
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Publish Your Lookbooks",
    desc: "Upload high-res garments, sketches, fabric specifications, and custom commission options in minutes.",
  },
  {
    step: "02",
    title: "Custom Drape & Sizing",
    desc: "Clients purchase ready sizes or send custom silhouette proportions for 1-of-1 bespoke tailoring.",
  },
  {
    step: "03",
    title: "100% Milestone Escrow",
    desc: "Payments are secured in escrow upfront. Never risk uncompensated tailoring or fabric waste.",
  },
  {
    step: "04",
    title: "Weavly Luxury Packaging",
    desc: "Ship in official Weavly couture garment bags and packaging seals provided directly to your studio.",
  },
  {
    step: "05",
    title: "Instant Payout Release",
    desc: "Upon delivery verification and client satisfaction, funds are released directly to your bank account.",
  },
  {
    step: "06",
    title: "Global Audience Reach",
    desc: "Showcase your original creations across 100+ countries with automatic multi-currency checkout.",
  },
];

const PLATFORM_PILLARS = [
  {
    title: "Bespoke Proportion Queue",
    desc: "Receive exact customer measurements and drape preferences integrated into your order manager.",
    icon: Scissors,
  },
  {
    title: "100% Escrow Protection",
    desc: "Full payment captured before cutting begins. All funds held safely in escrow until client confirms fit.",
    icon: ShieldCheck,
  },
  {
    title: "Official Luxury Packaging",
    desc: "Complimentary luxury garment covers, hanger tags, and branded shipping boxes delivered to your studio.",
    icon: Package,
  },
  {
    title: "Global Client Base",
    desc: "Reach high-intent luxury buyers worldwide with real-time multi-currency conversion and international logistics.",
    icon: Globe,
  },
  {
    title: "Creator Analytics & Pricing",
    desc: "Set your own bespoke rates, track lookbook impressions, commission conversion rates, and revenue.",
    icon: TrendingUp,
  },
  {
    title: "Nominal Spotlight Boosts",
    desc: "Feature your lookbooks on top storefront shelves with curated spotlight campaigns capped at nominal rates.",
    icon: Zap,
  },
];

const DESIGNER_TESTIMONIALS = [
  {
    quote: "The bespoke measurement workflow and milestone escrow changed everything for my brand. Clients send their exact proportions, the deposit is held safely in escrow, and my payout lands the moment the client is thrilled with the fit.",
    author: "Elena Rostova",
    label: "Independent Designer • Milan / Mumbai",
    stats: [
      { label: "Commissions Completed", value: "420+" },
      { label: "Escrow Disbursed", value: "₹28,50,000+" },
      { label: "Satisfaction Score", value: "99.8%" },
    ],
  },
];

const FAQS = [
  {
    q: "How do custom body measurement orders work?",
    a: "When a client commissions your design, they can choose a ready standard size or submit custom body proportions (bust, waist, hips, shoulder, sleeve length, height). You receive the full architectural spec sheet in your Designer Studio order queue.",
  },
  {
    q: "How does the Escrow and Payment Milestone system work?",
    a: "Weavly holds 100% of the commission value in escrow upfront. You can see confirmed escrow funds before cutting fabric. Once the client receives their piece and confirms satisfaction, your payout is immediately released to your linked bank account.",
  },
  {
    q: "Are there any joining fees or upfront subscription costs?",
    a: "None. Weavly Designer Pass is free to apply and join. We only charge a small standard commission on completed and satisfied customer sales.",
  },
  {
    q: "What packaging do I use for shipping garments?",
    a: "All verified Weavly designers receive complimentary luxury garment bags, branded ribbon seals, and sturdy garment boxes to ensure a 5-star unboxing experience for every client.",
  },
  {
    q: "Can international clients commission my work?",
    a: "Yes. Weavly supports multi-currency pricing across 100+ countries with automatic currency conversions (INR, USD, EUR, GBP, AED, JPY) and global shipping integration.",
  },
];

export default function BecomeDesignerPage() {
  const router = useRouter();
  const [activeFaq, setActiveFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      <main className="max-w-[1360px] mx-auto px-6 sm:px-12 md:px-16 lg:px-20 xl:px-24 py-8 sm:py-12 space-y-16">

        {/* ── HERO SECTION ── */}
        <section className="border border-[#183B56] bg-white p-8 sm:p-12 lg:p-16 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F5EFEB] border border-[#183B56] text-[10px] font-bold tracking-[0.2em] uppercase text-[#183B56]">
                <Sparkles size={12} />
                <span>Weavly Designer Pass</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#183B56] leading-[1.04]">
                Launch Your Designs. <br />
                Inspire The World.
              </h1>

              <p className="text-sm sm:text-base text-[#5A7184] leading-relaxed max-w-xl font-normal">
                Turn your sartorial creativity into a global luxury brand. Showcase original lookbooks, accept bespoke custom drape commissions, and earn with 100% milestone escrow protection.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => router.push("/designer/register")}
                  className="py-4 px-8 bg-[#183B56] hover:bg-[#102A43] text-white text-xs font-bold uppercase tracking-[0.18em] border border-[#183B56] cursor-pointer shadow-xs flex items-center gap-2.5 transition-all"
                >
                  <span>Apply for Designer Pass</span>
                  <ArrowRight size={14} />
                </button>

                <button
                  onClick={() => router.push("/designer/login")}
                  className="py-4 px-8 bg-white hover:bg-[#183B56] hover:text-white text-[#183B56] text-xs font-bold uppercase tracking-[0.18em] border border-[#183B56] cursor-pointer shadow-xs flex items-center gap-2 transition-all"
                >
                  <span>Sign In to Studio</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-[#183B56]/20 text-xs">
                <div>
                  <div className="font-bold text-[#183B56]">Zero Fees</div>
                  <div className="text-[10px] text-[#5A7184]">Free to join &amp; publish</div>
                </div>
                <div>
                  <div className="font-bold text-[#183B56]">100% Escrow</div>
                  <div className="text-[10px] text-[#5A7184]">Guaranteed payouts</div>
                </div>
                <div>
                  <div className="font-bold text-[#183B56]">Bespoke Drape</div>
                  <div className="text-[10px] text-[#5A7184]">Custom sizing specs</div>
                </div>
                <div>
                  <div className="font-bold text-[#183B56]">Global Reach</div>
                  <div className="text-[10px] text-[#5A7184]">100+ countries</div>
                </div>
              </div>
            </div>

            {/* Right Editorial Visual */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full aspect-[4/4.5] bg-[#DFE7ED] border border-[#183B56] relative overflow-hidden shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1760022638435-aad7c1e684b6?w=900&q=85"
                  alt="Designer lookbook preparation"
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-4 left-4 bg-white/95 border border-[#183B56] px-3 py-1.5 shadow-xs">
                  <div className="text-[9px] uppercase tracking-wider text-[#5A7184] font-bold">Verified Designer</div>
                  <div className="text-xs font-bold text-[#183B56]">Creator Accreditation</div>
                </div>

                <div className="absolute bottom-4 right-4 bg-white/95 border border-[#183B56] px-3.5 py-2 shadow-xs text-right">
                  <div className="text-[9px] uppercase tracking-wider text-[#5A7184] font-bold">Milestone Escrow</div>
                  <div className="text-xs font-bold text-[#183B56]">100% Protected Payouts</div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ── HOW IT WORKS (6 DESIGNER PHASES) ── */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#183B56] pb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">The Creator Workflow</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
                How Weavly Empowers Designers
              </h2>
            </div>
            <div className="text-xs text-[#5A7184]">From initial lookbook upload to fulfilled escrow payout</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {HOW_IT_WORKS.map((item) => (
              <div key={item.step} className="border border-[#183B56] bg-white p-6 sm:p-8 space-y-4 shadow-xs">
                <div className="w-10 h-10 border border-[#183B56] bg-[#F5EFEB] text-[#183B56] flex items-center justify-center font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-[#183B56]">{item.title}</h3>
                <p className="text-xs text-[#5A7184] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── PLATFORM PILLARS ── */}
        <section className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#183B56] pb-4">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">Creator Capabilities</div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
                Built for Independent Designers
              </h2>
            </div>
            <div className="text-xs text-[#5A7184]">Everything you need to run a high-end bespoke brand</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORM_PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="border border-[#183B56] bg-[#F5EFEB] p-6 sm:p-8 space-y-3 shadow-xs">
                  <div className="w-10 h-10 bg-white border border-[#183B56] flex items-center justify-center text-[#183B56] mb-2">
                    <Icon size={20} />
                  </div>
                  <h3 className="text-base font-bold text-[#183B56]">{p.title}</h3>
                  <p className="text-xs text-[#5A7184] leading-relaxed">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── DESIGNER CASE STUDY ── */}
        <section className="border border-[#183B56] bg-white p-8 sm:p-12 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 flex justify-center">
              <div className="w-full max-w-[280px] aspect-[3/3.6] bg-[#DFE7ED] border border-[#183B56] overflow-hidden shadow-xs">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80"
                  alt="Elena Rostova"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">
                Featured Designer Story
              </div>
              <blockquote className="text-base sm:text-lg lg:text-xl font-bold text-[#183B56] leading-relaxed italic">
                &ldquo;{DESIGNER_TESTIMONIALS[0].quote}&rdquo;
              </blockquote>

              <div className="space-y-0.5">
                <div className="text-sm font-bold text-[#183B56]">{DESIGNER_TESTIMONIALS[0].author}</div>
                <div className="text-xs text-[#5A7184]">{DESIGNER_TESTIMONIALS[0].label}</div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#183B56]/20">
                {DESIGNER_TESTIMONIALS[0].stats.map((s) => (
                  <div key={s.label}>
                    <div className="text-lg sm:text-2xl font-bold text-[#183B56]">{s.value}</div>
                    <div className="text-[10px] text-[#5A7184] uppercase tracking-wider">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQS ACCORDION ── */}
        <section className="space-y-6">
          <div className="border-b border-[#183B56] pb-4">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#5A7184]">Frequently Asked Questions</div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#183B56]">
              Designer Program FAQ
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const open = activeFaq === idx;
              return (
                <div key={faq.q} className="border border-[#183B56] bg-[#F5EFEB]">
                  <button
                    onClick={() => setActiveFaq(open ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer bg-transparent border-none font-bold text-xs sm:text-sm text-[#183B56]"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={16} className={`transition-transform shrink-0 ${open ? "rotate-180" : ""}`} />
                  </button>
                  {open && (
                    <div className="px-5 pb-5 text-xs text-[#5A7184] leading-relaxed border-t border-[#183B56]/20 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BOTTOM CTA BANNER ── */}
        <section className="border border-[#183B56] bg-[#183B56] text-white p-8 sm:p-14 text-center space-y-6 shadow-xs">
          <div className="max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/30 text-[10px] font-bold tracking-[0.2em] uppercase text-white">
              <Sparkles size={12} />
              <span>Join The Designer Network</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              Ready to Share Your Vision with the World?
            </h2>
            <p className="text-xs sm:text-sm text-white/80 leading-relaxed max-w-lg mx-auto">
              Create your designer profile, receive your unique Designer ID, and begin publishing lookbooks to thousands of clients today.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={() => router.push("/designer/register")}
              className="py-4 px-8 bg-white hover:bg-[#F5EFEB] text-[#183B56] text-xs font-bold uppercase tracking-[0.18em] border-none cursor-pointer shadow-xs flex items-center gap-2 transition-all"
            >
              <span>Register as a Designer</span>
              <ArrowRight size={14} />
            </button>
            <button
              onClick={() => router.push("/designer/login")}
              className="py-4 px-8 bg-transparent hover:bg-white/10 text-white text-xs font-bold uppercase tracking-[0.18em] border border-white cursor-pointer transition-all"
            >
              <span>Sign In to Studio</span>
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
