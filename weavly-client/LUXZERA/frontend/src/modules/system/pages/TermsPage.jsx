"use client";

// src/modules/system/pages/TermsPage.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  ShieldCheck,
  FileText,
  ShoppingBag,
  Sparkles,
  Scissors,
  Truck,
  RotateCcw,
  Lock,
  ChevronRight,
  Download,
  AlertCircle,
  CheckCircle2,
  Mail,
  Copy,
  Check
} from "lucide-react";

export default function TermsPage() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("acceptance");
  const [copiedEmail, setCopiedEmail] = useState(false);

  const lastUpdated = "September 2, 2026";
  const effectiveDate = "August 15, 2026";

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("legal@weavly.com");
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const sections = [
    { id: "acceptance", label: "1. Acceptance & Platform Scope" },
    { id: "accounts", label: "2. Account Registration & Security" },
    { id: "marketplace", label: "3. Drops & Luxury Purchases" },
    { id: "bespoke", label: "4. Bespoke Couture Commissions" },
    { id: "zyra-terms", label: "5. Zyra AI Styling & Recommendations" },
    { id: "shipping", label: "6. Shipping & Delivery Terms" },
    { id: "returns", label: "7. Returns, Refunds & Inspection" },
    { id: "ip-rights", label: "8. Intellectual Property & Designs" },
    { id: "conduct", label: "9. Prohibited Conduct" },
    { id: "liability", label: "10. Warranties & Limitation of Liability" },
    { id: "disputes", label: "11. Governing Law & Dispute Resolution" },
    { id: "contact", label: "12. Legal Inquiries & Notices" },
  ];

  const scrollTo = (id) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EFEB] text-[#183B56] font-sans selection:bg-[#183B56] selection:text-white pb-24">
      {/* ── Editorial Header ── */}
      <div className="relative border-b border-[#183B56]/15 bg-gradient-to-b from-white/60 to-[#F5EFEB] pt-20 pb-16 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto">
          
          {/* Breadcrumb & Legal Tag */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5A7184]">
              <button 
                onClick={() => router.push("/")} 
                className="hover:text-[#183B56] transition-colors border-none bg-transparent cursor-pointer p-0"
              >
                Weavly
              </button>
              <span>/</span>
              <span className="text-[#183B56]">Legal &amp; Compliance</span>
              <span>/</span>
              <span className="text-[#183B56]">Terms of Service</span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#183B56]/10 border border-[#183B56]/20 text-[#183B56] text-[11px] font-semibold">
              <Scale size={13} className="text-[#183B56]" />
              <span>Commercial &amp; Atelier Agreement</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center gap-2">
                <span className="h-px w-6 bg-[#183B56]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#183B56]">
                  Atelier &amp; Patron Terms of Engagement
                </p>
              </div>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold uppercase tracking-tight text-[#183B56] leading-[0.92]">
                Terms of<br />
                <span className="font-serif italic font-normal lowercase text-[#183B56]/90">service &amp; standards.</span>
              </h1>
              <p className="text-[14px] sm:text-[15px] text-[#5A7184] leading-relaxed max-w-2xl font-medium pt-2">
                These terms establish a binding legal agreement governing access to Weavly's curated marketplace drops, designer couture studios, and Zyra AI styling recommendations.
              </p>
            </div>

            <div className="lg:col-span-4 lg:text-right space-y-2 border-t lg:border-t-0 border-[#183B56]/10 pt-4 lg:pt-0">
              <p className="text-xs text-[#5A7184] font-medium">
                Last Revised: <span className="text-[#183B56] font-bold">{lastUpdated}</span>
              </p>
              <p className="text-xs text-[#5A7184] font-medium">
                Effective: <span className="text-[#183B56] font-bold">{effectiveDate}</span>
              </p>
              <div className="pt-2 flex lg:justify-end gap-3">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider bg-white border border-[#183B56]/20 text-[#183B56] hover:bg-[#183B56] hover:text-white transition-all shadow-2xs rounded-xs cursor-pointer"
                >
                  <Download size={13} />
                  <span>Print Document</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Key Commitments Executive Strip ── */}
      <div className="border-b border-[#183B56]/15 bg-white/70 backdrop-blur-xs py-6 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <ShoppingBag size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">100% Authentic Drops</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">Every garment is verified for craftsmanship, material integrity, and atelier provenance.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <Scissors size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">Bespoke Escrow</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">Designer custom commissions are secured under structured milestone guarantees.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <RotateCcw size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">30-Day Returns</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">Hassle-free return policy on standard ready-to-wear drops with prepaid shipping.</p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#183B56]/10 border border-[#183B56]/20 flex items-center justify-center shrink-0 text-[#183B56]">
              <Lock size={16} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#183B56]">Confidentiality</h4>
              <p className="text-[11px] text-[#5A7184] font-medium mt-0.5 leading-snug">Designer-patron sizing records are protected under strict platform NDAs.</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-6 sm:px-12 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-[#183B56]/20 rounded-xl p-5 shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56] mb-4 pb-2 border-b border-[#183B56]/10 flex items-center justify-between">
                <span>Terms Index</span>
                <span className="text-[#5A7184] font-mono font-normal">12 Sections</span>
              </p>
              <nav className="space-y-1">
                {sections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollTo(sec.id)}
                    className={`w-full text-left px-3 py-2 text-[12px] font-semibold transition-all rounded-md flex items-center justify-between cursor-pointer border-none bg-transparent
                      ${activeSection === sec.id
                        ? "bg-[#183B56] text-white shadow-2xs font-bold"
                        : "text-[#5A7184] hover:bg-[#E2EAEF] hover:text-[#183B56]"}`}
                  >
                    <span className="truncate">{sec.label}</span>
                    <ChevronRight size={12} className={activeSection === sec.id ? "text-white" : "text-[#5A7184]/50"} />
                  </button>
                ))}
              </nav>
            </div>

            {/* Legal Help Card */}
            <div className="bg-[#183B56] text-white rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-[#38BDF8]" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Atelier Legal Secretariat</h4>
              </div>
              <p className="text-[12px] text-white/80 leading-relaxed font-normal">
                Have contractual questions regarding bespoke commissions or intellectual property rights?
              </p>
              <div className="flex items-center justify-between bg-white/10 border border-white/15 px-3 py-2 rounded-lg text-xs font-mono">
                <span>legal@weavly.com</span>
                <button
                  onClick={handleCopyEmail}
                  className="hover:text-[#38BDF8] transition-colors border-none bg-transparent cursor-pointer p-0 text-white"
                  title="Copy email"
                >
                  {copiedEmail ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Legal Clauses */}
        <main className="lg:col-span-8 space-y-12">
          
          {/* Section 1 */}
          <section id="acceptance" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 01</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              1. Acceptance &amp; Platform Scope
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              By accessing, browsing, or executing transactions across Weavly (including web properties, client applications, and Zyra recommendation interfaces), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, you must refrain from using the platform.
            </p>
          </section>

          {/* Section 2 */}
          <section id="accounts" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 02</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              2. Account Registration, Roles &amp; Security
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Users may register as <strong>Patrons</strong> (buyers and lookbook curators) or apply for verified status as <strong>Designers</strong>. You are solely responsible for maintaining the confidentiality of your credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized account access.
            </p>
          </section>

          {/* Section 3 */}
          <section id="marketplace" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 03</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              3. Drops, Purchases &amp; Pricing Integrity
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Prices for curated drops and ready-to-wear pieces are displayed in relevant local currencies and inclusive of applicable item taxes unless specified at checkout. Weavly reserves the right to correct typographical pricing discrepancies or cancel orders resulting from erroneous system entries.
            </p>
          </section>

          {/* Section 4 */}
          <section id="bespoke" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 04</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              4. Bespoke Couture &amp; Custom Designer Commissions
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              When placing a bespoke commission via the Designer Studio:
            </p>
            <ul className="space-y-2 text-[12px] text-[#5A7184] font-medium list-disc pl-5 leading-relaxed">
              <li><strong>Milestone Escrow:</strong> Patron payments are held securely until the designer submits verified garment creation milestones and proof of completion.</li>
              <li><strong>Made-to-Measure Calibration:</strong> Designers are obligated to tailor garments according to the submitted fit specifications. In the event of craftsmanship defects exceeding 1.5 inches from provided measurements, alterations are covered by the atelier.</li>
              <li><strong>Custom Cancellation:</strong> Because bespoke items involve individualized fabric procurement and handcrafting, custom commission orders cannot be unilaterally cancelled once fabric cutting has commenced.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section id="zyra-terms" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 05</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              5. Zyra AI Styling &amp; Recommendation Service
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Zyra provides algorithmic styling guidance, fit scoring, and occasion curation based on user inputs. While Zyra continuously optimizes sizing precision, recommendations serve as styling suggestions; final purchasing selections remain the patron's choice.
            </p>
          </section>

          {/* Section 6 */}
          <section id="shipping" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 06</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              6. Shipping, Tracking &amp; Atelier Transit
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Standard ready-to-wear drops are dispatched within 24–48 hours. Bespoke couture garments adhere to individual artisan crafting timelines (typically 10–21 business days). All shipments include door-to-door tracking and transit insurance.
            </p>
          </section>

          {/* Section 7 */}
          <section id="returns" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 07</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              7. 30-Day Return &amp; Refund Policy
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Standard drop items may be returned within 30 days of delivery provided they are unworn, unwashed, and retained with original luxury packaging and tags. Refunds are credited back to the original payment method within 3–5 business days following physical inspection.
            </p>
          </section>

          {/* Section 8 */}
          <section id="ip-rights" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 08</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              8. Intellectual Property &amp; Designer Copyright
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Designers retain exclusive intellectual property rights and design patents in their proprietary couture lookbooks and custom garment designs. Weavly retains all trademarks, platform code, and algorithmic models related to the Zyra AI engine and marketplace software.
            </p>
          </section>

          {/* Section 9 */}
          <section id="conduct" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 09</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              9. Prohibited Conduct &amp; Platform Integrity
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              Users may not engage in reverse engineering of platform algorithms, scraping catalog data, submitting fraudulent payment credentials, or violating artisan copyright protections. Violations result in immediate account termination.
            </p>
          </section>

          {/* Section 10 */}
          <section id="liability" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 10</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              10. Warranties &amp; Limitation of Liability
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              To the maximum extent permitted under applicable law, Weavly provides its digital services "as is" and disclaims all implied warranties. In no event shall Weavly's aggregate liability exceed the total purchase price paid for the specific garment order giving rise to the claim.
            </p>
          </section>

          {/* Section 11 */}
          <section id="disputes" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 11</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              11. Governing Law &amp; Dispute Resolution
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              These terms are governed by commercial jurisprudence and statutory consumer protection laws. Parties agree to attempt amicable dispute resolution through the Weavly Atelier Mediation Panel prior to seeking binding arbitration.
            </p>
          </section>

          {/* Section 12 */}
          <section id="contact" className="scroll-mt-28 space-y-4 bg-white border border-[#183B56]/20 rounded-2xl p-8 shadow-xs">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-[#183B56]">
              <span className="w-2 h-2 rounded-full bg-[#183B56]" />
              <span>Section 12</span>
            </div>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-[#183B56]">
              12. Legal Inquiries &amp; Notices
            </h2>
            <p className="text-[13px] text-[#5A7184] leading-relaxed font-medium">
              For commercial notices, contract questions, or atelier agreements:
            </p>
            <div className="p-5 bg-[#F5EFEB] rounded-xl border border-[#183B56]/15 space-y-2 text-xs">
              <p><strong className="text-[#183B56]">Weavly Legal &amp; Governance Department</strong></p>
              <p className="text-[#5A7184]">Email: <a href="mailto:legal@weavly.com" className="text-[#183B56] font-bold underline">legal@weavly.com</a></p>
              <p className="text-[#5A7184]">Concierge Support: Mon–Fri, 9:00 AM – 6:00 PM EST</p>
            </div>
          </section>

        </main>

      </div>
    </div>
  );
}
